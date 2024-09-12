import { Namespace, Socket } from "socket.io";
import { PinesEntrada } from "../../../types/db";

export type ActionType = "add" | "update" | "delete";

export interface CameraPropsAlarm {
  cmr_id: number;
  tc_id: number;
  // tipo: string; // notificar
  // m_id: number;
  // marca: string;
  // ip: string;
  descripcion: string;
  conectado: number;
  activo: 0|1;
}

export interface ControllerPropsAlarm {
  ctrl_id: number;
  nodo: string;
  rgn_id: number;
  // region: string; // notificar
  descripcion: string;
  seguridad: 0 | 1;
  conectado: 0 | 1;
  modo: 0 | 1;
  activo: 0 | 1;
}

// Observer:
export interface AlarmObserver {
  emitPinEntrada(ctrl_id: number, data: PinesEntrada, action: ActionType): void;
  emitCamera(ctrl_id: number, data: CameraPropsAlarm, action: ActionType): void;
  emitController(ctrl_id: number,data: ControllerPropsAlarm,action: ActionType): void;
}

export interface AlarmSubject {
  registerObserver(ctrl_id: number, observer: AlarmObserver): void;
  unregisterObserver(ctrl_id: number): void;

  notifyPinEntrada(ctrl_id: number, pe_id: number, action: ActionType): void;
  notifyCamera(ctrl_id: number, cmr_id: number, action: ActionType): void;
  notifyController(ctrl_id: number, action: ActionType): void;
}

// Socket:
interface ClientToServerEvents {}

interface ServerToClientEvents {
  pin_entrada: (ctrl_id: number, data: PinesEntrada, action: ActionType) => void;
  camera: (ctrl_id: number, data: CameraPropsAlarm, action: ActionType) => void;
  controller: (ctrl_id: number,data: ControllerPropsAlarm,action: ActionType) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceAlarma = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketAlarma = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
