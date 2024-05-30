import { TECHNICIAN_PORT, TECHNICIAN_SERVER_IP } from "../configs/server.configs";
import { Ticket } from "../models/ticket"


export const updateTicketPendiente = async () => {
    try {
        // Obtener ticket de todos los nodos:
        const ticketsPendientes = await Ticket.getTicketsPendientes();
        if(ticketsPendientes.length>0){
            ticketsPendientes.forEach(async (ticket)=>{
                const {fechacomienzo, ctrl_id, rt_id}= ticket
                const startDate = new Date(fechacomienzo);
                // const endDate = new Date(fechatermino);
                const currentDate = new Date();
                const isDuringAndAfterEvent = currentDate > startDate;
                if(isDuringAndAfterEvent){
                    // rechazar ticket
                    try {
                        const response = await fetch( `http://${TECHNICIAN_SERVER_IP}:${TECHNICIAN_PORT}/servlets/ticketaction`, { method: "POST", body: JSON.stringify({ action:18, ctrl_id, rt_id }) } );
                        const responseJson = await response.json();
    
                        if (response.ok) {
                            console.log("No atendido respuesta:", responseJson);
                        } else {
                          const statusCode = response.status;
                          console.log("No atendido respuesta:", responseJson);
                        }          
                    } catch (error) {
                        console.error("Error en updateTicketPendiente\n",error) 
                    }

                }

            })
        }
    } catch (error) {
        console.log(error)
    }
}
