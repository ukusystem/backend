import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { RubroRepository } from '../rubro/rubro.repository';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { ContrataRepository, ContrataWithRubro } from './contrata.repository';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';
import { RequestWithUser } from '../../../types/requests';
import { AuditManager, getRecordAudit } from '../../../models/audit/audit.manager';

import { Contrata } from './contrata.entity';
import { EntityResponse, CreateEntityResponse, UpdateResponse, OffsetPaginationResponse, DeleteReponse } from '../../../types/shared';
import { PersonalRepository } from '../personal/personal.repository';
import { UserRepository } from '../usuario/user.repository';
import { PaginationContrata } from './schemas/pagination.contrata.schema';

export class ContrataController {
  constructor(
    private readonly contrata_repository: ContrataRepository,
    private readonly rubro_repository: RubroRepository,
    private readonly personal_repository: PersonalRepository,
    private readonly user_repository: UserRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const contrataDTO: CreateContrataDTO = req.body;

      const rubroFound = await this.rubro_repository.findById(contrataDTO.r_id);
      if (rubroFound === undefined) {
        return res.status(404).json({ success: false, message: `Rubro no disponible.` });
      }

      const newContrataId = await this.contrata_repository.create(contrataDTO);
      const response: CreateEntityResponse = {
        id: newContrataId,
        message: 'Contrata creado satisfactoriamente',
      };

      res.status(201).json(response);
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

          const response: UpdateResponse<Contrata> = {
            message: 'Contrata actualizado exitosamente',
          };

          return res.status(200).json(response);
        }

        return res.status(200).json({ success: true, message: 'No se realizaron cambios en los datos de la contrata' });
      } else {
        return res.status(401).json({ message: 'No autorizado' });
      }
    });
  }

  get listContratasOffset() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      // const { offset, limit } = req.query as { limit: string | undefined; offset: string | undefined };

      const { offset, limit, filters }: PaginationContrata = req.query;

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const contratas = await this.contrata_repository.findByOffsetPagination(final_limit, final_offset, filters);

      const contratasWithTotalPersonal = await Promise.all(
        contratas.map(async (contrata) => {
          const totalPersonal = await this.personal_repository.countTotalByCotrataId(contrata.co_id);
          return { ...contrata, total_personal: totalPersonal };
        }),
      );

      const total = await this.contrata_repository.countTotal();

      const response: OffsetPaginationResponse<ContrataWithRubro & { total_personal: number }> = {
        data: contratasWithTotalPersonal,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: contratasWithTotalPersonal.length,
          totalCount: total,
        },
      };

      return res.json(response);
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
      await this.personal_repository.softDeleteByContrata(Number(co_id));

      const personalesContrata = await this.personal_repository.findByContrataId(Number(co_id));
      for (const personal of personalesContrata) {
        await this.user_repository.softDeleteByPersonalId(personal.p_id);
      }

      const response: DeleteReponse = {
        message: 'Contrata eliminado exitosamente',
        id: Number(co_id),
      };
      res.status(200).json(response);
    });
  }

  get singleContrata() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { co_id } = req.params as { co_id: string };
      const contrataFound = await this.contrata_repository.findWithRubroById(Number(co_id));
      if (contrataFound === undefined) {
        return res.status(400).json({ success: false, message: 'Contrata no disponible' });
      }
      const totalPersonal = await this.personal_repository.countTotalByCotrataId(contrataFound.co_id);

      const response: EntityResponse<ContrataWithRubro & { total_personal: number }> = { ...contrataFound, total_personal: totalPersonal };
      res.status(200).json(response);
    });
  }
}
