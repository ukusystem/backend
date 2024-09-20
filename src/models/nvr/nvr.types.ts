import { RowDataPacket } from "mysql2";

export enum Day {
  "Monday" = 1,
  "Tuesday" = 2,
  "Wednesday" = 3,
  "Thursday" = 4,
  "Friday" = 5,
  "Saturday" = 6,
  "Sunday" = 7,
}

export interface NvrPreferencia {
  nvrpref_id: number;
  dia: Day;
  tiempo_inicio: string;
  tiempo_final: string;
  cmr_id: number;
  activo: number;
}

export interface NvrJobSchedule {
  stop():void;
}

export interface CameraJob {
  info: NvrPreferencia,
  StartScheduledJob?:NvrJobSchedule,
  EndScheduleJob?: NvrJobSchedule,
}

export type CamaraEvents = Map<number, CameraJob>; // key: cmr_id

export type NvrControllerStructure = Map<number, CamaraEvents>; // key: ctrl_id


export interface NvrPreferenciaRowData extends RowDataPacket, NvrPreferencia {};