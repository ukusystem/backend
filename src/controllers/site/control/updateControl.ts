import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";

// ========== Agregar esto
import { PinOrder } from "../../../models/controllerapp/src/types";

interface ControlUpdateBody {
  action: -1 | 0 | 1
  ctrl_id : number,
  pin: number
}
export const updateControl = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data : ControlUpdateBody = req.body;
    const {action , ctrl_id ,pin} = data
    console.log("Datos reciviodos control:\n",{action , ctrl_id ,pin})

    // ========== Usar esto
    // Main.onOrder(new PinOrder(action, ctrl_id, pin))

    const response = await fetch("http://172.16.4.3:55555/servlets/orden", {method: "POST", body:JSON.stringify({action , ctrl_id  ,pin}) });
    const test = await response.json();
    console.log("Imprimiendo respuesta:", test);
    // console.log("Imprimiendo respuesta:", JSON.stringify(response));

    if(response.ok){
      return res.json({
        success: true,
        message: "Accion realizada con éxito",
      });
    }else{
      const statusCode = response.status
      // console.log("Status code:", statusCode)
      return res.status(statusCode).json({
        success: false,
        message: "Ocurrrio un error al ejecutar la acción.",
      });

    }
    
    
    
  }
);


// Acciones:
// -1: Desactivar
// 0 : Automatico
// 1 : Activar