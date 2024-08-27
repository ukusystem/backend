import { Namespace, Socket } from "socket.io";
import { Controlador, SensorTemperatura } from "../../../types/db";

export type SensorTemperaturaSocket = SensorTemperatura & Pick<Controlador, "ctrl_id">;
export type SenTempAction = "add" | "delete" | "update";
export enum SenTempState {
  Activo = 1,
  Desactivado = 0,
}

export interface SensorTemperaturaSocketBad {
  ctrl_id: number;
  st_id: number;
  serie: string | null;
  ubicacion: string | null;
  actual: number | null;
  activo: number | null;
}


// Observer:
export interface SensorTemperatureObserver {
    updateListSenTemp(data: SensorTemperaturaSocket , action: SenTempAction ): void;
    updateSenTemp(data: SensorTemperaturaSocket): void;
}

export interface SensorTemperatureSubject {
    registerObserver(ctrl_id: number,observer: SensorTemperatureObserver): void;
    unregisterObserver(ctrl_id: number): void;
    notifyListSenTemp(ctrl_id: number,data: SensorTemperaturaSocket, action: SenTempAction): void;
    notifySenTemp(ctrl_id: number,data: SensorTemperaturaSocket): void;
}


// Socket :
interface ClientToServerEvents {
}
  
interface ServerToClientEvents {
  initial_list_temperature: (list: SensorTemperaturaSocket[]) => void;
  list_temperature: (modEn: SensorTemperaturaSocket, action: SenTempAction) => void;
  temperature: (modEn: SensorTemperaturaSocket) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceSenTemperature = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketSenTemperature = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;




