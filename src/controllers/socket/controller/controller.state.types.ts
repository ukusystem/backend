import { Socket , Namespace } from 'socket.io';
import { CONTROLLER_MODE, CONTROLLER_SECURITY, } from "../../../models/config/config.types";

export interface ControllerState {
//   mode: CONTROLLER_MODE;   // Controlado ConfigManager
//   security: CONTROLLER_SECURITY; // Controlado ConfigManager
}


interface ClientToServerEvents {
  setMode: (newMode: CONTROLLER_MODE) => void;
  setSecurity: (newSecurity: CONTROLLER_SECURITY) => void;
  initialInfo: (fields: (keyof ControllerState)[]) => void
}

interface ServerToClientEvents {
    mode : (mode: CONTROLLER_MODE) => void;
    security : (security: CONTROLLER_SECURITY) => void;
    //   basicEmit: (a: number, b: string, c: Buffer) => void;
    //   withAck: (d: string, callback: (e: number) => void) => void;
}


interface InterServerEvents {
//   ping: () => void;
}

interface SocketData {
//   name: string;
//   age: number;
}

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
  updateMode(newMode: CONTROLLER_MODE): void;
  updateSecurity(newSecurity: CONTROLLER_SECURITY): void;
}

export interface ControllerStateSubject {
  registerObserver(ctrl_id: number, observer: ControllerStateObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyMode(ctrl_id: number, mode: CONTROLLER_MODE): void;
  notifySecurity(ctrl_id: number, security: CONTROLLER_SECURITY): void;
}

//

export type UpdateControllerStateFunction<T extends keyof ControllerState> = ( currentConfig: ControllerState, newValue: ControllerState[T] , ctrl_id: number ) => void;

