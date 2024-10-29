import { ChildProcessByStdio, spawn } from "child_process";
import { Server, Socket } from "socket.io";
import { getRstpLinksByCtrlIdAndCmrId } from "../../utils/getCameraRtspLinks";

import path from "path";
import fs from "fs";
import { createMotionDetectionFolders } from "../../models/camera";
import { vmsLogger } from "../../services/loggers";

interface IFmmpegRecordProcess {
  [ctrl_id: number]: {
    [cmr_id: number]: [ChildProcessByStdio<null, any, null>, fs.WriteStream];
  };
}

const ffmpegRecordProcess: IFmmpegRecordProcess = {};


export const streamRecordSocket = async (io: Server, socket: Socket) => {

   // Obtener ctrl_id e ip
   const nspStream = socket.nsp;
   const [, , xctrl_id,xcmr_id] = nspStream.name.split("/"); // Namespace : "/record_stream/:ctrl_id/:ip"

  socket.on("start_recording", async (ctrl_id, cmr_id, t) => {
    vmsLogger.info(`Stream Record Socket | start_recording | ctrl_id = ${ctrl_id} | cmr_id = ${cmr_id} | t = ${t}`);
    if (!ffmpegRecordProcess.hasOwnProperty(ctrl_id)) {
      ffmpegRecordProcess[ctrl_id] = {};
    }

    if (!ffmpegRecordProcess[ctrl_id].hasOwnProperty(cmr_id)) {
      try {
        const [mainRtsp] = await getRstpLinksByCtrlIdAndCmrId(Number(ctrl_id), cmr_id);
        const args = [
          "-rtsp_transport","tcp",
          "-timeout",`${5*1000000}`,
          "-i",`${mainRtsp}`,
          "-c:v","libx264",
          "-t",`${t * 60}`,
          "-preset","ultrafast",
          "-tune","zerolatency",
          "-f","mpegts",
          "pipe:1",
        ];
        const pathFolderVidRecord = createMotionDetectionFolders(`./deteccionmovimiento/vid/${ctrl_id}/${cmr_id}`);
        const videoRecordPath = path.join(pathFolderVidRecord,`grabacion_${Date.now()}.mp4`);
        const newFfmpegProcess = spawn("ffmpeg", args,{stdio:["ignore","pipe","ignore"]});
  
        const videoRecordStream = fs.createWriteStream(videoRecordPath);
        ffmpegRecordProcess[ctrl_id][cmr_id] = [newFfmpegProcess, videoRecordStream];
      } catch (error) {
        vmsLogger.error(`Stream Record Socket | start_recording | Error | ctrl_id = ${ctrl_id} | ip = ${cmr_id}`,error);
        return 
      }
    }

    ffmpegRecordProcess[Number(xctrl_id)][Number(xcmr_id)][0].stdout.on("data", (data:any) => {
      socket.nsp.emit("stream_is_recording", true);
      ffmpegRecordProcess[Number(xctrl_id)][Number(xcmr_id)][1].write(data);
    });

    ffmpegRecordProcess[Number(xctrl_id)][Number(xcmr_id)][0].on("close", (code) => {
      vmsLogger.info(`Stream Record Socket | start_recording | Proceso de FFMPEG finalizado con código de salida ${code} | ctrl_id = ${ctrl_id} | ip = ${cmr_id}`);
      // Cerrar el proceso ffmpeg:
      if (xctrl_id in ffmpegRecordProcess) {
        if (xcmr_id in ffmpegRecordProcess[Number(xctrl_id)]) {
          vmsLogger.info(`Stream Record Socket | start_recording | Parando el proceso | ctrl_id = ${ctrl_id} | ip = ${cmr_id}`);
          ffmpegRecordProcess[Number(xctrl_id)][Number(xcmr_id)][0].kill();
          delete ffmpegRecordProcess[Number(xctrl_id)][Number(xcmr_id)];
          socket.nsp.emit("stream_is_recording", false);
        }
      }
    });

    ffmpegRecordProcess[Number(xctrl_id)][Number(xcmr_id)][0].on("error", (err) => {
      vmsLogger.error(`Stream Record Socket | start_recording | Error al ejecutar FFMPEG | ctrl_id = ${ctrl_id} | ip = ${cmr_id}`,err);
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
