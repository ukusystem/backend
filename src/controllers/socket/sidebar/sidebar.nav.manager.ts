import { ControllerMapManager, RegionMapManager } from "../../../models/maps";
import { SidebarNavControllerData, SidebarNavObserver, SocketSidebarNav } from "./sidebar.nav.types";

export class SidebarNavSocketObserver implements SidebarNavObserver {
  #socket: SocketSidebarNav;
  constructor(socket: SocketSidebarNav) {
    this.#socket = socket;
  }
  updateController(controller: SidebarNavControllerData): void {
    this.#socket.nsp.emit("update_controller", controller);
  }
  addController(newController: SidebarNavControllerData): void {
    this.#socket.nsp.emit("add_controller", newController);
  }
}

export class SidebarNavManager   {
  
  static #observer : SidebarNavObserver | null = null;

  static registerObserver(observer: SidebarNavObserver): void {
    if(SidebarNavManager.#observer === null){
      SidebarNavManager.#observer = observer;
    }
  }

  static unregisterObserver(): void {
    SidebarNavManager.#observer = null;
  }

  static notifyAddController(newController: SidebarNavControllerData): void {
    if(SidebarNavManager.#observer !== null){
      SidebarNavManager.#observer.addController(newController)
    }
  }

  static notifyUpdateController(controller: SidebarNavControllerData): void {
    if(SidebarNavManager.#observer !== null){
      SidebarNavManager.#observer.updateController(controller)
    }
  }

  static getAllControllers(): SidebarNavControllerData[] {
    const activeControllers = ControllerMapManager.getAllControllers(true);
    const controllersWithRegion = activeControllers.reduce<SidebarNavControllerData[]>((prev, curr)=>{
      const result = prev;
      const {rgn_id,ctrl_id,nodo,activo,conectado,seguridad,modo,descripcion,} = curr;
      const region = RegionMapManager.getRegion(curr.rgn_id);
      if(region !== undefined){
        const sidebarController: SidebarNavControllerData = { rgn_id, ctrl_id, nodo, activo, conectado, seguridad, modo, descripcion, region: region.region, }; 
        result.push(sidebarController);
      }
      return result
    },[])

    return controllersWithRegion
  }

}