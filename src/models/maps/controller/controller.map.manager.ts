import { MySQL2 } from "../../../database/mysql";
import { Controlador } from "../../../types/db";
import { ControllerNotifyManager } from "../../system";
import { RegionMapManager } from "../region";
import { Resolution } from "../resolucion";
import { ControllerAndResolution, ControllerData, ControllerRowData, ControllerState, UpdateControllerResolution } from "./controller.map.types";

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

  static #updateResolution(resUpdates: UpdateControllerResolution , curController: Controlador): UpdateControllerResolution {
    const updateResolution: Record<any, any> = {};
    for (const key in resUpdates) {
      const key_assert = key as keyof UpdateControllerResolution;
      if (resUpdates[key_assert] !== undefined) {
        const new_res_id = resUpdates[key_assert]
        const resulucion = Resolution.getResolution(new_res_id as number);
        if(resulucion !== undefined){
          Object.assign(curController,{[key_assert]: resUpdates[key_assert]});
          updateResolution[key_assert] = resUpdates[key_assert]
        }
      }
    }
    return updateResolution
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

  static getControllerAndResolution(ctrl_id:number) : ControllerAndResolution | undefined{
    const controller = ControllerMapManager.#controllers.get(ctrl_id);
    if(controller === undefined){
      return undefined
    }
    const resMotionRecord = Resolution.getResolution(controller.res_id_motionrecord);
    const resMotionSnapshot = Resolution.getResolution(controller.res_id_motionsnapshot);
    const resStreamAux = Resolution.getResolution(controller.res_id_streamauxiliary);
    const resStreamPri = Resolution.getResolution(controller.res_id_streamprimary);
    const resStreamSec = Resolution.getResolution(controller.res_id_streamsecondary);

    if(resMotionRecord !== undefined && resMotionSnapshot !== undefined && resStreamAux !== undefined && resStreamPri !== undefined && resStreamSec !== undefined){

      const result : ControllerAndResolution = {controller, resolution: {
        motion_record: resMotionRecord,
        motion_snapshot: resMotionSnapshot,
        stream_aux: resStreamAux,
        stream_pri: resStreamPri,
        stream_sec: resStreamSec
      }}
      return result
    }

    return undefined
  }

  static addController(ctrl_id: number, newController: ControllerData): void {
    const existController = ControllerMapManager.#controllers.has(ctrl_id);
    if (!existController) {
      ControllerMapManager.#controllers.set(ctrl_id, newController);
      ControllerNotifyManager.add(newController);
    }
  }

  static updateController(ctrl_id: number,fieldsUpdate: Partial<ControllerData>): void {
    const currController = ControllerMapManager.#controllers.get(ctrl_id);
    if (currController) {
      const curControllerCopy = {...currController}
      const fieldsFiltered = ControllerMapManager.#filterUndefined(fieldsUpdate);
      // ctrl_id no se esta actulizando!
      const {res_id_motionrecord,res_id_motionsnapshot,res_id_streamauxiliary,res_id_streamprimary,res_id_streamsecondary,ctrl_id,rgn_id, ...rest} = fieldsFiltered;
      const resolutionFieldsUpdate = ControllerMapManager.#updateResolution({res_id_motionrecord,res_id_motionsnapshot,res_id_streamauxiliary,res_id_streamprimary,res_id_streamsecondary},currController);

      const regFieldUpdate  : {rgn_id?: number | undefined} = {}
      if(rgn_id !== undefined){
        const region = RegionMapManager.getRegion(rgn_id);
        if(region !== undefined){
          regFieldUpdate.rgn_id = rgn_id;
        }
      }
      const finalFieldsUpdate = {...rest, ...regFieldUpdate,...resolutionFieldsUpdate} 
      Object.assign(currController, finalFieldsUpdate);
      ControllerNotifyManager.update(curControllerCopy,finalFieldsUpdate);
    }
  }

  static deleteController(ctrl_id: number): boolean {
    const deleteSuccessful = ControllerMapManager.#controllers.delete(ctrl_id);
    return deleteSuccessful;
  }

  static async init() {
    try {
      const controllers = await MySQL2.executeQuery<ControllerRowData[]>({
        sql: `SELECT * FROM general.controlador`,
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
//     setTimeout(() => {
//     const ramdomConnect = Math.round(Math.random());
//     const ramdomConnect2 = Math.round(Math.random());
//     // console.log("=========== Update conexion state =============")
//     // console.log(1,ramdomConnect)
//     // console.log(4,ramdomConnect2)
//     // ControllerMapManager.updateController(1,{conectado:ramdomConnect as 0 | 1 })  
//     // ControllerMapManager.updateController(4,{conectado:ramdomConnect2 as 0 | 1})  
//     console.log("update ctrl_id 4 --> 1")
//     ControllerMapManager.updateController(4,{conectado: 1})  
//   }, 15000);
//     setTimeout(() => {
//     console.log("update ctrl_id 5 --> 1")
//     ControllerMapManager.updateController(5,{conectado: 1})  
//   }, 30000);
//   // setTimeout(() => {
//   //   ControllerMapManager.updateController(1,{rgn_id: 3})
//   // }, 30000);

//   // setTimeout(() => {
//   //   const newController : ControllerData = {
//   //     ctrl_id: 10,
//   //     nodo: 'Nodo10',
//   //     rgn_id: 1,
//   //     direccion: 'Manuel Fuentes',
//   //     descripcion: 'Nuevo Nodo 10',
//   //     latitud: '-12.0000000',
//   //     longitud: '-72.0000000',
//   //     usuario: 'admin',
//   //     'contraseña': 'AIOEOm+Zy8UJF5O3efJ7VV7zkJAJGeVDVWwPlvB+z14=',
//   //     serie: 'SERIE1',
//   //     ip: '172.16.3.180',
//   //     mascara: '255.255.0.0',
//   //     puertaenlace: '172.16.0.1',
//   //     puerto: 3333,
//   //     personalgestion: 'Juan',
//   //     personalimplementador: 'Juan',
//   //     seguridad: 1,
//   //     conectado: 0,
//   //     activo: 1,
//   //     modo: 1,
//   //     motionrecordseconds: 30,
//   //     res_id_motionrecord: 3,
//   //     motionrecordfps: 30,
//   //     motionsnapshotseconds: 30,
//   //     res_id_motionsnapshot: 3,
//   //     motionsnapshotinterval: 5,
//   //     res_id_streamprimary: 3,
//   //     streamprimaryfps: 30,
//   //     res_id_streamsecondary: 2,
//   //     streamsecondaryfps: 30,
//   //     res_id_streamauxiliary: 1,
//   //     streamauxiliaryfps: 30,
//   //   }
//   //   ControllerMapManager.addController(10,newController)
//   // }, 60000);
// })()