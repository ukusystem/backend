import { Server, Socket } from "socket.io";
import { Energia } from "../../models/site/energia";
import { Controlador, MedidorEnergia } from "../../types/db";

export const energiaSocket = async (io: Server, socket: Socket) => {
  const nspEnergias = socket.nsp;
  const [, ,ctrl_id,me_id] = nspEnergias.name.split("/");// Namespace : "/energia/ctrl_id/me_id"
  const observer = new ModEnergiaItemSocketObserver(socket);
  MedidorEnergiaMap.registerItemObserver(Number(ctrl_id),Number(me_id),observer)
  //emit initial data
  const data = MedidorEnergiaMap.getDataByCtrlIDAndMeID(ctrl_id,me_id)
  if(data){
    socket.emit("energia", data.toJSON());
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/energia/${ctrl_id}/${me_id}`).sockets.size;
      console.log(`Socket Modulo Energia Item | clientes_conectados = ${clientsCount}| ctrl_id = ${ctrl_id} | me_id = ${me_id}`);
      if (clientsCount == 0 ) {
        console.log(`Socket Modulo Energia Item | Eliminado Observer | ctrl_id = ${ctrl_id} | me_id = ${me_id}`)
        MedidorEnergiaMap.unregisterItemObserver(Number(ctrl_id),Number(me_id))
      }
  });
  
  socket.on("error", (error: any) => {
    console.log(`Socket Modulo Energia Item | Error | ctrl_id = ${ctrl_id} | me_id = ${me_id}`)
    console.error(error)
  });

};

export const moduloEnergiaSocket = async (io: Server, socket: Socket) => {

  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/list_energia/ctrl_id"
  console.log(`Socket Modulo Energia | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  const observerList = new ModEnergiaListSocketObserver(socket);
  MedidorEnergiaMap.registerListObserver(Number(ctrl_id),observerList)
  //emit initial data
  const data = MedidorEnergiaMap.getDataByCtrlID(ctrl_id)
  socket.emit("list_energia", data); //moduloenergia

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/list_energia/${ctrl_id}`).sockets.size;
    console.log(`Socket Modulo Energia | ListObserver | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Modulo Energia | Eliminado ListObserver | ctrl_id = ${ctrl_id}`)
      MedidorEnergiaMap.unregisterListObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Modulo Energia | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });

}

interface ModEnergiaListObserver {
  update(data: IMedidorEnergiaSocket[]): void;
}

interface ModEnergiaItemObserver {
  update(data: IMedidorEnergiaSocket): void;
}

// interface ModEnergiaSubject<T> {
//   registerObserver(observer: T): void;
//   unregisterObserver(observer: T): void;
//   notifyObservers(): void;
// }

class ModEnergiaListSocketObserver implements ModEnergiaListObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }

  update(data: IMedidorEnergiaSocket[]): void {
      this.socket.nsp.emit("list_energia", data);
  }
}

class ModEnergiaItemSocketObserver implements ModEnergiaItemObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }

  update(data: IMedidorEnergiaSocket): void {
    this.socket.nsp.emit("energia", data);
  }
}

type IMedidorEnergiaSocket = Omit<MedidorEnergia,"serie"> & Pick<Controlador,"ctrl_id">

interface IMedidorEnergiaSocketBad {
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

export class MedidorEnergiaSocket implements IMedidorEnergiaSocket {
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


constructor(props: IMedidorEnergiaSocket) {
  const { ctrl_id, me_id, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh, activo,descripcion } = props;
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
  

public setCtrlId(ctrl_id: IMedidorEnergiaSocket["ctrl_id"]): void {
  this.ctrl_id = ctrl_id;
}
public setMeId(me_id: IMedidorEnergiaSocket["me_id"]): void {
  this.me_id = me_id;
}
public setVoltaje(voltaje: IMedidorEnergiaSocket["voltaje"]): void {
  this.voltaje = voltaje;
}
public setAmperaje(amperaje: IMedidorEnergiaSocket["amperaje"]): void {
  this.amperaje = amperaje;
}
public setFdp(fdp: IMedidorEnergiaSocket["fdp"]): void {
  this.fdp = fdp;
}
public setFrecuencia(frecuencia: IMedidorEnergiaSocket["frecuencia"]): void {
  this.frecuencia = frecuencia;
}
public setPotenciaw(potenciaw: IMedidorEnergiaSocket["potenciaw"]): void {
  this.potenciaw = potenciaw;
}
public setPotenciakwh(potenciakwh: IMedidorEnergiaSocket["potenciakwh"]): void {
  this.potenciakwh = potenciakwh;
}
public setActivo(activo: IMedidorEnergiaSocket["activo"]): void {
  this.activo = activo;
}
public setDescripcion(descripcion: IMedidorEnergiaSocket["descripcion"]): void {
  this.descripcion = descripcion;
}

public toJSON(): IMedidorEnergiaSocket {
  const result: IMedidorEnergiaSocket = {
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

export class MedidorEnergiaSocketBad implements IMedidorEnergiaSocketBad {
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

constructor(props: IMedidorEnergiaSocketBad) {
  const { ctrl_id, me_id, voltaje, amperaje, fdp, frecuencia, potenciaw, potenciakwh, activo,descripcion } = props;
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

public setCtrlId(ctrl_id: IMedidorEnergiaSocketBad["ctrl_id"]): void {
  this.ctrl_id = ctrl_id;
}
public setMeId(me_id: IMedidorEnergiaSocketBad["me_id"]): void {
  this.me_id = me_id;
}
public setVoltaje(voltaje: IMedidorEnergiaSocketBad["voltaje"]): void {
  this.voltaje = voltaje;
}
public setAmperaje(amperaje: IMedidorEnergiaSocketBad["amperaje"]): void {
  this.amperaje = amperaje;
}
public setFdp(fdp: IMedidorEnergiaSocketBad["fdp"]): void {
  this.fdp = fdp;
}
public setFrecuencia(frecuencia: IMedidorEnergiaSocketBad["frecuencia"]): void {
  this.frecuencia = frecuencia;
}
public setPotenciaw(potenciaw: IMedidorEnergiaSocketBad["potenciaw"]): void {
  this.potenciaw = potenciaw;
}
public setPotenciakwh(potenciakwh: IMedidorEnergiaSocketBad["potenciakwh"]): void {
  this.potenciakwh = potenciakwh;
}
public setActivo(activo: IMedidorEnergiaSocketBad["activo"]): void {
  this.activo = activo;
}
public setDescripcion(descripcion: IMedidorEnergiaSocketBad["descripcion"]): void {
  this.descripcion = descripcion;
}

public toJSON(): IMedidorEnergiaSocketBad {
  const result: IMedidorEnergiaSocketBad = {
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

export class MedidorEnergiaMap {

  static map: { [ctrl_id: string]: { [me_id: string]: MedidorEnergiaSocket } } = {};
  static observers: {[ctrl_id: string]:{ [me_id: string]: ModEnergiaItemObserver }} = {};
  static listobservers: {[ctrl_id: string]:ModEnergiaListObserver} = {};

  public static registerItemObserver(ctrl_id: number,me_id: number, observer: ModEnergiaItemObserver): void {
    if(!MedidorEnergiaMap.observers[ctrl_id]){
      MedidorEnergiaMap.observers[ctrl_id] = {}
    }
    if(!MedidorEnergiaMap.observers[ctrl_id][me_id]){
      MedidorEnergiaMap.observers[ctrl_id][me_id] = observer
    }
  }

  public static registerListObserver(ctrl_id: number, observer: ModEnergiaListObserver): void {
    if(!MedidorEnergiaMap.listobservers[ctrl_id]){
      MedidorEnergiaMap.listobservers[ctrl_id] = observer
    }
  }

  public static unregisterItemObserver(ctrl_id: number,me_id: number): void {
    if(MedidorEnergiaMap.observers[ctrl_id]){
      if(MedidorEnergiaMap.observers[ctrl_id][me_id]){
        delete MedidorEnergiaMap.observers[ctrl_id][me_id]
      }
    }
  }

  public static unregisterListObserver(ctrl_id: number): void {
    if(MedidorEnergiaMap.listobservers[ctrl_id]){
      delete MedidorEnergiaMap.listobservers[ctrl_id]
    }
  }

  public static notifyItemObserver(ctrl_id: number,me_id: number,data: MedidorEnergiaSocket):void{
    if(MedidorEnergiaMap.observers[ctrl_id]){
      if(MedidorEnergiaMap.observers[ctrl_id][me_id]){
        MedidorEnergiaMap.observers[ctrl_id][me_id].update(data.toJSON())
      }
    }
  }

  public static notifyListObserver(ctrl_id: number,data: MedidorEnergiaSocket):void{
    if(MedidorEnergiaMap.listobservers[ctrl_id]){
      const tempList = MedidorEnergiaMap.getDataByCtrlID(String(data.ctrl_id))
      MedidorEnergiaMap.listobservers[ctrl_id].update(tempList)
    }
  }

  private static exists(args: { ctrl_id: string; me_id: string }) {
    const { ctrl_id, me_id } = args;

    let is_ctrl_id: boolean = false;
    let is_me_id: boolean = false;

    for (const ctrl_id_key in MedidorEnergiaMap.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const me_id_key in MedidorEnergiaMap.map[ctrl_id_key]) {
        if (me_id_key == me_id) {
          is_me_id = true;
        }
      }
    }

    return is_ctrl_id && is_me_id;
  }

  private static add(medidor: MedidorEnergiaSocket) {
    const { ctrl_id, me_id } = medidor.toJSON();

    if (!MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
      MedidorEnergiaMap.map[ctrl_id] = {};
    }

    if (!MedidorEnergiaMap.map[ctrl_id].hasOwnProperty(me_id)) {
      MedidorEnergiaMap.map[ctrl_id][me_id] = medidor;
      MedidorEnergiaMap.notifyListObserver(ctrl_id,medidor)
    }
  }

  private static update(medidor: MedidorEnergiaSocket) {
    const { ctrl_id, me_id, activo, amperaje, fdp, frecuencia, potenciakwh, potenciaw, voltaje,descripcion } = medidor.toJSON();
    if (MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
      if (MedidorEnergiaMap.map[ctrl_id].hasOwnProperty(me_id)) {
        const currentMedEnergia = MedidorEnergiaMap.map[ctrl_id][me_id];
        // if (currentMedEnergia.ctrl_id != ctrl_id) currentMedEnergia.setCtrlId(ctrl_id);
        // if (currentMedEnergia.me_id != me_id) currentMedEnergia.setMeId(me_id);
        if (currentMedEnergia.amperaje != amperaje) currentMedEnergia.setAmperaje(amperaje);
        if (currentMedEnergia.fdp != fdp) currentMedEnergia.setFdp(fdp);
        if (currentMedEnergia.frecuencia != frecuencia) currentMedEnergia.setFrecuencia(frecuencia);
        if (currentMedEnergia.potenciakwh != potenciakwh) currentMedEnergia.setPotenciakwh(potenciakwh);
        if (currentMedEnergia.potenciaw != potenciaw) currentMedEnergia.setPotenciaw(potenciaw);
        if (currentMedEnergia.voltaje != voltaje) currentMedEnergia.setVoltaje(voltaje);
        if (currentMedEnergia.descripcion != descripcion) currentMedEnergia.setDescripcion(descripcion);
        if (currentMedEnergia.activo != activo){
          currentMedEnergia.setActivo(activo); 
          MedidorEnergiaMap.notifyListObserver(ctrl_id,medidor);
        } 

        MedidorEnergiaMap.notifyItemObserver(ctrl_id,me_id,medidor);
      }
    }
  }

  public static async init() {
    try {
        let initData = await Energia.getAllModuloEnergia()
        for (let medidor of initData) {
          let newMedEnergia = new MedidorEnergiaSocket(medidor);
          MedidorEnergiaMap.add_update(newMedEnergia);
        }
    } catch (error) {
      console.log(`Socket Medidor Energia | MedidorEnergiaMap | Error al inicilizar modulos`);
      console.error(error);
    }
  }

  public static delete(medidor: MedidorEnergiaSocket | MedidorEnergiaSocketBad) {
    if(medidor instanceof MedidorEnergiaSocket){
      const { ctrl_id, me_id } = medidor.toJSON();
      if (MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
        if (MedidorEnergiaMap.map[ctrl_id].hasOwnProperty(me_id)) {
          MedidorEnergiaMap.map[ctrl_id][me_id].setActivo(0);
          MedidorEnergiaMap.notifyListObserver(ctrl_id,medidor)
        }
      }
    }else{
      const { ctrl_id, me_id } = medidor.toJSON();
      if(ctrl_id != null && me_id != null){
        const currentMedEnergia = MedidorEnergiaMap.getDataByCtrlIDAndMeID(String(ctrl_id), String(me_id));
        if(currentMedEnergia){
          MedidorEnergiaMap.map[ctrl_id][me_id].setActivo(0);
          MedidorEnergiaMap.notifyListObserver(ctrl_id,MedidorEnergiaMap.map[ctrl_id][me_id])
        }
      }
    }
  }

  public static add_update(medidor: MedidorEnergiaSocket | MedidorEnergiaSocketBad) {
    if(medidor instanceof MedidorEnergiaSocket){
      const { me_id, ctrl_id } = medidor.toJSON();
      const exists = MedidorEnergiaMap.exists({ ctrl_id: String(ctrl_id), me_id: String(me_id), });
  
      if (!exists) {
        MedidorEnergiaMap.add(medidor);
      } else {
        MedidorEnergiaMap.update(medidor);
      }
    }else{
      const { me_id, ctrl_id,activo,amperaje,descripcion,fdp,frecuencia,potenciakwh,potenciaw,voltaje } = medidor.toJSON();
      if(me_id != null && ctrl_id != null){
        const currentMedidor = MedidorEnergiaMap.getDataByCtrlIDAndMeID(String(ctrl_id), String(me_id));
        if( currentMedidor ){ // existe modulo energia
          // actualizar
          if(amperaje !== null && currentMedidor.amperaje != amperaje) currentMedidor.setAmperaje(amperaje);
          if(descripcion !== null && currentMedidor.descripcion != descripcion) currentMedidor.setDescripcion(descripcion);
          if(fdp !== null && currentMedidor.fdp != fdp) currentMedidor.setFdp(fdp);
          if(frecuencia !== null && currentMedidor.frecuencia != frecuencia) currentMedidor.setFrecuencia(frecuencia);
          if(potenciakwh !== null && currentMedidor.potenciakwh != potenciakwh) currentMedidor.setPotenciakwh(potenciakwh);
          if(potenciaw !== null && currentMedidor.potenciaw != potenciaw) currentMedidor.setPotenciaw(potenciaw);
          if(voltaje !== null && currentMedidor.voltaje != voltaje) currentMedidor.setVoltaje(voltaje);
          if(activo !== null && currentMedidor.activo != activo) {
            currentMedidor.setActivo(activo);
            MedidorEnergiaMap.notifyListObserver(ctrl_id,currentMedidor);
          };

          MedidorEnergiaMap.notifyItemObserver(ctrl_id,me_id,currentMedidor);
          // MedidorEnergiaMap.update(currentMedidor);
        }else{
          // agregar
          if(activo != null && amperaje != null && descripcion != null && fdp != null && frecuencia != null && potenciakwh != null && potenciaw != null && voltaje != null){
            const newMedEnerSocket = new MedidorEnergiaSocket({ me_id, ctrl_id,activo,amperaje,descripcion,fdp,frecuencia,potenciakwh,potenciaw,voltaje })
            MedidorEnergiaMap.add(newMedEnerSocket)
          }
  
        }
      }
    }
  }

  public static getDataByCtrlID(ctrl_id: string) {
    let resultData: IMedidorEnergiaSocket[] = [];
    if (MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
      for (const st_id_key in MedidorEnergiaMap.map[ctrl_id]) {
        let sensorData = MedidorEnergiaMap.map[ctrl_id][st_id_key].toJSON();
        if (sensorData.activo == 1) {
          resultData.push(sensorData);
        }
      }
    }
    let sortedData = resultData.sort((r1, r2) => r1.me_id - r2.me_id); // ordenamiento ascendente
    return sortedData;
  }

  public static getDataByCtrlIDAndMeID(ctrl_id: string, me_id: string){
    let resultData: MedidorEnergiaSocket | null = null ;
    if (MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
     if(MedidorEnergiaMap.map[ctrl_id].hasOwnProperty(me_id)){
      resultData = MedidorEnergiaMap.map[ctrl_id][me_id]
     }
    }
    return resultData;
  }

}


// (() => {
//   setTimeout(()=>{
//     const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
//     const newSensorTemp = new MedidorEnergiaSocket({ me_id: 4, descripcion: "Medidor 4", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 1 });
//     MedidorEnergiaMap.delete(newSensorTemp)
//   },20000)

//   setInterval(()=>{
//     const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
//     const newSensorTemp = new MedidorEnergiaSocket({ me_id: 7, descripcion: "Medidor 7", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 1 });
//     MedidorEnergiaMap.add_update(newSensorTemp)
//   },5000)
// })();