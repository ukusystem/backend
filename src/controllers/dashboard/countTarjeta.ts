import { NextFunction, Request, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Dashboard } from '../../models/dashboard/dashboard';
import { dashboardLogger } from '../../services/loggers';

export const countTarjeta = asyncErrorHandler(async (req: Request, res: Response, _next: NextFunction) => {
  try {
    const data = await Dashboard.getTotalTarjeta();
    res.json(data);
  } catch (error) {
    dashboardLogger.error(`Error al obtener el total de tarjetas`, error);
    res.json({ total_tarjeta: 0, data: [] });
  }
});
