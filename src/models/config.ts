import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../database/mysql";
import { PinesEntradaMap } from "../controllers/socket";
import { StreamQuality, StreamSocketManager } from "../controllers/socket/fluxStream";
import { Resolucion } from "../types/db";

export enum CONTROLLER_MODE {
  Libre = 0,
  Seguridad = 1,
}

export enum CONTROLLER_SECURITY {
  Desarmado = 0,
  Armado = 1,
}

interface CONTROLLER_MOTION {
  MOTION_RECORD_SECONDS: number;
  MOTION_RECORD_RESOLUTION: Resolucion;
  MOTION_RECORD_FPS: number;

  MOTION_SNAPSHOT_SECONDS: number;
  MOTION_SNAPSHOT_RESOLUTION: Resolucion;
  MOTION_SNAPSHOT_INTERVAL: number;
}


interface CONTROLLER_STREAM {

  STREAM_PRIMARY_RESOLUTION: Resolucion;
  STREAM_PRIMARY_FPS: number;

  STREAM_SECONDARY_RESOLUTION: Resolucion;
  STREAM_SECONDARY_FPS: number;
  
  STREAM_AUXILIARY_RESOLUTION: Resolucion;
  STREAM_AUXILIARY_FPS: number;
}

interface CONTROLLER_CONFIG extends CONTROLLER_MOTION, CONTROLLER_STREAM {
  CONTROLLER_MODE: CONTROLLER_MODE;
  CONTROLLER_SECURITY: CONTROLLER_SECURITY;
}

interface GENERAL_CONFIG {
  COMPANY_NAME: string,
  EMAIL_ADMIN: string
}

type CONTROLLER_CONFIG_OMIT_DB = Omit<CONTROLLER_CONFIG, "MOTION_RECORD_RESOLUTION" | "MOTION_SNAPSHOT_RESOLUTION" | "STREAM_PRIMARY_RESOLUTION" | "STREAM_SECONDARY_RESOLUTION" | "STREAM_AUXILIARY_RESOLUTION">


interface ControllerConfigRowData extends RowDataPacket, CONTROLLER_CONFIG_OMIT_DB {
  ctrl_id:number,
  res_id_motionrecord: number,
  res_id_motionsnapshot: number,
  res_id_streamprimary: number,
  res_id_streamsecondary: number,
  res_id_streamauxiliary: number
}

interface GeneralConfigRowData extends RowDataPacket, GENERAL_CONFIG { }

interface ResolucionRowData extends RowDataPacket, Resolucion {}

export class AppConfig {

  static general: GENERAL_CONFIG 
  static #controller: { [ctrl_id: number]: CONTROLLER_CONFIG } = {};
  static #resolutions : Resolucion[] = []

  static updateGeneral(fieldsToUpdate: Partial<GENERAL_CONFIG>){
    const fieldsFiltered = AppConfig.#filterUndefinedProperties(fieldsToUpdate);
    AppConfig.#updateGeneralConfig(fieldsFiltered)
  }

  static getController(ctrl_id:number){
    if(!AppConfig.#controller[ctrl_id]){
      throw new Error("Configuracion del controlador no encontrado")
    }
    return AppConfig.#controller[ctrl_id]
  }

  static #updateGeneralConfig(fieldsToUpdate: Partial<GENERAL_CONFIG>){
    const currentGeneralConfig = AppConfig.general;
    if (currentGeneralConfig) {
      for (const key in fieldsToUpdate) {
        if (key in currentGeneralConfig) {
          const keyConfig = key as keyof GENERAL_CONFIG;
          const keyValue = fieldsToUpdate[keyConfig]
          if ( keyValue !== undefined) {
            const updateFunction = GeneralUpdate.getFunction(keyConfig);
            updateFunction(currentGeneralConfig, keyValue);
          }
        }
      }
    }
  }

  static updateController(ctrl_id: number, fieldsToUpdate: Partial<CONTROLLER_CONFIG> ) {
    const fieldsFiltered = AppConfig.#filterUndefinedProperties(fieldsToUpdate);
    AppConfig.#updateControllerConfig(ctrl_id,fieldsFiltered)
  }

  static addController(ctrl_id: number, configs: CONTROLLER_CONFIG){
    if(!AppConfig.#controller[ctrl_id]){
      AppConfig.#controller[ctrl_id] = configs
    }
  }

  static getResolution(res_id:number){
    const resolutionFound = AppConfig.#resolutions.find((resolucion) => resolucion.res_id === res_id);
    return resolutionFound
  }

  static #filterUndefinedProperties<T extends CONTROLLER_CONFIG | GENERAL_CONFIG>( obj: Partial<T> ): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static #updateControllerConfig( ctrl_id: number, fieldsToUpdate: Partial<CONTROLLER_CONFIG> ) {
    const currentControllerConfig = AppConfig.#controller[ctrl_id];
    if (currentControllerConfig) {
      for (const key in fieldsToUpdate) {
        if (key in currentControllerConfig) {
          const keyConfig = key as keyof CONTROLLER_CONFIG;
          const keyValue = fieldsToUpdate[keyConfig]
          if ( keyValue !== undefined) {
            const updateFunction = ControllerUpdate.getFunction(keyConfig);
            updateFunction(currentControllerConfig, keyValue , ctrl_id);
          }
        }
      }
    }
  }

  static async init() {
    try {
      const resolutions = await MySQL2.executeQuery<ResolucionRowData[]>({sql: `SELECT * FROM general.resolucion`})
      if(resolutions.length > 0){
        AppConfig.#resolutions = resolutions
      }

      const generalConfigs = await MySQL2.executeQuery<GeneralConfigRowData[]>({ sql: `SELECT nombreempresa AS COMPANY_NAME , correoadministrador AS EMAIL_ADMIN FROM general.configuracion LIMIT 1 OFFSET 0` });
      if(generalConfigs.length > 0){
        AppConfig.general= generalConfigs[0]
      }
      // const controllerConfigs = await MySQL2.executeQuery<ControllerConfigRowData[]>({ sql: `select c.ctrl_id, c.modo as CONTROLLER_MODE, c.seguridad as CONTROLLER_SECURITY, c.motionrecordseconds as MOTION_RECORD_SECONDS, mrr.ancho as MOTION_RECORD_RESOLUTION_WIDTH, mrr.altura as MOTION_RECORD_RESOLUTION_HEIGHT, c.motionrecordfps as MOTION_RECORD_FPS, c.motionsnapshotseconds as MOTION_SNAPSHOT_SECONDS, msr.ancho as MOTION_SNAPSHOT_RESOLUTION_WIDTH, msr.altura as MOTION_SNAPSHOT_RESOLUTION_HEIGHT, c.motionsnapshotinterval as MOTION_SNAPSHOT_INTERVAL, spr.ancho as STREAM_PRIMARY_RESOLUTION_WIDTH, spr.altura as STREAM_PRIMARY_RESOLUTION_HEIGHT, c.streamprimaryfps as STREAM_PRIMARY_FPS, ssr.ancho as STREAM_SECONDARY_RESOLUTION_WIDTH, ssr.altura as STREAM_SECONDARY_RESOLUTION_HEIGHT, c.streamsecondaryfps as STREAM_SECONDARY_FPS, sar.ancho as STREAM_AUXILIARY_RESOLUTION_WIDTH, sar.altura as STREAM_AUXILIARY_RESOLUTION_HEIGHT, c.streamauxiliaryfps as STREAM_AUXILIARY_FPS from general.controlador c inner join general.resolucion mrr on c.res_id_motionrecord = mrr.res_id inner join general.resolucion msr on c.res_id_motionsnapshot = msr.res_id inner join general.resolucion spr on c.res_id_streamprimary = spr.res_id inner join general.resolucion ssr on c.res_id_streamsecondary = ssr.res_id inner join general.resolucion sar on c.res_id_streamauxiliary = sar.res_id` });
      const controllerConfigs = await MySQL2.executeQuery<ControllerConfigRowData[]>({ sql: `select c.ctrl_id, c.modo as CONTROLLER_MODE, c.seguridad as CONTROLLER_SECURITY, c.motionrecordseconds as MOTION_RECORD_SECONDS, c.res_id_motionrecord, c.motionrecordfps as MOTION_RECORD_FPS, c.motionsnapshotseconds as MOTION_SNAPSHOT_SECONDS, c.res_id_motionsnapshot, c.motionsnapshotinterval as MOTION_SNAPSHOT_INTERVAL, c.streamprimaryfps as STREAM_PRIMARY_FPS, c.res_id_streamprimary, c.streamsecondaryfps as STREAM_SECONDARY_FPS, c.res_id_streamsecondary, c.streamauxiliaryfps as STREAM_AUXILIARY_FPS, c.res_id_streamauxiliary from general.controlador c` });

      controllerConfigs.forEach((ctrlConfig) => {
        const {ctrl_id, res_id_motionrecord,res_id_motionsnapshot,res_id_streamauxiliary, res_id_streamprimary, res_id_streamsecondary , ...rest} = ctrlConfig

        const resolution_motionrecord = AppConfig.getResolution(res_id_motionrecord)
        const resolution_motionsnapshot = AppConfig.getResolution(res_id_motionsnapshot)
        const resolution_streamauxiliary = AppConfig.getResolution(res_id_streamauxiliary)
        const resolution_streamprimary = AppConfig.getResolution(res_id_streamprimary)
        const resolution_streamsecondary = AppConfig.getResolution(res_id_streamsecondary)

        const allRosolutionsFound =  resolution_motionrecord !== undefined && resolution_motionsnapshot !== undefined && resolution_streamauxiliary !== undefined && resolution_streamprimary !== undefined && resolution_streamsecondary !== undefined ;
        if(allRosolutionsFound){
          const newControllerConfig : CONTROLLER_CONFIG = {
            ...rest,
            MOTION_RECORD_RESOLUTION:resolution_motionrecord,
            MOTION_SNAPSHOT_RESOLUTION: resolution_motionsnapshot,
            STREAM_AUXILIARY_RESOLUTION: resolution_streamauxiliary,
            STREAM_PRIMARY_RESOLUTION: resolution_streamprimary,
            STREAM_SECONDARY_RESOLUTION: resolution_streamsecondary
          }
          AppConfig.addController(ctrl_id,newControllerConfig)
        }else{
          throw new Error("No se encontraron todas las resoluciones")
        }       
      })
    } catch (error) {
      console.log(`AppConfig | Init | Error al inicializar configuración`);
      console.error(error);   
    }
  }

}

type UpdateControllerFunction<T extends keyof CONTROLLER_CONFIG> = ( currentConfig: CONTROLLER_CONFIG, newValue: CONTROLLER_CONFIG[T] , ctrl_id: number ) => void;

class ControllerUpdate {

  static #functions : { [P in keyof CONTROLLER_CONFIG]: UpdateControllerFunction<P>; } = {
    CONTROLLER_MODE: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.CONTROLLER_MODE !== newValue) {
        //update
        currentConfig.CONTROLLER_MODE = newValue;
        // notify
        PinesEntradaMap.notifyControllerMode(ctrl_id, newValue);
      }
    },
    CONTROLLER_SECURITY: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.CONTROLLER_SECURITY !== newValue) {
        //update
        currentConfig.CONTROLLER_SECURITY = newValue;
        // notify
        PinesEntradaMap.notifyControllerSecurity(ctrl_id, newValue);
      }
    },
    MOTION_RECORD_SECONDS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_RECORD_SECONDS !== newValue) {
        //update
        currentConfig.MOTION_RECORD_SECONDS = newValue;
      }
    },
    MOTION_RECORD_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_RECORD_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = AppConfig.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.MOTION_RECORD_RESOLUTION = newResolution;
        }
      }
    },
    MOTION_RECORD_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_RECORD_FPS !== newValue) {
        //update
        currentConfig.MOTION_RECORD_FPS = newValue;
      }
    },
    MOTION_SNAPSHOT_SECONDS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_SNAPSHOT_SECONDS !== newValue) {
        //update
        currentConfig.MOTION_SNAPSHOT_SECONDS = newValue;
      }
    },
    MOTION_SNAPSHOT_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_SNAPSHOT_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = AppConfig.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.MOTION_SNAPSHOT_RESOLUTION = newResolution;
        }
      }
    },
    MOTION_SNAPSHOT_INTERVAL: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.MOTION_SNAPSHOT_INTERVAL !== newValue) {
        //update
        currentConfig.MOTION_SNAPSHOT_INTERVAL = newValue;
      }
    },
    STREAM_PRIMARY_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_PRIMARY_RESOLUTION.res_id !== newValue.res_id) {
        const newResolution = AppConfig.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.STREAM_PRIMARY_RESOLUTION = newResolution;
          // notify
          StreamSocketManager.notifyChangeConfig( ctrl_id, StreamQuality.Primary );
        }
      }
    },
    STREAM_PRIMARY_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_PRIMARY_FPS !== newValue) {
        //update
        currentConfig.STREAM_PRIMARY_FPS = newValue;
        // notify
        StreamSocketManager.notifyChangeConfig(ctrl_id, StreamQuality.Primary);
      }
    },
    STREAM_SECONDARY_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (
        currentConfig.STREAM_SECONDARY_RESOLUTION.res_id !== newValue.res_id
      ) {
        const newResolution = AppConfig.getResolution(newValue.res_id);
        if (newResolution) {
          //update
          currentConfig.STREAM_SECONDARY_RESOLUTION = newResolution;
          // notify
          StreamSocketManager.notifyChangeConfig( ctrl_id, StreamQuality.Secondary );
        }
      }
    },
    STREAM_SECONDARY_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_SECONDARY_FPS !== newValue) {
        //update
        currentConfig.STREAM_SECONDARY_FPS = newValue;
        // notify
        StreamSocketManager.notifyChangeConfig( ctrl_id, StreamQuality.Secondary );
      }
    },
    STREAM_AUXILIARY_RESOLUTION: (currentConfig, newValue, ctrl_id) => {
      if (
        currentConfig.STREAM_AUXILIARY_RESOLUTION.res_id !== newValue.res_id
      ) {
        const newResolution = AppConfig.getResolution(newValue.res_id);
        if (newResolution) {
          // update
          currentConfig.STREAM_AUXILIARY_RESOLUTION = newResolution;
          // notify
          StreamSocketManager.notifyChangeConfig( ctrl_id, StreamQuality.Auxiliary );
        }
      }
    },
    STREAM_AUXILIARY_FPS: (currentConfig, newValue, ctrl_id) => {
      if (currentConfig.STREAM_AUXILIARY_FPS !== newValue) {
        //update
        currentConfig.STREAM_AUXILIARY_FPS = newValue;
        // notify
        StreamSocketManager.notifyChangeConfig( ctrl_id, StreamQuality.Auxiliary );
      }
    },
  };

  static getFunction<T extends keyof CONTROLLER_CONFIG>( keyConfig: T ) :  ( currentConfig: CONTROLLER_CONFIG, newValue: CONTROLLER_CONFIG[T] , ctrl_id: number ) => void {
    return ControllerUpdate.#functions[keyConfig];
  }
}

type UpdateGeneralFunction<T extends keyof GENERAL_CONFIG> = ( currentConfig: GENERAL_CONFIG, newValue: GENERAL_CONFIG[T] ) => void;

class GeneralUpdate {
  
  static #functions : { [P in keyof GENERAL_CONFIG]: UpdateGeneralFunction<P> } = {
    COMPANY_NAME : (currentConfig, newValue) => {
      if (currentConfig.COMPANY_NAME !== newValue) {
        currentConfig.COMPANY_NAME = newValue
      }
    },
    EMAIL_ADMIN: (currentConfig, newValue) => {
      if (currentConfig.EMAIL_ADMIN !== newValue) {
        currentConfig.EMAIL_ADMIN = newValue
      }
    },
  }
  static getFunction<T extends keyof GENERAL_CONFIG>( keyConfig: T ) : ( currentConfig: GENERAL_CONFIG, newValue: GENERAL_CONFIG[T] ) => void {
    return GeneralUpdate.#functions[keyConfig];
  }
}


// (async ()=>{
//   // setInterval(()=>{
//   //   const ramdomMode = Math.round(Math.random())
//   //   const ramdomSecurity = Math.round(Math.random())
//   //   console.log({CONTROLLER_MODE: ramdomMode , CONTROLLER_SECURITY: ramdomSecurity})
//   //   AppConfig.updateController(1,{CONTROLLER_MODE: ramdomMode , CONTROLLER_SECURITY: ramdomSecurity})
//   // },20000)

//   // setInterval(() => {
//   //   console.log("============= New fps stream primary =============")
//   //   const randomNumber = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
//   //   AppConfig.updateController(1,{STREAM_PRIMARY_FPS:randomNumber})
//   // }, 30000);

//   // setInterval(() => {
//   //   console.log("============= New Resolution =============")
//   //   const randomNumber = Math.floor(Math.random() * (30 - 20 + 1)) + 20;
//   //   AppConfig.updateController(1,{STREAM_PRIMARY_RESOLUTION:{res_id: 1, activo:0,altura:0,ancho:0,nombre:"",relacionaspecto:""}})
//   // }, 30000);

// })()