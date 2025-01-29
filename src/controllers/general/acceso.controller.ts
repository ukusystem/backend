import { NextFunction, Request, Response } from 'express';
import { RequestWithUser } from '../../types/requests';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { InsertRecordActivity, OperationType } from '../../models/audit/audit.types';
import { AuditManager, getOldRecordValues } from '../../models/audit/audit.manager';
import { CreateEntityResponse, DeleteReponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';

import { AccesoRepository } from '../../models/general/acceso/acceso.repository';
import { PersonalRepository } from '../../models/general/personal/personal.repository';
import { EquipoAccesoRepository } from '../../models/general/equipoacceso/equipo.acceso.repository';
import { CreateAccesoDTO } from '../../models/general/acceso/dtos/create.acceso.dto';
import { UpdateAccesoDTO } from '../../models/general/acceso/dtos/update.acceso.dto';
import { Acceso } from '../../models/general/acceso/acceso.entity';

export class AccesoController {
  constructor(
    private readonly acceso_repository: AccesoRepository,
    private readonly personal_repository: PersonalRepository,
    private readonly equipoacceso_repository: EquipoAccesoRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const accesoDTO: CreateAccesoDTO = req.body;

      const accesoFound = await this.acceso_repository.findBySerie(accesoDTO.serie);
      if (accesoFound !== undefined) {
        return res.status(409).json({ success: false, message: `Acceso con serie ${accesoDTO.serie} ya esta en uso.` });
      }

      const personalFound = await this.personal_repository.findById(accesoDTO.p_id);
      if (personalFound === undefined) {
        return res.status(404).json({ success: false, message: `Personal no disponible.` });
      }

      const equipoAccesoFound = await this.equipoacceso_repository.findById(accesoDTO.ea_id);
      if (equipoAccesoFound === undefined) {
        return res.status(404).json({ success: false, message: `Equipo Acceso no disponible.` });
      }

      const newAcceso = await this.acceso_repository.create(accesoDTO);

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'acceso',
        id_registro: newAcceso.a_id,
        tipo_operacion: OperationType.Create,
        valores_anteriores: null,
        valores_nuevos: newAcceso,
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);

      const response: CreateEntityResponse = {
        id: newAcceso.a_id,
        message: 'Acceso creado satisfactoriamente',
      };

      res.status(201).json(response);
    });
  }

  get update() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { a_id } = req.params as { a_id: string };

      const incommingDTO: UpdateAccesoDTO = req.body;

      const accesoFound = await this.acceso_repository.findById(Number(a_id));
      if (accesoFound === undefined) {
        return res.status(404).json({ success: false, message: `Acceso no disponible` });
      }

      const finalUpdateAccesoDTO: UpdateAccesoDTO = {};
      const { serie, p_id, ea_id, administrador } = incommingDTO;

      if (serie !== undefined && serie !== accesoFound.serie) {
        const accesoFoundSerie = await this.acceso_repository.findBySerie(serie);
        if (accesoFoundSerie !== undefined) {
          return res.status(409).json({ success: false, message: `Acceso con serie ${serie} ya esta en uso.` });
        }
        finalUpdateAccesoDTO.serie = serie;
      }

      if (p_id !== undefined && p_id !== accesoFound.p_id) {
        const personalFound = await this.personal_repository.findById(p_id);
        if (personalFound === undefined) {
          return res.status(404).json({ success: false, message: `Personal no disponible.` });
        }
        finalUpdateAccesoDTO.p_id = p_id;
      }

      if (ea_id !== undefined && ea_id !== accesoFound.ea_id) {
        const equipoAccesoFound = await this.equipoacceso_repository.findById(ea_id);
        if (equipoAccesoFound === undefined) {
          return res.status(404).json({ success: false, message: `Equipo Acceso no disponible.` });
        }
        finalUpdateAccesoDTO.ea_id = ea_id;
      }

      if (administrador !== undefined && administrador !== accesoFound.administrador) {
        finalUpdateAccesoDTO.administrador = administrador;
      }

      if (Object.keys(finalUpdateAccesoDTO).length > 0) {
        await this.acceso_repository.update(accesoFound.a_id, finalUpdateAccesoDTO);

        const oldValues = getOldRecordValues(accesoFound, finalUpdateAccesoDTO);

        const newActivity: InsertRecordActivity = {
          nombre_tabla: 'acceso',
          id_registro: accesoFound.a_id,
          tipo_operacion: OperationType.Update,
          valores_anteriores: oldValues,
          valores_nuevos: finalUpdateAccesoDTO,
          realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
        };

        AuditManager.generalInsert(newActivity);

        const response: UpdateResponse<Acceso> = {
          message: 'Acceso actualizado exitosamente',
        };
        return res.status(200).json(response);
      }

      return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del acceso' });
    });
  }

  get listAccesosOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const accesos = await this.acceso_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.acceso_repository.countTotal();
      const response: OffsetPaginationResponse<Acceso> = {
        data: accesos,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: accesos.length,
          totalCount: total,
        },
      };

      return res.json(response);
    });
  }

  get delete() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { a_id } = req.params as { a_id: string };
      const accesoFound = await this.acceso_repository.findById(Number(a_id));
      if (accesoFound === undefined) {
        return res.status(400).json({ success: false, message: 'Acceso no disponible' });
      }
      await this.acceso_repository.softDelete(Number(a_id));

      const newActivity: InsertRecordActivity = {
        nombre_tabla: 'acceso',
        id_registro: accesoFound.a_id,
        tipo_operacion: OperationType.Delete,
        valores_anteriores: { activo: accesoFound.activo },
        valores_nuevos: { activo: 0 },
        realizado_por: `${user.u_id} . ${user.nombre} ${user.apellido}`,
      };

      AuditManager.generalInsert(newActivity);

      const response: DeleteReponse = {
        message: 'Acceso eliminado exitosamente',
        id: Number(a_id),
      };
      res.status(200).json(response);
    });
  }

  get singleAcceso() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { a_id } = req.params as { a_id: string };
      const accesoFound = await this.acceso_repository.findById(Number(a_id));
      if (accesoFound === undefined) {
        return res.status(400).json({ success: false, message: 'Acceso no disponible' });
      }
      const response: EntityResponse<Acceso> = accesoFound;
      res.status(200).json(response);
    });
  }
}
