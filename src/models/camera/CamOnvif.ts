// @ts-ignore
// @ts-nocheck
import { Cam } from 'onvif'; // No existen types para ts

import { CustomError } from '../../utils/CustomError';
import { cameraLogger } from '../../services/loggers';

interface CameraProps {
  ctrl_id: number;
  usuario: string;
  contraseña: string;
  ip: string;
}

export type CamMovements = 'Right' | 'Left' | 'Up' | 'Down' | 'RightUp' | 'RightDown' | 'LeftUp' | 'LeftDown' | 'ZoomTele' | 'ZoomWide';
export type ControlPTZProps = { action: 'start' | 'stop'; velocity: number; movement: CamMovements };

interface ICamOnvifConnections {
  [ctrl_id: string]: { [ip: string]: Cam };
}

const camOnvifConnections: ICamOnvifConnections = {};

export class CameraOnvif {
  ctrl_id: number;
  ip: string;
  usuario: string;
  contraseña: string;

  constructor(props: CameraProps) {
    const { usuario, contraseña, ip, ctrl_id } = props;
    this.usuario = usuario;
    this.contraseña = contraseña;
    this.ip = ip;
    this.ctrl_id = ctrl_id;
  }

  #createInstanceConnection() {
    return new Promise<Cam>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      new Cam({ hostname: this.ip, username: this.usuario, password: this.contraseña, timeout: 5000 }, function (err: any) {
        if (err) {
          const errCamConnect = new CustomError('Error al intentar establecer conexión con la cámara', 500, 'Camara Onvif Conexion');
          return reject(errCamConnect);
        }
        return resolve(this);
      });
    });
  }

  async #getInstanceConnection(): Promise<Cam> {
    if (!camOnvifConnections[this.ctrl_id]) {
      camOnvifConnections[this.ctrl_id] = {};
    }

    if (!camOnvifConnections[this.ctrl_id][this.ip]) {
      const newConnection = await this.#createInstanceConnection();
      camOnvifConnections[this.ctrl_id][this.ip] = newConnection;
      cameraLogger.info(`CamOnvif | #getInstanceConnection | Nueva Instancia | ctrl_id: ${this.ctrl_id} | ip: ${this.ip}`);
      return newConnection;
    }

    return camOnvifConnections[this.ctrl_id][this.ip];
  }

  // Mover PTZ
  async #movePTZ({ x_speed, y_speed, zoom_speed }: { x_speed: number; y_speed: number; zoom_speed: number; action: ControlPTZProps['action']; movement: CamMovements }) {
    const camConnect = await this.#getInstanceConnection();

    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      camConnect.continuousMove({ x: x_speed, y: y_speed, zoom: zoom_speed }, async (err: any) => {
        if (err) {
          const errContiMove = new CustomError('Se ha producido un error durante el movimiento continuo de la cámara', 500, 'Start Error Movement');
          return reject(errContiMove);
        } else {
          return resolve();
        }
      });
    });
  }

  // Parar PTZ
  async #stopPTZ() {
    const camConnect = await this.#getInstanceConnection();
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      camConnect.stop({ panTilt: true, zoom: true }, function (err: any) {
        if (err) {
          const errStopContMove = new CustomError('Se ha producido un error al detener el movimiento continuo de la cámara', 500, 'Stop Error Movement');
          return reject(errStopContMove);
        }
        return resolve();
      });
    });
  }

  // Controlar PTZ
  async controlPTZByActionAndVelocityAndMovement({ action, velocity, movement }: ControlPTZProps) {
    const movements: { [move in CamMovements]: { x_speed: number; y_speed: number; zoom_speed: number; action: ControlPTZProps['action']; movement: CamMovements } } = {
      Right: { x_speed: velocity, y_speed: 0, zoom_speed: 0, movement, action },
      Left: { x_speed: -velocity, y_speed: 0, zoom_speed: 0, movement, action },
      Up: { x_speed: 0, y_speed: velocity, zoom_speed: 0, movement, action },
      Down: { x_speed: 0, y_speed: -velocity, zoom_speed: 0, movement, action },
      RightUp: { x_speed: velocity, y_speed: velocity, zoom_speed: 0, movement, action },
      RightDown: { x_speed: velocity, y_speed: -velocity, zoom_speed: 0, movement, action },
      LeftUp: { x_speed: -velocity, y_speed: velocity, zoom_speed: 0, movement, action },
      LeftDown: { x_speed: -velocity, y_speed: -velocity, zoom_speed: 0, movement, action },
      ZoomTele: { x_speed: 0, y_speed: 0, zoom_speed: velocity, movement, action },
      ZoomWide: { x_speed: 0, y_speed: 0, zoom_speed: -velocity, movement, action },
    };

    const movementData = movements[movement];

    if (!movementData) {
      const errMovement = new CustomError('El tipo de movimiento de la cámara no está disponible', 400, 'Invalid Movement');
      throw errMovement;
    }

    if (movementData.action === 'start') {
      await this.#movePTZ(movementData); // 400 - 550 ms
    } else if (movementData.action === 'stop') {
      await this.#stopPTZ(); // 500-600ms
    }
  }

  // Preset
  async gotoPresetPTZByNumPreset({ n_preset }: { n_preset: number }) {
    const camConnect = await this.#getInstanceConnection();
    return new Promise<void>((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      camConnect.gotoPreset({ preset: n_preset }, function (err: any, _stream: any, _xml: any) {
        if (err) {
          const errGoPreset = new CustomError('Error al establecer el preset de la cámara', 500, 'Preset Error');
          return reject(errGoPreset);
        } else {
          return resolve();
        }
      });
    });
  }
}
