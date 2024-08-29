import { LastSnapShotManager } from "../../../controllers/socket/snapshot";
import { CameraForFront } from "../../controllerapp/src/frontend/camaraForFront";
import { CameraMotionProcess } from "./camera.motion.process";
import { CameraReconnect } from "./camera.motion.reconnect";

export class CameraMotionManager {
  static map: { [ctrl_id: number]: { [cmr_id: number]: CameraMotionProcess } } = {};

  public static notifyImageMotion(ctrl_id: number, imageBase64: string): void {
    LastSnapShotManager.notifyLastSnapshot(ctrl_id, imageBase64);
  }

  static #exists(props: { ctrl_id: number; cmr_id: number }): boolean {
    const { cmr_id, ctrl_id } = props;

    let is_ctrl_id: boolean = false;
    let is_cmr_id: boolean = false;

    for (const ctrl_id_key in CameraMotionManager.map) {
      if (Number(ctrl_id_key) == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const cmr_id_key in CameraMotionManager.map[ctrl_id_key]) {
        if (Number(cmr_id_key) == cmr_id) {
          is_cmr_id = true;
        }
      }
    }

    return is_ctrl_id && is_cmr_id;
  }

  static #addcam(cam: CameraMotionProcess, execute: boolean = true) {
    if (!CameraMotionManager.map.hasOwnProperty(cam.ctrl_id)) {
      CameraMotionManager.map[cam.ctrl_id] = {};
    }

    if (!CameraMotionManager.map[cam.ctrl_id].hasOwnProperty(cam.cmr_id)) {
      CameraMotionManager.map[cam.ctrl_id][cam.cmr_id] = cam;
      if (execute) {
        try {
          CameraMotionManager.map[cam.ctrl_id][cam.cmr_id].execute();
        } catch (error) {
          console.log(`Detección Movimiento | Error en CameraMotionActions.add | ctrl_id: ${cam.ctrl_id} | cmr_id: ${cam.cmr_id} | ip: ${cam.ip}`);
          console.error(error);
        }
      }
    }
  }

  static #updatecam(cam: CameraMotionProcess) {
    if (CameraMotionManager.map.hasOwnProperty(cam.ctrl_id)) {
      if (CameraMotionManager.map[cam.ctrl_id].hasOwnProperty(cam.cmr_id)) {
        const curCamMotion = CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];
        if ( curCamMotion.ip != cam.ip || curCamMotion.contraseña != cam.contraseña || curCamMotion.usuario != cam.usuario ) {
          if (curCamMotion.ffmpegProcessImage != null)
            curCamMotion.ffmpegProcessImage.kill();
          if (curCamMotion.ffmpegProcessVideo != null)
            curCamMotion.ffmpegProcessVideo.kill();

          delete CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];
          // Agregar nuevo
          CameraMotionManager.#addcam(cam);
        }
      }
    }
  }

  static delete(cam: CameraForFront | CameraMotionProcess) {
    if (CameraMotionManager.map.hasOwnProperty(cam.ctrl_id)) {
      if (CameraMotionManager.map[cam.ctrl_id].hasOwnProperty(cam.cmr_id)) {
        const currentCamMot = CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];
        if (currentCamMot.ffmpegProcessImage != null)
          currentCamMot.ffmpegProcessImage.kill();
        if (currentCamMot.ffmpegProcessVideo != null)
          currentCamMot.ffmpegProcessVideo.kill();
        delete CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];
      }
    }
  }

  static delete_all() {
    for (const ctrl_id_key in CameraMotionManager.map) {
      for (const cmr_id_key in CameraMotionManager.map[ctrl_id_key]) {
        delete CameraMotionManager.map[ctrl_id_key][cmr_id_key];
      }
    }
  }

  static add_whithout_execute(cam: CameraMotionProcess) {
    const exists = CameraMotionManager.#exists({ctrl_id: cam.ctrl_id,cmr_id: cam.cmr_id,});
    if (!exists) {
      CameraMotionManager.#addcam(cam, false);
    }
  }

  static add_update(cam: CameraForFront | CameraMotionProcess): void {
    //Comprobar existencia
    const exists = CameraMotionManager.#exists({ ctrl_id: cam.ctrl_id, cmr_id: cam.cmr_id, });

    if (cam instanceof CameraMotionProcess) {
      if (!exists) {
        CameraMotionManager.#addcam(cam);
      } else {
        CameraMotionManager.#updatecam(cam);
      }
    } else {
      let front_cmr_id = cam.cmr_id;
      let front_ctrl_id = cam.ctrl_id;
      let front_ip = cam.ip;
      let front_contraseña = cam.contraseña;
      let front_usuario = cam.usuario;

      if (!exists) {
        // add
        if ( front_cmr_id != null && front_ctrl_id != null && front_ip != null && front_contraseña != null && front_usuario != null ) {
          const newCamMot = new CameraMotionProcess({
            ip: front_ip,
            usuario: front_usuario,
            contraseña: front_contraseña,
            cmr_id: front_cmr_id,
            ctrl_id: front_ctrl_id,
          });
          CameraMotionManager.#addcam(newCamMot);
        }
      } else {
        // update
        const currentCamMot = CameraMotionManager.map[cam.ctrl_id][cam.cmr_id];

        let new_ip = front_ip ?? currentCamMot.ip;
        let new_contraseña = front_contraseña ?? currentCamMot.contraseña;
        let new_usuario = front_usuario ?? currentCamMot.usuario;

        const newCamMot = new CameraMotionProcess({
          ip: new_ip,
          usuario: new_usuario,
          contraseña: new_contraseña,
          cmr_id: front_cmr_id,
          ctrl_id: front_ctrl_id,
        });

        CameraMotionManager.#updatecam(newCamMot);
      }
    }
  }

  static async reconnect(cmr_id: number, ctrl_id: number) {
    console.log(`reconectando camara ctrl_id : ${ctrl_id} | cmr_id: ${cmr_id} `);

    if (CameraMotionManager.#exists({ ctrl_id, cmr_id })) {
      const currCamMotion = CameraMotionManager.map[ctrl_id][cmr_id];
      const cur_cmr_id = currCamMotion.cmr_id;
      const cur_ctrl_id = currCamMotion.ctrl_id;
      const cur_ip = currCamMotion.ip;
      const cur_contraseña = currCamMotion.contraseña;
      const cur_usuario = currCamMotion.usuario;

      if (currCamMotion.ffmpegProcessImage != null)
        currCamMotion.ffmpegProcessImage.kill();
      if (currCamMotion.ffmpegProcessVideo != null)
        currCamMotion.ffmpegProcessVideo.kill();

      delete CameraMotionManager.map[ctrl_id][cmr_id];

      const newCamRec = new CameraReconnect({
        cmr_id: cur_cmr_id,
        ctrl_id: cur_ctrl_id,
        ip: cur_ip,
        contraseña: cur_contraseña,
        usuario: cur_usuario,
      });

      await newCamRec.execute();
    }
  }

  static deleteFfmpegProccess(cmr_id: number, ctrl_id: number) {
    console.log(
      `Eliminando Procesos Motion ctrl_id : ${ctrl_id} | cmr_id: ${cmr_id} `
    );

    if (CameraMotionManager.map.hasOwnProperty(ctrl_id)) {
      if (CameraMotionManager.map[ctrl_id].hasOwnProperty(cmr_id)) {
        const currentCamMot = CameraMotionManager.map[ctrl_id][cmr_id];
        if (currentCamMot.ffmpegProcessImage != null)
          currentCamMot.ffmpegProcessImage.kill();
        if (currentCamMot.ffmpegProcessVideo != null)
          currentCamMot.ffmpegProcessVideo.kill();
        // delete CameraMotionMap.map[ctrl_id][cmr_id];
      }
    }
  }
}