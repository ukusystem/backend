import { Ticket } from "./src/ticket";
import { Main } from "./src/main";
import { FinishTicket } from "./src/finishTicket";
import { PinOrder } from "./src/types";

let mainService:Main|null = null

export async function main() {
  // Usar esta instancia para tickets y ordenes
  mainService = new Main()
  await mainService.run()
}

export async function onTicket(newTicket:Ticket){
  return await mainService?.onTicket(newTicket)
}

export async function onFinishTicket(newTicket: FinishTicket) {
  return await mainService?.onFinishTicket(newTicket);
}

export async function onOrder(newTicket: PinOrder) {
  return await mainService?.onOrder(newTicket);
}