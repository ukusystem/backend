import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { CreatePersonalDTO } from './dtos/create.personal.dto';
import { CargoRepository } from '../cargo/cargo.repository';
import { ContrataRepository } from '../contrata/contrata.repository';
import { PersonalRepository } from './personal.repository';
import { deleteTemporalFiles, GeneralMulterMiddlewareArgs } from '../../../middlewares/multer.middleware';
import { createPersonalSchema } from './schemas/create.personal.schema';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import { getExtesionFile } from '../../../utils/getExtensionFile';
import { updatePersonalBodySchema } from './schemas/update.personal.schema';
import { UpdatePersonalDTO } from './dtos/update.personal.dto';
import { AuditManager, getRecordAudit } from '../../../models/audit/audit.manager';
import { RequestWithUser } from '../../../types/requests';
import { Personal } from './personal.entity';

import { EntityResponse, CreateEntityResponse, UpdateResponse, OffsetPaginationResponse, DeleteReponse } from '../shared';

export class PersonalController {
  constructor(
    private readonly personal_repository: PersonalRepository,
    private readonly cargo_repository: CargoRepository,
    private readonly contrata_repository: ContrataRepository,
  ) {}

  static readonly CREATE_BODY_FIELDNAME: string = 'form';
  static readonly CREATE_FILE_FIELDNAME: string = 'files';

  static readonly BASE_PROFILEPHOTO_DIR: string = './archivos/personal/photos';
  static readonly BASE_PROFILEPHOTO_RELATIVE_DIR: string = './archivos/personal';

  #deleteTemporalFiles(req: Request) {
    if (req.files !== undefined) deleteTemporalFiles(req.files);
    if (req.file !== undefined) deleteTemporalFiles([req.file]);
  }

  #moveMulterFilePhoto(file: Express.Multer.File): string {
    const newFileName = uuidv4();
    const extensionFile = getExtesionFile(file.originalname);

    const movePath = path.resolve(`${PersonalController.BASE_PROFILEPHOTO_DIR}/${newFileName}.${extensionFile}`);

    // create directory if no exist
    const dirnamePath = path.dirname(movePath);
    if (!fs.existsSync(dirnamePath)) {
      fs.mkdirSync(dirnamePath, { recursive: true });
    }

    // move file
    fs.renameSync(file.path, movePath);

    const relativePath = path.relative(`${PersonalController.BASE_PROFILEPHOTO_RELATIVE_DIR}`, movePath); // photos\41862f90-7f8f-4c89-bae6-a45c74700b68.jpeg

    const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // photos/41862f90-7f8f-4c89-bae6-a45c74700b68.jpeg

    return finalRelativePath;
  }

  #copyDefaultPhoto(): string {
    const newFileName = uuidv4();
    const destPath = path.resolve(`${PersonalController.BASE_PROFILEPHOTO_DIR}/${newFileName}.png`);

    // create directory if no exist
    const destDir = path.dirname(destPath);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    const sourcePath = path.resolve('./assets/default.user.avatar.png');
    // copy file
    fs.copyFileSync(sourcePath, destPath);

    const relativePath = path.relative(`${PersonalController.BASE_PROFILEPHOTO_RELATIVE_DIR}`, destPath); // photos\41862f90-7f8f-4c89-bae6-a45c74700b68.jpeg

    const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // photos/41862f90-7f8f-4c89-bae6-a45c74700b68.jpeg

    return finalRelativePath;
  }

  get createMulterConfig(): GeneralMulterMiddlewareArgs {
    return {
      allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png'],
      bodyFields: [PersonalController.CREATE_BODY_FIELDNAME],
      fields: [{ name: PersonalController.CREATE_FILE_FIELDNAME, maxCount: 1 }],
      limits: { files: 1, fileSize: 5 * 1024 * 1024, fieldSize: 5 * 1024 * 1024 },
    };
  }

  get create() {
    return asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
        const formParse = JSON.parse(req.body[PersonalController.CREATE_BODY_FIELDNAME]);
        const resultParse = createPersonalSchema.safeParse(formParse);

        if (!resultParse.success) {
          this.#deleteTemporalFiles(req);
          return res.status(400).json(resultParse.error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
        }

        const { c_id, co_id, dni } = resultParse.data;

        const personalFound = await this.personal_repository.findByDni(dni);
        if (personalFound !== undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(409).json({ success: false, message: `Personal con DNI ${dni} ya esta en uso.` });
        }

        const cargoFound = await this.cargo_repository.findById(c_id);
        if (cargoFound === undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(404).json({ success: false, message: `Cargo no disponible.` });
        }

        const contrataFound = await this.contrata_repository.findById(co_id);
        if (contrataFound === undefined) {
          this.#deleteTemporalFiles(req);
          return res.status(404).json({ success: false, message: `Contrata no disponible.` });
        }

        const filesUploaded = req.files;
        let finalPhotoPath: string | undefined = undefined;
        if (filesUploaded !== undefined) {
          if (Array.isArray(filesUploaded)) {
            const file = filesUploaded[0]; // expected only one
            if (file !== undefined) {
              finalPhotoPath = this.#moveMulterFilePhoto(file);
            }
          } else {
            const multerFiles = filesUploaded[PersonalController.CREATE_FILE_FIELDNAME];
            if (multerFiles !== undefined) {
              const file = multerFiles[0]; // expected only one
              if (file !== undefined) {
                finalPhotoPath = this.#moveMulterFilePhoto(file);
              }
            }
          }
        }

        if (finalPhotoPath === undefined) {
          finalPhotoPath = this.#copyDefaultPhoto();
        }

        // falta validar foto
        const newPersonal: CreatePersonalDTO = {
          ...resultParse.data,
          foto: finalPhotoPath,
        };

        const newPersonalId = await this.personal_repository.create(newPersonal);

        const response: CreateEntityResponse = {
          id: newPersonalId,
          message: 'Personal creado satisfactoriamente',
        };

        res.status(201).json(response);
      } catch (error) {
        this.#deleteTemporalFiles(req);
        next(error);
      }
    });
  }

  get update() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
      try {
        const user = req.user;

        if (user !== undefined) {
          const { p_id } = req.params as { p_id: string };

          const personalFound = await this.personal_repository.findById(Number(p_id));
          if (personalFound === undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(400).json({ success: false, message: 'Personal no disponible' });
          }

          const formParse = JSON.parse(req.body[PersonalController.CREATE_BODY_FIELDNAME]);

          const resultParse = updatePersonalBodySchema.safeParse(formParse);
          if (!resultParse.success) {
            this.#deleteTemporalFiles(req);
            return res.status(400).json(resultParse.error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
          }

          const { c_id, co_id, dni, apellido, correo, nombre, telefono } = resultParse.data;

          const finalPersonalUpdateDTO: UpdatePersonalDTO = {};

          if (dni !== undefined && dni !== personalFound.dni) {
            const personalFoundDni = await this.personal_repository.findByDni(dni);
            if (personalFoundDni !== undefined) {
              this.#deleteTemporalFiles(req);
              return res.status(409).json({ success: false, message: `Personal con DNI ${dni} ya esta en uso.` });
            }
            finalPersonalUpdateDTO.dni = dni;
          }

          if (c_id !== undefined && c_id !== personalFound.c_id) {
            const cargoFound = await this.cargo_repository.findById(c_id);
            if (cargoFound === undefined) {
              this.#deleteTemporalFiles(req);
              return res.status(404).json({ success: false, message: `Cargo no disponible.` });
            }

            finalPersonalUpdateDTO.c_id = c_id;
          }

          if (co_id !== undefined && co_id !== personalFound.co_id) {
            const contrataFound = await this.contrata_repository.findById(co_id);
            if (contrataFound === undefined) {
              this.#deleteTemporalFiles(req);
              return res.status(404).json({ success: false, message: `Contrata no disponible.` });
            }

            finalPersonalUpdateDTO.co_id = co_id;
          }

          const filesUploaded = req.files;

          if (filesUploaded !== undefined) {
            if (Array.isArray(filesUploaded)) {
              const file = filesUploaded[0]; // expected only one
              if (file !== undefined) {
                finalPersonalUpdateDTO.foto = this.#moveMulterFilePhoto(file);
              }
            } else {
              const multerFiles = filesUploaded[PersonalController.CREATE_FILE_FIELDNAME];
              if (multerFiles !== undefined) {
                const file = multerFiles[0]; // expected only one
                if (file !== undefined) {
                  finalPersonalUpdateDTO.foto = this.#moveMulterFilePhoto(file);
                }
              }
            }
          }

          if (apellido !== undefined && apellido !== personalFound.apellido) {
            finalPersonalUpdateDTO.apellido = apellido;
          }
          if (nombre !== undefined && nombre !== personalFound.nombre) {
            finalPersonalUpdateDTO.nombre = nombre;
          }
          if (correo !== undefined && correo !== personalFound.correo) {
            finalPersonalUpdateDTO.correo = correo;
          }
          if (telefono !== undefined && telefono !== personalFound.telefono) {
            finalPersonalUpdateDTO.telefono = telefono;
          }

          if (Object.keys(finalPersonalUpdateDTO).length > 0) {
            await this.personal_repository.update(Number(p_id), finalPersonalUpdateDTO);

            const records = getRecordAudit(personalFound, finalPersonalUpdateDTO);
            AuditManager.insert('general', 'general_audit', 'personal', records, `${user.p_id}. ${user.nombre} ${user.apellido}`);

            const response: UpdateResponse<Personal> = {
              message: 'Personal actualizado exitosamente',
            };

            return res.status(200).json(response);
          }

          return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del personal' });
        } else {
          return res.status(401).json({ message: 'No autorizado' });
        }
      } catch (error) {
        this.#deleteTemporalFiles(req);
        next(error);
      }
    });
  }

  get delete() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.personal_repository.findById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(400).json({ success: false, message: 'Personal no disponible' });
      }
      await this.personal_repository.softDelete(Number(p_id));

      const response: DeleteReponse = {
        message: 'Personal eliminado exitosamente',
        id: Number(p_id),
      };
      res.status(200).json(response);
    });
  }

  get singlePersonal() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.personal_repository.findById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(400).json({ success: false, message: 'Personal no disponible' });
      }

      const response: EntityResponse<Personal> = personalFound;
      res.status(200).json(response);
    });
  }

  get listPersonalesOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const personales = await this.personal_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.personal_repository.countTotal();

      const response: OffsetPaginationResponse<Personal> = {
        data: personales,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: personales.length,
          totalCount: total,
        },
      };

      return res.json(response);
    });
  }
}
