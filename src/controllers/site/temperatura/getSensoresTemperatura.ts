import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Temperatura } from "../../../models/site/temperatura";

export const getSensoresTemperatura = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {

    const {xctrl_id}  = req.params // "/site/sensortemperatura/:xctrl_id"
    const sensoresTemp = await  Temperatura.getSensoresTemperaturaByCtrlID({ctrl_id: Number(xctrl_id)})
    return res.json(sensoresTemp)
  }
);