import { ControllerMapManager, RegionMapManager, TipoCamaraMapManager } from "../../../models/maps";
import { NodoCameraMapManager } from "../../../models/maps/nodo.camera";
import { PinesEntrada } from "../../../types/db";
import { PinEntradaManager } from "../pinentrada";
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
    if(AlarmManager.#observer !== null){
      const pinEntrada = PinEntradaManager.getPinEntrada(String(ctrl_id),String(pe_id));
      if(pinEntrada !== null){
        AlarmManager.#observer.emitPinEntrada(ctrl_id,pinEntrada.toJSON(),action);
      }
    }
  };

  static notifyCamera(ctrl_id:number,cmr_id:number, action: ActionType):void{
    if(AlarmManager.#observer !== null){
      const cam = NodoCameraMapManager.getCamera(ctrl_id,cmr_id);
      if(cam !== undefined){
        const {activo,conectado,descripcion,tc_id} = cam
        AlarmManager.#observer.emitCamera(ctrl_id,{activo,cmr_id,conectado,descripcion,tc_id},action)
        // const tipoCam = TipoCamaraMapManager.getTipoCamara(cam.tc_id);
        // if(tipoCam !== undefined){
        //   const {activo,conectado,descripcion,tc_id} = cam
        //   AlarmManager.#observer.emitCamera(ctrl_id,{activo,cmr_id,conectado,descripcion,tc_id,tipo: tipoCam.tipo},action)
        // }
      }  
    }
  };

  static notifyController(ctrl_id:number, action: ActionType):void{
    if(AlarmManager.#observer !== null){
      const controller = ControllerMapManager.getController(ctrl_id);
        if(controller !== undefined){
          const {rgn_id,ctrl_id,nodo,activo,conectado,seguridad,modo,descripcion} = controller;
          const controllerAlarm: ControllerPropsAlarm = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion}; 
          AlarmManager.#observer.emitController(ctrl_id,controllerAlarm,action);
          // const region = RegionMapManager.getRegion(controller.rgn_id);
          // if(region !== undefined){
          //   const {rgn_id,ctrl_id,nodo,activo,conectado,seguridad,modo,descripcion} = controller;
          //   const controllerAlarm: ControllerPropsAlarm = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, region: region.region }; 
          //   AlarmManager.#observer.emitController(ctrl_id,controllerAlarm,action);
          // }
        }
    }
  };
}
