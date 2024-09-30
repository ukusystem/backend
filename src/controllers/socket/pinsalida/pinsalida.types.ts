import { Namespace, Socket } from "socket.io";
import { Controlador, EquipoSalida, PinesSalida } from "../../../types/db";

export enum ActionPinSal {
  Automatico = 0,
  Activar = 1,
  Desactivar = -1,
}

export interface OrdenPinSalida {
  action: ActionPinSal;
  ctrl_id: number;
  pin: number;
  es_id: number;
}

export interface ResponseOrdenPinSalida {
  success: boolean;
  message: string;
  ordenSend: OrdenPinSalida;
}

export type IPinSalidaSocket = PinesSalida & Pick<Controlador, "ctrl_id"> & { automatico: boolean; orden: ActionPinSal };

export interface IPinSalidaSocketBad {
  ps_id: number;
  pin: number;
  es_id: number | null;
  descripcion: string | null;
  estado: number | null;
  activo: number | null;
  automatico: boolean;
  ctrl_id: number;
  orden: number | null;
}

export interface PinSalidaObserver {
  updateEquiposSalida(data: EquipoSalida[]): void;
  updateListPinesSalida(data: PinesSalida[], equipo_salida: EquipoSalida): void;
  updateItemPinSalida(data: IPinSalidaSocket): void;
}

export interface PinesSalidaSubject {
  registerObserver(ctrl_id: number, observer: PinSalidaObserver): void;
  unregisterObserver(ctrl_id: number, observer: PinSalidaObserver): void;
  notifyEquiposSalida(ctrl_id: number, data: EquipoSalida[]): void;
  notifyListPinesSalida( ctrl_id: number, equipo_salida: EquipoSalida, data: PinesSalida[] ): void;
  notifyItemPinSalida( ctrl_id: number, es_id: number, ps_id: number, data: IPinSalidaSocket ): void;
}


export interface IPinSalObject extends IPinSalidaSocket {
  setPsId(ps_id: IPinSalidaSocket["ps_id"]): void;
  setPin(pin: IPinSalidaSocket["pin"]): void;
  setEsId(es_id: IPinSalidaSocket["es_id"]): void;
  setDescripcion(descripcion: IPinSalidaSocket["descripcion"]): void;
  setActivo(activo: IPinSalidaSocket["activo"]): void;
  setEstado(estado: IPinSalidaSocket["estado"]): void;
  setCtrlId(ctrl_id: IPinSalidaSocket["ctrl_id"]): void;
  setAutomatico(automatico: IPinSalidaSocket["automatico"]): void;
  setOrden(orden: IPinSalidaSocket["orden"]): void;
  toJSON(): IPinSalidaSocket;
}

export interface EquSalPinSalida extends EquipoSalida {
  pines_salida: {
    [ps_id: number]: IPinSalObject;
  };
}


// Socket


interface ClientToServerEvents {
  initial_list_pines_salida: (es_id: number) => void;
  initial_item_pin_salida: (es_id: number, ps_id: number) => void;
  orden_pin_salida: (data: OrdenPinSalida) => void;
}

interface ServerToClientEvents {
  equipos_salida: (equiSal: EquipoSalida[]) => void;
  item_pin_salida: (pinSal: IPinSalidaSocket) => void;
  list_pines_salida: ( lisPinSal: IPinSalidaSocket[], equiSal: EquipoSalida ) => void;
  response_orden_pin_salida: (data: ResponseOrdenPinSalida) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespacePinSalida = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketPinSalida = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;