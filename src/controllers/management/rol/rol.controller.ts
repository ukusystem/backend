import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../../utils/asynErrorHandler';
import { RolRepository } from './rol.repository';
import { EntityResponse } from '../../../types/shared';
import { Rol } from './rol.entinty';

export class RolController {
  constructor(private readonly repository: RolRepository) {}

  get item() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const { rl_id } = req.params as { rl_id: string };
      const rolFound = await this.repository.findById(Number(rl_id));
      if (rolFound === undefined) {
        return res.status(400).json({ success: false, message: 'Rol no disponible' });
      }
      const response: EntityResponse<Rol> = rolFound;
      res.status(200).json(response);
    });
  }
  get list() {
    return asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
      const roles = await this.repository.findAll();
      const response: EntityResponse<Rol[]> = roles;
      res.status(200).json(response);
    });
  }
}
