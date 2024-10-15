// @ts-ignore
// @ts-nocheck
import { Cam } from "onvif"; // No existen types para ts

import { CustomError } from "../../utils/CustomError";
import { cameraLogger } from "../../services/loggers";

interface CameraProps {
  ctrl_id: number ;
  usuario: string;
  contraseña: string;
  ip: string;
}

export type CamMovements = "Right" | "Left"| "Up"| "Down"| "RightUp"| "RightDown"| "LeftUp"| "LeftDown"| "ZoomTele"| "ZoomWide"
export type ControlPTZProps = {action : "start" | "stop", velocity: number, movement : CamMovements}

interface ICamOnvifConnections {
  [ctrl_id: string]:{[ ip: string]: Cam }
}


const camOnvifConnections : ICamOnvifConnections  = { }

export class CameraOnvif {
  ctrl_id: number;
  ip: string;
  usuario: string;
  contraseña: string;

  constructor(props: CameraProps) {
    const { usuario, contraseña, ip, ctrl_id,} = props;
    this.usuario = usuario;
    this.contraseña = contraseña;
    this.ip = ip;
    this.ctrl_id = ctrl_id;
  }

  #createInstanceConnection(){
    return new Promise<Cam>((resolve, reject) => {
      new Cam({ hostname: this.ip, username: this.usuario, password: this.contraseña , timeout: 5000, },function (err) {
        if (err) {
          const errCamConnect = new CustomError("Error al intentar establecer conexión con la cámara",500,"Camara Onvif Conexion")
          return reject(errCamConnect)
        }
        return resolve(this)
      })
        
    })
  }

  #getInstanceConnection(){
    return new Promise<Cam>(async (resolve, reject) => {

      if(!camOnvifConnections.hasOwnProperty(this.ctrl_id)){
        camOnvifConnections[this.ctrl_id]={}
      }

      if(!camOnvifConnections[this.ctrl_id].hasOwnProperty(this.ip)){
        try {
          const newConnection = await this.#createInstanceConnection()
          camOnvifConnections[this.ctrl_id][this.ip] = newConnection;
          cameraLogger.info(`CamOnvif | #getInstanceConnection | Nueva Instancia | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
          return resolve(newConnection)
        } catch (error) {
          return reject(error)
        }
      }

      return resolve(camOnvifConnections[this.ctrl_id][this.ip])
    })
  }

  // Mover PTZ
  async #movePTZ({ x_speed, y_speed, zoom_speed, movement }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const camConnect = await this.#getInstanceConnection();

        const parse_x = parseFloat(x_speed);
        const parse_y = parseFloat(y_speed);
        const parse_zoom = parseFloat(zoom_speed);

        camConnect.continuousMove({ x: parse_x, y: parse_y, zoom: parse_zoom },
          async (err) => {
            if (err) {
              const errContiMove = new CustomError("Se ha producido un error durante el movimiento continuo de la cámara", 500,"Start Error Movement")
              return reject(errContiMove)
            } else {
              return resolve()
            }
          }
        );
      } catch (error) {
        return reject(error)
      }

    })
  }

  // Parar PTZ
  async #stopPTZ() {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const camConnect = await this.#getInstanceConnection();
        camConnect.stop({ panTilt: true, zoom: true },
          async function (err) {
            if (err) {
              const errStopContMove = new CustomError( "Se ha producido un error al detener el movimiento continuo de la cámara", 500,"Stop Error Movement" );
              return reject(errStopContMove);
            }
            return resolve();
          }
        );
            
      } catch (error) {
        return reject(error)
      }
    })
  }

  // Controlar PTZ
  async  controlPTZByActionAndVelocityAndMovement({ action, velocity, movement}: ControlPTZProps) {
    return new Promise( async (resolve, reject) => {

      const movements : {[move in CamMovements] : {x_speed:number, y_speed:number, zoom_speed: number, action: ControlPTZProps["action"], movement: CamMovements }} = {
        Right: { x_speed: velocity, y_speed: 0, zoom_speed: 0, movement, action,},
        Left: { x_speed: -velocity, y_speed: 0, zoom_speed: 0, movement, action,},
        Up: { x_speed: 0, y_speed: velocity, zoom_speed: 0, movement, action },
        Down: { x_speed: 0, y_speed: -velocity, zoom_speed: 0, movement, action,},
        RightUp: { x_speed: velocity, y_speed: velocity, zoom_speed: 0, movement, action,},
        RightDown: { x_speed: velocity, y_speed: -velocity, zoom_speed: 0, movement, action,},
        LeftUp: { x_speed: -velocity, y_speed: velocity, zoom_speed: 0, movement, action,},
        LeftDown: { x_speed: -velocity, y_speed: -velocity, zoom_speed: 0, movement, action,},
        ZoomTele: { x_speed: 0, y_speed: 0, zoom_speed: velocity, movement, action,},
        ZoomWide: { x_speed: 0, y_speed: 0, zoom_speed: -velocity, movement, action,},
      };

      const movementData = movements[movement];

      if (!movementData) {
        const errMovement = new CustomError("El tipo de movimiento de la cámara no está disponible",400,"Invalid Movement")
        return reject(errMovement)
      }

      if (movementData.action === "start") {
        try { 
          await this.#movePTZ(movementData); // 400 - 550 ms
          
          return resolve(true)
        } catch (error) {
           return reject(error)
        }
      } else if (movementData.action === "stop") {
        try {
          await this.#stopPTZ(); // 500-600ms
          return resolve(true)
        } catch (error) {
          return reject(error)
        }
      }
    })
  }

  // Preset
  async gotoPresetPTZByNumPreset({ n_preset }) {
    return new Promise<void>(async (resolve, reject) => {
      try {
        const camConnect = await this.#getInstanceConnection();
        camConnect.gotoPreset({ preset: n_preset }, function (err, stream, xml) {
          if (err) {
            const errGoPreset = new CustomError("Error al establecer el preset de la cámara", 500,"Preset Error");
            return reject(errGoPreset)
          } else {
            return resolve();
          }
        });

      } catch (error) {
        return reject(error)
      }

    });
  }
}
