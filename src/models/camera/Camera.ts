import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import { Camara, Controlador, Marca, TipoCamara } from "../../types/db";
import { handleErrorWithArgument, handleErrorWithoutArgument } from "../../utils/simpleErrorHandler";
import { CameraOnvif, ControlPTZProps } from "./CamOnvif";
import { Init } from "../init";
import { getRstpLinksByCtrlIdAndIp } from "../../utils/getCameraRtspLinks";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { verifyImageMarkers } from "../../utils/stream";
import { decrypt } from "../../utils/decrypt";
import { CustomError } from "../../utils/CustomError";

type CameraInfo =  Pick<Camara, "cmr_id"|"ip"| "descripcion"|"puertows"> & Pick<TipoCamara,"tipo"> & Pick<Marca, "marca"> 
type CamCtrlIdIp = Pick<Controlador,"ctrl_id"> & Pick<Camara,"ip">

interface CameraData extends RowDataPacket , Camara {}
interface CameraInfoRowData extends RowDataPacket , CameraInfo {}
interface CamResponse {
  [key : string]: Record<string,(CameraInfo & Pick<Controlador, "ctrl_id" | "nodo"> & {region: string})[]>
}

export class Camera  {

    static async #getCameraOnvifByCtrlIdAndIp({ ctrl_id, ip } : CamCtrlIdIp) {
      try {
  
        const rows = await MySQL2.executeQuery<CameraData[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.camara WHERE ip = ? `,values:[ip]})

        const cameraData = rows[0];
        if (!cameraData) {
          throw new Error("Cámara no encontrada");
        }
        const contraseñaDecrypt = decrypt(cameraData.contraseña)
        const camera = new CameraOnvif({ctrl_id: ctrl_id, ip:cameraData.ip, usuario: cameraData.usuario,contraseña: contraseñaDecrypt},);
        return camera;
      } catch (error) {
        if(error instanceof Error){
            console.log(`Error en #getCameraOnvifByCtrlIdAndIp: ${error.message}`);
        }else{
            console.log(`Error en #getCameraOnvifByCtrlIdAndIp: ${error}`);
        }
        throw error;
      }
    }

    static getSnapshotByCtrlIdAndIp = ({ctrl_id, ip}: CamCtrlIdIp )  : Promise<Buffer> =>  {
      return new Promise(async (resolve, reject) => {
        let mainRtspLink

        try {
          const [mainRtsp] = await getRstpLinksByCtrlIdAndIp(ctrl_id, ip);
          mainRtspLink = mainRtsp
        } catch (error) {
          return reject(error)
        }

        if(mainRtspLink){
          const args = [
            "-rtsp_transport",
            "tcp",
            "-i",
            `${mainRtspLink}`,
            "-an",
            "-t",
            "10",
            "-c:v",
            "mjpeg",
            "-f",
            "image2pipe",
            "-",
          ];
  
          let ffmpegProcessImage : ChildProcessWithoutNullStreams | null = null;
          let imageBuffer = Buffer.alloc(0);
          let isInsideImage = false;
  
          if (!ffmpegProcessImage) {
            ffmpegProcessImage = spawn("ffmpeg", args);
          }
          // Redirigir la salida de ffmpeg al cliente Socket.IO
          ffmpegProcessImage.stdout.on("data", (data) => {
            // Verificar marcadores
            let isMarkStart = verifyImageMarkers(data, "start");
            let isMarkEnd = verifyImageMarkers(data, "end");
            if (!isInsideImage && isMarkStart) {
              // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
              isInsideImage = true;
            }
  
            if (isInsideImage) {
              // Concatenar nuevos datos al buffer existente
              imageBuffer = Buffer.concat([imageBuffer, data]);
  
              if (verifyImageMarkers(imageBuffer, "complete")) {
                //Imagen completa
                resolve(imageBuffer)
  
              }
            }
  
            if (isMarkEnd) {
              // Limpiar el búfer para la siguiente imagen
              imageBuffer = Buffer.alloc(0);
              isInsideImage = false;
            }
          });
  
          ffmpegProcessImage.on("close", (code) => {
            console.log(`Proceso ffmpegImage cerrado con código ${code}`);
            if (ffmpegProcessImage) {
              ffmpegProcessImage.kill();
              ffmpegProcessImage = null;
            }
  
            imageBuffer = Buffer.alloc(0);
            isInsideImage = false;
          });
  
          ffmpegProcessImage.on("error", (err) => {
            reject(err)
          });
        }else{
          const errGetRtspLink = new CustomError("Ocurrio un error al obtener los links rtsp",500,"link-rtsp-error")
          reject(errGetRtspLink)
        }

        

      });
    }

    static async controlPTZByActionAndVelocityAndMovementAndNodoAndIp({ action, velocity, movement, ctrl_id, ip,}:  ControlPTZProps & CamCtrlIdIp) {
      try {
        const camera = await Camera.#getCameraOnvifByCtrlIdAndIp({ctrl_id, ip }); // 1-2ms 
        await camera.controlPTZByActionAndVelocityAndMovement({action,velocity,movement}); // 500-800 ms
      } catch (error) {
        throw error;
      }
    }
    
    static async gotoPresetPTZByNumPresetAndNodoAndIp({ n_preset, ctrl_id, ip }: CamCtrlIdIp & {n_preset:number | string}) {
      try {
        const camera = await Camera.#getCameraOnvifByCtrlIdAndIp({ctrl_id, ip });
        await camera.gotoPresetPTZByNumPreset({n_preset})
      } catch (error) {
        throw error;
      }
    }

    static getAllCameras = handleErrorWithoutArgument<CamResponse>(async ()=>{
        const region_nodos = await Init.getRegionNodos()
        if( region_nodos.length > 0){
          const camerasData = await region_nodos.reduce(async (resultPromise, item) => {
            const result = await resultPromise;
            const { region, nododb_name, nodo,ctrl_id } = item;
            result[region] = result[region] || {}
            
            const cams = await MySQL2.executeQuery<CameraInfoRowData[]>({sql:`SELECT  cmr_id ,ip , descripcion, puertows,tipo, marca FROM ${nododb_name}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`})

            result[region][nodo] = cams.map(cam => ({...cam, nodo, ctrl_id,region}))
            return result
          },Promise.resolve({} as CamResponse))
          return camerasData
        }
        return {}
      }, "Init.getAllCameras")

    static getCameraByCtrlId = handleErrorWithArgument<CameraInfo[] , Pick<Controlador,"ctrl_id">>(async({ctrl_id})=>{

      const cams = await MySQL2.executeQuery<CameraInfoRowData[]>({sql:`SELECT  cmr_id ,ip , descripcion, puertows,tipo, marca FROM ${"nodo" + ctrl_id}.camara c INNER JOIN general.marca m ON c.m_id = m.m_id INNER JOIN general.tipocamara t ON c.tc_id = t.tc_id WHERE c.activo = 1`})

      if(cams.length>0){
        return cams
      }
      return [];

      })
  
  }

