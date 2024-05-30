
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { Buffer } from 'node:buffer';
import { CustomError } from "../../../utils/CustomError";
import { TECHNICIAN_PORT, TECHNICIAN_SERVER_IP } from "../../../configs/server.configs";

export const downloadFotoActividadPersonal = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {filePath} = req.query as {filePath: string } // filePath -> encodeURIComponent
      
      const response = await fetch(`http://${TECHNICIAN_SERVER_IP}:${TECHNICIAN_PORT}/servlets/archivo`,{method: "POST",body: JSON.stringify({path: decodeURIComponent(filePath)})})
      const responseData : {base64:string} = await response.json();
      // console.log("Technician response GET archivo: ", responseData)
      if(response.ok){
        const buff = Buffer.from(responseData.base64,"base64");
        res.setHeader("Content-Type","image/png")
        return res.send(buff)
        // const fileType = await filetype.fileTypeFromBuffer(buff)
        // if(fileType){
        //   const {ext , mime } = fileType
        //   res.setHeader("Content-Type",mime)
        //   return res.send(buff)
        // }
        // return res.status(500).json({message:"Internal Server Error"})
      }else{
        return res.status(response.status).json(responseData)
      }
    } catch (error) {
      console.log("Error producido en downloadFotoActividadPersonal\n",error)
      const errFileNotFound = new CustomError(
        `Ocurrio un error en el servidor al intentar obtener la imagen.`,
        500,
        "Internal Server Error"
      );
      next(errFileNotFound)
    }
  }
);