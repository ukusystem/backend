import { Server, Socket } from "socket.io";
import { TicketMap, TicketScheduleSocketObserver } from "../../models/ticketschedule";

export const ticketSocket = async (io: Server, socket: Socket) => {
  const nspTickets = socket.nsp;
  const [, , ctrl_id] = nspTickets.name.split("/"); // Namespace: "/tickets/ctrl_id/"

  const newObserver = new TicketScheduleSocketObserver(socket)
  TicketMap.registerObserver(Number(ctrl_id),newObserver)
  // emit initial data
  const data = TicketMap.getTicket(Number(ctrl_id))
  socket.emit("tickets", data);
};
