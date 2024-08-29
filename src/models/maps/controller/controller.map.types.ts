import { RowDataPacket } from "mysql2";
import { Controlador } from "../../../types/db";

export type ControllerData = Controlador

export enum ControllerState {
  Activo = 1,
  Desactivado = 0,
}

export interface ControllerRowData extends RowDataPacket , ControllerData {}
