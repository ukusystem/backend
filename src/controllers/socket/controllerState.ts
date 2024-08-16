import { Server, Socket } from "socket.io";

export const contollerStateSocket = async (io: Server, socket: Socket) => {

}



enum MODE {
  Libre = 0,
  Seguridad = 1,
}

enum SECURITY {
  Desarmado = 0,
  Armado = 1,
}

interface StateController {
  mode: MODE;
  security: SECURITY;
}


interface ControllerStateObserver {
  updateMode(newMode: MODE): void;
  updateSecurity(newSecurity: SECURITY): void;
}

interface StreamSubject {
  registerObserver(ctrl_id: number, observer: ControllerStateObserver): void;
  unregisterObserver(ctrl_id: number): void;
  notifyMode(ctrl_id: number, mode: MODE): void;
  notifySecurity(ctrl_id: number, security: SECURITY): void;
}

class ControllerStateSocketObserver implements ControllerStateObserver {
  #socket: Socket;

  constructor(socket: Socket) {
    this.#socket = socket;
  }

  updateMode(newMode: MODE): void {
    this.#socket.nsp.emit("mode", newMode);
  }
  updateSecurity(newSecurity: SECURITY): void {
    this.#socket.nsp.emit("security", newSecurity);
  }
}

export class ControllerStateManager {
  static state: { [ctrl_id: number]: StateController } = {};
  static observer: { [ctrl_id: number]: ControllerStateObserver } = {};

  static registerObserver(ctrl_id: number, observer: ControllerStateObserver): void {
    if (!ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id] = observer;
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      delete ControllerStateManager.observer[ctrl_id];
    }
  }
  static notifyMode(ctrl_id: number, mode: MODE): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
        ControllerStateManager.observer[ctrl_id].updateMode(mode)
    }
    // otros
  }
  static notifySecurity(ctrl_id: number, security: SECURITY): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
        ControllerStateManager.observer[ctrl_id].updateSecurity(security)
    }
    // otros
  }
}