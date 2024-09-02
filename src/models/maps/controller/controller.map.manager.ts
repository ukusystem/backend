import { MySQL2 } from "../../../database/mysql";
import { ControllerNotifyManager } from "../../system";
import { ControllerData, ControllerRowData, ControllerState } from "./controller.map.types";

export class ControllerMapManager {
  
  static #controllers: Map<number, ControllerData> = new Map();

  static #filterUndefined(data: Partial<ControllerData>): Partial<ControllerData> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof ControllerData;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static getAllControllers(active: boolean = false): ControllerData[] {
    const controllers = Array.from(ControllerMapManager.#controllers.values());
    if(!active) return controllers;
    const activeControllers = controllers.filter(
      (controller) => controller.activo === ControllerState.Activo
    );
    return activeControllers;
  }

  static getController(ctrl_id:number, active: boolean = false) : ControllerData | undefined {
    const controller = ControllerMapManager.#controllers.get(ctrl_id);
    if(controller === undefined){
      return undefined
    }

    if (!active) {
      return controller;
    }
    
    const isActiveController = controller.activo === ControllerState.Activo;

    if(isActiveController){
      return controller;
    }

    return undefined;
  }

  static addController(ctrl_id: number, newController: ControllerData): void {
    const existController = ControllerMapManager.#controllers.has(ctrl_id);
    if (!existController) {
      ControllerMapManager.#controllers.set(ctrl_id, newController);
    }
  }

  static updateController(ctrl_id: number,fieldsUpdate: Partial<ControllerData>): void {
    const currController = ControllerMapManager.#controllers.get(ctrl_id);
    if (currController) {
      const curControllerCopy = {...currController}
      const fieldsFiltered = ControllerMapManager.#filterUndefined(fieldsUpdate);
      Object.assign(currController, fieldsFiltered);
      ControllerNotifyManager.update(curControllerCopy,fieldsFiltered);
    }
  }

  static deleteController(ctrl_id: number): boolean {
    const deleteSuccessful = ControllerMapManager.#controllers.delete(ctrl_id);
    return deleteSuccessful;
  }

  static async init() {
    try {
      const controllers = await MySQL2.executeQuery<ControllerRowData[]>({
        sql: `SELECT c.* , r.region FROM general.controlador c INNER JOIN general.region r ON c.rgn_id = r.rgn_id ORDER BY c.ctrl_id ASC`,
      });

      controllers.forEach((controller) => {
        ControllerMapManager.addController(controller.ctrl_id, controller);
      });
    } catch (error) {
      console.log(`SidebarNavManager | Error al inicializar controladores`);
      console.error(error);
      throw error;
    }
  }
}


// (async ()=>{
//     setInterval(() => {
//     const ramdomConnect = Math.round(Math.random());
//     const ramdomConnect2 = Math.round(Math.random());
//     console.log("=========== Update conexion state =============")
//     console.log(1,ramdomConnect)
//     console.log(4,ramdomConnect2)
//     ControllerMapManager.updateController(1,{conectado:ramdomConnect})  
//     ControllerMapManager.updateController(4,{conectado:ramdomConnect2})  
//   }, 10000);
// })()