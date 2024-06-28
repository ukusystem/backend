import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Multimedia } from "../../../models/site";

export const getArchivoCamara = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const {cmr_id,ctrl_id, date,tipo, hour} = req.query as {ctrl_id:string, date:string, tipo:string, cmr_id:string, hour:string} // "/site/multimedia?ctrl_id=1&cmr_id=34&date='13/11/2024'&hour=08&tipo=1"

    const archivoCamara= await Multimedia.getArchivoCamByTypeAndCtrlIdAndCmrIdAndDateAndHour({ctrl_id: Number(ctrl_id), date: date,hour: Number(hour), tipo: Number(tipo),cmr_id: Number(cmr_id)})

    return res.json(archivoCamara)
  }
);