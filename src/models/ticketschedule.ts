import { CronJob } from "cron";

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
        schedule: TicketSchedule;
      };
    };
  };
}

export class TicketMap {
  static readonly tickets: TicketMapProps["tickets"] = {};

  static add(ticket: RegistroTicketObject): void {
    if (!TicketMap.tickets[ticket.ctrl_id]) {
      TicketMap.tickets[ticket.ctrl_id] = {};
    }
    if(!TicketMap.tickets[ticket.ctrl_id][ticket.id]){

        const newCron = CronJob.from<null,ITicketCronContext>({
            cronTime: new Date(ticket.fechacomienzo*1000),
            onTick: function (this: ITicketCronContext) {
              if(TicketMap.tickets[this.ctrl_id]){
                  if(TicketMap.tickets[this.ctrl_id][this.id]){
                       // comprobar ticket estado -> Esperando
                      if(TicketMap.tickets[this.ctrl_id][this.id].ticket.estd_id == TicketState.Esperando){
                          // notificar ticket no atendido

                          // eliminar ticket
                          TicketMap.delete(this.ctrl_id, this.id)
                      }
                  }
              }
            },
            onComplete:null,
            start: true,
            context: ticket.toJSON()
        });
      
        const newTicketSchedule = new TicketSchedule(newCron)
      
        TicketMap.tickets[ticket.ctrl_id][ticket.id] = {ticket: ticket,schedule: newTicketSchedule}
    }
  }

  static update(ctrl_id:number,id:number,estd_id:number): void {
    if (TicketMap.tickets[ctrl_id]) {
      if (TicketMap.tickets[ctrl_id][id]) {
        TicketMap.tickets[ctrl_id][id].ticket.setEstdId(estd_id);
      }
    }
  }

  static delete(ctrl_id:number,id:number): void {
    if (TicketMap.tickets[ctrl_id]) {
        if (TicketMap.tickets[ctrl_id][id]) {
            // detener cron
            TicketMap.tickets[ctrl_id][id].schedule.stop()
            // eliminar instancia
            delete TicketMap.tickets[ctrl_id][id]
        }
    }
  }
}

class RegistroTicketObject implements ITicketCronContext {

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
Completado : 5 ,
// Error : 6 ,
// Montado : 7 ,
// Desmontado : 8 ,
// Expulsado : 9 ,
// Timeout : 10 ,
// Ejecutado : 11 ,
// Desconectado : 12 ,
// MalFormato : 13 ,
// Inexistente : 14 ,
Invalido : 15 ,
Finalizado : 16 ,
Anulado : 17 ,
NoAtendido : 18 
}
