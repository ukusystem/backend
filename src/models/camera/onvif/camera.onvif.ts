// // @ts-ignore
// // @ts-nocheck
// import { Cam } from 'onvif'; // No existen types para ts

// import { CamMovements, CamOnvifMethods, CamOnvifProps, PTZAction } from './camera.onvif.types';

// export class CameraOnvif implements CamOnvifProps, CamOnvifMethods {
//   readonly ctrl_id: number;
//   readonly cmr_id: number;
//   readonly ip: string;
//   readonly usuario: string;
//   readonly contraseña: string;

//   constructor(props: CamOnvifProps) {
//     const { usuario, contraseña, ip, ctrl_id, cmr_id } = props;
//     this.ctrl_id = ctrl_id;
//     this.cmr_id = cmr_id;
//     this.usuario = usuario;
//     this.contraseña = contraseña;
//     this.ip = ip;
//   }

//   async controlPTZ(movement: CamMovements, velocity: number, action: PTZAction): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
//   async presetPTZ(n_preset: number): Promise<void> {
//     throw new Error('Method not implemented.');
//   }
// }
