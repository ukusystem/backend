import { AlarmManager, CamStreamQuality, CamStreamSocketManager, ControllerStateManager, PinEntradaManager, SidebarNavManager } from "../../controllers/socket";
import { Controlador } from "../../types/db";

export class ControllerNotifyManager {

  static #notifyUpdateToStream(curController: Controlador,fieldsUpdate: Partial<Controlador>) {
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

  static #notifyUpdateToSidebarNav(curController: Controlador,fieldsUpdate: Partial<Controlador>){
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

  static #notifyUpdateToPinEntrada(curController: Controlador,fieldsUpdate: Partial<Controlador>){
    const { seguridad, modo } = fieldsUpdate;
    if(modo !== undefined && curController.modo !== modo){
      PinEntradaManager.notifyControllerMode(curController.ctrl_id, modo);
    }

    if(seguridad !== undefined && curController.seguridad !== seguridad){
      PinEntradaManager.notifyControllerSecurity(curController.ctrl_id, seguridad);
    }
  };

  static #notifyUpdateToControllerState(curController: Controlador,fieldsUpdate: Partial<Controlador>){
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

  static #notifyUpdateToAlarm(curController: Controlador,fieldsUpdate: Partial<Controlador>){

    const { nodo, seguridad, conectado, modo , activo} = fieldsUpdate;

    const hasChanges =
    (nodo !== undefined && curController.nodo !== nodo) || 
    // (descripcion !== undefined && curController.descripcion !== descripcion) || 
    (seguridad !== undefined && curController.seguridad !== seguridad) || 
    (modo !== undefined && curController.modo !== modo) ||
    (conectado !== undefined && curController.conectado !== conectado) ||
    (activo !== undefined && curController.activo !== activo);

    if(hasChanges){
      AlarmManager.notifyController(curController.ctrl_id,"update");
    }
  }

  static update(curController: Controlador,fieldsUpdate: Partial<Controlador>) {
    // stream
    ControllerNotifyManager.#notifyUpdateToStream(curController,fieldsUpdate);
    // sidebar_nav
    ControllerNotifyManager.#notifyUpdateToSidebarNav(curController,fieldsUpdate);
    // pin entrada
    ControllerNotifyManager.#notifyUpdateToPinEntrada(curController,fieldsUpdate);
    // ControllerState
    ControllerNotifyManager.#notifyUpdateToControllerState(curController,fieldsUpdate);
    // Alarm
    ControllerNotifyManager.#notifyUpdateToAlarm(curController,fieldsUpdate);
  }

  static add(newController: Controlador) {
    // sidebar_nav
    SidebarNavManager.notifyAddController(newController.ctrl_id);
  }
}

