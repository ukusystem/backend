
// import {  MedidorEnergiaSocket, MedidorEnergiaSocketBad, ModEnergiaObserver, ModEnergiaSubject, SocketModEnergia } from "./modulo.energia.types";

// export class ModuloEnergiaObserver implements ModEnergiaObserver {
//   #socket: SocketModEnergia;

//   constructor(socket: SocketModEnergia) {
//     this.#socket = socket;
//   }
//   updateListModEnergia(data: MedidorEnergiaSocket[]): void {
//     this.#socket.nsp.emit("list_energia", data);
//   }
//   updateModEnergia(data: MedidorEnergiaSocket): void {
//     this.#socket.nsp.emit("enegia", data);
//   }
// }


// export class MedEnergiaSocketDTO implements MedidorEnergiaSocket {
//   ctrl_id: number;
//   me_id: number;
//   descripcion: string;
//   voltaje: number;
//   amperaje: number;
//   fdp: number;
//   frecuencia: number;
//   potenciaw: number;
//   potenciakwh: number;
//   activo: number;

//   constructor(props: MedidorEnergiaSocket) {
//     const {ctrl_id,me_id,voltaje,amperaje,fdp,frecuencia,potenciaw,potenciakwh,activo,descripcion,} = props;
//     this.ctrl_id = ctrl_id;
//     this.me_id = me_id;
//     this.voltaje = voltaje;
//     this.amperaje = amperaje;
//     this.fdp = fdp;
//     this.frecuencia = frecuencia;
//     this.potenciaw = potenciaw;
//     this.potenciakwh = potenciakwh;
//     this.activo = activo;
//     this.descripcion = descripcion;
//   }

//   public setCtrlId(ctrl_id: MedidorEnergiaSocket["ctrl_id"]): void {
//     this.ctrl_id = ctrl_id;
//   }
//   public setMeId(me_id: MedidorEnergiaSocket["me_id"]): void {
//     this.me_id = me_id;
//   }
//   public setVoltaje(voltaje: MedidorEnergiaSocket["voltaje"]): void {
//     this.voltaje = voltaje;
//   }
//   public setAmperaje(amperaje: MedidorEnergiaSocket["amperaje"]): void {
//     this.amperaje = amperaje;
//   }
//   public setFdp(fdp: MedidorEnergiaSocket["fdp"]): void {
//     this.fdp = fdp;
//   }
//   public setFrecuencia(frecuencia: MedidorEnergiaSocket["frecuencia"]): void {
//     this.frecuencia = frecuencia;
//   }
//   public setPotenciaw(potenciaw: MedidorEnergiaSocket["potenciaw"]): void {
//     this.potenciaw = potenciaw;
//   }
//   public setPotenciakwh(potenciakwh: MedidorEnergiaSocket["potenciakwh"]): void {
//     this.potenciakwh = potenciakwh;
//   }
//   public setActivo(activo: MedidorEnergiaSocket["activo"]): void {
//     this.activo = activo;
//   }
//   public setDescripcion(descripcion: MedidorEnergiaSocket["descripcion"]): void {
//     this.descripcion = descripcion;
//   }

//   public toJSON(): MedidorEnergiaSocket {
//     const result: MedidorEnergiaSocket = {
//       ctrl_id: this.ctrl_id,
//       me_id: this.me_id,
//       voltaje: this.voltaje,
//       amperaje: this.amperaje,
//       fdp: this.fdp,
//       frecuencia: this.frecuencia,
//       potenciaw: this.potenciaw,
//       potenciakwh: this.potenciakwh,
//       activo: this.activo,
//       descripcion: this.descripcion,
//     };
//     return result;
//   }
// }
  
// export class MedEnergiaSocketBadDTO implements MedidorEnergiaSocketBad {
//   ctrl_id: number;
//   me_id: number;
//   voltaje: number | null;
//   amperaje: number | null;
//   fdp: number | null;
//   frecuencia: number | null;
//   potenciaw: number | null;
//   potenciakwh: number | null;
//   activo: number | null;
//   descripcion: string | null;

//   constructor(props: MedidorEnergiaSocketBad) {
//     const {ctrl_id,me_id,voltaje,amperaje,fdp,frecuencia,potenciaw,potenciakwh,activo,descripcion,} = props;
//     this.ctrl_id = ctrl_id;
//     this.me_id = me_id;
//     this.voltaje = voltaje;
//     this.amperaje = amperaje;
//     this.fdp = fdp;
//     this.frecuencia = frecuencia;
//     this.potenciaw = potenciaw;
//     this.potenciakwh = potenciakwh;
//     this.activo = activo;
//     this.descripcion = descripcion;
//   }

//   public setCtrlId(ctrl_id: MedidorEnergiaSocketBad["ctrl_id"]): void {
//     this.ctrl_id = ctrl_id;
//   }
//   public setMeId(me_id: MedidorEnergiaSocketBad["me_id"]): void {
//     this.me_id = me_id;
//   }
//   public setVoltaje(voltaje: MedidorEnergiaSocketBad["voltaje"]): void {
//     this.voltaje = voltaje;
//   }
//   public setAmperaje(amperaje: MedidorEnergiaSocketBad["amperaje"]): void {
//     this.amperaje = amperaje;
//   }
//   public setFdp(fdp: MedidorEnergiaSocketBad["fdp"]): void {
//     this.fdp = fdp;
//   }
//   public setFrecuencia(frecuencia: MedidorEnergiaSocketBad["frecuencia"]): void {
//     this.frecuencia = frecuencia;
//   }
//   public setPotenciaw(potenciaw: MedidorEnergiaSocketBad["potenciaw"]): void {
//     this.potenciaw = potenciaw;
//   }
//   public setPotenciakwh(potenciakwh: MedidorEnergiaSocketBad["potenciakwh"]): void {
//     this.potenciakwh = potenciakwh;
//   }
//   public setActivo(activo: MedidorEnergiaSocketBad["activo"]): void {
//     this.activo = activo;
//   }
//   public setDescripcion(descripcion: MedidorEnergiaSocketBad["descripcion"]): void {
//     this.descripcion = descripcion;
//   }

//   public toJSON(): MedidorEnergiaSocketBad {
//     const result: MedidorEnergiaSocketBad = {
//       ctrl_id: this.ctrl_id,
//       me_id: this.me_id,
//       voltaje: this.voltaje,
//       amperaje: this.amperaje,
//       fdp: this.fdp,
//       frecuencia: this.frecuencia,
//       potenciaw: this.potenciaw,
//       potenciakwh: this.potenciakwh,
//       activo: this.activo,
//       descripcion: this.descripcion,

//     };
//     return result;
//   }
// }

// export class ModuleEnergiaManager {
  

//   static map: { [ctrl_id: string]: { [me_id: string]: MedEnergiaSocketDTO } } = {};
//   static observers: { [ctrl_id: string]: { [me_id: string]: ModEnergiaObserver }; } = {};

//   static registerObserver( ctrl_id: number, me_id: number, observer: ModEnergiaObserver ): void {
//     if (!ModuleEnergiaManager.observers[ctrl_id]) {
//       ModuleEnergiaManager.observers[ctrl_id] = {};
//     }
//     if (!ModuleEnergiaManager.observers[ctrl_id][me_id]) {
//       ModuleEnergiaManager.observers[ctrl_id][me_id] = observer;
//     }
//   }

//   static unregisterObserver(ctrl_id: number, me_id: number): void {
//     if (ModuleEnergiaManager.observers[ctrl_id]) {
//       if (ModuleEnergiaManager.observers[ctrl_id][me_id]) {
//         delete ModuleEnergiaManager.observers[ctrl_id][me_id];
//       }
//     }
//   }

//   static notifyModEnergia(ctrl_id: number,me_id: number, data: MedidorEnergiaSocket): void {
//     if (ModuleEnergiaManager.observers[ctrl_id]) {
//         if (ModuleEnergiaManager.observers[ctrl_id][me_id]) {
//           ModuleEnergiaManager.observers[ctrl_id][me_id].updateModEnergia(data);
//         }
//     }
//   }
//   static notifyListModEnergia(ctrl_id: number,me_id: number, data: MedidorEnergiaSocket[]): void {
//     if (ModuleEnergiaManager.observers[ctrl_id]) {
//       if (ModuleEnergiaManager.observers[ctrl_id][me_id]) {
//         ModuleEnergiaManager.observers[ctrl_id][me_id].updateListModEnergia(data);
//       }
//     }
//   }

//   private static exists(args: { ctrl_id: string; me_id: string }) {
//     const { ctrl_id, me_id } = args;

//     let is_ctrl_id: boolean = false;
//     let is_me_id: boolean = false;

//     for (const ctrl_id_key in ModuleEnergiaManager.map) {
//       if (ctrl_id_key == ctrl_id) {
//         is_ctrl_id = true;
//       }
//       for (const me_id_key in ModuleEnergiaManager.map[ctrl_id_key]) {
//         if (me_id_key == me_id) {
//           is_me_id = true;
//         }
//       }
//     }

//     return is_ctrl_id && is_me_id;
//   }

//   private static add(medidor: MedEnergiaSocketDTO) {
//     const { ctrl_id, me_id } = medidor.toJSON();

//     if (!ModuleEnergiaManager.map.hasOwnProperty(ctrl_id)) {
//       ModuleEnergiaManager.map[ctrl_id] = {};
//     }

//     if (!ModuleEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
//       ModuleEnergiaManager.map[ctrl_id][me_id] = medidor;

//       const listMedEner = ModuleEnergiaManager.#getListMedEnergia(ctrl_id);
//       ModuleEnergiaManager.notifyListModEnergia(ctrl_id, me_id, listMedEner);

//     }
//   }

//   static #getListMedEnergia(ctrl_id:number){
//     const result : MedidorEnergiaSocket[] = [];
//     if (ModuleEnergiaManager.map.hasOwnProperty(ctrl_id)) {
//       Object.values(ModuleEnergiaManager.map[ctrl_id]).forEach((medidor) => {
//         result.push(medidor.toJSON());
//       });
//     }
//     return result;
//   }

//   static #update(medidor: MedEnergiaSocketDTO) {
//     const { ctrl_id, me_id, activo, amperaje, fdp, frecuencia, potenciakwh, potenciaw, voltaje, descripcion, } = medidor.toJSON();
//     if (ModuleEnergiaManager.map.hasOwnProperty(ctrl_id)) {
//       if (ModuleEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
//         const currentMedEnergia = ModuleEnergiaManager.map[ctrl_id][me_id];
//         // if (currentMedEnergia.ctrl_id != ctrl_id) currentMedEnergia.setCtrlId(ctrl_id);
//         // if (currentMedEnergia.me_id != me_id) currentMedEnergia.setMeId(me_id);
//         if (currentMedEnergia.amperaje != amperaje)
//           currentMedEnergia.setAmperaje(amperaje);
//         if (currentMedEnergia.fdp != fdp) currentMedEnergia.setFdp(fdp);
//         if (currentMedEnergia.frecuencia != frecuencia)
//           currentMedEnergia.setFrecuencia(frecuencia);
//         if (currentMedEnergia.potenciakwh != potenciakwh)
//           currentMedEnergia.setPotenciakwh(potenciakwh);
//         if (currentMedEnergia.potenciaw != potenciaw)
//           currentMedEnergia.setPotenciaw(potenciaw);
//         if (currentMedEnergia.voltaje != voltaje)
//           currentMedEnergia.setVoltaje(voltaje);
//         if (currentMedEnergia.descripcion != descripcion)
//           currentMedEnergia.setDescripcion(descripcion);
//         if (currentMedEnergia.activo != activo) {
//           currentMedEnergia.setActivo(activo);
//           ModuleEnergiaManager.notifyListModEnergia(ctrl_id, medidor);
//         }

//         ModuleEnergiaManager.notifyItemObserver(ctrl_id, me_id, medidor);
//       }
//     }
//   }

//   public static async init() {
//     try {
//       let initData = await Energia.getAllModuloEnergia();
//       for (let medidor of initData) {
//         let newMedEnergia = new MedidorEnergiaSocket(medidor);
//         ModuleEnergiaManager.add_update(newMedEnergia);
//       }
//     } catch (error) {
//       console.log(
//         `Socket Medidor Energia | MedidorEnergiaMap | Error al inicilizar modulos`
//       );
//       console.error(error);
//       throw error;
//     }
//   }

//   public static delete(
//     medidor: MedidorEnergiaSocket | MedidorEnergiaSocketBad
//   ) {
//     if (medidor instanceof MedidorEnergiaSocket) {
//       const { ctrl_id, me_id } = medidor.toJSON();
//       if (ModuleEnergiaManager.map.hasOwnProperty(ctrl_id)) {
//         if (ModuleEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
//           ModuleEnergiaManager.map[ctrl_id][me_id].setActivo(0);
//           ModuleEnergiaManager.notifyListObserver(ctrl_id, medidor);
//         }
//       }
//     } else {
//       const { ctrl_id, me_id } = medidor.toJSON();
//       if (ctrl_id != null && me_id != null) {
//         const currentMedEnergia = ModuleEnergiaManager.getDataByCtrlIDAndMeID(
//           String(ctrl_id),
//           String(me_id)
//         );
//         if (currentMedEnergia) {
//           ModuleEnergiaManager.map[ctrl_id][me_id].setActivo(0);
//           ModuleEnergiaManager.notifyListObserver(
//             ctrl_id,
//             ModuleEnergiaManager.map[ctrl_id][me_id]
//           );
//         }
//       }
//     }
//   }

//   public static add_update(
//     medidor: MedidorEnergiaSocket | MedidorEnergiaSocketBad
//   ) {
//     if (medidor instanceof MedidorEnergiaSocket) {
//       const { me_id, ctrl_id } = medidor.toJSON();
//       const exists = ModuleEnergiaManager.exists({
//         ctrl_id: String(ctrl_id),
//         me_id: String(me_id),
//       });

//       if (!exists) {
//         ModuleEnergiaManager.add(medidor);
//       } else {
//         ModuleEnergiaManager.#update(medidor);
//       }
//     } else {
//       const {
//         me_id,
//         ctrl_id,
//         activo,
//         amperaje,
//         descripcion,
//         fdp,
//         frecuencia,
//         potenciakwh,
//         potenciaw,
//         voltaje,
//       } = medidor.toJSON();
//       if (me_id != null && ctrl_id != null) {
//         const currentMedidor = ModuleEnergiaManager.getDataByCtrlIDAndMeID(
//           String(ctrl_id),
//           String(me_id)
//         );
//         if (currentMedidor) {
//           // existe modulo energia
//           // actualizar
//           if (amperaje !== null && currentMedidor.amperaje != amperaje)
//             currentMedidor.setAmperaje(amperaje);
//           if (descripcion !== null && currentMedidor.descripcion != descripcion)
//             currentMedidor.setDescripcion(descripcion);
//           if (fdp !== null && currentMedidor.fdp != fdp)
//             currentMedidor.setFdp(fdp);
//           if (frecuencia !== null && currentMedidor.frecuencia != frecuencia)
//             currentMedidor.setFrecuencia(frecuencia);
//           if (potenciakwh !== null && currentMedidor.potenciakwh != potenciakwh)
//             currentMedidor.setPotenciakwh(potenciakwh);
//           if (potenciaw !== null && currentMedidor.potenciaw != potenciaw)
//             currentMedidor.setPotenciaw(potenciaw);
//           if (voltaje !== null && currentMedidor.voltaje != voltaje)
//             currentMedidor.setVoltaje(voltaje);
//           if (activo !== null && currentMedidor.activo != activo) {
//             currentMedidor.setActivo(activo);
//             ModuleEnergiaManager.notifyListObserver(ctrl_id, currentMedidor);
//           }

//           ModuleEnergiaManager.notifyItemObserver(
//             ctrl_id,
//             me_id,
//             currentMedidor
//           );
//           // MedidorEnergiaMap.update(currentMedidor);
//         } else {
//           // agregar
//           if (
//             activo != null &&
//             amperaje != null &&
//             descripcion != null &&
//             fdp != null &&
//             frecuencia != null &&
//             potenciakwh != null &&
//             potenciaw != null &&
//             voltaje != null
//           ) {
//             const newMedEnerSocket = new MedidorEnergiaSocket({
//               me_id,
//               ctrl_id,
//               activo,
//               amperaje,
//               descripcion,
//               fdp,
//               frecuencia,
//               potenciakwh,
//               potenciaw,
//               voltaje,
//             });
//             ModuleEnergiaManager.add(newMedEnerSocket);
//           }
//         }
//       }
//     }
//   }

//   public static getDataByCtrlID(ctrl_id: string) {
//     let resultData: MedidorEnergiaSocket[] = [];
//     if (ModuleEnergiaManager.map.hasOwnProperty(ctrl_id)) {
//       for (const st_id_key in ModuleEnergiaManager.map[ctrl_id]) {
//         let sensorData = ModuleEnergiaManager.map[ctrl_id][st_id_key].toJSON();
//         if (sensorData.activo == 1) {
//           resultData.push(sensorData);
//         }
//       }
//     }
//     let sortedData = resultData.sort((r1, r2) => r1.me_id - r2.me_id); // ordenamiento ascendente
//     return sortedData;
//   }

//   public static getDataByCtrlIDAndMeID(ctrl_id: string, me_id: string) {
//     let resultData: MedidorEnergiaSocket | null = null;
//     if (ModuleEnergiaManager.map.hasOwnProperty(ctrl_id)) {
//       if (ModuleEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
//         resultData = ModuleEnergiaManager.map[ctrl_id][me_id];
//       }
//     }
//     return resultData;
//   }
// }