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

export class PersonalController {
  constructor(
    private readonly personal_repository: PersonalRepository,
    private readonly cargo_repository: CargoRepository,
    private readonly contrata_repository: ContrataRepository,
  ) {}

  static readonly CREATE_BODY_FIELDNAME: string = 'form';
  static readonly CREATE_FILE_FIELDNAME: string = 'files_test';

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

        res.status(201).json({
          success: true,
          message: 'Personal creado satisfactoriamente',
          data: {
            u_id: newPersonalId,
          },
        });
      } catch (error) {
        this.#deleteTemporalFiles(req);
        next(error);
      }
    });
  }

  get update() {
    return asyncErrorHandler(async (req: Request, res: Response, next: NextFunction) => {
      try {
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

        let hasChanges: boolean = false;

        if (dni !== undefined && dni !== personalFound.dni) {
          const personalFoundDni = await this.personal_repository.findByDni(dni);
          if (personalFoundDni !== undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(409).json({ success: false, message: `Personal con DNI ${dni} ya esta en uso.` });
          }
          hasChanges = true;
        }

        if (c_id !== undefined && c_id !== personalFound.c_id) {
          const cargoFound = await this.cargo_repository.findById(c_id);
          if (cargoFound === undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(404).json({ success: false, message: `Cargo no disponible.` });
          }
          hasChanges = true;
        }

        if (co_id !== undefined && co_id !== personalFound.co_id) {
          const contrataFound = await this.contrata_repository.findById(co_id);
          if (contrataFound === undefined) {
            this.#deleteTemporalFiles(req);
            return res.status(404).json({ success: false, message: `Contrata no disponible.` });
          }
          hasChanges = true;
        }

        const filesUploaded = req.files;
        let finalPhotoPath: string | undefined = undefined;
        if (filesUploaded !== undefined) {
          if (Array.isArray(filesUploaded)) {
            const file = filesUploaded[0]; // expected only one
            if (file !== undefined) {
              finalPhotoPath = this.#moveMulterFilePhoto(file);
              hasChanges = true;
            }
          } else {
            const multerFiles = filesUploaded[PersonalController.CREATE_FILE_FIELDNAME];
            if (multerFiles !== undefined) {
              const file = multerFiles[0]; // expected only one
              if (file !== undefined) {
                finalPhotoPath = this.#moveMulterFilePhoto(file);
                hasChanges = true;
              }
            }
          }
        }

        hasChanges = hasChanges || (apellido !== undefined && apellido !== personalFound.apellido) || (nombre !== undefined && nombre !== personalFound.nombre) || (correo !== undefined && correo !== personalFound.correo) || (telefono !== undefined && telefono !== personalFound.telefono);
        if (hasChanges) {
          await this.personal_repository.update(Number(p_id), { c_id, co_id, dni, apellido, correo, nombre, telefono, foto: finalPhotoPath });
          return res.status(200).json({
            success: true,
            message: 'Personal actualizado exitosamente',
          });
        }

        res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos del personal' });
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
      res.status(200).json({
        success: true,
        message: 'Personal eliminado exitosamente',
      });
    });
  }
  get singlePersonal() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { p_id } = req.params as { p_id: string };
      const personalFound = await this.personal_repository.findById(Number(p_id));
      if (personalFound === undefined) {
        return res.status(400).json({ success: false, message: 'Personal no disponible' });
      }
      res.status(200).json(personalFound);
    });
  }

  get listPersonalesOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const personales = await this.personal_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.personal_repository.countTotal();

      return res.json({
        data: personales,
        meta_data: {
          limit: final_limit,
          offset: final_offset,
          count_data: personales.length,
          total_count: total,
        },
      });
    });
  }
}
