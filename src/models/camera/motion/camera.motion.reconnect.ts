// @ts-ignore
// @ts-nocheck

import { cameraLogger } from "../../../services/loggers";
import { CameraMotionManager } from "./camera.motion.manager";
// import { CameraMotionProcess } from "./camera.motion.process";
import { CameraProps } from "./camera.motion.types";
import { Cam } from "onvif";

export class CameraReconnect {

  ip: string;
  usuario: string;
  contraseña: string;
  cmr_id: number;
  ctrl_id: number;

  interval_proccess: NodeJS.Timeout | null = null;

  constructor( props: CameraProps ) {
    const { cmr_id, ctrl_id, ip, contraseña, usuario } = props;
    this.cmr_id = cmr_id;
    this.ctrl_id = ctrl_id;
    this.ip = ip;
    this.contraseña = contraseña;
    this.usuario = usuario;
  }

  public async execute() {
    try {
      const isConnected = await this.#connect();
      if (isConnected) {
        cameraLogger.info(`CameraReconnect | execute | Connectado primer intento | ctrl_id: ${this.ctrl_id} | cmr_id: ${this.cmr_id}  | ip: ${this.ip}`);
        // const newCamMotion = new CameraMotionProcess({
        //   cmr_id: this.cmr_id,
        //   ctrl_id: this.ctrl_id,
        //   ip: this.ip,
        //   contraseña: this.contraseña,
        //   usuario: this.usuario,
        // });
        // CameraMotionManager.add_update(newCamMotion);
        CameraMotionManager.notifyAddUpdate(this.ctrl_id,this.cmr_id);
      }

      // console.log("creando setInterval de reconeccion")
      // this.interval_proccess = setInterval( async ()=>{
      //   const isConnected = await this.#connect();
      //   console.log("setInterval reconectando",isConnected)
      //   if(isConnected){
      //     const newCamMotion = new CameraMotionProcess({cmr_id:this.cmr_id,ctrl_id:this.ctrl_id,ip:this.ip,contraseña:this.contraseña,usuario:this.usuario})
      //     CameraMotionManager.add_update(newCamMotion)
      //     if(this.interval_proccess){
      //       clearInterval(this.interval_proccess)
      //       console.log("eliminando setInterval")
      //     }
      //   }

      // },30000)
    } catch (error) {
      cameraLogger.error(`CameraReconnect | execute | Error CameraReconnect.execute`,error);
    }
  }

  #connect(): Promise<boolean> {
    const camOvifProps = {
      hostname: this.ip,
      username: this.usuario,
      password: this.contraseña,
      timeout: 5000,
      preserveAddress: false,
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
}
