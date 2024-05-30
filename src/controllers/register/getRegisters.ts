import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { RegisterArgs, Register } from "../../models/register";

export const getRegisters = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fecha_fin, fecha_inicio, ctrl_id, tipo_registro } = req.body as RegisterArgs;
    const registroData = await Register.getRegistroByNodoAndTypeAndDateTimeRange({fecha_fin, fecha_inicio, ctrl_id, tipo_registro});
    res.status(200).json(registroData);
  }
);
