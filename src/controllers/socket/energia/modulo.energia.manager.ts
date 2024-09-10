
import { Energia } from "../../../models/site/energia";
import {  MedEneListAction, MedEneState, MedidorEnergiaSocket, MedidorEnergiaSocketBad, ModEnergiaObserver, ModEnergiaSubject, SocketModEnergia } from "./modulo.energia.types";

export class ModuloEnergiaObserver implements ModEnergiaObserver {
  #socket: SocketModEnergia;

  constructor(socket: SocketModEnergia) {
    this.#socket = socket;
  }
  updateListModEnergia( data: MedidorEnergiaSocket, action: MedEneListAction ): void {
    this.#socket.nsp.emit("list_energia", data, action);
  }

  updateModEnergia(data: MedidorEnergiaSocket): void {
    this.#socket.nsp.emit("energia", data);
  }
}


export class MedEnergiaVO implements MedidorEnergiaSocket {
  ctrl_id: number;
  me_id: number;
  descripcion: string;
  voltaje: number;
  amperaje: number;
  fdp: number;
  frecuencia: number;
  potenciaw: number;
  potenciakwh: number;
  activo: number;

  constructor(props: MedidorEnergiaSocket) {
    const {ctrl_id,me_id,voltaje,amperaje,fdp,frecuencia,potenciaw,potenciakwh,activo,descripcion,} = props;
    this.ctrl_id = ctrl_id;
    this.me_id = me_id;
    this.voltaje = voltaje;
    this.amperaje = amperaje;
    this.fdp = fdp;
    this.frecuencia = frecuencia;
    this.potenciaw = potenciaw;
    this.potenciakwh = potenciakwh;
    this.activo = activo;
    this.descripcion = descripcion;
  }

  public setCtrlId(ctrl_id: MedidorEnergiaSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setMeId(me_id: MedidorEnergiaSocket["me_id"]): void {
    this.me_id = me_id;
  }
  public setVoltaje(voltaje: MedidorEnergiaSocket["voltaje"]): void {
    this.voltaje = voltaje;
  }
  public setAmperaje(amperaje: MedidorEnergiaSocket["amperaje"]): void {
    this.amperaje = amperaje;
  }
  public setFdp(fdp: MedidorEnergiaSocket["fdp"]): void {
    this.fdp = fdp;
  }
  public setFrecuencia(frecuencia: MedidorEnergiaSocket["frecuencia"]): void {
    this.frecuencia = frecuencia;
  }
  public setPotenciaw(potenciaw: MedidorEnergiaSocket["potenciaw"]): void {
    this.potenciaw = potenciaw;
  }
  public setPotenciakwh(potenciakwh: MedidorEnergiaSocket["potenciakwh"]): void {
    this.potenciakwh = potenciakwh;
  }
  public setActivo(activo: MedidorEnergiaSocket["activo"]): void {
    this.activo = activo;
  }
  public setDescripcion(descripcion: MedidorEnergiaSocket["descripcion"]): void {
    this.descripcion = descripcion;
  }

  public toJSON(): MedidorEnergiaSocket {
    const result: MedidorEnergiaSocket = {
      ctrl_id: this.ctrl_id,
      me_id: this.me_id,
      voltaje: this.voltaje,
      amperaje: this.amperaje,
      fdp: this.fdp,
      frecuencia: this.frecuencia,
      potenciaw: this.potenciaw,
      potenciakwh: this.potenciakwh,
      activo: this.activo,
      descripcion: this.descripcion,
    };
    return result;
  }
}
  
export class MedEnergiaBadVO implements MedidorEnergiaSocketBad {
  ctrl_id: number;
  me_id: number;
  voltaje: number | null;
  amperaje: number | null;
  fdp: number | null;
  frecuencia: number | null;
  potenciaw: number | null;
  potenciakwh: number | null;
  activo: number | null;
  descripcion: string | null;

  constructor(props: MedidorEnergiaSocketBad) {
    const {ctrl_id,me_id,voltaje,amperaje,fdp,frecuencia,potenciaw,potenciakwh,activo,descripcion,} = props;
    this.ctrl_id = ctrl_id;
    this.me_id = me_id;
    this.voltaje = voltaje;
    this.amperaje = amperaje;
    this.fdp = fdp;
    this.frecuencia = frecuencia;
    this.potenciaw = potenciaw;
    this.potenciakwh = potenciakwh;
    this.activo = activo;
    this.descripcion = descripcion;
  }

  public setCtrlId(ctrl_id: MedidorEnergiaSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setMeId(me_id: MedidorEnergiaSocketBad["me_id"]): void {
    this.me_id = me_id;
  }
  public setVoltaje(voltaje: MedidorEnergiaSocketBad["voltaje"]): void {
    this.voltaje = voltaje;
  }
  public setAmperaje(amperaje: MedidorEnergiaSocketBad["amperaje"]): void {
    this.amperaje = amperaje;
  }
  public setFdp(fdp: MedidorEnergiaSocketBad["fdp"]): void {
    this.fdp = fdp;
  }
  public setFrecuencia(frecuencia: MedidorEnergiaSocketBad["frecuencia"]): void {
    this.frecuencia = frecuencia;
  }
  public setPotenciaw(potenciaw: MedidorEnergiaSocketBad["potenciaw"]): void {
    this.potenciaw = potenciaw;
  }
  public setPotenciakwh(potenciakwh: MedidorEnergiaSocketBad["potenciakwh"]): void {
    this.potenciakwh = potenciakwh;
  }
  public setActivo(activo: MedidorEnergiaSocketBad["activo"]): void {
    this.activo = activo;
  }
  public setDescripcion(descripcion: MedidorEnergiaSocketBad["descripcion"]): void {
    this.descripcion = descripcion;
  }

  public toJSON(): MedidorEnergiaSocketBad {
    const result: MedidorEnergiaSocketBad = {
      ctrl_id: this.ctrl_id,
      me_id: this.me_id,
      voltaje: this.voltaje,
      amperaje: this.amperaje,
      fdp: this.fdp,
      frecuencia: this.frecuencia,
      potenciaw: this.potenciaw,
      potenciakwh: this.potenciakwh,
      activo: this.activo,
      descripcion: this.descripcion,

    };
    return result;
  }
}

export class ModuloEnergiaManager {
  
  static map: { [ctrl_id: number]: { [me_id: number]: MedEnergiaVO } } = {};

  static observers: { [ctrl_id: string]: ModEnergiaObserver } = {};

  static registerObserver( ctrl_id: number, observer: ModEnergiaObserver ): void {
    if (!ModuloEnergiaManager.observers[ctrl_id]) {
      ModuloEnergiaManager.observers[ctrl_id] = observer;
    }
  }

  static unregisterObserver(ctrl_id: number): void {
    if (ModuloEnergiaManager.observers[ctrl_id]) {
        delete ModuloEnergiaManager.observers[ctrl_id];
    }
  }

  static notifyModEnergia(ctrl_id: number, data: MedidorEnergiaSocket): void {
    if (ModuloEnergiaManager.observers[ctrl_id]) {
        ModuloEnergiaManager.observers[ctrl_id].updateModEnergia(data);
    }
  }

  static notifyListModEnergia(ctrl_id: number, data: MedidorEnergiaSocket , action: MedEneListAction ): void {
    if (ModuloEnergiaManager.observers[ctrl_id]) {
        ModuloEnergiaManager.observers[ctrl_id].updateListModEnergia(data, action);
    }
  }

  private static exists(args: { ctrl_id: number; me_id: number }) {
    const { ctrl_id, me_id } = args;

    let is_ctrl_id: boolean = false;
    let is_me_id: boolean = false;

    for (const ctrl_id_key in ModuloEnergiaManager.map) {
      if (Number(ctrl_id_key) == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const me_id_key in ModuloEnergiaManager.map[ctrl_id_key]) {
        if (Number(me_id_key) == me_id) {
          is_me_id = true;
        }
      }
    }

    return is_ctrl_id && is_me_id;
  }

  static #add(medidor: MedEnergiaVO) {
    const { ctrl_id, me_id } = medidor.toJSON();

    if (!ModuloEnergiaManager.map.hasOwnProperty(ctrl_id)) {
      ModuloEnergiaManager.map[ctrl_id] = {};
    }

    if (!ModuloEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
      ModuloEnergiaManager.map[ctrl_id][me_id] = medidor;
      if(medidor.activo === MedEneState.Activo){
        ModuloEnergiaManager.notifyListModEnergia(ctrl_id, medidor, "add");
      }

    }
  }

  static #getListMedEnergia(ctrl_id:number){
    const result : MedidorEnergiaSocket[] = [];
    if (ModuloEnergiaManager.map.hasOwnProperty(ctrl_id)) {
      Object.values(ModuloEnergiaManager.map[ctrl_id]).forEach((medidor) => {
        result.push(medidor.toJSON());
      });
    }
    return result;
  }

  static #update(medidor: MedEnergiaVO) {
    const { ctrl_id, me_id, activo, amperaje, fdp, frecuencia, potenciakwh, potenciaw, voltaje, descripcion, } = medidor.toJSON();
    if (ModuloEnergiaManager.map.hasOwnProperty(ctrl_id)) {
      if (ModuloEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
        const currentMedEnergia = ModuloEnergiaManager.map[ctrl_id][me_id];
        // if (currentMedEnergia.ctrl_id != ctrl_id) currentMedEnergia.setCtrlId(ctrl_id);
        // if (currentMedEnergia.me_id != me_id) currentMedEnergia.setMeId(me_id);
        if (currentMedEnergia.amperaje != amperaje) currentMedEnergia.setAmperaje(amperaje);
        if (currentMedEnergia.fdp != fdp) currentMedEnergia.setFdp(fdp);
        if (currentMedEnergia.frecuencia != frecuencia) currentMedEnergia.setFrecuencia(frecuencia);
        if (currentMedEnergia.potenciakwh != potenciakwh) currentMedEnergia.setPotenciakwh(potenciakwh);
        if (currentMedEnergia.potenciaw != potenciaw) currentMedEnergia.setPotenciaw(potenciaw);
        if (currentMedEnergia.voltaje != voltaje) currentMedEnergia.setVoltaje(voltaje);
        if (currentMedEnergia.descripcion != descripcion) currentMedEnergia.setDescripcion(descripcion);
        if (currentMedEnergia.activo != activo) { 
            if(currentMedEnergia.activo === MedEneState.Activo){
                ModuloEnergiaManager.notifyListModEnergia(ctrl_id, medidor.toJSON(),"delete");
            }
            if(currentMedEnergia.activo === MedEneState.Desactivado){
                ModuloEnergiaManager.notifyListModEnergia(ctrl_id, medidor.toJSON(),"add");
            }
            currentMedEnergia.setActivo(activo);
        }

        ModuloEnergiaManager.notifyModEnergia(ctrl_id , medidor.toJSON());
      }
    }
  }

  public static async init() {
    try {
      let initData = await Energia.getAllModuloEnergia();
      for (let medidor of initData) {
        let newMedEnergia = new MedEnergiaVO(medidor);
        ModuloEnergiaManager.add_update(newMedEnergia);
      }
    } catch (error) {
      console.log(`Socket Medidor Energia | MedidorEnergiaMap | Error al inicilizar modulos`);
      console.error(error);
      throw error;
    }
  }

  public static delete( medidor: MedEnergiaVO | MedEnergiaBadVO ) {
    if (medidor instanceof MedEnergiaVO) {
      const { ctrl_id, me_id } = medidor.toJSON();
      if (ModuloEnergiaManager.map.hasOwnProperty(ctrl_id)) {
        if (ModuloEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
          ModuloEnergiaManager.map[ctrl_id][me_id].setActivo(0);
          ModuloEnergiaManager.notifyListModEnergia(ctrl_id, medidor.toJSON(),"delete");
        }
      }
    } else {
      const { ctrl_id, me_id } = medidor.toJSON();
      if (ctrl_id != null && me_id != null) {
        const curMedEnergia = ModuloEnergiaManager.getDataByCtrlIDAndMeID(ctrl_id, me_id);
        if (curMedEnergia !== null) {
          curMedEnergia.setActivo(0);
          ModuloEnergiaManager.notifyListModEnergia(ctrl_id,curMedEnergia.toJSON(),"delete");
        }
      }
    }
  }

  public static add_update( medidor: MedEnergiaVO | MedEnergiaBadVO ) {
    if (medidor instanceof MedEnergiaVO) {
      const { me_id, ctrl_id } = medidor.toJSON();
      const exists = ModuloEnergiaManager.exists({me_id, ctrl_id});

      if (!exists) {
        ModuloEnergiaManager.#add(medidor);
      } else {
        ModuloEnergiaManager.#update(medidor);
      }
    } else {
      const {me_id,ctrl_id,activo,amperaje,descripcion,fdp,frecuencia,potenciakwh,potenciaw,voltaje,} = medidor.toJSON();
      if (me_id != null && ctrl_id != null) {
        const currentMedidor = ModuloEnergiaManager.getDataByCtrlIDAndMeID(ctrl_id,me_id);
        if (currentMedidor) {
          // existe modulo energia
          // actualizar
          if (amperaje !== null && currentMedidor.amperaje != amperaje)
            currentMedidor.setAmperaje(amperaje);
          if (descripcion !== null && currentMedidor.descripcion != descripcion)
            currentMedidor.setDescripcion(descripcion);
          if (fdp !== null && currentMedidor.fdp != fdp)
            currentMedidor.setFdp(fdp);
          if (frecuencia !== null && currentMedidor.frecuencia != frecuencia)
            currentMedidor.setFrecuencia(frecuencia);
          if (potenciakwh !== null && currentMedidor.potenciakwh != potenciakwh)
            currentMedidor.setPotenciakwh(potenciakwh);
          if (potenciaw !== null && currentMedidor.potenciaw != potenciaw)
            currentMedidor.setPotenciaw(potenciaw);
          if (voltaje !== null && currentMedidor.voltaje != voltaje)
            currentMedidor.setVoltaje(voltaje);
          if (activo !== null && currentMedidor.activo != activo) {
              if(currentMedidor.activo === MedEneState.Activo){
                  ModuloEnergiaManager.notifyListModEnergia(ctrl_id, currentMedidor.toJSON(),"delete");
                }
              if(currentMedidor.activo === MedEneState.Desactivado){
                  ModuloEnergiaManager.notifyListModEnergia(ctrl_id, currentMedidor.toJSON(),"add");
              }
              currentMedidor.setActivo(activo);
          }

          ModuloEnergiaManager.notifyModEnergia(ctrl_id , currentMedidor.toJSON());

        } else {
          // agregar
          if ( activo != null && amperaje != null && descripcion != null && fdp != null && frecuencia != null && potenciakwh != null && potenciaw != null && voltaje != null ) {
            const newMedEnerSocket = new MedEnergiaVO({me_id,ctrl_id,activo,amperaje,descripcion,fdp,frecuencia,potenciakwh,potenciaw,voltaje,});
            ModuloEnergiaManager.#add(newMedEnerSocket);
          }
        }
      }
    }
  }

  public static getDataByCtrlID(ctrl_id: number) {
    let resultData: MedidorEnergiaSocket[] = [];
    if (ModuloEnergiaManager.map.hasOwnProperty(ctrl_id)) {
      for (const st_id_key in ModuloEnergiaManager.map[ctrl_id]) {
        let sensorData = ModuloEnergiaManager.map[ctrl_id][st_id_key].toJSON();
        if (sensorData.activo == MedEneState.Activo) {
          resultData.push(sensorData);
        }
      }
    }
    let sortedData = resultData.sort((r1, r2) => r1.me_id - r2.me_id); // ordenamiento ascendente
    return sortedData;
  }

  public static getDataByCtrlIDAndMeID(ctrl_id: number, me_id: number) {
    let resultData: MedEnergiaVO | null = null;
    if (ModuloEnergiaManager.map.hasOwnProperty(ctrl_id)) {
      if (ModuloEnergiaManager.map[ctrl_id].hasOwnProperty(me_id)) {
        resultData = ModuloEnergiaManager.map[ctrl_id][me_id];
      }
    }
    return resultData;
  }
}


// (async ()=>{
//     // setInterval(()=>{
//     //     const getRandomNumber = (min: number, max: number) => {
//     //       return Math.floor(Math.random() * (max - min + 1)) + min;
//     //     };
//     //     const randomVoltaje = getRandomNumber(110,120)
//     //     let newMedEnergia = new MedEnergiaVO({
//     //       ctrl_id: 1,
//     //       me_id: 1,
//     //       voltaje: randomVoltaje,
//     //       amperaje: 0,
//     //       fdp: 0,
//     //       frecuencia: 0,
//     //       potenciaw: 0,
//     //       potenciakwh: 0,
//     //       activo: 1,
//     //       descripcion: "Medidor 1",
//     //     });
//     //     console.log("actulizando: ", newMedEnergia.ctrl_id, newMedEnergia.me_id, newMedEnergia.voltaje)
//     //     ModuloEnergiaManager.add_update(newMedEnergia)
        
//     // },10000);

//     // setTimeout(() => {
//     //     let newMedEnergia = new MedEnergiaVO({
//     //         ctrl_id: 1,
//     //         me_id: 1,
//     //         voltaje: 100,
//     //         amperaje: 0,
//     //         fdp: 0,
//     //         frecuencia: 0,
//     //         potenciaw: 0,
//     //         potenciakwh: 0,
//     //         activo: 1,
//     //         descripcion: "Medidor 1",
//     //       });
//     //       ModuloEnergiaManager.delete(newMedEnergia)

//     // }, 10000);

//     // setTimeout(() => {
//     //     let newMedEnergia = new MedEnergiaVO({
//     //         ctrl_id: 1,
//     //         me_id: 1,
//     //         voltaje: 100,
//     //         amperaje: 0,
//     //         fdp: 0,
//     //         frecuencia: 0,
//     //         potenciaw: 0,
//     //         potenciakwh: 0,
//     //         activo: 1,
//     //         descripcion: "Medidor 1",
//     //       });
//     //       ModuloEnergiaManager.add_update(newMedEnergia)

//     // }, 30000);
// })()