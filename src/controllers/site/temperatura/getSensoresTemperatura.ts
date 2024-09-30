import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Temperatura } from "../../../models/site/temperatura";

export const getSensoresTemperatura = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const {ctrl_id} = req.query as {ctrl_id:string}
    const sensoresTemp = await  Temperatura.getSensoresTemperaturaByCtrlID({ctrl_id: Number(ctrl_id)})
    return res.json(sensoresTemp)
  }
);