import { NextFunction, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { RequestWithUser } from "../../types/requests";
import fs from "node:fs";
import path from "node:path";
import { v4 as uuidv4 } from 'uuid';
import { spawn } from "node:child_process";
import { genericLogger } from "../../services/loggers";

export const trimRecordNvr = asyncErrorHandler(
  async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const { ctrl_id, cmr_id, date, endTime, startTime } = req.query as {ctrl_id: string;cmr_id: string;date: string;startTime: string;endTime: string;};

    const [hr_inicio, min_inicio, sec_inicio] = startTime.split(":");
    const [hr_final, min_final, sec_final] = endTime.split(":");
    const startTimeSeconds = (parseInt(hr_inicio, 10)*60*60) + (parseInt(min_inicio,10)*60) + (parseInt(sec_inicio, 10));
    const endTimeSeconds = (parseInt(hr_final, 10)*60*60) + (parseInt(min_final,10)*60) + (parseInt(sec_final, 10));
    if(endTimeSeconds <= startTimeSeconds){
       return res.status(400).json({message:"'endTime' debe ser mayor a 'startTime'"})
    };

    const recorFilePath = path.resolve(`./nvr/hls/nodo${ctrl_id}/camara${cmr_id}/${date}/index.m3u8`).split(path.sep).join(path.posix.sep);

    fs.readFile(recorFilePath, "utf8", (err, _data) => {
      if (err) {
        return res.status(404).json({ message: "Grabación no disponible." });
      }
      try {

        const nameTemporalVideo = uuidv4();
        const basePath = path.resolve("./archivos/temporal")
  
        if (!fs.existsSync(basePath)) {
          fs.mkdirSync(basePath, { recursive: true });
        }
        const temporalSavePath = path.resolve("./archivos/temporal",`${nameTemporalVideo}.mp4`).split(path.sep).join(path.posix.sep);
  
        const keyArgs: string[] = [
          "-i",`${recorFilePath}`,
          "-ss",`${startTime}`,
          "-to",`${endTime}`,
          "-c","copy",
          `${temporalSavePath}`,
        ];
  
        const ffmpegProcess = spawn("ffmpeg", keyArgs);
  
        ffmpegProcess.stdout.on("close", (data: any) => {
          res.download(temporalSavePath, (err) => {
            if (err) {
              res.status(500).json({message:"Error al enviar el archivo."});
            }
  
            fs.unlink(temporalSavePath, (err) => {
              if (err) {
                genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal`,err);
              }
            });
          });
        });
  
        ffmpegProcess.stdout.on("error", (err) => {
          genericLogger.error(`trimRecordNvr | Error al cortar grabacion`,err);
          res.status(500).json({message:"Error al cortar grabación."});
          fs.unlink(temporalSavePath, (err) => {
            if (err) {
              genericLogger.error(`trimRecordNvr | Error al eliminar archivo temporal`,err);
            }
          });
        });

      } catch (error) {
        return res.status(500).json({message:"Error al cortar grabación."});
      }

    });
  }
);
