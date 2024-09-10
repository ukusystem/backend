import { CamStreamQuality, CamStreamSocketManager, ControllerStateManager, PinEntradaManager, SidebarNavManager } from "../../controllers/socket";
import { Controlador } from "../../types/db";

export class ControllerNotifyManager {

  static #notifyUpdateStream(curController: Controlador,fieldsUpdate: Partial<Controlador>) {
    const {res_id_streamprimary,res_id_streamsecondary,res_id_streamauxiliary,} = fieldsUpdate;
    const { streamprimaryfps, streamsecondaryfps, streamauxiliaryfps } = fieldsUpdate;

    // primary stream
    const hasChangeStremaPri =
      (res_id_streamprimary !== undefined && curController.res_id_streamprimary !== res_id_streamprimary) ||
      (streamprimaryfps !== undefined && curController.streamprimaryfps !== streamprimaryfps);
    if(hasChangeStremaPri){
      CamStreamSocketManager.notifyChangeConfig(curController.ctrl_id,CamStreamQuality.Primary);
    }

    // secondary stream
    const hasChangeStremaSec =
      (res_id_streamsecondary !== undefined && curController.res_id_streamsecondary !== res_id_streamsecondary) ||
      (streamsecondaryfps !== undefined && curController.streamsecondaryfps !== streamsecondaryfps);
    if(hasChangeStremaSec){
      CamStreamSocketManager.notifyChangeConfig(curController.ctrl_id,CamStreamQuality.Secondary);
    }

    // Auxiliary stream
    const hasChangeStremaAux =
      (res_id_streamauxiliary !== undefined && curController.res_id_streamauxiliary !== res_id_streamauxiliary) ||
      (streamauxiliaryfps !== undefined && curController.streamauxiliaryfps !== streamauxiliaryfps);
    if(hasChangeStremaAux){
      CamStreamSocketManager.notifyChangeConfig(curController.ctrl_id,CamStreamQuality.Auxiliary);
    }
    
  };

  static #notifyUpdateSidebarNav(curController: Controlador,fieldsUpdate: Partial<Controlador>){
    const { activo, rgn_id, nodo, conectado, seguridad, modo, descripcion } = fieldsUpdate;
    const hasChangesSidebarNav =
      (activo !== undefined && curController.activo !== activo) ||
      (rgn_id !== undefined && curController.rgn_id !== rgn_id) ||
      (nodo !== undefined && curController.nodo !== nodo) ||
      (conectado !== undefined && curController.conectado !== conectado) ||
      (seguridad !== undefined && curController.seguridad !== seguridad) ||
      (modo !== undefined && curController.modo !== modo) ||
      (descripcion !== undefined && curController.descripcion !== descripcion);

      if(hasChangesSidebarNav){
        SidebarNavManager.notifyUpdateController(curController.ctrl_id)
      }
  };

  static #notifyUpdatePinEntrada(curController: Controlador,fieldsUpdate: Partial<Controlador>){
    const { seguridad, modo } = fieldsUpdate;
    if(modo !== undefined && curController.modo !== modo){
      PinEntradaManager.notifyControllerMode(curController.ctrl_id, modo);
    }

    if(seguridad !== undefined && curController.seguridad !== seguridad){
      PinEntradaManager.notifyControllerSecurity(curController.ctrl_id, seguridad);
    }
  };

  static #notifyUpdateControllerState(curController: Controlador,fieldsUpdate: Partial<Controlador>){
    const { seguridad, modo , conectado , rgn_id, nodo, descripcion , activo} = fieldsUpdate;
    const hasChanges =
    (nodo !== undefined && curController.nodo !== nodo) || 
    (rgn_id !== undefined && curController.rgn_id !== rgn_id) || 
    (descripcion !== undefined && curController.descripcion !== descripcion) || 
    (seguridad !== undefined && curController.seguridad !== seguridad) || 
    (modo !== undefined && curController.modo !== modo) ||
    (conectado !== undefined && curController.conectado !== conectado) ||
    (activo !== undefined && curController.activo !== activo);
    
    if(hasChanges){
      ControllerStateManager.notifyUpdateController(curController.ctrl_id);
    }

  }

  static update(curController: Controlador,fieldsUpdate: Partial<Controlador>) {
    // stream
    ControllerNotifyManager.#notifyUpdateStream(curController,fieldsUpdate);
    // sidebar_nav
    ControllerNotifyManager.#notifyUpdateSidebarNav(curController,fieldsUpdate);
    // pin entrada
    ControllerNotifyManager.#notifyUpdatePinEntrada(curController,fieldsUpdate);
    // ControllerState
    ControllerNotifyManager.#notifyUpdateControllerState(curController,fieldsUpdate);
  }

  static add(newController: Controlador) {
    // sidebar_nav
    SidebarNavManager.notifyAddController(newController.ctrl_id);
  }
}

// export class ControllerMap {
  
//   static #controllers: Map<number, Controlador> = new Map();

//   static #filterUndefined(data: Partial<Controlador>): Partial<Controlador> {
//     const filteredData: Record<any, any> = {};
//     for (const key in data) {
//       const key_assert = key as keyof Controlador;
//       if (data[key_assert] !== undefined) {
//         filteredData[key_assert] = data[key_assert];
//       }
//     }
//     return filteredData;
//   }

//   static getAllControllers(active: boolean = false): Controlador[] {
//     const controllers = Array.from(ControllerMap.#controllers.values());
//     if(!active) return controllers;
//     const activeControllers = controllers.filter(
//       (controller) => controller.activo === ControllerActive.Activo
//     );
//     return activeControllers;
//   }

//   static getController(ctrl_id:number, active: boolean = false) : Controlador | undefined {
//     const controller = ControllerMap.#controllers.get(ctrl_id);
//     if(controller === undefined){
//       return undefined
//     }

//     if (!active) {
//       return controller;
//     }
    
//     const isActiveController = controller.activo === ControllerActive.Activo;

//     if(isActiveController){
//       return controller;
//     }

//     return undefined;
//   }

//   static addController(ctrl_id: number, newController: Controlador): void {
//     const existController = ControllerMap.#controllers.has(ctrl_id);
//     if (!existController) {
//       ControllerMap.#controllers.set(ctrl_id, newController);
//     }
//   }

//   static updateController(ctrl_id: number,fieldsUpdate: Partial<Controlador>): void {
//     const currController = ControllerMap.#controllers.get(ctrl_id);
//     if (currController) {
//       const currContrCopy = {...currController};
//       const fieldsFiltered = ControllerMap.#filterUndefined(fieldsUpdate);
//       Object.assign(currController, fieldsFiltered);
//       ControllerNotifyManager.update(currContrCopy,fieldsFiltered)
//     }
//   }

//   static deleteController(ctrl_id: number): boolean {
//     const deleteSuccessful = ControllerMap.#controllers.delete(ctrl_id);
//     return deleteSuccessful;
//   }

//   static async init() {
//     try {
//       const controllers = await MySQL2.executeQuery<ControllerRowData[]>({
//         sql: `SELECT * FROM general.controlador`,
//       });

//       controllers.forEach((controller) => {
//         ControllerMap.addController(controller.ctrl_id, controller);
//       });
//     } catch (error) {
//       console.log(`SidebarNavManager | Error al inicializar controladores`);
//       console.error(error);
//       throw error;
//     }
//   }
// }

