import { ControllerMapManager } from "../../models/maps";
import { getRstpLinksByCtrlIdAndIp } from "../getCameraRtspLinks";

type Calidad = "q1" | "q2" | "q3";

export const getFfmpegArgs = async (ctrl_id: number, ip: string, q: Calidad) => {
    try {
      const ctrlConfig = ControllerMapManager.getControllerAndResolution(ctrl_id);
      if(ctrlConfig === undefined){
        throw new Error(`Error getFfmpegArgs | Controlador ${ctrl_id} no encontrado getControllerAndResolution`);
      }
      const {resolution,controller} = ctrlConfig
      const [rtspUrl, rtspUrlsub] = await getRstpLinksByCtrlIdAndIp(ctrl_id,ip);
      let ffmpegArg : string[] = [];
      if (q === "q1") {
        ffmpegArg = [
          "-rtsp_transport","tcp",
          "-i",rtspUrl,
          "-r",`${controller.streamprimaryfps}`,
          "-an",
          "-c:v","h264_nvenc",
          "-vf",`scale=${resolution.stream_pri.ancho}:${resolution.stream_pri.altura}`,
          "-c:v","mjpeg",
          "-f","image2pipe",
          "-",
        ];
      }
      if (q === "q2") {
        ffmpegArg = [
          "-rtsp_transport","tcp",
          "-i",rtspUrl,
          "-r",`${controller.streamsecondaryfps}`,
          "-an",
          "-c:v","h264_nvenc",
          "-vf",`scale=${resolution.stream_sec.ancho}:${resolution.stream_sec.altura}`,
          "-c:v","mjpeg",
          "-b:v","2M",
          "-f","image2pipe",
          "-",
        ];
      }
      if (q === "q3") {
        ffmpegArg = [
          "-rtsp_transport","tcp",
          "-i",rtspUrlsub,
          "-r",`${controller.streamauxiliaryfps}`,
          "-vf",`scale=${resolution.stream_aux.ancho}:${resolution.stream_aux.altura}`,
          "-an", 
          "-c:v","copy",
          "-f","image2pipe",
          "-",
        ];
      }
      return ffmpegArg;
    } catch (error) {
      console.error("Error en getFfmpegArgs", error);
      throw error
    }
  };