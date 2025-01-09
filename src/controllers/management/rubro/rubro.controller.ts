import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { EntityResponse } from '../../../types/shared';
import { RubroRepository } from './rubro.repository';
import { Rubro } from './rubro.entity';

export class RubroController {
  constructor(private readonly repository: RubroRepository) {}

  get singleRubro() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { rl_id } = req.params as { rl_id: string };
      const rubroFound = await this.repository.findById(Number(rl_id));
      if (rubroFound === undefined) {
        return res.status(400).json({ success: false, message: 'Rubro no disponible' });
      }
      const response: EntityResponse<Rubro> = rubroFound;
      res.status(200).json(response);
    });
  }
  get listRubros() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const rubros = await this.repository.findAll();
      const response: EntityResponse<Rubro[]> = rubros;
      res.status(200).json(response);
    });
  }
}
