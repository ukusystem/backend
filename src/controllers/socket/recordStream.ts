import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Server, Socket } from "socket.io";
import { getRstpLinksByCtrlIdAndIp } from "../../utils/getCameraRtspLinks";

import path from "path";
import fs from "fs";
import { createMotionDetectionFolders } from "../../models/camera/CameraMotion";

interface IFmmpegRecordProcess {
  [ctrl_id: string]: {
    [ip: string]: [ChildProcessWithoutNullStreams, fs.WriteStream];
  };
}

const ffmpegRecordProcess: IFmmpegRecordProcess = {};
// let isRecording : boolean = false

export const streamRecordSocket = async (io: Server, socket: Socket) => {

   // Obtener ctrl_id e ip
   const nspStream = socket.nsp;
   const [, , xctrl_id,xip] = nspStream.name.split("/"); // Namespace : "/record_stream/:ctrl_id/:ip"
   
   console.log("Llego peticion record_stream",xctrl_id,xip)

  

  socket.on("start_recording", async (ctrl_id, ip, t) => {
    // console.log("Entro start recording")
    console.log("start_recording",ctrl_id, ip, t)
    if (!ffmpegRecordProcess.hasOwnProperty(ctrl_id)) {
      ffmpegRecordProcess[ctrl_id] = {};
    }

    if (!ffmpegRecordProcess[ctrl_id].hasOwnProperty(ip)) {
      try {
        const [mainRtsp] = await getRstpLinksByCtrlIdAndIp(Number(ctrl_id), ip);
        const args = [
          "-rtsp_transport",
          "tcp",
          "-i",
          `${mainRtsp}`,
          "-c:v",
          "libx264",
          "-t",
          `${t * 60}`,
          "-preset",
          "ultrafast",
          "-tune",
          "zerolatency",
          "-f",
          "mpegts",
          "pipe:1",
        ];
        const pathFolderVidRecord = createMotionDetectionFolders(`./deteccionmovimiento/vid/${ctrl_id}/${ip}`);
        const videoRecordPath = path.join(pathFolderVidRecord,`grabacion_${Date.now()}.mp4`);
        const newFfmpegProcess = spawn("ffmpeg", args);
  
        const videoRecordStream = fs.createWriteStream(videoRecordPath);
        ffmpegRecordProcess[ctrl_id][ip] = [newFfmpegProcess, videoRecordStream];
      } catch (error) {
        console.log(error)
        return 
      }
    }

    ffmpegRecordProcess[xctrl_id][xip][0].stdout.on("data", (data) => {
      socket.nsp.emit("stream_is_recording", true);
      ffmpegRecordProcess[xctrl_id][xip][1].write(data);
    });

    ffmpegRecordProcess[xctrl_id][xip][0].on("close", (code) => {
      console.log(`Proceso de FFMPEG finalizado con código de salida ${code}`);
      // Cerrar el proceso ffmpeg:
      if (xctrl_id in ffmpegRecordProcess) {
        if (xip in ffmpegRecordProcess[xctrl_id]) {
          console.log("parando el proceso:", xctrl_id, xip);
          ffmpegRecordProcess[xctrl_id][xip][0].kill();
          delete ffmpegRecordProcess[xctrl_id][xip];
          socket.nsp.emit("stream_is_recording", false);
        }
      }
    });

    ffmpegRecordProcess[xctrl_id][xip][0].on("error", (err) => {
      console.error(`Error al ejecutar FFMPEG: ${err}`);
    });

  });

  socket.on("stop_recording", (ctrl_id, ip) => {
    console.log("Entro a stop recording");
    if (ctrl_id in ffmpegRecordProcess) {
      if (ip in ffmpegRecordProcess[ctrl_id]) {
        console.log("parando el proceso:", ctrl_id, ip);
        ffmpegRecordProcess[ctrl_id][ip][0].kill();
        delete ffmpegRecordProcess[ctrl_id][ip];
        socket.nsp.emit("stream_is_recording", false);
      }
    }
  });

};
