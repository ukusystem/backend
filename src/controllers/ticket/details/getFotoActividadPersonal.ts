import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";

import { CustomError } from "../../../utils/CustomError";
import { TECHNICIAN_PORT, TECHNICIAN_SERVER_IP } from "../../../configs/server.configs";

export const getFotoActividadPersonal = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // const {xfoto} = req.params
    // const test = req.body

    // const imgPath = path.resolve("./fotos/actividadpersonal",xfoto);
    
    try {
      const reqBody = req.body // {path: "ruta_foto"}
      const response = await fetch(`http://${TECHNICIAN_SERVER_IP}:${TECHNICIAN_PORT}/servlets/archivo`,{method: "POST",body: JSON.stringify(reqBody)})
      const responseData = await response.json();

      // console.log("Technician response GET archivo: ", responseData)
      if(response.ok){
        return res.json(responseData)
      }else{
        return res.status(response.status).json(responseData)
      }
    } catch (error) {
      console.log("Error producido en getFotoActividadPersonal\n",error)
      const errFileNotFound = new CustomError(
        `Ocurrio un error en el servidor al intentar obtener la imagen.`,
        500,
        "Internal Server Error"
      );
      next(errFileNotFound)
    }

    // res.sendFile(imgPath,(err)=>{
    //   if(err){
    //     const errUserNotFound = new CustomError(
    //       `La imagen solicitada no está disponible en el servidor.`,
    //       404,
    //       "Not Found"
    //     );
    //     next(errUserNotFound)
    //   }
    // })
  }
);