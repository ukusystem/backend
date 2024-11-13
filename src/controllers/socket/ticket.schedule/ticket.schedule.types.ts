export interface RegistroTicketObj {
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
export interface RegistroTicketJobSchedule {
  stop(): void;
  start(): void;
}
interface RegistroTicketSchedule {
  ticket: RegistroTicketObj;
  startSchedule: RegistroTicketJobSchedule | undefined;
  endSchedule: RegistroTicketJobSchedule | undefined;
}

export type RegistroTicketMap = Map<number, RegistroTicketSchedule>; // key : rt_id
export type ControllerRegTicketMap = Map<number, RegistroTicketMap>; // key : ctrl_id

// Observer:
export interface RegistroTicketObserver {}

export interface RegistroTicketSubject {
  registerObserver(ctrl_id: number, new_observer: RegistroTicketObserver): void;
  unregisterObserver(ctrl_id: number): void;
}

export type ObserverSenTempMap = Map<number, RegistroTicketObserver>; // key : ctrl_id
