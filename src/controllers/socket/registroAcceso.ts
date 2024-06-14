import { Server, Socket } from "socket.io";
import type { Contrata, Controlador, RegistroAcceso } from "../../types/db";
import { RegistroAccesoSite } from "../../models/site";
import { ContrataMap } from "../../models/maps";
export const registroAccesoSocket = async (io: Server, socket: Socket) => {
  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/registro_acceso/ctrl_id"

  console.log(`Socket Registro Acceso | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  let newObserver = new RegistroAccesoSocketObserver(socket)
  RegistroAccesoMap.registerObserver(Number(ctrl_id),newObserver)
  //emit initial data:
  let regAccData = RegistroAccesoMap.getRegistrosAcceso(ctrl_id);
  socket.emit("list_registros_acceso",regAccData)


  socket.on("disconnect", () => {
    const clientsCount = io.of(`/registro_acceso/${ctrl_id}`).sockets.size;
    console.log(`Socket Registro Acceso | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Registro Acceso | Eliminado Observer | ctrl_id = ${ctrl_id}`)
      RegistroAccesoMap.unregisterObserver(Number(ctrl_id))

    }
  });

  socket.on("error", (error) => {
    console.log(`Socket Registro Acceso | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}


type IRegistroAccesoSocket = Omit<RegistroAcceso,"ra_id"> & Pick<Controlador, "ctrl_id"> & Pick<Contrata,"contrata">;
export class RegistroAccesoSocket implements IRegistroAccesoSocket {

  ctrl_id: number;
  serie: number;
  ea_id: number;
  co_id: number;
  contrata: string;
  administrador: number;
  autorizacion: number;
  fecha: string;
  tipo: number;
  sn_id: number;

  constructor(props: IRegistroAccesoSocket) {
    const {administrador,autorizacion,co_id,ctrl_id,ea_id,fecha,serie,sn_id,tipo,contrata} = props;
    this.serie = serie;
    this.ea_id = ea_id;
    this.co_id = co_id;
    this.administrador = administrador;
    this.autorizacion = autorizacion;
    this.fecha = fecha;
    this.tipo = tipo;
    this.sn_id = sn_id;
    this.ctrl_id = ctrl_id;
    this.contrata = contrata;
  }

  public setCtrlId(ctrl_id: IRegistroAccesoSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }

  public setSerie(serie: IRegistroAccesoSocket["serie"]): void {
    this.serie = serie;
  }
  public setEaId(ea_id: IRegistroAccesoSocket["ea_id"]): void {
    this.ea_id = ea_id;
  }
  public setAdministrador(administrador: IRegistroAccesoSocket["administrador"]): void {
    this.administrador = administrador;
  }
  public setAutorizacion(autorizacion: IRegistroAccesoSocket["autorizacion"]): void {
    this.autorizacion = autorizacion;
  }
  public setFecha(fecha: IRegistroAccesoSocket["fecha"]): void {
    this.fecha = fecha;
  }
  public setTipo(tipo: IRegistroAccesoSocket["tipo"]): void {
    this.tipo = tipo;
  }
  public setSnId(sn_id: IRegistroAccesoSocket["sn_id"]): void {
    this.sn_id = sn_id;
  }
  public setContrata(contrata: IRegistroAccesoSocket["contrata"]): void {
    this.contrata = contrata;
  }

  public toJSON() : IRegistroAccesoSocket {
    const result: IRegistroAccesoSocket ={
      serie : this.serie ,
      ea_id : this.ea_id ,
      co_id : this.co_id ,
      administrador : this.administrador ,
      autorizacion : this.autorizacion ,
      fecha : this.fecha ,
      tipo : this.tipo ,
      sn_id : this.sn_id ,
      ctrl_id : this.ctrl_id ,
      contrata: this.contrata
    }
    return result
  }
}

interface IRegistroAccesoSocketBad {
ctrl_id: number;
serie: number;
ea_id: number;
co_id: number;
administrador: number;
autorizacion: number;
fecha: string;
tipo: number;
sn_id: number;
}

export class RegistroAccesoSocketBad implements IRegistroAccesoSocketBad {

  ctrl_id: number;
  serie: number;
  ea_id: number;
  co_id: number;
  administrador: number;
  autorizacion: number;
  fecha: string;
  tipo: number;
  sn_id: number;

  constructor(props: IRegistroAccesoSocketBad) {
    const {administrador,autorizacion,co_id,ctrl_id,ea_id,fecha,serie,sn_id,tipo} = props;
    this.serie = serie;
    this.ea_id = ea_id;
    this.co_id = co_id;
    this.administrador = administrador;
    this.autorizacion = autorizacion;
    this.fecha = fecha;
    this.tipo = tipo;
    this.sn_id = sn_id;
    this.ctrl_id = ctrl_id;
  }

  public setCtrlId(ctrl_id: IRegistroAccesoSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }

  public setSerie(serie: IRegistroAccesoSocketBad["serie"]): void {
    this.serie = serie;
  }
  public setEaId(ea_id: IRegistroAccesoSocketBad["ea_id"]): void {
    this.ea_id = ea_id;
  }
  public setAdministrador(administrador: IRegistroAccesoSocketBad["administrador"]): void {
    this.administrador = administrador;
  }
  public setAutorizacion(autorizacion: IRegistroAccesoSocketBad["autorizacion"]): void {
    this.autorizacion = autorizacion;
  }
  public setFecha(fecha: IRegistroAccesoSocketBad["fecha"]): void {
    this.fecha = fecha;
  }
  public setTipo(tipo: IRegistroAccesoSocketBad["tipo"]): void {
    this.tipo = tipo;
  }
  public setSnId(sn_id: IRegistroAccesoSocketBad["sn_id"]): void {
    this.sn_id = sn_id;
  }


  public toJSON() : IRegistroAccesoSocketBad {
    const result: IRegistroAccesoSocketBad ={
      serie : this.serie ,
      ea_id : this.ea_id ,
      co_id : this.co_id ,
      administrador : this.administrador ,
      autorizacion : this.autorizacion ,
      fecha : this.fecha ,
      tipo : this.tipo ,
      sn_id : this.sn_id ,
      ctrl_id : this.ctrl_id ,
    }
    return result
  }
}

interface RegistroAccesoObserver {
  updateRegistroAcceso(data: IRegistroAccesoSocket): void;
}

// interface PinesSalidaSubject {
//   registerObserver(ctrl_id: number, observer: RegistroAccesoObserver): void;
//   unregisterObserver(ctrl_id: number): void;
//   notityRegistroAcceso(data:RegistroAccesoSocket) : void
// }

class RegistroAccesoSocketObserver implements RegistroAccesoObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }
  updateRegistroAcceso(data: IRegistroAccesoSocket): void {
    this.socket.nsp.emit("new_registro_acceso", data);
  }

}

export class RegistroAccesoMap  {
  
  static map : { [ctrl_id: string]: RegistroAccesoSocket[] } = {};
  static observers: {[ctrl_id: string]:RegistroAccesoObserver} = {};

  public static registerObserver(ctrl_id: number, observer: RegistroAccesoObserver): void {
    if(!RegistroAccesoMap.observers[ctrl_id]){
      RegistroAccesoMap.observers[ctrl_id] = observer
    }
  }
  public static unregisterObserver(ctrl_id: number): void {
    if(RegistroAccesoMap.observers[ctrl_id]){
      delete RegistroAccesoMap.observers[ctrl_id]
    }
  }
  public static notityRegistroAcceso(data: RegistroAccesoSocket): void {
    if(RegistroAccesoMap.observers[data.ctrl_id]){
      RegistroAccesoMap.observers[data.ctrl_id].updateRegistroAcceso(data.toJSON())
    }
  }

  public static add(regAcc: RegistroAccesoSocket |  RegistroAccesoSocketBad) {
    const { ctrl_id } = regAcc.toJSON();

    if (!RegistroAccesoMap.map.hasOwnProperty(ctrl_id)) {
      RegistroAccesoMap.map[ctrl_id] = []
    }

    if(regAcc instanceof RegistroAccesoSocket){
      RegistroAccesoMap.map[ctrl_id].unshift(regAcc)  // agregar elementos al comienzo
      // notificar
      RegistroAccesoMap.notityRegistroAcceso(regAcc)
    }else{

      if(ContrataMap.map[regAcc.co_id]){
        let newRegAcc = new RegistroAccesoSocket({...regAcc,contrata:ContrataMap.map[regAcc.co_id].contrata})
        RegistroAccesoMap.map[ctrl_id].unshift(newRegAcc)  // agregar elementos al comienzo
        // notificar
        RegistroAccesoMap.notityRegistroAcceso(newRegAcc)
      }else{ // sin contrata
        let newRegAccSinContrata = new RegistroAccesoSocket({...regAcc,contrata:"sin_contrata"})
        RegistroAccesoMap.map[ctrl_id].unshift(newRegAccSinContrata)
        RegistroAccesoMap.notityRegistroAcceso(newRegAccSinContrata)

      }
    }

    if(RegistroAccesoMap.map[ctrl_id].length > 5){
      RegistroAccesoMap.map[ctrl_id].splice(5) // elimina elementos desde el index 5
    }

  }

  public static async init(){
    try {
      let initialRegistrosAcceso = await RegistroAccesoSite.getAllRegistrosAcceso()
      for(let regAcc of initialRegistrosAcceso.reverse()){
        if(ContrataMap.map[regAcc.co_id]){
          let newRegAcc = new RegistroAccesoSocket({...regAcc,contrata:ContrataMap.map[regAcc.co_id].contrata})
          RegistroAccesoMap.add(newRegAcc)
        }else{
          let newRegAcc = new RegistroAccesoSocket({...regAcc,contrata:"sin_contrata"})
          RegistroAccesoMap.add(newRegAcc)
        }
      }
    } catch (error) {
      console.log(`Socket Registro Acceso | RegistroAccesoMap | Error al inicializar registros`);
      console.error(error);  
    }
  }

  public static getRegistrosAcceso(ctrl_id: string) {
    let resultData: IRegistroAccesoSocket[] = [];
    if (RegistroAccesoMap.map.hasOwnProperty(ctrl_id)) {
      RegistroAccesoMap.map[ctrl_id].forEach((item) => {
        resultData.push(item.toJSON());
      });
    }
    return resultData;
  }

}


// (()=>{
//   let count = 0
//   setInterval( ()=>{

//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     // const randomNumber2 = Math.floor(Math.random() * 11) + 20;

//     const newSensorTemp = new RegistroAccesoSocket({
//       // "ra_id": 226,
//       "serie": 63744,
//       "administrador": 0,
//       "autorizacion": randomNumber,
//       "fecha": "2024-11-06 17:51:41",
//       "co_id": 0,
//       "ea_id": 0,
//       "tipo": 0,
//       "sn_id": 1,
//       contrata:`Contrata N ${count}`,
//       ctrl_id: 27
//     })

//     count= count + 1

//     RegistroAccesoMap.add(newSensorTemp)


//   },10000)

// })()

