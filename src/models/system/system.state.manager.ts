import { MySQL2 } from "../../database/mysql";
import { ControllerUpdate } from "./system.controller.update";
import { GeneralUpdate } from "./system.general.update";
import { Resolution } from "./system.resolution";
import { ControllerConfig, ControllerConfigRowData, GeneralConfig, GeneralConfigRowData } from "./system.state.types";

export class SystemManager {

  static general: GeneralConfig 
  static #controller: { [ctrl_id: number]: ControllerConfig } = {};

  static updateGeneral(fieldsToUpdate: Partial<GeneralConfig>){
    const fieldsFiltered = SystemManager.#filterUndefinedProperties(fieldsToUpdate);
    SystemManager.#updateGeneralConfig(fieldsFiltered)
  }

  static getController(ctrl_id:number){
    if(!SystemManager.#controller[ctrl_id]){
      throw new Error("Configuracion del controlador no encontrado")
    }
    return SystemManager.#controller[ctrl_id]
  }

  static getControllerProperties(ctrl_id:number, keys: (keyof ControllerConfig)[]) : Partial<ControllerConfig> {
    const result : Record<any,any> = {}
    if(SystemManager.#controller.hasOwnProperty(ctrl_id)){
      const currCtrlConf = SystemManager.#controller[ctrl_id];
      keys.forEach((key) => {
        if(currCtrlConf[key] !== undefined){
          result[key] = currCtrlConf[key];
        }
      });
    }
    return result
  }

  static #updateGeneralConfig(fieldsToUpdate: Partial<GeneralConfig>){
    const currentGeneralConfig = SystemManager.general;
    if (currentGeneralConfig) {
      for (const key in fieldsToUpdate) {
        if (key in currentGeneralConfig) {
          const keyConfig = key as keyof GeneralConfig;
          const keyValue = fieldsToUpdate[keyConfig]
          if ( keyValue !== undefined) {
            const updateFunction = GeneralUpdate.getFunction(keyConfig);
            updateFunction(currentGeneralConfig, keyValue);
          }
        }
      }
    }
  }

  static updateController(ctrl_id: number, fieldsToUpdate: Partial<ControllerConfig> ) {
    const fieldsFiltered = SystemManager.#filterUndefinedProperties(fieldsToUpdate);
    SystemManager.#updateControllerConfig(ctrl_id,fieldsFiltered)
  }

  static addController(ctrl_id: number, configs: ControllerConfig){
    if(!SystemManager.#controller[ctrl_id]){
      SystemManager.#controller[ctrl_id] = configs
    }
  }

  static #filterUndefinedProperties<T extends ControllerConfig | GeneralConfig>( obj: Partial<T> ): Partial<T> {
    const result: Partial<T> = {};
    for (const key in obj) {
      if (obj[key] !== undefined) {
        result[key] = obj[key];
      }
    }
    return result;
  }

  static #updateControllerConfig( ctrl_id: number, fieldsToUpdate: Partial<ControllerConfig> ) {
    const currentControllerConfig = SystemManager.#controller[ctrl_id];
    if (currentControllerConfig) {
      for (const key in fieldsToUpdate) {
        if (key in currentControllerConfig) {
          const keyConfig = key as keyof ControllerConfig;
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

      await Resolution.init()

      const generalConfigs = await MySQL2.executeQuery<GeneralConfigRowData[]>({ sql: `SELECT nombreempresa AS COMPANY_NAME , correoadministrador AS EMAIL_ADMIN FROM general.configuracion LIMIT 1 OFFSET 0` });
      if(generalConfigs.length > 0){
        SystemManager.general= generalConfigs[0]
      }
      const controllerConfigs = await MySQL2.executeQuery<ControllerConfigRowData[]>({ sql: `select c.ctrl_id, c.modo as CONTROLLER_MODE, c.seguridad as CONTROLLER_SECURITY, c.conectado as CONTROLLER_CONNECT, c.motionrecordseconds as MOTION_RECORD_SECONDS, c.res_id_motionrecord, c.motionrecordfps as MOTION_RECORD_FPS, c.motionsnapshotseconds as MOTION_SNAPSHOT_SECONDS, c.res_id_motionsnapshot, c.motionsnapshotinterval as MOTION_SNAPSHOT_INTERVAL, c.streamprimaryfps as STREAM_PRIMARY_FPS, c.res_id_streamprimary, c.streamsecondaryfps as STREAM_SECONDARY_FPS, c.res_id_streamsecondary, c.streamauxiliaryfps as STREAM_AUXILIARY_FPS, c.res_id_streamauxiliary from general.controlador c` });

      controllerConfigs.forEach((ctrlConfig) => {
        const {ctrl_id, res_id_motionrecord,res_id_motionsnapshot,res_id_streamauxiliary, res_id_streamprimary, res_id_streamsecondary , ...rest} = ctrlConfig

        const resolution_motionrecord = Resolution.getResolution(res_id_motionrecord)
        const resolution_motionsnapshot = Resolution.getResolution(res_id_motionsnapshot)
        const resolution_streamauxiliary = Resolution.getResolution(res_id_streamauxiliary)
        const resolution_streamprimary = Resolution.getResolution(res_id_streamprimary)
        const resolution_streamsecondary = Resolution.getResolution(res_id_streamsecondary)

        const allRosolutionsFound =  resolution_motionrecord !== undefined && resolution_motionsnapshot !== undefined && resolution_streamauxiliary !== undefined && resolution_streamprimary !== undefined && resolution_streamsecondary !== undefined ;
        if(allRosolutionsFound){
          const newControllerConfig : ControllerConfig = {
            ...rest,
            MOTION_RECORD_RESOLUTION:resolution_motionrecord,
            MOTION_SNAPSHOT_RESOLUTION: resolution_motionsnapshot,
            STREAM_AUXILIARY_RESOLUTION: resolution_streamauxiliary,
            STREAM_PRIMARY_RESOLUTION: resolution_streamprimary,
            STREAM_SECONDARY_RESOLUTION: resolution_streamsecondary
          }
          SystemManager.addController(ctrl_id,newControllerConfig)
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

//   // setInterval(() => {
//   //   const ramdomConnect = Math.round(Math.random());
//   //   const ramdomConnect2 = Math.round(Math.random());
//   //   console.log("=========== Update conexion state =============")
//   //   console.log(1,ramdomConnect)
//   //   console.log(1,ramdomConnect2)
//   //   SystemManager.updateController(1,{CONTROLLER_CONNECT:ramdomConnect})  
//   //   SystemManager.updateController(4,{CONTROLLER_CONNECT:ramdomConnect2})  
//   // }, 2000);

// })()