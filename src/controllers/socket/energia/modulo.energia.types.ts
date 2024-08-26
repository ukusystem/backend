import { Namespace, Socket } from "socket.io";
import { Controlador, MedidorEnergia } from "../../../types/db";

export type MedidorEnergiaSocket = Omit<MedidorEnergia, "serie"> & Pick<Controlador, "ctrl_id">;

// export interface IMedEnergiaDTO extends MedidorEnergiaSocket {
//   setCtrlId(ctrl_id: MedidorEnergiaSocket["ctrl_id"]): void;
//   setMeId(me_id: MedidorEnergiaSocket["me_id"]): void;
//   setVoltaje(voltaje: MedidorEnergiaSocket["voltaje"]): void;
//   setAmperaje(amperaje: MedidorEnergiaSocket["amperaje"]): void;
//   setFdp(fdp: MedidorEnergiaSocket["fdp"]): void;
//   setFrecuencia(frecuencia: MedidorEnergiaSocket["frecuencia"]): void;
//   setPotenciaw(potenciaw: MedidorEnergiaSocket["potenciaw"]): void;
//   setPotenciakwh(potenciakwh: MedidorEnergiaSocket["potenciakwh"]): void;
//   setActivo(activo: MedidorEnergiaSocket["activo"]): void;
//   setDescripcion(descripcion: MedidorEnergiaSocket["descripcion"]): void;
//   toJSON(): MedidorEnergiaSocket
// }

export interface MedidorEnergiaSocketBad {
  ctrl_id: number;
  me_id: number;
  descripcion: string | null;
  voltaje: number | null;
  amperaje: number | null;
  fdp: number | null;
  frecuencia: number | null;
  potenciaw: number | null;
  potenciakwh: number | null;
  activo: number | null;
}

// export interface IMedEnergiaBadDTO extends MedidorEnergiaSocketBad {
//   setCtrlId(ctrl_id: MedidorEnergiaSocketBad["ctrl_id"]): void;
//   setMeId(me_id: MedidorEnergiaSocketBad["me_id"]): void;
//   setVoltaje(voltaje: MedidorEnergiaSocketBad["voltaje"]): void;
//   setAmperaje(amperaje: MedidorEnergiaSocketBad["amperaje"]): void;
//   setFdp(fdp: MedidorEnergiaSocketBad["fdp"]): void;
//   setFrecuencia(frecuencia: MedidorEnergiaSocketBad["frecuencia"]): void;
//   setPotenciaw(potenciaw: MedidorEnergiaSocketBad["potenciaw"]): void;
//   setPotenciakwh(potenciakwh: MedidorEnergiaSocketBad["potenciakwh"]): void;
//   setActivo(activo: MedidorEnergiaSocketBad["activo"]): void;
//   setDescripcion(descripcion: MedidorEnergiaSocketBad["descripcion"]): void;
//   toJSON(): MedidorEnergiaSocketBad;
// }

// Socket:
interface ClientToServerEvents {
}
  
interface ServerToClientEvents {
  list_energia: (listEn: MedidorEnergiaSocket[]) => void;
  enegia: (modEn: MedidorEnergiaSocket) => void;
}

interface InterServerEvents {}

interface SocketData {}

export type NamespaceModEnergia = Namespace<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;

export type SocketModEnergia = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;


// Observer:

export interface ModEnergiaObserver {
  updateListModEnergia(data: MedidorEnergiaSocket[]): void;
  updateModEnergia(data: MedidorEnergiaSocket): void;
}

export interface ModEnergiaSubject {
  registerObserver(ctrl_id: number,me_id: number,observer: ModEnergiaObserver): void;
  unregisterObserver(ctrl_id: number, me_id: number): void;
  notifyListModEnergia(ctrl_id: number,me_id: number, data: MedidorEnergiaSocket[]): void;
  notifyModEnergia(ctrl_id: number,me_id: number, data: MedidorEnergiaSocket): void;
}

