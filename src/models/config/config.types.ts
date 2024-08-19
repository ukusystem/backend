import { RowDataPacket } from "mysql2";
import { Resolucion } from "../../types/db";

export enum CONTROLLER_MODE {
  Libre = 0,
  Seguridad = 1,
}

export enum CONTROLLER_SECURITY {
  Desarmado = 0,
  Armado = 1,
}

export interface CONTROLLER_MOTION {
  MOTION_RECORD_SECONDS: number;
  MOTION_RECORD_RESOLUTION: Resolucion;
  MOTION_RECORD_FPS: number;

  MOTION_SNAPSHOT_SECONDS: number;
  MOTION_SNAPSHOT_RESOLUTION: Resolucion;
  MOTION_SNAPSHOT_INTERVAL: number;
}

export interface CONTROLLER_STREAM {
  STREAM_PRIMARY_RESOLUTION: Resolucion;
  STREAM_PRIMARY_FPS: number;

  STREAM_SECONDARY_RESOLUTION: Resolucion;
  STREAM_SECONDARY_FPS: number;

  STREAM_AUXILIARY_RESOLUTION: Resolucion;
  STREAM_AUXILIARY_FPS: number;
}

export interface CONTROLLER_CONFIG extends CONTROLLER_MOTION, CONTROLLER_STREAM {
  CONTROLLER_MODE: CONTROLLER_MODE;
  CONTROLLER_SECURITY: CONTROLLER_SECURITY;
}

export interface GENERAL_CONFIG {
  COMPANY_NAME: string;
  EMAIL_ADMIN: string;
}

type CONTROLLER_CONFIG_OMIT_DB = Omit<
  CONTROLLER_CONFIG,
  | "MOTION_RECORD_RESOLUTION"
  | "MOTION_SNAPSHOT_RESOLUTION"
  | "STREAM_PRIMARY_RESOLUTION"
  | "STREAM_SECONDARY_RESOLUTION"
  | "STREAM_AUXILIARY_RESOLUTION"
>;

export interface ControllerConfigRowData extends RowDataPacket, CONTROLLER_CONFIG_OMIT_DB {
  ctrl_id: number;
  res_id_motionrecord: number;
  res_id_motionsnapshot: number;
  res_id_streamprimary: number;
  res_id_streamsecondary: number;
  res_id_streamauxiliary: number;
}

export interface GeneralConfigRowData extends RowDataPacket, GENERAL_CONFIG {}

export interface ResolucionRowData extends RowDataPacket, Resolucion {}


export type UpdateControllerFunction<T extends keyof CONTROLLER_CONFIG> = ( currentConfig: CONTROLLER_CONFIG, newValue: CONTROLLER_CONFIG[T] , ctrl_id: number ) => void;


export type UpdateGeneralFunction<T extends keyof GENERAL_CONFIG> = ( currentConfig: GENERAL_CONFIG, newValue: GENERAL_CONFIG[T] ) => void;
