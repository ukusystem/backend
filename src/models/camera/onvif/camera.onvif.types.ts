export type CamMovements = 'Right' | 'Left' | 'Up' | 'Down' | 'RightUp' | 'RightDown' | 'LeftUp' | 'LeftDown' | 'ZoomTele' | 'ZoomWide';
export type ControlPTZProps = { action: 'start' | 'stop'; velocity: number; movement: CamMovements };
export type PTZAction = 'start' | 'stop';

export interface CamOnvifProps {
  ctrl_id: number;
  cmr_id: number;
  ip: string;
  usuario: string;
  contraseña: string;
}

export interface CamOnvifMethods {
  controlPTZ(movement: CamMovements, velocity: number, action: PTZAction): Promise<void>;
  presetPTZ(n_preset: number): Promise<void>;
}

export type CamOnvifMap = Map<number, CamOnvifProps & CamOnvifMethods>; // key : cmr_id

export type CtrlOnvifMap = Map<number, CamOnvifMap>; // key : ctrl_id
