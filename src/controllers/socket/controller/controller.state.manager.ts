import { ControllerStateInfo, ControllerStateObserver, SocketControllerState } from './controller.state.types';

import { ControllerMapManager, RegionMapManager } from '../../../models/maps';
import { Region } from '../../../types/db';

export class ControllerStateSocketObserver implements ControllerStateObserver {
  #socket: SocketControllerState;

  constructor(socket: SocketControllerState) {
    this.#socket = socket;
  }

  updateRegion(region: Region): void {
    this.#socket.nsp.emit('update_region', region);
  }

  updateController(newCtrl: ControllerStateInfo): void {
    this.#socket.nsp.emit('update_controller', newCtrl);
  }
}

export class ControllerStateManager {
  static observer: { [ctrl_id: number]: ControllerStateObserver } = {};

  static registerObserver(ctrl_id: number, observer: ControllerStateObserver): void {
    if (!ControllerStateManager.observer[ctrl_id]) {
      ControllerStateManager.observer[ctrl_id] = observer;
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    if (ControllerStateManager.observer[ctrl_id]) {
      delete ControllerStateManager.observer[ctrl_id];
    }
  }

  static notifyUpdateController(ctrl_id: number): void {
    if (ControllerStateManager.observer[ctrl_id]) {
      const controller = ControllerStateManager.getController(ctrl_id);
      if (controller !== undefined) {
        ControllerStateManager.observer[ctrl_id].updateController(controller);
      }
    }
  }

  static notifyUpdateRegion(rgn_id: number): void {
    const activeControllers = ControllerMapManager.getAllControllers(true);
    const controllersFiltered = activeControllers.filter((controller) => controller.rgn_id === rgn_id);
    for (const controller of controllersFiltered) {
      const { ctrl_id } = controller;
      if (ControllerStateManager.observer[ctrl_id]) {
        const region = RegionMapManager.getRegion(rgn_id);
        if (region !== undefined) {
          ControllerStateManager.observer[ctrl_id].updateRegion(region);
        }
      }
    }
  }

  // static notifyUpdateSecurityButton(ctrl_id: number, data: boolean): void{
  //   if (ControllerStateManager.observer[ctrl_id]){

  //   }
  // }

  static getController(ctrl_id: number): ControllerStateInfo | undefined {
    const controller = ControllerMapManager.getController(ctrl_id, true);
    if (controller === undefined) {
      return undefined;
    }
    const region = RegionMapManager.getRegion(controller.rgn_id);

    if (region === undefined) {
      return undefined;
    }

    const controllerInfo: ControllerStateInfo = {
      activo: controller.activo,
      conectado: controller.conectado,
      ctrl_id: controller.ctrl_id,
      descripcion: controller.descripcion,
      modo: controller.modo,
      nodo: controller.nodo,
      region: region.region,
      rgn_id: controller.rgn_id,
      seguridad: controller.seguridad,
    };

    return controllerInfo;
  }

  // static updateNewState(ctrl_id:number,fieldsToUpdate : Partial<NewStatesController>){
  //   const filte

  // }
}
