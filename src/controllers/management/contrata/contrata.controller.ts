import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { RubroRepository } from '../rubro/rubro.repository';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { ContrataRepository } from './contrata.repository';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';
import { RequestWithUser } from '../../../types/requests';
import { AuditManager, getRecordAudit } from '../../../models/audit/audit.manager';

export class ContrataController {
  constructor(
    private readonly contrata_repository: ContrataRepository,
    private readonly rubro_repository: RubroRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const contrataDTO: CreateContrataDTO = req.body;

      const rubroFound = await this.rubro_repository.findById(contrataDTO.r_id);
      if (rubroFound === undefined) {
        return res.status(404).json({ success: false, message: `Rubro no disponible.` });
      }

      const newContrataId = await this.contrata_repository.create(contrataDTO);

      res.status(201).json({
        success: true,
        message: 'Contrata creado satisfactoriamente',
        data: {
          co_id: newContrataId,
        },
      });
    });
  }

  get update() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;

      if (user !== undefined) {
        const { co_id } = req.params as { co_id: string };
        const incommingDTO: UpdateContrataDTO = req.body;

        const contrataFound = await this.contrata_repository.findById(Number(co_id));

        if (contrataFound === undefined) {
          return res.status(400).json({ success: false, message: 'Contrata no disponible' });
        }

        const finalContrataUpdateDTO: UpdateContrataDTO = {};
        const { r_id, contrata, descripcion } = incommingDTO;

        if (r_id !== undefined && r_id !== contrataFound.r_id) {
          const rubroFound = await this.rubro_repository.findById(r_id);
          if (rubroFound === undefined) {
            return res.status(404).json({ success: false, message: `Rubro no disponible.` });
          }
          finalContrataUpdateDTO.r_id = r_id;
        }

        if (contrata !== undefined && contrata !== contrataFound.contrata) {
          finalContrataUpdateDTO.contrata = contrata;
        }

        if (descripcion !== undefined && descripcion !== contrataFound.descripcion) {
          finalContrataUpdateDTO.descripcion = descripcion;
        }

        if (Object.keys(finalContrataUpdateDTO).length > 0) {
          await this.contrata_repository.update(Number(co_id), finalContrataUpdateDTO);

          const records = getRecordAudit(contrataFound, finalContrataUpdateDTO);
          AuditManager.insert('general', 'general_audit', 'contrata', records, `${user.p_id}. ${user.nombre} ${user.apellido}`);

          return res.status(200).json({
            success: true,
            message: 'Contrata actualizado exitosamente',
          });
        }

        return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos de la contrata' });
      } else {
        return res.status(401).json({ message: 'No autorizado' });
      }
    });
  }

  get listContratasOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const contratas = await this.contrata_repository.findByOffsetPagination(final_limit, final_offset);
      const total = await this.contrata_repository.countTotal();

      return res.json({
        data: contratas,
        meta_data: {
          limit: final_limit,
          offset: final_offset,
          count_data: contratas.length,
          total_count: total,
        },
      });
    });
  }

  get delete() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { co_id } = req.params as { co_id: string };
      const contrataFound = await this.contrata_repository.findById(Number(co_id));
      if (contrataFound === undefined) {
        return res.status(400).json({ success: false, message: 'Contrata no disponible' });
      }
      await this.contrata_repository.softDelete(Number(co_id));
      res.status(200).json({
        success: true,
        message: 'Contrata eliminado exitosamente',
      });
    });
  }

  get singleContrata() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { co_id } = req.params as { co_id: string };
      const contrataFound = await this.contrata_repository.findById(Number(co_id));
      if (contrataFound === undefined) {
        return res.status(400).json({ success: false, message: 'Contrata no disponible' });
      }
      res.status(200).json(contrataFound);
    });
  }
}
