import { CronJob } from "cron";
import dayjs from "dayjs";
import { Socket } from "socket.io";
import { Ticket } from "./ticket";
import { onFinishTicket } from "./controllerapp/controller";
import { FinishTicket } from "./controllerapp/src/finishTicket";

export class TicketSchedule {
  #cron: CronJob<null,ITicketCronContext>;
  constructor(cron: CronJob<null,ITicketCronContext>) {
    this.#cron = cron;
  }

  stop() {
    this.#cron.stop();
  }
}

interface TicketMapProps {
  tickets: {
    [ctrl_id: string]: {
      [id: string]: {
        ticket: RegistroTicketObject;
        startSchedule: TicketSchedule | null;
        endSchedule: TicketSchedule | null;
      };
    };
  };
}

interface TicketScheduleObserver {
  updateTicketSchedule(data: ITicketCronContext,typeAct: "add"| "update" | "delete"): void;
}

// interface TicketScheduleSubject {
//   registerObserver(ctrl_id: number, observer: TicketScheduleObserver): void;
//   unregisterObserver(ctrl_id: number): void;
//   notifyTicketSchedule(data:ITicketCronContext,typeAct: "add"| "update" | "delete") : void
// }

export class TicketScheduleSocketObserver implements TicketScheduleObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }
  updateTicketSchedule(data: ITicketCronContext,typeAct: "add"| "update" | "delete"): void {
    if(typeAct == "add"){
      this.socket.nsp.emit("add_ticket", data);
    }else if(typeAct == "update"){
      this.socket.nsp.emit("update_ticket", data);
    }else if( typeAct == "delete"){
      this.socket.nsp.emit("delete_ticket", data);
    }
  }

}


export class TicketMap {

  static readonly tickets: TicketMapProps["tickets"] = {};
  static observers: {[ctrl_id: string]:TicketScheduleObserver} = {};

  public static registerObserver(ctrl_id: number, observer: TicketScheduleObserver): void {
    if(!TicketMap.observers[ctrl_id]){
      TicketMap.observers[ctrl_id] = observer
    }
  }
  public static unregisterObserver(ctrl_id: number): void {
    if(TicketMap.observers[ctrl_id]){
      delete TicketMap.observers[ctrl_id]
    }
  }
  public static notifyTicketSchedule(data: RegistroTicketObject,typeAct: "add"| "update" | "delete"): void {
    let nowDateNext7 = dayjs().startOf("date").add(7,"day").unix();

    if(TicketMap.observers[data.ctrl_id]){
      if(data.fechatermino < nowDateNext7){
        TicketMap.observers[data.ctrl_id].updateTicketSchedule(data.toJSON(),typeAct)
      }
    }
  }

  static add(ticket: RegistroTicketObject): void {
    if (!TicketMap.tickets[ticket.ctrl_id]) {
      TicketMap.tickets[ticket.ctrl_id] = {};
    }
    if(!TicketMap.tickets[ticket.ctrl_id][ticket.id]){
      const currentDateHour = dayjs().unix()
      let newStartTicketSchedule : TicketSchedule | null = null
      let newEndTicketSchedule : TicketSchedule | null = null

      if((ticket.fechacomienzo < currentDateHour) && ticket.estd_id == TicketState.Esperando){
        // notificar ticket no atendido
        onFinishTicket(new FinishTicket(TicketState.NoAtendido,ticket.ctrl_id,ticket.id))
        // console.log("Notificando ticket no atendido:",ticket.ctrl_id,ticket.id)
        return
      }

      if((ticket.fechacomienzo > currentDateHour) && ticket.estd_id == TicketState.Esperando){ // crear cron
        const newCronStart = CronJob.from<null,ITicketCronContext>({
          cronTime: new Date(ticket.fechacomienzo*1000),
          onTick: function (this: ITicketCronContext) {
            if(TicketMap.tickets[this.ctrl_id]){
                if(TicketMap.tickets[this.ctrl_id][this.id]){
                     // comprobar ticket estado -> Esperando
                    if(TicketMap.tickets[this.ctrl_id][this.id].ticket.estd_id == TicketState.Esperando){
                        // notificar ticket no atendido
                        onFinishTicket(new FinishTicket(TicketState.NoAtendido,this.ctrl_id,this.id))
                        // eliminar ticket
                        TicketMap.delete(this.ctrl_id, this.id)
                    }
                }
            }
          },
          onComplete:null,
          start: true,
          context: ticket.toJSON(),
        });
        newStartTicketSchedule = new TicketSchedule(newCronStart)

      }

      if(ticket.fechatermino > currentDateHour){
        const newCronEnd = CronJob.from<null,ITicketCronContext>({
          cronTime: new Date(ticket.fechatermino*1000),
          onTick: function (this: ITicketCronContext) {
            if(TicketMap.tickets[this.ctrl_id]){
                if(TicketMap.tickets[this.ctrl_id][this.id]){
                  TicketMap.delete(this.ctrl_id, this.id)
                }
            }
          },
          onComplete:null,
          start: true,
          context: ticket.toJSON(),
        });
        newEndTicketSchedule = new TicketSchedule(newCronEnd)
      }

      if(newStartTicketSchedule || newEndTicketSchedule){
        TicketMap.tickets[ticket.ctrl_id][ticket.id] = {ticket: ticket,startSchedule: newStartTicketSchedule,endSchedule:newEndTicketSchedule}
        // notify
        TicketMap.notifyTicketSchedule(ticket,"add")
        // console.log(JSON.stringify(TicketMap.tickets))
      }
    }
  }

  static update(ctrl_id:number,id:number,estd_id:number): void {
    if (TicketMap.tickets[ctrl_id]) {
      if (TicketMap.tickets[ctrl_id][id]) {
        if(estd_id == TicketState.Aceptado ){
          TicketMap.tickets[ctrl_id][id].ticket.setEstdId(estd_id);
          // notify
          TicketMap.notifyTicketSchedule(TicketMap.tickets[ctrl_id][id].ticket,"update")
        }

        if(estd_id == TicketState.Cancelado || estd_id == TicketState.Rechazado || estd_id == TicketState.Finalizado || estd_id == TicketState.Anulado || estd_id == TicketState.NoAtendido){
          TicketMap.delete(ctrl_id, id)
        }
      }
    }
  }

  static delete(ctrl_id:number,id:number): void {
    if (TicketMap.tickets[ctrl_id]) {
        if (TicketMap.tickets[ctrl_id][id]) {
          // detener cron
          TicketMap.tickets[ctrl_id][id].startSchedule?.stop()
          TicketMap.tickets[ctrl_id][id].endSchedule?.stop()
          // notify
          TicketMap.notifyTicketSchedule(TicketMap.tickets[ctrl_id][id].ticket,"delete")
          // eliminar instancia
          delete TicketMap.tickets[ctrl_id][id]
        }
    }
  }

  static getTicket(ctrl_id:number){
    let resultData: ITicketCronContext[] = [];
    if (TicketMap.tickets.hasOwnProperty(ctrl_id)) {
      Object.values(TicketMap.tickets[ctrl_id]).forEach((item) => {
        let nowDateNext7 = dayjs().startOf("date").add(7,"day").unix();
        if(item.ticket.fechatermino < nowDateNext7 ){
          resultData.push(item.ticket.toJSON());
        }

      });
    }
    return resultData
  }

  static async init(){
    try {
      const initialTickets = await Ticket.getTicketsPendientesAceptados();
      for(let ticket of initialTickets){
        const {estd_id,fechacomienzo,fechatermino, ...rest} = ticket
        const newRegTicket = new RegistroTicketObject({...rest,id: ticket.rt_id,fechacomienzo: dayjs(fechacomienzo).unix(),fechatermino: dayjs(fechatermino).unix()})
        TicketMap.add(newRegTicket)
      }
    } catch (error) {
      console.log(`Socket Tickets | TicketMap | Error al inicializar tickets`);
      console.error(error);  
    }
  }
}

export class RegistroTicketObject implements ITicketCronContext {

  readonly telefono: string;
  readonly correo: string;
  readonly descripcion: string;
  readonly fechacomienzo: number;
  readonly fechatermino: number;
  readonly prioridad: number;
  readonly p_id: number;
  readonly tt_id: number;
  readonly sn_id: number;
  readonly co_id: number;
  readonly ctrl_id: number;
  readonly id: number;

  estd_id: number;

  constructor(props: Omit<ITicketCronContext, "estd_id">) {
    const { telefono, correo, descripcion, fechacomienzo, fechatermino, prioridad, p_id, tt_id, sn_id, co_id, ctrl_id, id, } = props;
    this.id = id;
    this.estd_id = TicketState.Esperando;
    this.telefono = telefono;
    this.correo = correo;
    this.descripcion = descripcion;
    this.fechacomienzo = fechacomienzo;
    this.fechatermino = fechatermino;
    this.prioridad = prioridad;
    this.p_id = p_id;
    this.tt_id = tt_id;
    this.sn_id = sn_id;
    this.co_id = co_id;
    this.ctrl_id = ctrl_id;
  }

  toJSON(): ITicketCronContext {
    return {
      telefono: this.telefono,
      correo: this.correo,
      descripcion: this.descripcion,
      fechacomienzo: this.fechacomienzo,
      fechatermino: this.fechatermino,
      prioridad: this.prioridad,
      p_id: this.p_id,
      tt_id: this.tt_id,
      sn_id: this.sn_id,
      co_id: this.co_id,
      ctrl_id: this.ctrl_id,
      estd_id: this.estd_id,
      id: this.id,
    };
  }

  setEstdId(estd_id: ITicketCronContext["estd_id"]): void {
    this.estd_id = estd_id;
  }
}


interface ITicketCronContext {
  telefono: string;
  correo: string;
  descripcion: string;
  fechacomienzo: number;
  fechatermino: number;
  prioridad: number;
  p_id: number;
  tt_id: number;
  sn_id: number;
  co_id: number;
  ctrl_id: number;
  estd_id: number;
  id: number;
}

const TicketState = {
Esperando : 1 ,
Aceptado : 2 ,
Cancelado : 3 ,
Rechazado : 4 ,
Finalizado : 16 ,
Anulado : 17 ,
NoAtendido : 18
}
