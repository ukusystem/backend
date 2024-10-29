import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { SmartMap } from "../../models/smartmap";

export const getControladorInfo = asyncErrorHandler(
    async (req: Request, res: Response, next: NextFunction) => {
    const {xctrl_id} = req.params 
    const controlador = await SmartMap.getControladorInfoByCtrlId({ctrl_id: Number(xctrl_id)})
    res.json(controlador)
  }
);
