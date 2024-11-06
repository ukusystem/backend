import { Ticket } from "./src/ticket";
import { Main } from "./src/main";
import { FinishTicket } from "./src/finishTicket";
import { PinOrder } from "./src/types";
import { RequestResult } from "./src/requestResult";
import { Camara } from "../../types/db";

let mainService:Main|null = null

export async function main() {
  // Usar esta instancia para tickets y ordenes
  mainService = new Main()
  await mainService.run()
}

export async function onTicket(newTicket:Ticket){
  return await mainService?.onTicket(newTicket)
}

export async function onFinishTicket(ticket: FinishTicket) {
  return await mainService?.onFinishTicket(ticket);
}

export async function onOrder(pinOrder: PinOrder) {
  return await mainService?.onOrder(pinOrder);
}

export async function sendSecurity(controllerID:number, security:boolean):Promise<RequestResult|undefined> {
  return await mainService?.sendSecurity(controllerID, security);
}

export function notifyCamDisconnect(ctrl_id:number,cam: Camara):void{
  mainService?.addDisconnectedCamera(ctrl_id,cam)
}