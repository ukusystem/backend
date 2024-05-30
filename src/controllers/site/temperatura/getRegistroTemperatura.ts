import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Temperatura } from "../../../models/site/temperatura";

export const getRegistroTemperartura = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const {xctrl_id, xst_id, xdate}  = req.params // "/site/sensortemperatura/registros/:xctrl_id/:xst_id/:xdate"
    const registrosTemp = await  Temperatura.getRegistroTempByCtrlIdAndStIdAndDate({ctrl_id: Number(xctrl_id),st_id: Number(xst_id), date: xdate })
    return res.json(registrosTemp)
  }
);