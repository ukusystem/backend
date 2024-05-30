import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Control } from "../../../models/site";


export const getEquiposSalida = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const {xctrl_id} = req.params // "/site/control/:xctrl_id"
    const equiposSalida = await Control.getEquiposSalidaByCtrlId({ctrl_id: Number(xctrl_id)})
    res.json(equiposSalida)
  }
);
