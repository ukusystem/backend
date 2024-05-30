import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Multimedia } from "../../../models/site";
import { PORT, SERVER_IP } from "../../../configs/server.configs";

interface DataReqParams {
  ctrl_id : number,
  date: string,
  hour: number,
  tipo: 0 | 1
}

export const getArchivoCamara = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    // const {xctrl_id, xdate, xhour, xtipo, xcmr_id}  = req.params // "/site/multimedia/:xctrl_id/:xcmr_id/:xdate/:xhour/:xtipo"
    const {cmr_id,ctrl_id, date,tipo, hour} = req.query as {ctrl_id:string, date:string, tipo:string, cmr_id:string, hour:string} // "/site/multimedia?ctrl_id=1&cmr_id=34&date='13/11/2024'&hour=08&tipo=1"
    // console.log({cmr_id,ctrl_id, date,tipo, hour})
    const archivoCamara= await Multimedia.getArchivoCamByTypeAndCtrlIdAndCmrIdAndDateAndHour({ctrl_id: Number(ctrl_id), date: date,hour: Number(hour), tipo: Number(tipo),cmr_id: Number(cmr_id)})
    // const { } = pathsData[0]
    // const finalArchivosCamara =archivoCamara.map((item)=>{
    //   const {ruta, ...itemRest} = item
    //   return {ruta: `http://${SERVER_IP}:${PORT}/api/v1/site/multimedia?ctrl_id=27&cmr_id=12&date=2024-02-22&hour=15&tipo=3`}
    // })
    return res.json(archivoCamara)
  }
);