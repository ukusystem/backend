import { ChildProcessWithoutNullStreams } from "child_process";

export interface CameraMotionProps {
  ip: string;
  usuario: string;
  contraseña: string;
  cmr_id: number;
  ctrl_id: number;

  ffmpegProcessImage: ChildProcessWithoutNullStreams | null;
  imageBuffer: Buffer;
  isInsideImage: boolean;
  isActiveProccesImage: boolean;
  ffmpegProcessVideo: ChildProcessWithoutNullStreams | null;
  isActiveProccesVideo: boolean;
}

export interface CameraMotionMethods {
  receivedEvent: (camMessage: any, xml: any, rtspUrl: string) => void;
  stripNamespaces: (topic: any) => string;
  processEvent: ( eventTime: any, eventTopic: any, eventProperty: any, sourceName: any, sourceValue: any, dataName: any, dataValue: any, rtspUrl: string ) => void;
}
