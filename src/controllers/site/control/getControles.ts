import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { PinSalida } from "../../../models/site";

export const getControles = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {xctrl_id, xes_id} = req.params // "/site/control/:xctrl_id/:xes_id"
    const controles = await PinSalida.getControlesByCtrlIdAndEsId({ctrl_id: Number(xctrl_id), es_id: Number(xes_id)})
    res.json(controles)
  }
);
