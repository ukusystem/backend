import { Socket, Namespace } from "socket.io";
import { ControllerConfig, ControllerMode, ControllerSecurity, } from "../../../models/system";
import { Controlador, Region } from "../../../types/db";

export type KeyControllerConfig = keyof ControllerConfig;

export type ControladorInfo = Pick<
  Controlador,
  | "ctrl_id"
  | "nodo"
  | "rgn_id"
  | "direccion"
  | "descripcion"
  | "latitud"
  | "longitud"
  | "serie"
  | "personalgestion"
  | "personalimplementador"
  | "modo"
  | "seguridad"
  | "conectado"
  | "activo"
> &
  Pick<Region, "region">;


export interface ErrorControllerState {
  message: string;
}

// socket
interface ClientToServerEvents {
  setMode: (newMode: ControllerMode) => void;
  setSecurity: (newSecurity: ControllerSecurity) => void;
}

interface ServerToClientEvents {
  all_controllers: (data: ControladorInfo[]) => void;
  controller_info: (data: ControladorInfo) => void;
  error_message: (data: ErrorControllerState) => void;
  update_controller: (data: ControladorInfo) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceControllerState = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketControllerState = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

// Observer
export interface ControllerStateObserver {
  updateController(newCtrl:ControladorInfo ):void;
}

export interface ControllerStateSubject {
  registerObserver(ctrl_id: number, observer: ControllerStateObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyUpdateController(ctrl_id: number): void;
}
