import { ControllerMapManager } from "../../models/maps";
import { getRstpLinksByCtrlIdAndIp } from "../getCameraRtspLinks";

type Calidad = "q1" | "q2" | "q3";

export const getFfmpegArgs = async (ctrl_id: number, ip: string, q: Calidad) => {
    try {
      const ctrlConfig = ControllerMapManager.getControllerAndResolution(ctrl_id);
      if(ctrlConfig === undefined){
        throw new Error(`Error getFfmpegArgs | Controlador ${ctrl_id} no encontrado getControllerAndResolution`);
      }
      const {resolution} = ctrlConfig
      const [rtspUrl, rtspUrlsub] = await getRstpLinksByCtrlIdAndIp(ctrl_id,ip);
      let ffmpegArg : string[] = [];
      if (q === "q1") {
        ffmpegArg = [
          "-rtsp_transport",
          "tcp",
          "-i",
          rtspUrl,
          "-an",
          "-c:v",
          "h264_nvenc",
          "-vf",
          // "scale=1920:1080",
          `scale=${resolution.stream_pri.ancho}:${resolution.stream_pri.altura}`,
          "-c:v",
          "mjpeg",
          "-f",
          "image2pipe",
          "-",
        ];
      }
      if (q === "q2") {
        ffmpegArg = [
          "-rtsp_transport",
          "tcp",
          "-i",
          rtspUrl,
          "-an",
          "-c:v",
          "h264_nvenc",
          "-vf",
          // "scale=1280:720",
          `scale=${resolution.stream_sec.ancho}:${resolution.stream_sec.altura}`,
          "-c:v",
          "mjpeg",
          "-b:v",
          "2M",
          "-f",
          "image2pipe",
          "-",
        ];
      }
      if (q === "q3") {
        ffmpegArg = [
          "-rtsp_transport",
          "tcp",
          "-i",
          rtspUrlsub,
          "-an", // Desactivar audio
          "-c:v",
          "copy", // Copiar el flujo de video sin transcodificación
          "-f",
          "image2pipe", // Formato de salida: image2pipe
          "-",
        ];
      }
      return ffmpegArg;
    } catch (error) {
      console.error("Error en getFfmpegArgs", error);
      throw error
    }
  };