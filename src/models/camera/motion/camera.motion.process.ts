// @ts-ignore
// @ts-nocheck

import { ChildProcessByStdio, spawn } from "child_process";
import path from "path";
import fs from "fs";
import { Cam } from "onvif";
import { MySQL2 } from "../../../database/mysql";
import { createImageBase64, verifyImageMarkers } from "../../../utils/stream";
import { getMulticastRtspStreamAndSubStream } from "../../../utils/getCameraRtspLinks";
import dayjs from "dayjs";
import { CameraMotionMethods, CameraMotionProps, CameraProps } from "./camera.motion.types";
import { ControllerMapManager } from "../../maps";
import { cameraLogger } from "../../../services/loggers";
import { CameraMotionManager } from "./camera.motion.manager";
import { NodoCameraMapManager } from "../../maps/nodo.camera";
import { notifyCamDisconnect } from "../../controllerapp/controller";

const TIMEOUT_DISCONNECT = 5;
export class CameraMotionProcess implements CameraMotionProps, CameraMotionMethods {
  ip: string;
  usuario: string;
  contraseña: string;
  cmr_id: number;
  ctrl_id: number;

  ffmpegProcessImage: ChildProcessByStdio<null, any, null> | null = null;
  imageBuffer: Buffer = Buffer.alloc(0);
  isInsideImage: boolean = false;
  isActiveProccesImage: boolean = false;

  ffmpegProcessVideo: ChildProcessByStdio<null, null, null> | null = null;
  isActiveProccesVideo: boolean = false;

  constructor(props: CameraProps) {
    const { cmr_id, ctrl_id, ip, contraseña, usuario } = props;
    this.cmr_id = cmr_id;
    this.ctrl_id = ctrl_id;
    this.ip = ip;

    this.contraseña = contraseña;
    this.usuario = usuario;
  }

  stripNamespaces(topic: any) {
    // example input :-   tns1:MediaControl/tnsavg:ConfigurationUpdateAudioEncCfg
    // Split on '/'
    // For each part, remove any namespace
    // Recombine parts that were split with '/'
    let output = "";
    let parts = topic.split("/");
    for (let index = 0; index < parts.length; index++) {
      let stringNoNamespace = parts[index].split(":").pop(); // split on :, then return the last item in the array
      if (output.length == 0) {
        output += stringNoNamespace;
      } else {
        output += "/" + stringNoNamespace;
      }
    }
    return output;
  }

  processEvent(eventTime: any, eventTopic: any, eventProperty: any, sourceName: any, sourceValue: any, dataName: any, dataValue: any, rtspUrl: string) {
    let output = "";
    output += `EVENT: ${eventTime.toJSON()} ${eventTopic}`;
    if (typeof eventProperty !== "undefined") {
      output += ` PROP:${eventProperty}`;
    }
    if (typeof sourceName !== "undefined" && typeof sourceValue !== "undefined") {
      output += ` SRC:${sourceName}=${sourceValue}`;
    }
    if (typeof dataName !== "undefined" && typeof dataValue !== "undefined") {
      output += ` DATA:${dataName}=${dataValue}`;
    }

    if (eventTopic === "VideoSource/MotionAlarm" || eventTopic === "RuleEngine/CellMotionDetector/Motion") {
      this.isActiveProccesImage = dataValue;
      this.isActiveProccesVideo = dataValue;
    }

    if (this.isActiveProccesImage) {
      this.snapshotMotion(rtspUrl);
    }

    if (this.isActiveProccesVideo) {
      this.captureMotion(rtspUrl);
    }
  }

  snapshotMotion(rtspUrl: string) {
    if (this.ffmpegProcessImage === null) {
      try {
        const argsImageProcces = getImageFfmpegArgs(rtspUrl,this.ctrl_id);
        const newImgProcess = spawn("ffmpeg", argsImageProcces,{stdio:["ignore","pipe","ignore"]});
        this.ffmpegProcessImage = newImgProcess;

        this.ffmpegProcessImage.stdout.on("data", (data: Buffer) => {
          // Verificar marcadores
          let isMarkStart = verifyImageMarkers(data, "start");
          let isMarkEnd = verifyImageMarkers(data, "end");

          if (!this.isInsideImage && isMarkStart) {
            // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
            this.isInsideImage = true;
          }

          if (this.isInsideImage) {
            // Concatenar nuevos datos al buffer existente
            this.imageBuffer = Buffer.concat([this.imageBuffer, data]);

            if (verifyImageMarkers(this.imageBuffer, "complete")) {
              try {
                const pathImg = createMotionDetectionFolders(`./deteccionmovimiento/img/${"nodo" + this.ctrl_id}/${this.ip}`);
                cameraLogger.debug(`CameraMotionProcess | snapshotMotion | Imagen completo recibido | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
                // Guardar la imagen
                const imagePath = path.join(pathImg, `captura_${Date.now()}.jpg`); // ---> deteccionmovimiento\img\Arequipa\172.16.4.110\2024-01-26\13\captura_1706292419800.jpg

                fs.writeFileSync(imagePath, this.imageBuffer);

                let imageBase64 = createImageBase64(this.imageBuffer)
                CameraMotionManager.notifyImageMotion(this.ctrl_id,imageBase64)

                insertPathToDB(imagePath, this.ctrl_id, this.cmr_id, 0);

              } catch (error) {
                cameraLogger.error(`CameraMotionProcess | snapshotMotion | Error al guardar imagen | ctrl_id: ${this.ctrl_id} | ip: ${this.ip} `,error);
              }
            }
          }

          if (isMarkEnd) {
            // Limpiar el búfer para la siguiente imagen
            this.imageBuffer = Buffer.alloc(0);
            this.isInsideImage = false;
          }
        });

        // this.ffmpegProcessImage.on("error", (err) => {
        //   cameraLogger.error(`CameraMotionProcess | snapshotMotion | Error en el proceso ffmpegImage | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`,err);
        //   if (this.ffmpegProcessImage) {
        //     this.ffmpegProcessImage.kill();
        //     this.ffmpegProcessImage = null;
        //   }

        //   // this.isActiveProccesImage = false;

        //   this.imageBuffer = Buffer.alloc(0);
        //   this.isInsideImage = false;
        // });

        this.ffmpegProcessImage.on("close", async (code) => {
          cameraLogger.debug(`CameraMotionProcess | snapshotMotion | Proceso ffmpegImage cerrado con código ${code} | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
          if (this.ffmpegProcessImage) {
            this.ffmpegProcessImage.kill();
            this.ffmpegProcessImage = null;
          }
          // this.isActiveProccesImage = false;

          this.imageBuffer = Buffer.alloc(0);
          this.isInsideImage = false;

          if (this.isActiveProccesImage) {
            cameraLogger.debug(`CameraMotionProcess | snapshotMotion | Evento continua activo para capturar imagenes | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
            const isConnected = await this.isCamConnected();
            if (isConnected) {
              return this.snapshotMotion(rtspUrl);
            } else {
              this.isActiveProccesImage = false;
              // notificar deconexión
              NodoCameraMapManager.update(this.ctrl_id, this.cmr_id, { conectado: 0 });
              const camera = NodoCameraMapManager.getCamera(this.ctrl_id, this.cmr_id,);
              if (camera !== undefined) {
                cameraLogger.info(`CameraMotionProcess | snapshotMotion | Notify Camera Disconnect | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);
                notifyCamDisconnect(this.ctrl_id, { ...camera });
              }

            }
          }
        });
      } catch (error) {
        cameraLogger.error(`CameraMotionProcess | snapshotMotion | Error en CameraMotion.snapshotMotion | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`,error);
      }
    }
  }

  captureMotion(rtspUrl: string) {
    if (this.ffmpegProcessVideo === null) {
      try {
        const pathFolderVid = createMotionDetectionFolders(`./deteccionmovimiento/vid/${"nodo" + this.ctrl_id}/${this.ip}`);
        const videoPath = path.join(pathFolderVid, `grabacion_${Date.now()}.mp4`);
        const argsVideoProcces = getVideoFfmpegArgs(rtspUrl, videoPath , this.ctrl_id);
        const newVideoProcess = spawn("ffmpeg", argsVideoProcces,{stdio:["ignore","ignore","ignore"]});
        this.ffmpegProcessVideo = newVideoProcess;

        // this.ffmpegProcessVideo.on("error", (err) => {
        //   cameraLogger.error(`CameraMotionProcess | captureMotion | Error en el proceso ffmpegVideo | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`,err);
        //   if (this.ffmpegProcessVideo) {
        //     this.ffmpegProcessVideo.kill();
        //     this.ffmpegProcessVideo = null;
        //   }
        // });

        this.ffmpegProcessVideo.on("close", async (code) => {
          if (code === 0) {
            cameraLogger.debug(`CameraMotionProcess | captureMotion | Proceso ffmpegVideo completado sin errores | Código de salida: ${code} | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
            insertPathToDB(videoPath, this.ctrl_id, this.cmr_id, 1);
          } else {
            cameraLogger.error(`CameraMotionProcess | captureMotion | Proceso ffmpegVideo cerrado con código de error: ${code} | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
            // Eliminar video.
            try {
              fs.unlinkSync(videoPath);
            } catch (error) {
              cameraLogger.error(`CameraMotionProcess | captureMotion | Error al eliminar video: ${videoPath} | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`,error);
            }
          }

          if (this.ffmpegProcessVideo) {
            this.ffmpegProcessVideo.kill();
            this.ffmpegProcessVideo = null;
            // if(code !== 0){
            //   this.isActiveProccesVideo = false;
            // }
          }

          if (this.isActiveProccesVideo) {
            cameraLogger.debug(`CameraMotionProcess | captureMotion | Evento continua activo para capturar video | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
            const isConnected = await this.isCamConnected();
            if (isConnected) {
              return this.captureMotion(rtspUrl);
            } else {
              this.isActiveProccesVideo = false;
              // notificar deconexión
              NodoCameraMapManager.update(this.ctrl_id, this.cmr_id, { conectado: 0 });
              const camera = NodoCameraMapManager.getCamera(this.ctrl_id, this.cmr_id,);
              if (camera !== undefined) {
                cameraLogger.info(`CameraMotionProcess | captureMotion | Notify Camera Disconnect | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}`);
                notifyCamDisconnect(this.ctrl_id, { ...camera });
              }
            }
          }
        });
      } catch (error) {
        cameraLogger.error(`CameraMotionProcess | captureMotion | Error en CameraMotion.captureMotion | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`,error);
      }
    }
  }

  receivedEvent(camMessage: any, xml: any, rtspUrl: string) {
    // Extract Event Details
    // Events have a Topic
    // Events have (optionally) a Source, a Key and Data fields
    // The Source,Key and Data fields can be single items or an array of items
    // The Source,Key and Data fields can be of type SimpleItem or a Complex Item

    //    - Topic
    //    - Message/Message/$
    //    - Message/Message/Source...
    //    - Message/Message/Key...
    //    - Message/Message/Data/SimpleItem/[index]/$/name   (array of items)
    // OR - Message/Message/Data/SimpleItem/$/name   (single item)
    //    - Message/Message/Data/SimpleItem/[index]/$/value   (array of items)
    // OR - Message/Message/Data/SimpleItem/$/value   (single item)

    let eventTopic = camMessage.topic._;
    eventTopic = this.stripNamespaces(eventTopic);

    let eventTime = camMessage.message.message.$.UtcTime;

    let eventProperty = camMessage.message.message.$.PropertyOperation;
    // Supposed to be Initialized, Deleted or Changed but missing/undefined on the Avigilon 4 channel encoder

    // Only handle simpleItem
    // Only handle one 'source' item
    // Ignore the 'key' item  (nothing I own produces it)
    // Handle all the 'Data' items

    // SOURCE (Name:Value)
    let sourceName = null;
    let sourceValue = null;
    if (camMessage.message.message.source && camMessage.message.message.source.simpleItem) {
      if (Array.isArray(camMessage.message.message.source.simpleItem)) {
        sourceName = camMessage.message.message.source.simpleItem[0].$.Name;
        sourceValue = camMessage.message.message.source.simpleItem[0].$.Value;
        // console.log("WARNING: Only processing first Event Source item");
      } else {
        sourceName = camMessage.message.message.source.simpleItem.$.Name;
        sourceValue = camMessage.message.message.source.simpleItem.$.Value;
      }
    } else {
      sourceName = null;
      sourceValue = null;
      // console.log("WARNING: Source does not contain a simpleItem");
    }

    //KEY
    if (camMessage.message.message.key) {
      // console.log("NOTE: Event has a Key");
    }

    // DATA (Name:Value)
    if (camMessage.message.message.data && camMessage.message.message.data.simpleItem) {
      if (Array.isArray(camMessage.message.message.data.simpleItem)) {
        for (let x = 0; x < camMessage.message.message.data.simpleItem.length; x++) {
          let dataName = camMessage.message.message.data.simpleItem[x].$.Name;
          let dataValue = camMessage.message.message.data.simpleItem[x].$.Value;
          this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
        }
      } else {
        let dataName = camMessage.message.message.data.simpleItem.$.Name;
        let dataValue = camMessage.message.message.data.simpleItem.$.Value;
        this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
      }
    } else if (camMessage.message.message.data && camMessage.message.message.data.elementItem) {
      // console.log("WARNING: Data contain an elementItem");
      let dataName = "elementItem";
      let dataValue = JSON.stringify(camMessage.message.message.data.elementItem);
      this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
    } else {
      // console.log("WARNING: Data does not contain a simpleItem or elementItem");
      let dataName = null;
      let dataValue = null;
      this.processEvent(eventTime, eventTopic, eventProperty, sourceName, sourceValue, dataName, dataValue, rtspUrl);
    }
  }

  getCamOnvifInstance(): Promise<Cam> {
    const camOvifProps = {
      hostname: this.ip,
      username: this.usuario,
      password: this.contraseña,
      timeout: 10000,
      preserveAddress: true,
      autoconnect: true,
    };

    return new Promise<Cam>((resolve, reject) => {
      new Cam(camOvifProps, function (err: any) {
        if (err) {
          const errConection = new Error(`Deteccion de Movimiento | No se pudo establecer conexion a la camara ${camOvifProps.hostname}`);
          return reject(errConection);
        }
        return resolve(this);
      });
    });
  }

  private isCamConnected(): Promise<boolean> {
    const camOvifProps = {
      hostname: this.ip,
      username: this.usuario,
      password: this.contraseña,
      timeout: 5000,
      preserveAddress: true,
      autoconnect: true,
    };

    return new Promise<boolean>((resolve, reject) => {
      new Cam(camOvifProps, function (err: any) {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      });
    });
  }

  getDeviceInformation(cam: Cam): Promise<any> {
    const camHostname = this.ip;
    return new Promise<any>((resolve, reject) => {
      cam.getDeviceInformation((err: any, info: any, xml: any) => {
        if (err) {
          const errDiviceInformation = new Error(`Deteccion de Movimiento | No se pudo obtener informacion del dispositivo ${camHostname}`);
          return reject(errDiviceInformation);
        } else {
          return resolve(info);
        }
      });
    });
  }

  getSystemDateAndTime(cam: Cam): Promise<any> {
    const camHostname = this.ip;
    return new Promise<any>((resolve, reject) => {
      cam.getSystemDateAndTime((err: any, date: any, xml: any) => {
        if (err) {
          const errSysDataTime = new Error(`Deteccion de Movimiento | No se pudo obtener el 'system datetime' del dispositivo ${camHostname}`);
          return reject(errSysDataTime);
        } else {
          return resolve(date);
        }
      });
    });
  }

  getStreamUri(cam: Cam): Promise<any> {
    const camHostname = this.ip;
    return new Promise<any>((resolve, reject) => {
      cam.getStreamUri({ protocol: "RTSP" }, function (err: any, stream: any) {
        if (err) {
          const errStremaUri = new Error(`Deteccion de Movimiento | No se pudo obtener el 'stream uri' del dispositivo ${camHostname}`);
          return reject(errStremaUri);
        } else {
          return resolve(stream.uri);
        }
      });
    });
  }

  getCapabilities(cam: Cam): Promise<boolean> {
    const camHostname = this.ip;
    return new Promise<boolean>((resolve, reject) => {
      cam.getCapabilities(function (err: any, data: any, xml: any) {
        try {
          if (err) {
            const errCapabilities = new Error(`Deteccion de Movimiento | No se pudo obtener las 'capabilities' del dispositivo ${camHostname}`);
            reject(errCapabilities);
          }
          if (data.events) {
            return resolve(true);
          } else {
            return resolve(false);
          }
        } catch (error) {
          const errEvents = new Error(`Deteccion de Movimiento | No de pudo obtener eventos ${camHostname}`);
          reject(errEvents);
        }
      });
    });
  }

  getEventProperties(cam: Cam, hasEvents: boolean) {
    const camHostname = this.ip;
    let hasTopics: boolean = false;
    return new Promise<boolean>((resolve, reject) => {
      if (hasEvents) {
        cam.getEventProperties(function (err: any, data: any, xml: any) {
          if (err) {
            const errEventProperties = new Error(`Deteccion de Movimiento | No se pudo obtener las 'event properties' del dispositivo ${camHostname}`);
            return reject(errEventProperties);
          } else {
            // Display the available Topics
            let parseNode = function (node: any, topicPath: any) {
              // loop over all the child nodes in this node
              for (const child in node) {
                if (child == "$") {
                  continue;
                } else if (child == "messageDescription") {
                  // we have found the details that go with an event
                  // examine the messageDescription
                  let IsProperty = false;
                  let source = "";
                  let data = "";
                  if (node[child].$ && node[child].$.IsProperty) {
                    IsProperty = node[child].$.IsProperty;
                  }
                  if (node[child].source) {
                    source = JSON.stringify(node[child].source);
                  }
                  if (node[child].data) {
                    data = JSON.stringify(node[child].data);
                  }
                  // console.log("Found Event - " + topicPath.toUpperCase());
                  //console.log('  IsProperty=' + IsProperty);
                  if (source.length > 0) {
                    // console.log("  Source=" + source);
                  }
                  if (data.length > 0) {
                    // console.log("  Data=" + data);
                  }

                  hasTopics = true;
                  return;
                } else {
                  // decend into the child node, looking for the messageDescription
                  parseNode(node[child], topicPath + "/" + child);
                }
              }
            };
            parseNode(data.topicSet, "");
            resolve(hasTopics);
          }
          // console.log("");
          // console.log("");
        });
      } else {
        const errHasEvents = new Error(`Deteccion de Movimiento | No se encontraron 'events' en el dispositivo ${camHostname}`);
        reject(errHasEvents);
      }
    });
  }

  async execute() {
    try {
      const camOnvif = await this.getCamOnvifInstance();
      cameraLogger.info(`CameraMotionProcess | execute | Conexion establecida con la camara ${this.ip}`);

      // Proceso 1
      const info = await this.getDeviceInformation(camOnvif);
      cameraLogger.info(`CameraMotionProcess | execute | Manufacturer  ${info.manufacturer}`);
      cameraLogger.info(`CameraMotionProcess | execute | Model         ${info.model}`);
      cameraLogger.info(`CameraMotionProcess | execute | Firmware      ${info.firmwareVersion}`);
      cameraLogger.info(`CameraMotionProcess | execute | Serial Number ${info.serialNumber}`);
      // Proceso 2
      const date = await this.getSystemDateAndTime(camOnvif);
      cameraLogger.info(`CameraMotionProcess | execute | Device Time   ${date}`);
      // Get RTSP:
      const onvifRtspUrl = await this.getStreamUri(camOnvif);
      // const rstpUrl = addCredentialToRtsp(onvifRtspUrl, this.usuario, this.contraseña);
      const multRtsp = await getMulticastRtspStreamAndSubStream(onvifRtspUrl, this.usuario, this.contraseña, info.manufacturer);
      cameraLogger.info(`CameraMotionProcess | execute | Rtsp URL : ${JSON.stringify(multRtsp)}`);
      //Proceso 3
      let hasEvents = await this.getCapabilities(camOnvif);
      // Proceso 4
      let hasTopics = await this.getEventProperties(camOnvif, hasEvents);

      cameraLogger.info(`CameraMotionProcess | execute | hasEvents && hasTopics ${hasEvents} ${hasTopics}`);
      if (hasEvents && hasTopics) {
        // register for 'event' events. This causes the library to ask the camera for Pull Events
        camOnvif.on("event", (camMessage: any, xml: any) => {
          // console.log(`Detección Movimiento Test | isActiveProccesImage = ${ JSON.stringify(this.isActiveProccesImage)}  | isActiveProccesVideo = ${ JSON.stringify(this.isActiveProccesVideo)} | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`)
          this.receivedEvent(camMessage, xml, multRtsp[0]);
        });
      }

      // if(hasEvents){
      //   // test
      //   camOnvif.on("connect",function(data:any){
      //     console.log("Connect Event test:", data)
      //   })

      //   comOnvif.on("error",function(err:any){
      //     console.log("Error Envent", err)
      //   })
      // }
    } catch (error) {
      if(error instanceof Error){
        cameraLogger.error(`CameraMotionProcess | Execute Error | ctrl_id : ${this.ctrl_id} | cmr_id ${this.cmr_id}`, error.message);
      }else{
        cameraLogger.error(`CameraMotionProcess | Execute Error | ctrl_id : ${this.ctrl_id} | cmr_id ${this.cmr_id}`, error);
      }
      // throw error
    }
  }
}

const getImageFfmpegArgs = (rtspUrl: string, ctrl_id: number): string[] => {
  const ctrlConfig = ControllerMapManager.getControllerAndResolution(ctrl_id);
  if(ctrlConfig === undefined){
    throw new Error(`Error getImageFfmpegArgs | Controlador ${ctrl_id} no encontrado getControllerAndResolution`);
  }
  const {controller,resolution:{motion_snapshot}} = ctrlConfig

  return [
    "-rtsp_transport", "tcp", 
    "-timeout",`${TIMEOUT_DISCONNECT*1000000}`,
    "-i", `${rtspUrl}`,
    "-vf", `scale=${motion_snapshot.ancho}:${motion_snapshot.altura},select='gte(t\\,0)',fps=1/${controller.motionsnapshotinterval}`,
    "-an",
    "-t", `${controller.motionsnapshotseconds}`,
    "-c:v", "mjpeg",
    "-f", "image2pipe",
    "-"
    ];
};

const getVideoFfmpegArgs = (rtspUrl: string, outputPath: string, ctrl_id: number): string[] => {
  const ctrlConfig = ControllerMapManager.getControllerAndResolution(ctrl_id);
  if(ctrlConfig === undefined){
    throw new Error(`Error getVideoFfmpegArgs | Controlador ${ctrl_id} no encontrado getControllerAndResolution`);
  }
  const {controller,resolution:{motion_record}} = ctrlConfig

  return [
    "-rtsp_transport","tcp",
    "-timeout",`${TIMEOUT_DISCONNECT*1000000}`,
    "-i",`${rtspUrl}`,
    "-r",`${controller.motionrecordfps}`,
    "-vf",`scale=${motion_record.ancho}:${motion_record.altura}`,
    "-an",
    "-c:v","libx264",
    "-preset","fast",
    "-t",`${controller.motionrecordseconds}`,
    `${outputPath}`,
  ];
};

function createFolderIfNotExists(dir: fs.PathLike) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function getCurrentDateTime() {
  const now = new Date();
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const day = now.getDate().toString().padStart(2, "0");
  const hour = now.getHours().toString().padStart(2, "0");

  return { year, month, day, hour };
}

export function createMotionDetectionFolders(motionDetectionPath: string) {
  const { year, month, day, hour } = getCurrentDateTime();

  const folderPath = path.join(motionDetectionPath, `${year}-${month}-${day}`, hour);
  createFolderIfNotExists(folderPath);

  return folderPath;
}

const insertPathToDB = (newPath: string, ctrl_id: number, cmr_id: number, tipo: 0 | 1) => {
  (async () => {
    try {
      const finalPath = newPath.split(path.sep).join(path.posix.sep);
      const fecha = dayjs().format("YYYY-MM-DD HH:mm:ss")

      await MySQL2.executeQuery({ sql: `INSERT INTO ${"nodo" + ctrl_id}.registroarchivocamara (cmr_id,tipo,ruta,fecha) VALUES ( ? , ?, ?, ?)`, values: [cmr_id, tipo, finalPath,fecha] });
    } catch (error) {
      cameraLogger.error(`CameraMotionProcess | insertPathToDB | Error al insertar path a la db:\n`, error);
    }
  })();
};
