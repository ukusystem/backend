import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { PinSalida } from "../../../models/site";

export const getEquiposSalida = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {xctrl_id} = req.params // "/site/control/:xctrl_id"
    const equiposSalida = await PinSalida.getEquiposSalidaByCtrlId({ctrl_id: Number(xctrl_id)})
    res.json(equiposSalida)
  }
);
