import { AlarmManager } from "../../controllers/socket";
import { Camara } from "../../types/db";

export class CameraNotifyManager {

  static #notifyUpdateToAlarm(ctrl_id: number,curCam: Camara,fieldsUpdate: Partial<Camara>) {
    const { conectado, descripcion, tc_id, activo,ip } = fieldsUpdate;
    const hasChanges =
      (conectado !== undefined && curCam.conectado !== conectado) ||
      (descripcion !== undefined && curCam.descripcion !== descripcion) ||
      (tc_id !== undefined && curCam.tc_id !== tc_id) ||
      (activo !== undefined && curCam.activo !== activo) ||
      (ip !== undefined && curCam.ip !== ip);

    if (hasChanges) {
      AlarmManager.notifyCamera(ctrl_id, curCam.cmr_id, "update");
    }
  }

  static #notifyAddToAlarm(ctrl_id: number,newCam: Camara){
    AlarmManager.notifyCamera(ctrl_id, newCam.cmr_id, "add");
  }

  static update(ctrl_id: number,curCam: Camara,fieldsUpdate: Partial<Camara>) {
    // notify Alarm
    CameraNotifyManager.#notifyUpdateToAlarm(ctrl_id, curCam, fieldsUpdate);
  }

  static add(ctrl_id: number,newCam: Camara) {
    // notify Alarm
    CameraNotifyManager.#notifyAddToAlarm(ctrl_id,newCam);

  }
}
