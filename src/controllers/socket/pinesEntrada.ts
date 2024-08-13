import { Server, Socket } from "socket.io";
import { Controlador, EquipoEntrada, PinesEntrada } from "../../types/db";
import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";
import { PinEntrada } from "../../models/site";
import { AppConfig } from "../../models/config";
// import { CONTROLLER_MODE , CONTROLLER_SECURITY } from "../../models/config";

type PinesEntradaData = PinesEntrada & Pick<EquipoEntrada, "detector">
interface PinesEntradaRowsData extends PinesEntradaData ,RowDataPacket {}

export const pinesEntradaSocket =async (io:Server, socket: Socket) => {
    let intervalId: NodeJS.Timeout | null = null; 
    if (!intervalId) {
      intervalId = setInterval(async () => {
        const nspPinesEntrada = socket.nsp;
  
        const [,,ctrl_id] = nspPinesEntrada.name.split("/"); // Namespace: "/pines_entrada/ctrl_id"

        const pinesEntradaData = await MySQL2.executeQuery<PinesEntradaRowsData[]>({sql:`SELECT pe_id , pin , pe.ee_id , pe.descripcion, estado, pe.activo, detector FROM ${"nodo" + ctrl_id}.pinesentrada pe INNER JOIN  general.equipoentrada  ee ON pe.ee_id= ee.ee_id WHERE pe.activo = 1`})
    
        const resultObject : Record<string, PinesEntradaData[]> = {};
  
        pinesEntradaData.forEach((item) => {
          const key = item.detector;

          if (!resultObject[key]) {
            resultObject[key] = [];
          }

          resultObject[key].push(item);
        });

        socket.emit("pines_entrada", Object.values(resultObject));
      }, 1000);
    }
  
    socket.on("disconnect", () => {
      if(intervalId){
        clearInterval(intervalId);
        intervalId = null;
      }
    });
    
}

export const pinesEntradaSocketFinal =async (io:Server, socket: Socket) => {

  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/pines_entradafinal/ctrl_id"

  console.log(`Socket Pines Entrada | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);
  const observer = new PinesSalidaSocketObserver(socket);
  PinesEntradaMap.registerObserver(Number(ctrl_id),observer);
  //emit initial data:
  const data = PinesEntradaMap.getListPinesSalida(ctrl_id)
  socket.emit("list_pines_entrada", data);
  try {
    const {CONTROLLER_MODE, CONTROLLER_SECURITY} = AppConfig.getController(Number(ctrl_id))
    socket.emit("controller_mode",CONTROLLER_MODE);
    socket.emit("controller_security",CONTROLLER_SECURITY);
  } catch (error) {
    console.log(`Socket Pines Entrada | Error al obtener modo y seguridad | ctrl_id = ${ctrl_id}`)
    console.error(error)
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/pines_entradafinal/${ctrl_id}`).sockets.size;
    console.log(`Socket Pines Entrada | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Pines Entrada | Eliminado Observer | ctrl_id = ${ctrl_id}`)
      PinesEntradaMap.unregisterObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Pines Entrada | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });

}

type IPinesEntradaSocket = PinesEntrada & Pick<Controlador, "ctrl_id">;

export class PinesEntradaSocket implements IPinesEntradaSocket {
  ctrl_id: number;
  pe_id: number;
  pin: number;
  ee_id: number;
  descripcion: string;
  estado: number;
  activo: number;

  constructor(props: IPinesEntradaSocket) {
    const { activo, ctrl_id, descripcion, ee_id, estado, pe_id, pin } = props;
    this.pe_id = pe_id;
    this.pin = pin;
    this.ee_id = ee_id;
    this.descripcion = descripcion;
    this.estado = estado;
    this.activo = activo;
    this.ctrl_id = ctrl_id;
  }

  public setCtrlId(ctrl_id: IPinesEntradaSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setPeId(pe_id: IPinesEntradaSocket["pe_id"]): void {
    this.pe_id = pe_id;
  }
  public setPin(pin: IPinesEntradaSocket["pin"]): void {
    this.pin = pin;
  }
  public setEeId(ee_id: IPinesEntradaSocket["ee_id"]): void {
    this.ee_id = ee_id;
  }
  public setDescripcion(descripcion: IPinesEntradaSocket["descripcion"]): void {
    this.descripcion = descripcion;
  }
  public setEstado(estado: IPinesEntradaSocket["estado"]): void {
    this.estado = estado;
  }
  public setActivo(activo: IPinesEntradaSocket["activo"]): void {
    this.activo = activo;
  }
  

  public toJSON() : IPinesEntradaSocket {
    const result: IPinesEntradaSocket ={
      pe_id: this.pe_id,
      pin: this.pin,
      ee_id: this.ee_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
    }
    return result
  }
}


interface IPinesEntradaSocketBad {
  pe_id: number;
  pin: number;
  ee_id: number | null;
  descripcion: string | null;
  estado: number | null;
  activo: number | null;
  ctrl_id: number;
}

export class PinesEntradaSocketBad implements IPinesEntradaSocketBad {
  pe_id: number;
  pin: number;
  ee_id: number | null;
  descripcion: string | null;
  estado: number | null;
  activo: number | null;
  ctrl_id: number;

  constructor(props: IPinesEntradaSocketBad) {
    const { activo, ctrl_id, descripcion, ee_id, estado, pe_id, pin } = props;
    this.pe_id = pe_id;
    this.pin = pin;
    this.ee_id = ee_id;
    this.descripcion = descripcion;
    this.estado = estado;
    this.activo = activo;
    this.ctrl_id = ctrl_id;
  }
  
  public setCtrlId(ctrl_id: IPinesEntradaSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setPeId(pe_id: IPinesEntradaSocketBad["pe_id"]): void {
    this.pe_id = pe_id;
  }
  public setPin(pin: IPinesEntradaSocketBad["pin"]): void {
    this.pin = pin;
  }
  public setEeId(ee_id: IPinesEntradaSocketBad["ee_id"]): void {
    this.ee_id = ee_id;
  }
  public setDescripcion(descripcion: IPinesEntradaSocketBad["descripcion"]): void {
    this.descripcion = descripcion;
  }
  public setEstado(estado: IPinesEntradaSocketBad["estado"]): void {
    this.estado = estado;
  }
  public setActivo(activo: IPinesEntradaSocketBad["activo"]): void {
    this.activo = activo;
  }

  public toJSON() : IPinesEntradaSocketBad{
    const result: IPinesEntradaSocketBad ={
      pe_id: this.pe_id,
      pin: this.pin,
      ee_id: this.ee_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
    }
    return result
  }
}

interface PinesEntradaObserver {
  // updateEquiposEntrada(data:EquipoEntrada[]): void;
  updateListPinesEntrada(data: PinesEntrada[]): void;
  updateItemPinEntrada(data: IPinesEntradaSocket): void;
  updateControllerMode(data: 0 | 1) : void
  updateControllerSecurity(data: 0 | 1) : void
  
}

// interface PinesSalidaSubject {
//   registerObserver(ctrl_id: number, observer: PinesEntradaObserver): void;
//   unregisterObserver(ctrl_id: number, observer: PinesEntradaObserver): void;
//   // notifyEquiposSalida(ctrl_id: number, data: EquipoSalida[]): void;
//   notifyListPinesEntrada(ctrl_id: number, data: PinesEntrada[]): void;
//   notifyItemPinEntrada(ctrl_id: number, ps_id: number,data: IPinesEntradaSocket): void;
// }

class PinesSalidaSocketObserver implements PinesEntradaObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }
  updateControllerMode(data: 0 | 1): void {
    this.socket.nsp.emit("controller_mode", data);
  }
  updateControllerSecurity(data: 0 | 1): void {
    this.socket.nsp.emit("controller_security", data);
  }
  updateListPinesEntrada(data: PinesEntrada[]): void {
    this.socket.nsp.emit("list_pines_entrada", data);
  }
  updateItemPinEntrada(data: IPinesEntradaSocket): void {
    this.socket.nsp.emit("item_pin_entrada", data);
  }

}

export class PinesEntradaMap {
  static map : { [ctrl_id: string]: { [pe_id: string]: PinesEntradaSocket } } = {};
  private static equipoentrada: EquipoEntrada[] = [];
  static observers: {[ctrl_id: string]:PinesEntradaObserver} = {};

  public static registerObserver(ctrl_id: number, observer: PinesEntradaObserver): void {
    if(!PinesEntradaMap.observers[ctrl_id]){
      PinesEntradaMap.observers[ctrl_id] = observer
    }
  }
  public static unregisterObserver(ctrl_id: number): void {
    if(PinesEntradaMap.observers[ctrl_id]){
      delete PinesEntradaMap.observers[ctrl_id]
    }
  }
  public static notifyListPinesEntrada( data: PinesEntradaSocket): void {
    if(PinesEntradaMap.observers[data.ctrl_id]){
      let listPinEntrada = PinesEntradaMap.getListPinesSalida(String(data.ctrl_id))
      PinesEntradaMap.observers[data.ctrl_id].updateListPinesEntrada(listPinEntrada)
    }
  }
  public static notifyItemPinEntrada(data: PinesEntradaSocket): void {
    if(PinesEntradaMap.observers[data.ctrl_id]){
      PinesEntradaMap.observers[data.ctrl_id].updateItemPinEntrada(data.toJSON())
    }
  }

  public static notifyControllerMode( ctrl_id: number, data: 0 | 1 ): void {
    if(PinesEntradaMap.observers[ctrl_id]){
      PinesEntradaMap.observers[ctrl_id].updateControllerMode(data)
    }
  }
  public static notifyControllerSecurity( ctrl_id: number, data: 0 | 1): void {
    if(PinesEntradaMap.observers[ctrl_id]){
      PinesEntradaMap.observers[ctrl_id].updateControllerSecurity(data)
    }
  }

  

  private static exists(args: { ctrl_id: string; pe_id: string }) {
    const { ctrl_id, pe_id } = args;

    let is_ctrl_id: boolean = false;
    let is_pe_id: boolean = false;

    for (const ctrl_id_key in PinesEntradaMap.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const pe_id_key in PinesEntradaMap.map[ctrl_id_key]) {
        if (pe_id_key == pe_id) {
          is_pe_id = true;
        }
      }
    }

    return is_ctrl_id && is_pe_id;
  }

  private static add(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id } = pinEnt.toJSON();

    if (!PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      PinesEntradaMap.map[ctrl_id] = {};
    }

    if (!PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
      PinesEntradaMap.map[ctrl_id][pe_id] = pinEnt;
      PinesEntradaMap.notifyListPinesEntrada(pinEnt)
    }
  }

  private static update(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id , activo,descripcion,ee_id,estado,pin } = pinEnt.toJSON();
    if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
        const currentPinEntrada = PinesEntradaMap.map[ctrl_id][pe_id]
        
        if (currentPinEntrada.descripcion != descripcion) currentPinEntrada.setDescripcion(descripcion);
        if (currentPinEntrada.ee_id != ee_id) currentPinEntrada.setEeId(ee_id);
        if (currentPinEntrada.estado != estado) currentPinEntrada.setEstado(estado);
        if (currentPinEntrada.pin != pin) currentPinEntrada.setPin(pin);
        if (currentPinEntrada.activo != activo) {
          currentPinEntrada.setActivo(activo);
          PinesEntradaMap.notifyListPinesEntrada(pinEnt)
        };

        PinesEntradaMap.notifyItemPinEntrada(pinEnt);
      }
    }
  }

  public static async init(){
    try {
      const equiEntradaData = await PinEntrada.getEquiposEntrada()
      PinesEntradaMap.equipoentrada = equiEntradaData

      const pinEntradaData = await PinEntrada.getAllPinesEntrada()
      for (let pinEntrada of pinEntradaData) {
        let newPinSalida = new PinesEntradaSocket(pinEntrada);
        PinesEntradaMap.add_update(newPinSalida);
      }
    } catch (error) {
      console.log(`Socket Pines Entrada | PinesEntradaMap | Error al inicilizar equipos de entrada`);
      console.error(error);   
    }
  }
  
  public static delete(pinEnt: PinesEntradaSocket | PinesEntradaSocketBad) {
    if(pinEnt instanceof PinesEntradaSocket){
      const { ctrl_id, pe_id } = pinEnt.toJSON();
      if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
        if (PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
          
          PinesEntradaMap.map[ctrl_id][pe_id].setActivo(0)
          // Notificar observer
          PinesEntradaMap.notifyListPinesEntrada(pinEnt)


        }
      }
    }else{
      const { ctrl_id, pe_id } = pinEnt.toJSON();
      if(ctrl_id != null &&  pe_id != null){
        const currentPinEntrada = PinesEntradaMap.getPinSalida(String(ctrl_id),String(pe_id));
        if(currentPinEntrada){
          currentPinEntrada.setActivo(0)
          // Notificar observer
          PinesEntradaMap.notifyListPinesEntrada(currentPinEntrada)

        }
      }


    }
  }

  public static add_update(pinEnt: PinesEntradaSocket | PinesEntradaSocketBad) {
    if(pinEnt instanceof PinesEntradaSocket){
      const { pe_id, ctrl_id } = pinEnt.toJSON();
      const exists = PinesEntradaMap.exists({ctrl_id: String(ctrl_id),pe_id: String(pe_id),});
  
      if (!exists) {
        PinesEntradaMap.add(pinEnt);
      } else {
        PinesEntradaMap.update(pinEnt);
      }
    }else{
      const { pe_id, ctrl_id ,activo,descripcion,ee_id,estado,pin } = pinEnt.toJSON();
      if(pe_id != null && ctrl_id != null){
        const currentPinEntrada = PinesEntradaMap.getPinSalida(String(ctrl_id),String(pe_id));
        if(currentPinEntrada){ // existe pin entrada 
          // actualizar
          if (descripcion !== null && currentPinEntrada.descripcion != descripcion ) currentPinEntrada.setDescripcion(descripcion);
          if (ee_id !== null && currentPinEntrada.ee_id != ee_id ) currentPinEntrada.setEeId(ee_id);
          if (estado !== null && currentPinEntrada.estado != estado ) currentPinEntrada.setEstado(estado);
          if (pin !== null && currentPinEntrada.pin != pin ) currentPinEntrada.setPin(pin);
          if (activo !== null && currentPinEntrada.activo != activo ) {
            currentPinEntrada.setActivo(activo)
            PinesEntradaMap.notifyListPinesEntrada(currentPinEntrada)
          };
          
          // Notificar observer
          PinesEntradaMap.notifyItemPinEntrada(currentPinEntrada);
        }else{
          // agregar
          if( activo != null && descripcion != null && ee_id != null && estado != null && pin != null ){
            const newPinEntrada = new PinesEntradaSocket({pe_id, ctrl_id ,activo,descripcion,ee_id,estado,pin})
            PinesEntradaMap.add(newPinEntrada);
          }
        }

      }

    }

  }

  public static getPinSalida(ctrl_id: string,pe_id: string ){
    let resultData: PinesEntradaSocket | null = null ;
    if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
        resultData = PinesEntradaMap.map[ctrl_id][pe_id]
      }
    }
    return resultData
  }

  public static getListPinesSalida(ctrl_id: string) {
    let resultData: IPinesEntradaSocket[] = [];
    if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      for (const pe_id_key in PinesEntradaMap.map[ctrl_id]) {
        let sensorData = PinesEntradaMap.map[ctrl_id][pe_id_key].toJSON();
        if (sensorData.activo == 1) {
          resultData.push(sensorData);
        }
      }
    }
    let orderedResult = resultData.sort((a,b)=> a.estado - b.estado)
    return orderedResult;
  }
}


(() => {

  // setInterval(() => {
  //   const randomNumber = Math.round(Math.random())
  //   const randomNumber2 = Math.round(Math.random());

  //   const newSensorTemp = new PinesEntradaSocket({pe_id: 1, pin: 1, ee_id: 1, descripcion: "Entrada 1", estado: randomNumber, activo: 1, ctrl_id: 1});
  //   const newSensorTemp2 = new PinesEntradaSocket({pe_id: 2, pin: 2, ee_id: 2, descripcion: "Entrada 2", estado: randomNumber2, activo: 1, ctrl_id: 1 });

  //   PinesEntradaMap.add_update(newSensorTemp);
  //   PinesEntradaMap.add_update(newSensorTemp2);

  // }, 2000);

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesEntradaSocket({pe_id: 10,pin: 10,ee_id: 1,descripcion: "Entrada 10",estado: randomNumber,activo: 1,ctrl_id: 27});
//     PinesEntradaMap.add_update(newSensorTemp)
//   },10000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesEntradaSocket({pe_id: 5,pin: 5,ee_id: 5,descripcion: "Entrada 5",estado: randomNumber,activo: 1,ctrl_id: 27});
//     PinesEntradaMap.add_update(newSensorTemp)
//   },20000)

  // setTimeout(()=>{
  //   const randomNumber = Math.round(Math.random());
  //   const newSensorTemp = new PinesEntradaSocket({pe_id: 6 , pin: 6,ee_id: 6,descripcion: "Entrada 6",estado: 1,activo: 1,ctrl_id: 27})
  //   PinesEntradaMap.add_update(newSensorTemp)
  // },60000)

  // setInterval(()=>{
  //   const randomNumber = Math.round(Math.random());
  //   const newSensorTemp = new PinesEntradaSocket({pe_id: 5,pin: 5,ee_id: 5,descripcion: "Entrada 5",estado: randomNumber,activo: 1,ctrl_id: 27});
  //   PinesEntradaMap.add_update(newSensorTemp)
  // },5000)

})();

