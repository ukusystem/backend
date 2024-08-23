import { ControllerStateObserver, KeyControllerConfig, SocketControllerState} from "./controller.state.types";

import { ControllerConfig, ControllerMode, ControllerSecurity, GeneralConfig, SystemManager } from "../../../models/system";

export class ControllerStateSocketObserver implements ControllerStateObserver {
  #socket: SocketControllerState;

  constructor(socket: SocketControllerState) {
    this.#socket = socket;
  }

  updateAnyState(ctrl_id: number, data: Partial<ControllerConfig>): void {
    this.#socket.nsp.emit("data",ctrl_id,data)
  }

  updateMode(newMode: ControllerMode): void {
    this.#socket.nsp.emit("mode",newMode)
  }
  
  updateSecurity(newSecurity: ControllerSecurity): void {
    this.#socket.nsp.emit("security", newSecurity)
  }

}

export class ControllerStateManager {

  static observer: { [ctrl_id: number]: ControllerStateObserver } = {};

  static registerObserver( ctrl_id: number, observer: ControllerStateObserver ): void {
    if (!ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id] = observer;
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      delete ControllerStateManager.observer[ctrl_id];
    }
  }

  static notifyMode(ctrl_id: number, mode: ControllerMode): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id].updateMode(mode);
    }
  }
  
  static notifySecurity(ctrl_id: number, security: ControllerSecurity): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id].updateSecurity(security);
    }
  }

  static notifyAnyChange(ctrl_id:number, data: Partial<ControllerConfig>): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id].updateAnyState(ctrl_id,data);
    }

    if(ControllerStateManager.observer.hasOwnProperty(0)){
      ControllerStateManager.observer[0].updateAnyState(ctrl_id,data);
    }
  }


  static getPropertyValues(ctrl_id:number ,keys: KeyControllerConfig[]){

    const propValues = SystemManager.getControllerProperties(ctrl_id,keys);
    
    return propValues
  }

}
