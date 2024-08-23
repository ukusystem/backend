import { Socket , Namespace } from 'socket.io';
import { ControllerConfig, ControllerMode, ControllerSecurity} from '../../../models/system';

export type KeyControllerConfig = keyof ControllerConfig

interface ClientToServerEvents {
  setMode: (newMode: ControllerMode) => void;
  setSecurity: (newSecurity: ControllerSecurity) => void;
  getInfo: (fields: KeyControllerConfig[]) => void
}

interface ServerToClientEvents {
    mode : (mode: ControllerMode) => void;
    security : (security: ControllerSecurity) => void;
    data : (ctrl_id:number,data: Partial<ControllerConfig>) => void ;
}


interface InterServerEvents {

}

interface SocketData {

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
  updateMode(newMode: ControllerMode): void;
  updateSecurity(newSecurity: ControllerSecurity): void;
  updateAnyState(ctrl_id: number,data: Partial<ControllerConfig>): void;
}

export interface ControllerStateSubject {
  registerObserver(ctrl_id: number, observer: ControllerStateObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyMode(ctrl_id: number, mode: ControllerMode): void;
  notifySecurity(ctrl_id: number, security: ControllerSecurity): void;
  notifyAnyChange(ctrl_id:number,data: Partial<ControllerConfig>): void
}

