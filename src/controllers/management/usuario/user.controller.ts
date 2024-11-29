import { NextFunction, Request, Response } from 'express';
import { PasswordHasher } from './security/passwod.hasher';
import { UserRepository } from './user.repository';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { CreateUserDTO } from './dtos/create.user.dto';
import { PersonalRepository } from '../personal/personal.repository';
import { RolRepository } from '../rol/rol.repository';
import { UpdateUserDTO } from './dtos/update.user.dto';
import { RequestWithUser } from '../../../types/requests';
import { AuditManager, getRecordAudit } from '../../../models/audit/audit.manager';

export class UserController {
  constructor(
    private readonly user_repository: UserRepository,
    private readonly hasher: PasswordHasher,
    private readonly personal_repository: PersonalRepository,
    private readonly rol_repository: RolRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      //
      const userDTO: CreateUserDTO = req.body;

      const isUsernameAvailable = await this.user_repository.isUsernameAvailable(userDTO.usuario);
      if (!isUsernameAvailable) {
        return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
      }

      const foundPersonal = await this.personal_repository.findById(userDTO.p_id);
      if (foundPersonal === undefined) {
        return res.status(404).json({ success: false, message: `Personal no encontrado.` });
      }

      const isPersonalAvaible = await this.user_repository.isPersonalAvailable(userDTO.p_id);
      if (!isPersonalAvaible) {
        return res.status(409).json({ success: false, message: 'El personal ya está en uso. Por favor, elige otro.' });
      }

      const foundRol = await this.rol_repository.findById(userDTO.rl_id);
      if (foundRol === undefined) {
        return res.status(404).json({ success: false, message: `Rol no encontrado.` });
      }

      const passwordHashed = await this.hasher.hash(userDTO.contraseña);

      const newUserId = await this.user_repository.create({ ...userDTO, contraseña: passwordHashed });

      res.status(201).json({
        success: true,
        message: 'Usuario creado satisfactoriamente',
        data: {
          u_id: newUserId,
        },
      });
    });
  }

  get update() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;

      if (user !== undefined) {
        // params
        const { u_id } = req.params as { u_id: string };
        // body
        const incommingDTO: UpdateUserDTO = req.body;
        const { contraseña, p_id, rl_id, usuario } = incommingDTO;
        const finalUserUpdateDTO: UpdateUserDTO = {};

        const userFound = await this.user_repository.findById(Number(u_id));
        if (userFound === undefined) {
          return res.status(400).json({ success: false, message: 'Usuario no disponible' });
        }

        if (usuario !== undefined && usuario !== userFound.usuario) {
          const isUsernameAvailable = await this.user_repository.isUsernameAvailable(usuario);
          if (!isUsernameAvailable) {
            return res.status(409).json({ success: false, message: 'El nombre de usuario ya está en uso. Por favor, elige otro.' });
          }
          finalUserUpdateDTO.usuario = usuario;
        }

        if (p_id !== undefined && p_id !== userFound.p_id) {
          const foundPersonal = await this.personal_repository.findById(p_id);
          if (foundPersonal === undefined) {
            return res.status(404).json({ success: false, message: `Personal no encontrado.` });
          }

          const isPersonalAvaible = await this.user_repository.isPersonalAvailable(p_id);
          if (!isPersonalAvaible) {
            return res.status(409).json({ success: false, message: 'El personal ya está en uso. Por favor, elige otro.' });
          }
          finalUserUpdateDTO.p_id = p_id;
        }

        if (rl_id !== undefined && rl_id !== userFound.rl_id) {
          const foundRol = await this.rol_repository.findById(rl_id);
          if (foundRol === undefined) {
            return res.status(404).json({ success: false, message: `Rol no encontrado.` });
          }

          finalUserUpdateDTO.rl_id = rl_id;
        }

        if (contraseña !== undefined) {
          const isSamePassword = await this.hasher.compare(contraseña, userFound.contraseña);
          if (!isSamePassword) {
            finalUserUpdateDTO.contraseña = await this.hasher.hash(contraseña);
          }
        }

        if (Object.keys(finalUserUpdateDTO).length > 0) {
          await this.user_repository.update(Number(u_id), finalUserUpdateDTO);

          const records = getRecordAudit(userFound, finalUserUpdateDTO);
          AuditManager.insert('general', 'general_audit', 'usuario', records, `${user.p_id}. ${user.nombre} ${user.apellido}`);

          return res.status(200).json({
            success: true,
            message: 'Usuario actualizado exitosamente',
          });
        }

        return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del usuario' });
      } else {
        return res.status(401).json({ message: 'No autorizado' });
      }
    });
  }

  get listUsersCursor() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { cursor, page_size } = req.query as { page_size: string | undefined; cursor: string | undefined };

      const final_page_size: number = page_size !== undefined ? Math.min(Math.max(Number(page_size), 0), 100) : 10; // default page size : 10 ,  max page size : 100

      const final_cursor: number | undefined = cursor !== undefined ? Number(cursor) : undefined;
      const users = await this.user_repository.findByCursorPagination(final_page_size, final_cursor);
      return res.json({
        data: users,
        meta_data: {
          next_cursor: 0,
          prev_cursor: 0,
        },
      });
    });
  }

  get listUsersOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const users = await this.user_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.user_repository.countTotal();

      return res.json({
        data: users,
        meta_data: {
          limit: final_limit,
          offset: final_offset,
          count_data: users.length,
          total_count: total,
        },
      });
    });
  }

  get delete() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { u_id } = req.params as { u_id: string };
      const userFound = await this.user_repository.findById(Number(u_id));
      if (userFound === undefined) {
        return res.status(400).json({ success: false, message: 'Usuario no disponible' });
      }
      await this.user_repository.softDelete(Number(u_id));
      res.status(200).json({
        success: true,
        message: 'Usuario eliminado exitosamente',
      });
    });
  }

  get singleUser() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { u_id } = req.params as { u_id: string };
      const userFound = await this.user_repository.findById(Number(u_id));
      if (userFound === undefined) {
        return res.status(400).json({ success: false, message: 'Usuario no disponible' });
      }
      res.status(200).json(userFound);
    });
  }
}
