import { Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Ticket } from "../../models/ticket";
import type { RequestWithUser } from "../../types/requests";
import { CustomError } from "../../utils/CustomError";
import { TECHNICIAN_PORT, TECHNICIAN_SERVER_IP } from "../../configs/server.configs";
import { FinishTicket } from "../../models/controllerapp/src/finishTicket";
import { Main } from "../../models/controllerapp/src/main";

interface TicketUpdateBody {
  action: number;
  ctrl_id: number;
  rt_id: number;
}

export const upadateTicket = asyncErrorHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const data: TicketUpdateBody = req.body;
    const {action, ctrl_id ,rt_id} = data
    console.log("Datos recividos:", data);
    const user = req.user!; // ! -> anteponer middleware auth

    const ticket = await Ticket.getTicketByCrtlIdAndTicketId({ctrl_id: ctrl_id, rt_id: rt_id});

    if(ticket){

      if((ticket.estd_id == 4 || ticket.estd_id == 3 || ticket.estd_id == 16 || ticket.estd_id == 17)){ // 4 -> Rechazado , 3 -> Cancelado , 16 -> Finalizado , 17 -> Anulado
        return res.status(403).json({success:false,message: "Acción no permitida.",})
      }else{

        const estdPendiente = ticket.estd_id == 1 && (action == 2 || action == 4 || action == 3) // 1 -> Esperando/Pendiente
        const estdAceptBefore = ticket.estd_id == 2 && (action == 4 || action == 3);
        const estdAceptDuring = ticket.estd_id == 2 && (action == 16 || action == 17)  // 2 -> Aceptado

        const startDate = new Date(ticket.fechacomienzo);
        const endDate = new Date(ticket.fechatermino);
        const currentDate = new Date();
        const isBeforeEvent = currentDate < startDate;
        const isDuringEvent = currentDate >= startDate && currentDate < endDate;

        const beforeEventAction = isBeforeEvent && (estdPendiente || estdAceptBefore);
        const duringEventAction = isDuringEvent && (estdAceptDuring)



        if( beforeEventAction || duringEventAction ){

          if(user.rol === "Administrador" || user.rol === "Usuario"){
            const response = await fetch( `http://${TECHNICIAN_SERVER_IP}:${TECHNICIAN_PORT}/servlets/ticketaction`, { method: "POST", body: JSON.stringify({ action, ctrl_id, rt_id }) } );
            const responseJson = await response.json()
            
            if (response.ok) {
              return res.json({success: true,message: "Accion realizada con éxito",});
            } else {
              const statusCode = response.status;
              console.log(responseJson)
              return res.status(statusCode).json({ success: false, message: "Ocurrrio un error al ejecutar la acción.", });
            }
          }
        }

        if(isBeforeEvent && ticket.estd_id == 1){
          if(user.rol === "Invitado"){
            if(action == 3){  // 3 -> Cancelar

              // =========== Usar esto
              // Main.onFinishTicket(new FinishTicket( action, ctrl_id, rt_id ));

              const response = await fetch( `http://${TECHNICIAN_SERVER_IP}:${TECHNICIAN_PORT}/servlets/ticketaction`, { method: "POST", body: JSON.stringify({ action, ctrl_id, rt_id }) } );
              const responseJson = await response.json()
              
              if (response.ok) {
                
                return res.json({success: true,message: "Accion realizada con éxito",});
              } else {
                const statusCode = response.status;
                console.log(responseJson)
                return res.status(statusCode).json({ success: false, message: "Ocurrrio un error al ejecutar la acción.", });
              }
  
            }
          }
        }
        
      }

    }

    res.status(400).json({
      success: false,
      message: "Acción no permitida.",
    });

  }
);
// 4 -> Rechazado
// 2 -> Aceptado
// 3 -> Cancelado
// 1 -> Esperando   
// 5 -> Completado : 

// Acciones:
// rechazar : -1,
// cancelar : 0
// aceptar : 1