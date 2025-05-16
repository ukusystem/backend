import { ControllerMapManager, RegionMapManager } from '../../../models/maps';
import { ControllerActive } from '../../../models/system';
import { Region } from '../../../types/db';
import { PinEntActionType, PinEntradaDTO } from '../pinentrada';
import { SidebarNavControllerData, SidebarNavObserver, SocketSidebarNav } from './sidebar.nav.types';

export class SidebarNavSocketObserver implements SidebarNavObserver {
  #socket: SocketSidebarNav;
  constructor(socket: SocketSidebarNav) {
    this.#socket = socket;
  }
  updateInputPin(ctrl_id: number, pe_id: number, data: PinEntradaDTO, action: PinEntActionType): void {
    this.#socket.nsp.emit('update_inputpin', ctrl_id, pe_id, data, action);
  }
  updateRegion(region: Region): void {
    this.#socket.nsp.emit('update_region', region);
  }
  updateController(controller: SidebarNavControllerData): void {
    this.#socket.nsp.emit('update_controller', controller);
  }
  addController(newController: SidebarNavControllerData): void {
    this.#socket.nsp.emit('add_controller', newController);
  }
}

export class SidebarNavManager {
  static #observer: SidebarNavObserver | null = null;

  static readonly equiEntBuzonId: number = 17;

  static registerObserver(observer: SidebarNavObserver): void {
    if (SidebarNavManager.#observer === null) {
      SidebarNavManager.#observer = observer;
    }
  }

  static unregisterObserver(): void {
    if (SidebarNavManager.#observer !== null) {
      SidebarNavManager.#observer = null;
    }
  }

  static notifyAddController(new_ctrl_id: number): void {
    if (SidebarNavManager.#observer !== null) {
      const addController = ControllerMapManager.getController(new_ctrl_id);
      if (addController !== undefined) {
        const { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion } = addController;
        if (activo === ControllerActive.Activo) {
          const region = RegionMapManager.getRegion(rgn_id);
          if (region !== undefined) {
            const sidebarController: SidebarNavControllerData = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, region: region.region };
            SidebarNavManager.#observer.addController(sidebarController);
          }
        }
      }
    }
  }

  static notifyUpdateController(ctrl_id: number): void {
    if (SidebarNavManager.#observer !== null) {
      const updateController = ControllerMapManager.getController(ctrl_id);
      if (updateController !== undefined) {
        const { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion } = updateController;
        const region = RegionMapManager.getRegion(rgn_id);
        if (region !== undefined) {
          const sidebarController: SidebarNavControllerData = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, region: region.region };
          SidebarNavManager.#observer.updateController(sidebarController);
        }
      }
    }
  }

  static notifyUpdateRegion(rgn_id: number): void {
    if (SidebarNavManager.#observer !== null) {
      const region = RegionMapManager.getRegion(rgn_id);
      if (region !== undefined) {
        SidebarNavManager.#observer.updateRegion(region);
      }
    }
  }
  static notifyUpdateInputPin(ctrl_id: number, pe_id: number, data: PinEntradaDTO, action: PinEntActionType) {
    if (SidebarNavManager.#observer !== null) {
      if (data.latitud !== undefined && data.longitud !== undefined && data.ee_id === SidebarNavManager.equiEntBuzonId) {
        SidebarNavManager.#observer.updateInputPin(ctrl_id, pe_id, data, action);
      }
    }
  }

  static getAllControllers(): SidebarNavControllerData[] {
    const activeControllers = ControllerMapManager.getAllControllers(true);
    const controllersWithRegion = activeControllers.reduce<SidebarNavControllerData[]>((prev, curr) => {
      const result = prev;
      const { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion } = curr;
      const region = RegionMapManager.getRegion(curr.rgn_id);
      if (region !== undefined) {
        const sidebarController: SidebarNavControllerData = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, region: region.region };
        result.push(sidebarController);
      }
      return result;
    }, []);

    return controllersWithRegion;
  }
}
