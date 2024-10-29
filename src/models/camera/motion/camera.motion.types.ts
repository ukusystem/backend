import { ChildProcessByStdio } from "child_process";

export interface CameraMotionProps {
  ip: string;
  usuario: string;
  contraseña: string;
  cmr_id: number;
  ctrl_id: number;

  ffmpegProcessImage: ChildProcessByStdio<null, any, null> | null;
  imageBuffer: Buffer;
  isInsideImage: boolean;
  isActiveProccesImage: boolean;
  
  ffmpegProcessVideo: ChildProcessByStdio<null, null, null> | null;
  isActiveProccesVideo: boolean;
}

export type CameraProps = Pick<CameraMotionProps, "ip" | "usuario" | "contraseña" | "cmr_id" | "ctrl_id" >

export interface CameraMotionMethods {
  receivedEvent: (camMessage: any, xml: any, rtspUrl: string) => void;
  stripNamespaces: (topic: any) => string;
  processEvent: ( eventTime: any, eventTopic: any, eventProperty: any, sourceName: any, sourceValue: any, dataName: any, dataValue: any, rtspUrl: string ) => void;
}
