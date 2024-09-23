import { CronJob } from "cron";
import path from "path";
import { MySQL2 } from "../../database/mysql";
import { getRstpLinksByCtrlIdAndCmrId } from "../../utils/getCameraRtspLinks";
import { Init } from "../init";
import { PreferenciaStructure, CameraJob, CronTimesNvr, NvrControllerStructure, NvrJobSchedule, NvrPreferencia, NvrPreferenciaRowData, CronJobContext } from "./nvr.types";
import dayjs from "dayjs";
import fs from 'fs'
import { spawn } from "child_process";


export class NvrManager {
  static #map: NvrControllerStructure = new Map();
  static #HLS_TIME:number = 5;

  static #getCronTimes(times: Pick<NvrPreferencia, "tiempo_final" | "tiempo_inicio">): CronTimesNvr {
    const [hr_inicio, min_inicio, sec_inicio] = times.tiempo_inicio.split(":"); // "hh:mm:ss";
    const [hr_final, min_final, sec_final] = times.tiempo_final.split(":"); // "hh:mm:ss";
    return {
      cron_tiempo_inicio: `${parseInt(sec_inicio, 10)}${parseInt(min_inicio,10)}${parseInt(hr_inicio, 10)}***`,
      cron_tiempo_final: `${parseInt(sec_final, 10)}${parseInt(min_final,10)}${parseInt(hr_final, 10)}***`,
    };
  }

  static async #createDirectory(basePath: string): Promise<string>{
    try {
      const currentDateTime = dayjs();
      const folderPath = path.join(basePath,currentDateTime.format("YYYY-MM-DD"));
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      return path.resolve(basePath,currentDateTime.format("YYYY-MM-DD"));
    } catch (error) {
      console.log("Error al crear directorio NvrManager.#createDirectory");
      if(error instanceof Error){
        console.log(error.message);
      }
      throw error;
    }
  }

  static async #getFfmpegCLI(ctrl_id:number,cmr_id:number): Promise<string>{
    try {
      const [mainRtsp] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id,cmr_id);

      const basePath : string = `./nvr/hls/nodo${ctrl_id}/camara${cmr_id}`;
      const finalPath = await NvrManager.#createDirectory(basePath);

      return `ffmpeg -rtsp_transport tcp -i ${mainRtsp} -vcodec copy -f hls -hls_segment_type mpegts -hls_time ${NvrManager.#HLS_TIME} -hls_list_size 0 -hls_playlist_type event -hls_flags append_list -hls_segment_filename '${finalPath}/segment_%H_%M_%S.ts' -strftime 1 '${finalPath}/index.m3u8'`
    } catch (error) {
      console.log("Error al obtener ffmpeg cli NvrManager.#getFfmpegCLI");
      if(error instanceof Error){
        console.log(error.message);
      }
      throw error;
    }
  }

  static update(ctrl_id:number,nvrpref_id: number,fieldsToUpdate: Partial<NvrPreferencia>){
    const currPrefStructure = NvrManager.#map.get(ctrl_id);
    if(currPrefStructure !== undefined){
      const currCamJob = currPrefStructure.get(nvrpref_id);
      if(currCamJob !== undefined){
        const {nvrpref_id,...fieldsFiletered} = filterUndefined<NvrPreferencia>(fieldsToUpdate);
        // Object.assign(currRegion, fieldsFiltered);
      }
    }
  }

  static add(ctrl_id: number, preferencia: NvrPreferencia) {

    const currentDateTime = dayjs();

    const cronTimes = NvrManager.#getCronTimes({
      tiempo_final: preferencia.tiempo_final,
      tiempo_inicio: preferencia.tiempo_inicio,
    });

    const newCronJobStart = CronJob.from<null, CronJobContext>({
      cronTime: cronTimes.cron_tiempo_inicio,
      onTick: async function (this: CronJobContext) {
        // ... ejecuta cuando se cumple crontime
        const currPrefStructure = NvrManager.#map.get(this.ctrl_id);
        if(currPrefStructure !== undefined){
          const currCamJob = currPrefStructure.get(this.nvrpref_id);
          if(currCamJob !== undefined){
            // ejecutar el proceso ffmpeg
            try {
              const ffmpegCli = await NvrManager.#getFfmpegCLI(this.ctrl_id,this.cmr_id);
              const newFfmpegProcess = spawn(ffmpegCli);
              if(currCamJob.ffmpegProcess === undefined){
                currCamJob.ffmpegProcess = newFfmpegProcess;
              }else{
                currCamJob.ffmpegProcess.kill();
                delete currCamJob.ffmpegProcess;
                currCamJob.ffmpegProcess = newFfmpegProcess;
              }

            } catch (error) {
              
            }


          }
        }
      },
      onComplete: null,
      start: false,
      context: {ctrl_id,...preferencia},
    });

    const newCronJobEnd = CronJob.from<null, CronJobContext>({
      cronTime: cronTimes.cron_tiempo_final,
      onTick: function (this: CronJobContext) {
        // ... ejecuta cuando se cumple crontime
      },
      onComplete: null,
      start: false,
      context: {ctrl_id,...preferencia},
    });

    const currPrefStructure = NvrManager.#map.get(ctrl_id);
    
    if(currPrefStructure === undefined){

      const newPrefStructure: PreferenciaStructure = new Map();

      const newCamJob: CameraJob = {
        info: preferencia,
        startScheduledJob: new CamCronJob(newCronJobStart),
        endScheduleJob: new CamCronJob(newCronJobEnd),
      };
      newPrefStructure.set(preferencia.nvrpref_id, newCamJob);

      if(preferencia.activo === 1){
        newCamJob.startScheduledJob?.start();
        newCamJob.endScheduleJob?.start();
      }

      NvrManager.#map.set(ctrl_id, newPrefStructure);
    }else{
      const currCamJob = currPrefStructure.get(preferencia.nvrpref_id);
      if(currCamJob === undefined){
        const newCamJob: CameraJob = {
          info: preferencia,
          startScheduledJob: new CamCronJob(newCronJobStart),
          endScheduleJob: new CamCronJob(newCronJobEnd),
        };

        if(preferencia.activo === 1) {
          newCamJob.startScheduledJob?.start();
          newCamJob.endScheduleJob?.start();
        };

        currPrefStructure.set(preferencia.nvrpref_id, newCamJob);
      }
    }
  }

  static async init() {
    try {
      const region_nodos = await Init.getRegionNodos();
      region_nodos.forEach(async (reg_nodo) => {
        const { ctrl_id, nododb_name } = reg_nodo;

        const preferencias = await MySQL2.executeQuery<NvrPreferenciaRowData[]>(
          {
            sql: `SELECT * FROM ${nododb_name}.nvrpreferencia`,
          }
        );

        preferencias.forEach((preferencia) => {
          NvrManager.add(ctrl_id,preferencia);
        });

      });
    } catch (error) {
      console.log(`NvrManager | Error al inicializar`);
      console.error(error);
      throw error;
    }
  }
}

export class CamCronJob implements NvrJobSchedule {
  #cron: CronJob<null, CronJobContext>;
  constructor(cron: CronJob<null, CronJobContext>) {
    this.#cron = cron;
  }
  start(): void {
    this.#cron.start();
  }
  stop(): void {
    this.#cron.stop();
  }
}

function filterUndefined<T>(data: Partial<T>): Partial<T> {
  const filteredData:  Partial<T> = {};
  for (const key in data) {
    const key_assert = key as keyof T;
    if (data[key_assert] !== undefined) {
      filteredData[key_assert] = data[key_assert];
    }
  }
  return filteredData;
}