import { Server, Socket } from "socket.io";
import { TicketMap, TicketScheduleSocketObserver } from "../../models/ticketschedule";
// import { Ticket } from "../../models/ticket";

export const ticketRegistroSocket = async (io: Server, socket: Socket) => {
  const nspTickets = socket.nsp;
  const [, , ctrl_id] = nspTickets.name.split("/"); // Namespace: "/tickets/ctrl_id/"

  let newObserver = new TicketScheduleSocketObserver(socket)
  TicketMap.registerObserver(Number(ctrl_id),newObserver)

  // emit initial data:


  // let intervalId: NodeJS.Timeout | null = null;
  // if (!intervalId) {
  //   intervalId = setInterval(async () => {
  //     const nspTickets = socket.nsp;

  //     const [, , ctrl_id] = nspTickets.name.split("/"); // Namespace: "/tickets/ctrl_id/"

  //     const registrotickets = await Ticket.getNext7DaysByCtrlId({
  //       ctrl_id: parseInt(ctrl_id, 10),
  //     });

  //     socket.emit("tickets", registrotickets);
  //   }, 1000);
  // }

  // socket.on("disconnect", () => {
  //   if (intervalId) {
  //     clearInterval(intervalId);
  //     intervalId = null;
  //   }
  // });
};


