import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Server, Socket } from "socket.io";
import { getRstpLinksByCtrlIdAndIp } from "../../utils/getCameraRtspLinks";

import path from "path";
import fs from "fs";
import { createMotionDetectionFolders } from "../../models/camera";
import { vmsLogger } from "../../services/loggers";

interface IFmmpegRecordProcess {
  [ctrl_id: string]: {
    [ip: string]: [ChildProcessWithoutNullStreams, fs.WriteStream];
  };
}

const ffmpegRecordProcess: IFmmpegRecordProcess = {};


export const streamRecordSocket = async (io: Server, socket: Socket) => {

   // Obtener ctrl_id e ip
   const nspStream = socket.nsp;
   const [, , xctrl_id,xip] = nspStream.name.split("/"); // Namespace : "/record_stream/:ctrl_id/:ip"

  socket.on("start_recording", async (ctrl_id, ip, t) => {
    vmsLogger.info(`Stream Record Socket | start_recording | ctrl_id = ${ctrl_id} | ip = ${ip} | t = ${t}`);
    if (!ffmpegRecordProcess.hasOwnProperty(ctrl_id)) {
      ffmpegRecordProcess[ctrl_id] = {};
    }

    if (!ffmpegRecordProcess[ctrl_id].hasOwnProperty(ip)) {
      try {
        const [mainRtsp] = await getRstpLinksByCtrlIdAndIp(Number(ctrl_id), ip);
        const args = [
          "-rtsp_transport","tcp",
          "-i",`${mainRtsp}`,
          "-c:v","libx264",
          "-t",`${t * 60}`,
          "-preset","ultrafast",
          "-tune","zerolatency",
          "-f","mpegts",
          "pipe:1",
        ];
        const pathFolderVidRecord = createMotionDetectionFolders(`./deteccionmovimiento/vid/${ctrl_id}/${ip}`);
        const videoRecordPath = path.join(pathFolderVidRecord,`grabacion_${Date.now()}.mp4`);
        const newFfmpegProcess = spawn("ffmpeg", args);
  
        const videoRecordStream = fs.createWriteStream(videoRecordPath);
        ffmpegRecordProcess[ctrl_id][ip] = [newFfmpegProcess, videoRecordStream];
      } catch (error) {
        vmsLogger.error(`Stream Record Socket | start_recording | Error | ctrl_id = ${ctrl_id} | ip = ${ip}`,error);
        return 
      }
    }

    ffmpegRecordProcess[xctrl_id][xip][0].stdout.on("data", (data) => {
      socket.nsp.emit("stream_is_recording", true);
      ffmpegRecordProcess[xctrl_id][xip][1].write(data);
    });

    ffmpegRecordProcess[xctrl_id][xip][0].on("close", (code) => {
      vmsLogger.info(`Stream Record Socket | start_recording | Proceso de FFMPEG finalizado con código de salida ${code} | ctrl_id = ${ctrl_id} | ip = ${ip}`);
      // Cerrar el proceso ffmpeg:
      if (xctrl_id in ffmpegRecordProcess) {
        if (xip in ffmpegRecordProcess[xctrl_id]) {
          vmsLogger.info(`Stream Record Socket | start_recording | Parando el proceso | ctrl_id = ${ctrl_id} | ip = ${ip}`);
          ffmpegRecordProcess[xctrl_id][xip][0].kill();
          delete ffmpegRecordProcess[xctrl_id][xip];
          socket.nsp.emit("stream_is_recording", false);
        }
      }
    });

    ffmpegRecordProcess[xctrl_id][xip][0].on("error", (err) => {
      vmsLogger.error(`Stream Record Socket | start_recording | Error al ejecutar FFMPEG | ctrl_id = ${ctrl_id} | ip = ${ip}`,err);
    });

  });

  socket.on("stop_recording", (ctrl_id, ip) => {
    vmsLogger.info(`Stream Record Socket | stop_recording | ctrl_id = ${ctrl_id} | ip = ${ip}`);
    if (ctrl_id in ffmpegRecordProcess) {
      if (ip in ffmpegRecordProcess[ctrl_id]) {
        vmsLogger.info(`Stream Record Socket | stop_recording | Parando el proceso | ctrl_id = ${ctrl_id} | ip = ${ip}`);
        ffmpegRecordProcess[ctrl_id][ip][0].kill();
        delete ffmpegRecordProcess[ctrl_id][ip];
        socket.nsp.emit("stream_is_recording", false);
      }
    }
  });

};
