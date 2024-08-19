import { MySQL2 } from "../../database/mysql";
import { CONTROLLER_CONFIG, ControllerConfigRowData, GENERAL_CONFIG, GeneralConfigRowData } from "./config.types";
import { Resolution } from "./config.resolution";
import { GeneralUpdate } from "./config.general.update";
import { ControllerUpdate } from "./config.cotroller.update";

export class ConfigManager {

  static general: GENERAL_CONFIG 
  static #controller: { [ctrl_id: number]: CONTROLLER_CONFIG } = {};

  static updateGeneral(fieldsToUpdate: Partial<GENERAL_CONFIG>){
    const fieldsFiltered = ConfigManager.#filterUndefinedProperties(fieldsToUpdate);
    ConfigManager.#updateGeneralConfig(fieldsFiltered)
  }

  static getController(ctrl_id:number){
    if(!ConfigManager.#controller[ctrl_id]){
      throw new Error("Configuracion del controlador no encontrado")
    }
    return ConfigManager.#controller[ctrl_id]
  }

  static #updateGeneralConfig(fieldsToUpdate: Partial<GENERAL_CONFIG>){
    const currentGeneralConfig = ConfigManager.general;
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
    const fieldsFiltered = ConfigManager.#filterUndefinedProperties(fieldsToUpdate);
    ConfigManager.#updateControllerConfig(ctrl_id,fieldsFiltered)
  }

  static addController(ctrl_id: number, configs: CONTROLLER_CONFIG){
    if(!ConfigManager.#controller[ctrl_id]){
      ConfigManager.#controller[ctrl_id] = configs
    }
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
    const currentControllerConfig = ConfigManager.#controller[ctrl_id];
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

      await Resolution.init()

      const generalConfigs = await MySQL2.executeQuery<GeneralConfigRowData[]>({ sql: `SELECT nombreempresa AS COMPANY_NAME , correoadministrador AS EMAIL_ADMIN FROM general.configuracion LIMIT 1 OFFSET 0` });
      if(generalConfigs.length > 0){
        ConfigManager.general= generalConfigs[0]
      }
      // const controllerConfigs = await MySQL2.executeQuery<ControllerConfigRowData[]>({ sql: `select c.ctrl_id, c.modo as CONTROLLER_MODE, c.seguridad as CONTROLLER_SECURITY, c.motionrecordseconds as MOTION_RECORD_SECONDS, mrr.ancho as MOTION_RECORD_RESOLUTION_WIDTH, mrr.altura as MOTION_RECORD_RESOLUTION_HEIGHT, c.motionrecordfps as MOTION_RECORD_FPS, c.motionsnapshotseconds as MOTION_SNAPSHOT_SECONDS, msr.ancho as MOTION_SNAPSHOT_RESOLUTION_WIDTH, msr.altura as MOTION_SNAPSHOT_RESOLUTION_HEIGHT, c.motionsnapshotinterval as MOTION_SNAPSHOT_INTERVAL, spr.ancho as STREAM_PRIMARY_RESOLUTION_WIDTH, spr.altura as STREAM_PRIMARY_RESOLUTION_HEIGHT, c.streamprimaryfps as STREAM_PRIMARY_FPS, ssr.ancho as STREAM_SECONDARY_RESOLUTION_WIDTH, ssr.altura as STREAM_SECONDARY_RESOLUTION_HEIGHT, c.streamsecondaryfps as STREAM_SECONDARY_FPS, sar.ancho as STREAM_AUXILIARY_RESOLUTION_WIDTH, sar.altura as STREAM_AUXILIARY_RESOLUTION_HEIGHT, c.streamauxiliaryfps as STREAM_AUXILIARY_FPS from general.controlador c inner join general.resolucion mrr on c.res_id_motionrecord = mrr.res_id inner join general.resolucion msr on c.res_id_motionsnapshot = msr.res_id inner join general.resolucion spr on c.res_id_streamprimary = spr.res_id inner join general.resolucion ssr on c.res_id_streamsecondary = ssr.res_id inner join general.resolucion sar on c.res_id_streamauxiliary = sar.res_id` });
      const controllerConfigs = await MySQL2.executeQuery<ControllerConfigRowData[]>({ sql: `select c.ctrl_id, c.modo as CONTROLLER_MODE, c.seguridad as CONTROLLER_SECURITY, c.motionrecordseconds as MOTION_RECORD_SECONDS, c.res_id_motionrecord, c.motionrecordfps as MOTION_RECORD_FPS, c.motionsnapshotseconds as MOTION_SNAPSHOT_SECONDS, c.res_id_motionsnapshot, c.motionsnapshotinterval as MOTION_SNAPSHOT_INTERVAL, c.streamprimaryfps as STREAM_PRIMARY_FPS, c.res_id_streamprimary, c.streamsecondaryfps as STREAM_SECONDARY_FPS, c.res_id_streamsecondary, c.streamauxiliaryfps as STREAM_AUXILIARY_FPS, c.res_id_streamauxiliary from general.controlador c` });

      controllerConfigs.forEach((ctrlConfig) => {
        const {ctrl_id, res_id_motionrecord,res_id_motionsnapshot,res_id_streamauxiliary, res_id_streamprimary, res_id_streamsecondary , ...rest} = ctrlConfig

        const resolution_motionrecord = Resolution.getResolution(res_id_motionrecord)
        const resolution_motionsnapshot = Resolution.getResolution(res_id_motionsnapshot)
        const resolution_streamauxiliary = Resolution.getResolution(res_id_streamauxiliary)
        const resolution_streamprimary = Resolution.getResolution(res_id_streamprimary)
        const resolution_streamsecondary = Resolution.getResolution(res_id_streamsecondary)

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
          ConfigManager.addController(ctrl_id,newControllerConfig)
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

// })()