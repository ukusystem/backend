import { ControllerState, ControllerStateObserver, SocketControllerState} from "./controller.state.types";
import { CONTROLLER_MODE, CONTROLLER_SECURITY, } from "../../../models/config/config.types";
import { ControllerStateUpdate } from "./controller.state.update";

export class ControllerStateSocketObserver implements ControllerStateObserver {
  #socket: SocketControllerState;

  constructor(socket: SocketControllerState) {
    this.#socket = socket;
  }

  updateMode(newMode: CONTROLLER_MODE): void {
    this.#socket.nsp.emit("mode",newMode)
  }
  
  updateSecurity(newSecurity: CONTROLLER_SECURITY): void {
    this.#socket.nsp.emit("security", newSecurity)
  }

}

export class ControllerStateManager {

  static state: { [ctrl_id: number]: ControllerState } = {};
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

  static notifyMode(ctrl_id: number, mode: CONTROLLER_MODE): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id].updateMode(mode);
    }
    // otros
  }
  
  static notifySecurity(ctrl_id: number, security: CONTROLLER_SECURITY): void {
    if (ControllerStateManager.observer.hasOwnProperty(ctrl_id)) {
      ControllerStateManager.observer[ctrl_id].updateSecurity(security);
    }
    // otros
  }

  static update( ctrl_id: number, fieldsToUpdate: Partial<ControllerState>): void {
    const fieldsFiltered = ControllerStateManager.#filterUndefinedProperties(fieldsToUpdate);
    ControllerStateManager.#updateControllerConfig(ctrl_id,fieldsFiltered)
  }

  static #updateControllerConfig( ctrl_id: number, fieldsToUpdate: Partial<ControllerState> ) {
    const currentControllerConfig = ControllerStateManager.state[ctrl_id];
    if (currentControllerConfig) {
      for (const key in fieldsToUpdate) {
        if (key in currentControllerConfig) {
          const keyConfig = key as keyof ControllerState;
          const keyValue = fieldsToUpdate[keyConfig]
          if ( keyValue !== undefined) {
            const updateFunction = ControllerStateUpdate.getFunction(keyConfig);
            updateFunction(currentControllerConfig, keyValue , ctrl_id);
          }
        }
      }
    }
  }



  static #filterUndefinedProperties<T extends ControllerState>( obj: Partial<T> ): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  }

}
