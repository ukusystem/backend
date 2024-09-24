import { CronJob } from "cron";
import path from "path";
import { MySQL2 } from "../../database/mysql";
import { getRstpLinksByCtrlIdAndCmrId } from "../../utils/getCameraRtspLinks";
import { Init } from "../init";
import { PreferenciaStructure, CameraJob, CronTimesNvr, NvrControllerStructure, NvrJobSchedule, NvrPreferencia, NvrPreferenciaRowData, CronJobContext, SecondTimesNvr } from "./nvr.types";
import dayjs from "dayjs";
import fs from 'fs'
import { spawn } from "child_process";

export class NvrManager {
  static #map: NvrControllerStructure = new Map();
  static #HLS_TIME:number = 5;

  static #getCronTimes(times: Pick<NvrPreferencia, "tiempo_final" | "tiempo_inicio" | "dia">): CronTimesNvr {
    const [hr_inicio, min_inicio, sec_inicio] = times.tiempo_inicio.split(":"); // "hh:mm:ss";
    const [hr_final, min_final, sec_final] = times.tiempo_final.split(":");

    let cronStartTime : string = `${parseInt(sec_inicio, 10)} ${parseInt(min_inicio,10)} ${parseInt(hr_inicio, 10)} * * ${times.dia}`;

    const currStartDateTime = dayjs().set("hour",parseInt(hr_inicio, 10)).set("minute",parseInt(min_inicio,10)).set("second",parseInt(sec_inicio, 10));
    const currStartDateTimeAjusted = currStartDateTime.subtract(NvrManager.#HLS_TIME,"second");

    if(currStartDateTime.format("YYYY-MM-DD") === currStartDateTimeAjusted.format("YYYY-MM-DD")){
      cronStartTime = `${currStartDateTimeAjusted.second()} ${currStartDateTimeAjusted.minute()} ${currStartDateTimeAjusted.hour()} * * ${times.dia}`;
    }else{
      const currStartDayTime = currStartDateTime.startOf("day")
      cronStartTime = `${currStartDayTime.second()} ${currStartDayTime.minute()} ${currStartDayTime.hour()} * * ${times.dia}`;
    }

    let cronEndTime : string = `${parseInt(sec_inicio, 10)} ${parseInt(min_inicio,10)} ${parseInt(hr_inicio, 10)} * * ${times.dia}`;
    const currEndDateTime = dayjs().set("hour",parseInt(hr_final, 10)).set("minute",parseInt(min_final,10)).set("second",parseInt(sec_final, 10));
    const currEndDateTimeAjusted = currEndDateTime.add(NvrManager.#HLS_TIME,"second");
  
    if(currEndDateTime.format("YYYY-MM-DD") === currEndDateTimeAjusted.format("YYYY-MM-DD")){
      cronEndTime = `${currEndDateTimeAjusted.second()} ${currEndDateTimeAjusted.minute()} ${currEndDateTimeAjusted.hour()} * * ${times.dia}`;
    }else{
      const currEndDayTime = currEndDateTime.endOf("day")
      cronEndTime = `${currEndDayTime.second()} ${currEndDayTime.minute()} ${currEndDayTime.hour()} * * ${times.dia}`;
    }

    return {
      cron_tiempo_inicio: cronStartTime,
      cron_tiempo_final: cronEndTime,
    };


  }

  static #getTimesInSecond(times: Pick<NvrPreferencia, "tiempo_final" | "tiempo_inicio">) : SecondTimesNvr {
    const [hr_inicio, min_inicio, sec_inicio] = times.tiempo_inicio.split(":");
    const [hr_final, min_final, sec_final] = times.tiempo_final.split(":");
    const startTimeSeconds = (parseInt(hr_inicio, 10)*60*60) + (parseInt(min_inicio,10)*60) + (parseInt(sec_inicio, 10));
    const endTimeSeconds = (parseInt(hr_final, 10)*60*60) + (parseInt(min_final,10)*60) + (parseInt(sec_final, 10));
    return {
      end_time_seconds:endTimeSeconds,
      start_time_seconds: startTimeSeconds,
    };
  }

  static async #createDirectory(basePath: string): Promise<string>{
    try {
      const currentDateTime = dayjs();
      const folderPath = path.join(basePath,currentDateTime.format("YYYY-MM-DD"));
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      // for (let i = 0; i < 24; i++) {
      //   const directoryHoursPath = path.join(folderPath, i.toString());
      //   // Crear el directorio si no existe
      //   fs.mkdirSync(directoryHoursPath, { recursive: true });
      // }
      return path.resolve(basePath,currentDateTime.format("YYYY-MM-DD")).split(path.sep).join(path.posix.sep);
    } catch (error) {
      console.log("Error al crear directorio NvrManager.#createDirectory");
      if(error instanceof Error){
        console.log(error.message);
      }
      throw error;
    }
  }

  static async #getFfmpegCLI(ctrl_id:number,cmr_id:number): Promise<string[]>{
    try {
      const [mainRtsp] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id,cmr_id);

      const basePath : string = `./nvr/hls/nodo${ctrl_id}/camara${cmr_id}`;
      const finalPath = await NvrManager.#createDirectory(basePath);

      const keyArgs : string[] =[
        "-rtsp_transport","tcp",
        "-i",mainRtsp,
        "-vcodec","copy",
        "-f","hls",
        "-hls_segment_type","mpegts",
        "-hls_time",`${NvrManager.#HLS_TIME}`,
        "-hls_list_size","0",
        "-hls_playlist_type","event",
        "-hls_flags","append_list",
        // "-hls_segment_filename",`${finalPath}/%H/segment_%H_%M_%S.ts`,
        "-hls_segment_filename",`${finalPath}/segment_%H_%M_%S.ts`,
        "-strftime","1",
        `${finalPath}/index.m3u8`
      ]

      return keyArgs;
    } catch (error) {
      console.log("Error al obtener ffmpeg cli NvrManager.#getFfmpegCLI");
      if(error instanceof Error){
        console.log(error.message);
      }
      throw error;
    }
  }

  static async update(ctrl_id:number,nvrpref_id_update: number,fieldsToUpdate: Partial<NvrPreferencia>){
    try {
      const currPrefStructure = NvrManager.#map.get(ctrl_id);
      if(currPrefStructure !== undefined){
        const currCamJob = currPrefStructure.get(nvrpref_id_update);
        if(currCamJob !== undefined){
          const {nvrpref_id,...fieldsFiletered} = filterUndefined<NvrPreferencia>(fieldsToUpdate);
          const {activo,cmr_id,dia,tiempo_final,tiempo_inicio} = fieldsFiletered;
  
          const hasChanges: boolean =
            (cmr_id !== undefined && currCamJob.info.cmr_id !== cmr_id) ||
            (dia !== undefined && currCamJob.info.dia !== dia) ||
            (tiempo_final !== undefined && currCamJob.info.tiempo_final !== tiempo_final) ||
            (activo !== undefined && currCamJob.info.activo !== activo) ||
            (tiempo_inicio !== undefined && currCamJob.info.tiempo_inicio !== tiempo_inicio);
  
          if(hasChanges){
            // stops cron jobs:
            if(currCamJob.endScheduleJob){
              currCamJob.endScheduleJob.stop();
              delete currCamJob.endScheduleJob;
            }
            if(currCamJob.startScheduledJob){
              currCamJob.startScheduledJob.stop();
              delete currCamJob.startScheduledJob;
            }
            // kill ffmpeg process:
            if(currCamJob.ffmpegProcess !== undefined){
              currCamJob.ffmpegProcess.kill();
              delete currCamJob.ffmpegProcess;
            }
            // update with new values:
            Object.assign(currCamJob.info,fieldsFiletered);
  
            // delete preference:
            currPrefStructure.delete(nvrpref_id_update);
            NvrManager.#map.set(ctrl_id,currPrefStructure);
  
            // add new preference:
            await NvrManager.add(ctrl_id,currCamJob.info);

          }
  
        }
      }
    } catch (error) {
      console.log("Error al actualizar nvrpreferencia | NvrManager.update()");
      if(error instanceof Error){
        console.log(error.message);
      }
    }
  }

  static async add(ctrl_id: number, preferencia: NvrPreferencia) {

    const currentDateTime = dayjs();
    const currentTimeSeconds = (currentDateTime.hour()*60*60) + (currentDateTime.minute()*60) + (currentDateTime.second());
    const secondTimes = NvrManager.#getTimesInSecond({
      tiempo_final: preferencia.tiempo_final,
      tiempo_inicio: preferencia.tiempo_inicio,
    });

    const isInRangeCurTime = currentTimeSeconds > secondTimes.start_time_seconds && currentTimeSeconds < secondTimes.end_time_seconds;

    const cronTimes = NvrManager.#getCronTimes({
      tiempo_final: preferencia.tiempo_final,
      tiempo_inicio: preferencia.tiempo_inicio,
      dia: preferencia.dia
    });

    const newCronJobStart = CronJob.from<null, CronJobContext>({
      cronTime: cronTimes.cron_tiempo_inicio,
      onTick: async function (this: CronJobContext) {
        const currPrefStructure = NvrManager.#map.get(this.ctrl_id);
        if(currPrefStructure !== undefined){
          const currCamJob = currPrefStructure.get(this.nvrpref_id);
          if(currCamJob !== undefined){
            try {
              const ffmpegCli = await NvrManager.#getFfmpegCLI(this.ctrl_id,this.cmr_id);
              const newFfmpegProcess = spawn("ffmpeg",ffmpegCli);
              if(currCamJob.ffmpegProcess === undefined){
                currCamJob.ffmpegProcess = newFfmpegProcess;
              }else{
                currCamJob.ffmpegProcess.kill();
                delete currCamJob.ffmpegProcess;
                currCamJob.ffmpegProcess = newFfmpegProcess;
              }

              currPrefStructure.set(this.nvrpref_id,currCamJob);
              NvrManager.#map.set(this.ctrl_id,currPrefStructure);
              
            } catch (error) {
              console.log("Error al crear proceso ffmpeg | newCronJobStart.onTick");
              if(error instanceof Error){
                console.log(error.message);
              }
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
        const currPrefStructure = NvrManager.#map.get(this.ctrl_id);
        if(currPrefStructure !== undefined){
          const currCamJob = currPrefStructure.get(this.nvrpref_id);
          if(currCamJob !== undefined){
            try {
              if(currCamJob.ffmpegProcess !== undefined){
                currCamJob.ffmpegProcess.kill();
                delete currCamJob.ffmpegProcess;
              }
              currPrefStructure.set(this.nvrpref_id,currCamJob);
              NvrManager.#map.set(this.ctrl_id,currPrefStructure);
            } catch (error) {
              console.log("Error al cerrar proceso ffmpeg | newCronJobEnd.onTick");
              if(error instanceof Error){
                console.log(error.message);
              }
            }
          }
        }
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

      if(isInRangeCurTime){
        try {
          const ffmpegCli = await NvrManager.#getFfmpegCLI(ctrl_id,preferencia.cmr_id);
          const newFfmpegProcess = spawn("ffmpeg",ffmpegCli);
          newCamJob.ffmpegProcess = newFfmpegProcess;
        } catch (error) {
          console.log("Error al crear proceso ffmpeg | isInRangeCurTime");
          if(error instanceof Error){
            console.log(error.message);
          }
        }
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

        if(isInRangeCurTime){
          try {
            const ffmpegCli = await NvrManager.#getFfmpegCLI(ctrl_id,preferencia.cmr_id);
            const newFfmpegProcess = spawn("ffmpeg",ffmpegCli);
            newCamJob.ffmpegProcess = newFfmpegProcess;
          } catch (error) {
            console.log("Error al crear proceso ffmpeg | isInRangeCurTime");
            if(error instanceof Error){
              console.log(error.message);
            }
          }
        };

        if(preferencia.activo === 1) {
          newCamJob.startScheduledJob?.start();
          newCamJob.endScheduleJob?.start();
        };

        currPrefStructure.set(preferencia.nvrpref_id, newCamJob);
        NvrManager.#map.set(ctrl_id,currPrefStructure);
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

        preferencias.forEach(async (preferencia) => {
           await NvrManager.add(ctrl_id,preferencia);
        });

      });
    } catch (error) {
      console.log(`NvrManager | Error al inicializar`);
      console.error(error);
      throw error;
    }
  }

  static notifyChangeCamera(ctrl_id:number,cmr_id:number){

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

// (async ()=>{
//   setTimeout(async() => {
//     console.log("===========update cam id========")
//     await NvrManager.update(1,1,{cmr_id:2})
//   }, 60000);
// })()