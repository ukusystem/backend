import { RowDataPacket } from "mysql2";
import { Controlador, EquipoEntrada, PinesEntrada } from "../../../types/db";

export type PinesEntradaData = PinesEntrada & Pick<EquipoEntrada, "detector">;
export interface PinesEntradaRowsData extends PinesEntradaData, RowDataPacket {}

export type IPinesEntradaSocket = PinesEntrada & Pick<Controlador, "ctrl_id">;

export interface IPinesEntradaSocketBad {
  pe_id: number;
  pin: number;
  ee_id: number | null;
  descripcion: string | null;
  estado: number | null;
  activo: number | null;
  ctrl_id: number;
}

// Observers

export interface PinesEntradaObserver {
  updateListPinesEntrada(data: PinesEntrada[]): void;
  updateItemPinEntrada(data: IPinesEntradaSocket): void;
  updateControllerMode(data: 0 | 1): void;
  updateControllerSecurity(data: 0 | 1): void;
}

export interface PinesEntradaSubject {
  registerObserver(ctrl_id: number, observer: PinesEntradaObserver): void;
  unregisterObserver(ctrl_id: number, observer: PinesEntradaObserver): void;
  notifyListPinesEntrada(data: IPinesEntradaSocket): void;
  notifyItemPinEntrada(data: IPinesEntradaSocket): void;
  notifyControllerMode(ctrl_id: number, data: 0 | 1): void;
  notifyControllerSecurity(ctrl_id: number, data: 0 | 1): void;
}
