import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import { Camara } from "../../types/db";
import { Init } from "../init";
import { CameraNotifyManager } from "../system";

interface CameraRowData extends RowDataPacket, Camara {}

export class NodoCameraMapManager {
  static #camaras: Record<number,Map<number, Camara>> = {};

  static #filterUndefined(data: Partial<Camara>): Partial<Camara> {
    const filteredData: Record<any, any> = {};
    for (const key in data) {
      const key_assert = key as keyof Camara;
      if (data[key_assert] !== undefined) {
        filteredData[key_assert] = data[key_assert];
      }
    }
    return filteredData;
  }

  static add(ctrl_id: number, newCam: Camara) {
    if (!NodoCameraMapManager.#camaras.hasOwnProperty(ctrl_id)) {
        NodoCameraMapManager.#camaras[ctrl_id] = new Map();
    }

    const hasCamera = NodoCameraMapManager.#camaras[ctrl_id].has(newCam.cmr_id);

    if (!hasCamera) {
      NodoCameraMapManager.#camaras[ctrl_id].set(newCam.cmr_id, newCam);
      CameraNotifyManager.add(ctrl_id,newCam);
    }
  }

  static update(ctrl_id: number,cmr_id_index: number, fieldsUpdate: Partial<Camara>) {
    if (NodoCameraMapManager.#camaras.hasOwnProperty(ctrl_id)) {
      const curCam = NodoCameraMapManager.#camaras[ctrl_id].get(cmr_id_index);
      if (curCam !== undefined) {
        const curCamCopy = {...curCam};
        const { cmr_id, ...fieldsFiltered } = NodoCameraMapManager.#filterUndefined(fieldsUpdate);
        Object.assign(curCam, fieldsFiltered);
        CameraNotifyManager.update(ctrl_id,curCamCopy,fieldsFiltered);
      }
    }
  }

  static getCamera(ctrl_id:number,cmr_id:number) : Camara | undefined {
    if (NodoCameraMapManager.#camaras.hasOwnProperty(ctrl_id)) {
      return NodoCameraMapManager.#camaras[ctrl_id].get(cmr_id);
    }
    return undefined;
  }

  static getCamerasByCtrlID(ctrl_id:number,active:boolean = false):Camara[]{
    if (NodoCameraMapManager.#camaras.hasOwnProperty(ctrl_id)) {
      const camaras = Array.from(NodoCameraMapManager.#camaras[ctrl_id].values());
      if(!active){
        return camaras
      }
      const activeCameras = camaras.filter((cam)=> cam.activo === 1)
      return activeCameras;
    }
    return [];
  }

  static async init() {
    try {
    const region_nodos = await Init.getRegionNodos()
    region_nodos.forEach(async (reg_nodo) => {
      const { ctrl_id,nododb_name } = reg_nodo;
      const cams = await MySQL2.executeQuery<CameraRowData[]>({
        sql: `SELECT * FROM ${nododb_name}.camara`,
      });
      cams.forEach((cam) => {
        NodoCameraMapManager.add(ctrl_id, cam);
      });
    });

    } catch (error) {
      console.log(`CameraMapManager | Error al inicializar camaras`);
      console.error(error);
      throw error;
    }
  }
}

// (()=>{
//   setTimeout(() => {
//     console.log("========Update Cam 5 =====")
//     NodoCameraMapManager.update(1,5,{conectado:0})
//   }, 20000);
// })()