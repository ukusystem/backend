import { PinesEntrada } from "../../../types/db";
import { ActionType, AlarmObserver, CameraPropsAlarm, ControllerPropsAlarm, SocketAlarma } from "./alarm.types";

export class AlarmSocketObserver implements AlarmObserver {
  #socket: SocketAlarma
  constructor(socket:SocketAlarma ){
    this.#socket = socket
  }
  
  emitPinEntrada(ctrl_id: number, data: PinesEntrada, action: ActionType): void {
    this.#socket.nsp.emit("pin_entrada",ctrl_id,data,action);
  }
  emitCamera(ctrl_id: number, data: CameraPropsAlarm, action: ActionType): void {
    this.#socket.nsp.emit("camera",ctrl_id,data,action);
  }
  emitController(ctrl_id: number, data: ControllerPropsAlarm, action: ActionType): void {
    this.#socket.nsp.emit("controller",ctrl_id,data,action); 
  }
};

export class AlarmManager {

  static #observer: AlarmObserver | null = null;

  static registerObserver(observer: AlarmObserver): void {
    if (AlarmManager.#observer === null) {
      AlarmManager.#observer = observer;
    }
  }

  static unregisterObserver(): void {
    if (AlarmManager.#observer !== null) {
      AlarmManager.#observer = null;
    }
  }

  static notifyPinEntrada(ctrl_id:number,pe_id:number, action: ActionType):void{

  };

  static notifyCamera(ctrl_id:number,cmr_id:number, action: ActionType):void{

  };

  static notifyController(ctrl_id:number, action: ActionType):void{

  };
}
