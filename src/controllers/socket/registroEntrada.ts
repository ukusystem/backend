
import { Server, Socket } from "socket.io";
import { Controlador, EquipoEntrada, RegistroEntrada } from "../../types/db";
import { EquipoEntradaMap } from "../../models/maps";
import { RegistroEntradaSite } from "../../models/site";
import { PinEntradaManager } from "./pinentrada";

export const registroEntradaSocket = async (io: Server, socket: Socket) => {
  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/registro_entrada/ctrl_id"

  console.log(`Socket Registro Entrada | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  let newObserver = new RegistroEntradaSocketObserver(socket)
  RegistroEntradaMap.registerObserver(Number(ctrl_id),newObserver)
  //emit initial data:
  let regEntData = RegistroEntradaMap.getRegistrosEntrada(ctrl_id);
  socket.emit("list_registros_entrada",regEntData)

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/registro_acceso/${ctrl_id}`).sockets.size;
    console.log(`Socket Registro Entrada | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Registro Entrada | Eliminado Obeserver | ctrl_id = ${ctrl_id}`)
      RegistroEntradaMap.unregisterObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Registro Entrada | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}

type IRegistroEntradaSocket = Omit<RegistroEntrada,"rentd_id"> & Pick<Controlador, "ctrl_id"> & Pick<EquipoEntrada,"detector">

export class RegistroEntradaSocket implements IRegistroEntradaSocket {

  ctrl_id: number;
  pin: number; // --> pe_id // PinesEntradaManager -- obtener ee_id
  estado: number;
  fecha: string;
  ee_id: number;

  detector: string;

  constructor(props: IRegistroEntradaSocket) {
    const { ctrl_id, ee_id, estado, fecha, pin, detector } = props;
    this.pin = pin;
    this.estado = estado;
    this.ee_id = ee_id;
    this.fecha = fecha;
    this.ctrl_id = ctrl_id;
    this.detector = detector;
  }

  public toJSON() : IRegistroEntradaSocket {
    const result: IRegistroEntradaSocket = {
      pin: this.pin,
      estado: this.estado,
      ee_id: this.ee_id,
      fecha: this.fecha,
      ctrl_id: this.ctrl_id,
      detector: this.detector
    };
    return result
  }
}

type IRegistroEntradaSocketBad = Omit<RegistroEntrada,"rentd_id" | "ee_id"> & Pick<Controlador, "ctrl_id">

export class RegistroEntradaSocketBad implements IRegistroEntradaSocketBad {

  ctrl_id: number;
  pin: number; // --> pe_id // PinesEntradaManager -- obtener ee_id
  estado: number;
  fecha: string;

  constructor(props: IRegistroEntradaSocketBad) {
    const { ctrl_id, estado, fecha, pin } = props;
    this.pin = pin;
    this.estado = estado;
    this.fecha = fecha;
    this.ctrl_id = ctrl_id;
  }

  public toJSON() : IRegistroEntradaSocketBad {
    const result: IRegistroEntradaSocketBad = {
      pin: this.pin,
      estado: this.estado,
      fecha: this.fecha,
      ctrl_id: this.ctrl_id,
    };
    return result
  }

}

interface RegistroEntradaObserver {
  updateRegistroAcceso(data: IRegistroEntradaSocket): void;
}

// interface RegistroEntradaSubject {
//   registerObserver(ctrl_id: number, observer: RegistroEntradaObserver): void;
//   unregisterObserver(ctrl_id: number): void;
//   notifyRegistroAcceso(data:RegistroEntradaSocket) : void
// }

class RegistroEntradaSocketObserver implements RegistroEntradaObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }
  updateRegistroAcceso(data: IRegistroEntradaSocket): void {
    this.socket.nsp.emit("new_registro_entrada", data);
  }

}

export class RegistroEntradaMap  {

  static map : { [ctrl_id: string]: RegistroEntradaSocket[] } = {};
  static observers: {[ctrl_id: string]:RegistroEntradaObserver} = {};

  public static registerObserver(ctrl_id: number, observer: RegistroEntradaObserver): void {
    if(!RegistroEntradaMap.observers[ctrl_id]){
      RegistroEntradaMap.observers[ctrl_id] = observer
    }
  }
  public static unregisterObserver(ctrl_id: number): void {
    if(RegistroEntradaMap.observers[ctrl_id]){
      delete RegistroEntradaMap.observers[ctrl_id]
    }
  }
  public static notifyRegistroAcceso(data: RegistroEntradaSocket): void {
    if(RegistroEntradaMap.observers[data.ctrl_id]){
      RegistroEntradaMap.observers[data.ctrl_id].updateRegistroAcceso(data.toJSON())
    }
  }

  public static add(regEnt: RegistroEntradaSocket |  RegistroEntradaSocketBad) {
    const { ctrl_id ,pin } = regEnt.toJSON();

    if (!RegistroEntradaMap.map.hasOwnProperty(ctrl_id)) {
      RegistroEntradaMap.map[ctrl_id] = []
    }

    if(regEnt instanceof RegistroEntradaSocket){
      RegistroEntradaMap.map[ctrl_id].unshift(regEnt)  // agregar elementos al comienzo
      // notificar
      RegistroEntradaMap.notifyRegistroAcceso(regEnt)
    }else{
      const currentPinEntrada = PinEntradaManager.getPinEntrada(String(ctrl_id),String(pin));
      if(currentPinEntrada){
        if(EquipoEntradaMap.map[currentPinEntrada.ee_id]){
          let newRegEnt = new RegistroEntradaSocket({...regEnt,ee_id:currentPinEntrada.ee_id,detector:EquipoEntradaMap.map[currentPinEntrada.ee_id].detector})
          RegistroEntradaMap.map[ctrl_id].unshift(newRegEnt)  // agregar elementos al comienzo
          // notificar
          RegistroEntradaMap.notifyRegistroAcceso(newRegEnt)
        }
      }
    }

    if(RegistroEntradaMap.map[ctrl_id].length > 5){
      RegistroEntradaMap.map[ctrl_id].splice(5) // elimina elementos desde el index 5
    }

  }

  public static async init(){
    try {
      let initialRegistrosEntrada = await RegistroEntradaSite.getAllRegistrosEntrada()
      for(let regEnt of initialRegistrosEntrada.reverse()){
        if(EquipoEntradaMap.map[regEnt.ee_id]){
          let newRegAcc = new RegistroEntradaSocket({...regEnt,detector:EquipoEntradaMap.map[regEnt.ee_id].detector})
          RegistroEntradaMap.add(newRegAcc)
        }
      }
    } catch (error) {
      console.log(`Socket Registro Entrada | RegistroEntradaMap | Error al inicializar registros entrada`);
      console.error(error);  
      throw error
    }
  }

  public static getRegistrosEntrada(ctrl_id: string) {
    let resultData: IRegistroEntradaSocket[] = [];
    if (RegistroEntradaMap.map[ctrl_id]) {
      RegistroEntradaMap.map[ctrl_id].forEach((item) => {
        resultData.push(item.toJSON());
      });
    }
    return resultData;
  }

}


// (()=>{
//   let count = 60
//   setInterval(async ()=>{

//     const randomNumber = Math.floor(Math.random() * (100 - 10) + 10);
//     const randomNumber2 = Math.round(Math.random())

//     const newSensorTemp = new RegistroEntradaSocket({
//       "rentd_id": count,
//       "pin": randomNumber,
//       "estado": randomNumber2,
//       "fecha": "2024-04-12 15:19:27",
//       "ee_id": 1,
//       ctrl_id:27
//     })

//     count= count + 1

//     await RegistroEntradaMap.add(newSensorTemp)


//   },10000)

// })()


