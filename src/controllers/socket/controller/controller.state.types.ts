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
  getInfo: (fields: KeyControllerConfig[]) => void;
}

interface ServerToClientEvents {
  mode: (mode: ControllerMode) => void;
  security: (security: ControllerSecurity) => void;
  data: (ctrl_id: number, data: Partial<ControllerConfig>) => void;
  all_controllers: (data: ControladorInfo[]) => void;
  controller_info: (data: ControladorInfo) => void;
  error_message: (data: ErrorControllerState) => void;
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
  updateMode(newMode: ControllerMode): void;
  updateSecurity(newSecurity: ControllerSecurity): void;
  updateAnyState(ctrl_id: number, data: Partial<ControllerConfig>): void;
}

export interface ControllerStateSubject {
  registerObserver(ctrl_id: number, observer: ControllerStateObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyMode(ctrl_id: number, mode: ControllerMode): void;
  notifySecurity(ctrl_id: number, security: ControllerSecurity): void;
  notifyAnyChange(ctrl_id: number, data: Partial<ControllerConfig>): void;
}
