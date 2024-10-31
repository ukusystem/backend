import { CronJob } from "cron";
import path from "path";
import { MySQL2 } from "../../database/mysql";
import { getRstpLinksByCtrlIdAndCmrId } from "../../utils/getCameraRtspLinks";
import { Init } from "../init";
import { PreferenciaStructure, CameraJob, CronTimesNvr, NvrControllerStructure, NvrJobSchedule, NvrPreferencia, NvrPreferenciaRowData, CronJobContext, SecondTimesNvr } from "./nvr.types";
import dayjs from "dayjs";
import fs from 'fs'
import { spawn } from "child_process";
import { genericLogger } from "../../services/loggers";
import { notifyNvrCamDisconnect } from "../controllerapp/controller";
import { NodoCameraMapManager } from "../maps/nodo.camera";

export class NvrManager {
  static #map: NvrControllerStructure = new Map();
  static #HLS_TIME:number = 5;
  static #TIMEOUT :number = 5;

  static #getCronTimes(times: Pick<NvrPreferencia, "tiempo_final" | "tiempo_inicio" | "dia">): CronTimesNvr {
    const [hr_inicio, min_inicio, sec_inicio] = times.tiempo_inicio.split(":"); // "hh:mm:ss";
    const [hr_final, min_final, sec_final] = times.tiempo_final.split(":");

    let cronStartTime : string = `${parseInt(sec_inicio, 10)} ${parseInt(min_inicio,10)} ${parseInt(hr_inicio, 10)} * * ${times.dia}`;

    // const currStartDateTime = dayjs().set("hour",parseInt(hr_inicio, 10)).set("minute",parseInt(min_inicio,10)).set("second",parseInt(sec_inicio, 10));
    // const currStartDateTimeAjusted = currStartDateTime.subtract(NvrManager.#HLS_TIME,"second");

    // if(currStartDateTime.format("YYYY-MM-DD") === currStartDateTimeAjusted.format("YYYY-MM-DD")){
    //   cronStartTime = `${currStartDateTimeAjusted.second()} ${currStartDateTimeAjusted.minute()} ${currStartDateTimeAjusted.hour()} * * ${times.dia}`;
    // }else{
    //   const currStartDayTime = currStartDateTime.startOf("day")
    //   cronStartTime = `${currStartDayTime.second()} ${currStartDayTime.minute()} ${currStartDayTime.hour()} * * ${times.dia}`;
    // }

    let cronEndTime : string = `${parseInt(sec_final, 10)} ${parseInt(min_final,10)} ${parseInt(hr_final, 10)} * * ${times.dia}`;
    // const currEndDateTime = dayjs().set("hour",parseInt(hr_final, 10)).set("minute",parseInt(min_final,10)).set("second",parseInt(sec_final, 10));
    // const currEndDateTimeAjusted = currEndDateTime.add(NvrManager.#HLS_TIME,"second");
  
    // if(currEndDateTime.format("YYYY-MM-DD") === currEndDateTimeAjusted.format("YYYY-MM-DD")){
    //   cronEndTime = `${currEndDateTimeAjusted.second()} ${currEndDateTimeAjusted.minute()} ${currEndDateTimeAjusted.hour()} * * ${times.dia}`;
    // }else{
    //   const currEndDayTime = currEndDateTime.endOf("day")
    //   cronEndTime = `${currEndDayTime.second()} ${currEndDayTime.minute()} ${currEndDayTime.hour()} * * ${times.dia}`;
    // }

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

  static #secondsToTime(seconds_input: number):string {
    const dateObj = new Date(seconds_input * 1000);
    const hours = dateObj.getUTCHours();
    const minutes = dateObj.getUTCMinutes();
    const seconds = dateObj.getSeconds();
    const timeString =
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0");
    return timeString;
  }

  static #getTimeDiff(times: Pick<NvrPreferencia, "tiempo_final" | "tiempo_inicio">) : string {

    const secondTimes = NvrManager.#getTimesInSecond({
      tiempo_final: times.tiempo_final,
      tiempo_inicio: times.tiempo_inicio,
    });
    const diffSeconds = secondTimes.end_time_seconds - secondTimes.start_time_seconds;

    const timeDiff = NvrManager.#secondsToTime(diffSeconds);

    return timeDiff;
  }

  static async #createDirectory(basePath: string): Promise< {segment_path: string;playlist_path: string}>{
    try {
      const currentDateTime = dayjs();
      const folderPath = path.join(basePath,currentDateTime.format("YYYY-MM-DD"),"record");
      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
      }
      
      return {
        segment_path: path.resolve(basePath,currentDateTime.format("YYYY-MM-DD"),"record").split(path.sep).join(path.posix.sep),
        playlist_path: path.resolve(basePath,currentDateTime.format("YYYY-MM-DD")).split(path.sep).join(path.posix.sep),
      };
    } catch (error) {
      genericLogger.error(`NvrManager | #createDirectory | Error al crear directorio`,error);
      throw error;
    }
  }

  static async #getFfmpegCLI(ctrl_id:number,cmr_id:number,times: Pick<NvrPreferencia, "tiempo_final" | "tiempo_inicio">): Promise<string[]>{
    try {
      const [mainRtsp] = await getRstpLinksByCtrlIdAndCmrId(ctrl_id,cmr_id);
      const basePath : string = `./nvr/hls/nodo${ctrl_id}/camara${cmr_id}`;
      const finalPaths = await NvrManager.#createDirectory(basePath);

      const timeDiff = NvrManager.#getTimeDiff(times);

      const keyArgs : string[] =[
        "-rtsp_transport","tcp",
        "-timeout",`${NvrManager.#TIMEOUT*1000000}`,
        "-i",mainRtsp,
        "-vcodec","copy",
        "-f","hls",
        "-hls_segment_type","mpegts",
        "-hls_time",`${NvrManager.#HLS_TIME}`,
        "-hls_list_size","0",
        "-hls_playlist_type", "event",
        "-hls_base_url", `record/`,
        "-hls_flags","append_list",
        "-hls_segment_filename",`${finalPaths.segment_path}/segment_%H_%M_%S.ts`,
        "-strftime","1",
        "-t",`${timeDiff}`,
        `${finalPaths.playlist_path}/index.m3u8`
      ]

      return keyArgs;
    } catch (error) {
      genericLogger.error(`NvrManager | #getFfmpegCLI | Error al obtener ffmpeg cli`,error);
      throw error;
    }
  }

  static #updateStateRecording(ctrl_id:number,nvrpref_id:number,newState: boolean): void{
    const currPrefStructure = NvrManager.#map.get(ctrl_id);
    if(currPrefStructure !== undefined){
      const currCamJob = currPrefStructure.get(nvrpref_id);
      if(currCamJob !== undefined){
        currCamJob.isRecording = newState;

        currPrefStructure.set(nvrpref_id,currCamJob);
        NvrManager.#map.set(ctrl_id,currPrefStructure);
      }
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
      genericLogger.error(`NvrManager | update | Error al actualizar nvrpreferencia`,error);
    }
  }

  static #closeHandlerEvent(code:number | null, signal: NodeJS.Signals | null,context:CronJobContext){
    const {ctrl_id,nvrpref_id,tiempo_inicio,tiempo_final,cmr_id} = context;

    genericLogger.info(`NvrManager |    ffmpeg cerrado con código ${code} y señal ${signal} | ctrl_id : ${ctrl_id} | nvrpref_id: ${nvrpref_id}`)
    NvrManager.#updateStateRecording(ctrl_id,nvrpref_id,false);

    const currDateTime = dayjs();
    const currTimeSeconds = (currDateTime.hour()*60*60) + (currDateTime.minute()*60) + (currDateTime.second());
    const {end_time_seconds,start_time_seconds} = NvrManager.#getTimesInSecond({tiempo_final,tiempo_inicio});

    const isCloseInRangeTime = currTimeSeconds > start_time_seconds && currTimeSeconds < end_time_seconds;
    if(isCloseInRangeTime){
      // notificar deconexión
      NodoCameraMapManager.update(ctrl_id,cmr_id,{conectado:0});
      const camera = NodoCameraMapManager.getCamera(ctrl_id,cmr_id);
      if(camera !== undefined){
        notifyNvrCamDisconnect(ctrl_id,{...camera});
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

    if(secondTimes.end_time_seconds <= secondTimes.start_time_seconds){
      genericLogger.info(`NvrManager | add | Tiempo de finalizacion es menor que el de inicio`);
      return;
    }

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
              const ffmpegCli = await NvrManager.#getFfmpegCLI(this.ctrl_id,this.cmr_id,{tiempo_inicio:this.tiempo_inicio,tiempo_final:this.tiempo_final});

              const contextJob = this;

              const newFfmpegProcess = spawn("ffmpeg",ffmpegCli,{stdio:['ignore', 'ignore', 'ignore']});
              currCamJob.isRecording = true;

              newFfmpegProcess.on('close', (code,signal) => {
                NvrManager.#closeHandlerEvent(code,signal,contextJob);
              });

              // if(currCamJob.ffmpegProcess === undefined){
              //   currCamJob.ffmpegProcess = newFfmpegProcess;
              // }else{
              //   currCamJob.ffmpegProcess.kill();
              //   delete currCamJob.ffmpegProcess;
              //   currCamJob.ffmpegProcess = newFfmpegProcess;
              // }

              currPrefStructure.set(this.nvrpref_id,currCamJob);
              NvrManager.#map.set(this.ctrl_id,currPrefStructure);
              
            } catch (error) {
              genericLogger.error(`NvrManager | Error al crear proceso ffmpeg | newCronJobStart.onTick`,error);
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
              genericLogger.error(`NvrManager | Error al cerrar proceso ffmpeg | newCronJobEnd.onTick`,error);
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
          const newInitialTime = currentDateTime.format("HH:mm:ss");
          const ffmpegCli = await NvrManager.#getFfmpegCLI(ctrl_id,preferencia.cmr_id,{tiempo_inicio:newInitialTime,tiempo_final:preferencia.tiempo_final});
          const newFfmpegProcess = spawn("ffmpeg",ffmpegCli,{stdio:['ignore', 'ignore', 'ignore']});
          newCamJob.isRecording = true;

          newFfmpegProcess.on('close', (code,signal) => {
            NvrManager.#closeHandlerEvent(code,signal,{ctrl_id,...preferencia});                                                                                                                                                                       
          });
          
        } catch (error) {
          genericLogger.error(`NvrManager | Error al crear proceso ffmpeg | isInRangeCurTime`,error);
        }
      };

      if(preferencia.activo === 1){
        newCamJob.startScheduledJob?.start();
        newCamJob.endScheduleJob?.start();
      }

      newPrefStructure.set(preferencia.nvrpref_id, newCamJob);

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
            const newInitialTime = currentDateTime.format("HH:mm:ss");
            const ffmpegCli = await NvrManager.#getFfmpegCLI(ctrl_id,preferencia.cmr_id,{tiempo_inicio:newInitialTime,tiempo_final:preferencia.tiempo_final});
            const newFfmpegProcess = spawn("ffmpeg",ffmpegCli,{stdio:['ignore', 'ignore', 'ignore']});
            newCamJob.isRecording = true;
            
            newFfmpegProcess.on('close', (code,signal) => {
              NvrManager.#closeHandlerEvent(code,signal,{ctrl_id,...preferencia});                                                                                                                                                                       
            });
          } catch (error) {
            genericLogger.error(`NvrManager | Error al crear proceso ffmpeg | isInRangeCurTime`,error);
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

        try {
          const { ctrl_id, nododb_name } = reg_nodo;

          const preferencias = await MySQL2.executeQuery<NvrPreferenciaRowData[]>({
            sql: `SELECT * FROM ${nododb_name}.nvrpreferencia`,
          });
        
          preferencias.forEach(async (preferencia) => {
           await NvrManager.add(ctrl_id,preferencia);
          });
          
        } catch (error) {
          genericLogger.error(`NvrManager | Error al inicializar | nodo ${reg_nodo.nodo}`,error);
        }

      });
    } catch (error) {
      genericLogger.error(`NvrManager | Error al inicializar`,error);
      throw error;
    }
  }

  static notifyChangeCamera(ctrl_id:number,cmr_id:number){
    const currPrefStructure = NvrManager.#map.get(ctrl_id);
    if(currPrefStructure !== undefined){

      const allCamJobs = Array.from(currPrefStructure.values());
      const camJobsFilterByCmrId = allCamJobs.filter((camJob) => camJob.info.cmr_id === cmr_id);

      const curDateTime = dayjs();
      const currentTimeSeconds = (curDateTime.hour()*60*60) + (curDateTime.minute()*60) + (curDateTime.second());

      camJobsFilterByCmrId.forEach(async (camJob) => {
        const currCamJob = camJob;
        const secondTimes = NvrManager.#getTimesInSecond({
          tiempo_final: currCamJob.info.tiempo_final,
          tiempo_inicio: currCamJob.info.tiempo_inicio,
        });
        const isInRangeCurTime = currentTimeSeconds > secondTimes.start_time_seconds && currentTimeSeconds < secondTimes.end_time_seconds;

        if(isInRangeCurTime){
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
          // delete preference:
          currPrefStructure.delete(currCamJob.info.nvrpref_id);
          NvrManager.#map.set(ctrl_id,currPrefStructure);

          // add new preference:
          await NvrManager.add(ctrl_id,currCamJob.info);
        }
      })

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

// (async ()=>{
//   setTimeout(async() => {
//     console.log("===========update cam id========")
//     await NvrManager.update(1,1,{cmr_id:2})
//   }, 60000);
// })()