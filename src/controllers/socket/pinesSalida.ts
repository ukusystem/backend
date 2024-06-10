import { Server, Socket } from "socket.io";
import { Controlador, EquipoSalida, PinesSalida } from "../../types/db";
import { PinSalida } from "../../models/site";
import { onOrder } from "../../models/controllerapp/controller";

interface OrdenPinSalida {
  action: -1 | 0 | 1
  ctrl_id : number,
  pin: number
  es_id: number
}

interface ResponseOrdenPinSalida {
  success: boolean;
  message: string;
  ordenSend: OrdenPinSalida
}

export const pinesSalidaSocket =async (io:Server, socket: Socket) => {
  
  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/pines_salida/ctrl_id"

  console.log(`Socket Pines Salida | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);
  const observer = new PinesSalidaSocketObserver(socket);
  PinesSalidaMap.registerObserver(Number(ctrl_id),observer);

  //emit initial data
  let newEquipSal = PinesSalidaMap.getEquiposSalida(String(ctrl_id));
  socket.nsp.emit("equipos_salida",newEquipSal)
  
  socket.on("initial_list_pines_salida",(es_id: number)=>{
    let newListPinSal = PinesSalidaMap.getListPinesSalida(String(ctrl_id),String(es_id));
    socket.nsp.emit("list_pines_salida",newListPinSal)
  })

  socket.on("initial_item_pin_salida",(es_id: number, ps_id:number)=>{
    let newItemPinSal = PinesSalidaMap.getItemPinSalida(ctrl_id,String(es_id),String(ps_id))
    if(newItemPinSal){
      socket.nsp.emit("item_pin_salida",newItemPinSal)
    }
  })

  socket.on("orden_pin_salida",async ({action,ctrl_id,pin,es_id}: OrdenPinSalida)=>{
    console.log("orden: ",{action,ctrl_id,pin, es_id} )
    try {
      const ordenResult =  await onOrder({action,ctrl_id,pin})
      if(ordenResult != undefined){
        console.log("result_orden: ", ordenResult.resultado, ordenResult.mensaje)
        if(ordenResult.resultado){ // orden correcto
          if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
            if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(es_id)) {
              if(PinesSalidaMap.map[ctrl_id][es_id].pines_salida.hasOwnProperty(pin)){

                const  currentPinSal = PinesSalidaMap.map[ctrl_id][es_id].pines_salida[pin]
                currentPinSal.setOrden(action)
                PinesSalidaMap.add_update(currentPinSal);

                socket.emit("response_orden_pin_salida",{success:ordenResult.resultado , message: ordenResult.mensaje, ordenSend:{action,ctrl_id,pin,es_id}} as ResponseOrdenPinSalida )
              }
            }
          }
        }else{
          socket.emit("response_orden_pin_salida",{success:ordenResult.resultado , message: ordenResult.mensaje, ordenSend:{action,ctrl_id,pin,es_id}} as ResponseOrdenPinSalida )
        }
      }
    } catch (error) {
      // console.log(first)
      console.error(error)
    }
  })

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/pines_salida/${ctrl_id}`).sockets.size;
    console.log(`Socket Pines Salida | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Pines Salida | Eliminado Observer | ctrl_id = ${ctrl_id}`)
      PinesSalidaMap.unregisterObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Pines Salida | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}

type IPinesSalidaSocket = PinesSalida & Pick<Controlador, "ctrl_id"> & {automatico: boolean , orden: number };
interface IPinesSalidaSocketBad {
  ps_id: number,
  pin: number,
  es_id: number | null,
  descripcion: string | null,
  estado: number | null,
  activo: number  | null,
  automatico: boolean,
  ctrl_id: number,
  orden: number | null,
}

export class PinesSalidaSocket implements IPinesSalidaSocket {
  ps_id: number;
  pin: number;
  es_id: number;
  descripcion: string;
  // activo: 0 | 1;
  activo: number;
  estado: number; // automatico true
  ctrl_id: number;
  // automatico: boolean
  // orden: -1 | 0 | 1 --> automatico false
  automatico: boolean;
  orden: number;
  // orden: 0 | 1 | -1;

  // ps_id: number;
  // pin: number;
  // es_id: number | null;
  // descripcion: string | null;
  // estado: number | null;
  // activo: number | null;
  // automatico: boolean;
  // ctrl_id: number;
  // orden: number | null;

  constructor(props: IPinesSalidaSocket) {
    const { activo, ctrl_id, descripcion, es_id, estado, pin, ps_id, automatico, orden, } = props;
    this.ps_id = ps_id;
    this.pin = pin;
    this.es_id = es_id;
    this.descripcion = descripcion;
    this.estado = estado;
    this.activo = activo;
    this.ctrl_id = ctrl_id;
    this.automatico = automatico;
    this.orden = orden;
  }
  

  public setPsId(ps_id: IPinesSalidaSocket["ps_id"]): void {
    this.ps_id = ps_id;
  }
  public setPin(pin: IPinesSalidaSocket["pin"]): void {
    this.pin = pin;
  }
  public setEsId(es_id: IPinesSalidaSocket["es_id"]): void {
    this.es_id = es_id;
  }
  public setDescripcion(descripcion: IPinesSalidaSocket["descripcion"]): void {
    this.descripcion = descripcion;
  }
  public setActivo(activo: IPinesSalidaSocket["activo"]): void {
    this.activo = activo;
  }
  public setEstado(estado: IPinesSalidaSocket["estado"]): void {
    this.estado = estado;
  }
  public setCtrlId(ctrl_id: IPinesSalidaSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setAutomatico(automatico: IPinesSalidaSocket["automatico"]): void {
    this.automatico = automatico;
  }
  public setOrden(orden: IPinesSalidaSocket["orden"]): void {
    this.orden = orden;
  }

  public toJSON(): IPinesSalidaSocket {
    const result: IPinesSalidaSocket = {
      ps_id: this.ps_id,
      pin: this.pin,
      es_id: this.es_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
      automatico: this.automatico,
      orden: this.orden,
    };

    return result;
  }
  
}

export class PinesSalidaSocketBad implements IPinesSalidaSocketBad {

  ps_id: number;
  pin: number;
  es_id: number | null;
  descripcion: string | null;
  estado: number | null;
  activo: number | null;
  automatico: boolean;
  ctrl_id: number;
  orden: number | null;

  constructor(props: IPinesSalidaSocketBad) {
    const { activo, ctrl_id, descripcion, es_id, estado, pin, ps_id, automatico, orden, } = props;
    this.ps_id = ps_id;
    this.pin = pin;
    this.es_id = es_id;
    this.descripcion = descripcion;
    this.estado = estado;
    this.activo = activo;
    this.ctrl_id = ctrl_id;
    this.automatico = automatico;
    this.orden = orden;
  }
  

  public setPsId(ps_id: IPinesSalidaSocketBad["ps_id"]): void {
    this.ps_id = ps_id;
  }
  public setPin(pin: IPinesSalidaSocketBad["pin"]): void {
    this.pin = pin;
  }
  public setEsId(es_id: IPinesSalidaSocketBad["es_id"]): void {
    this.es_id = es_id;
  }
  public setDescripcion(descripcion: IPinesSalidaSocketBad["descripcion"]): void {
    this.descripcion = descripcion;
  }
  public setActivo(activo: IPinesSalidaSocketBad["activo"]): void {
    this.activo = activo;
  }
  public setEstado(estado: IPinesSalidaSocketBad["estado"]): void {
    this.estado = estado;
  }
  public setCtrlId(ctrl_id: IPinesSalidaSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setAutomatico(automatico: IPinesSalidaSocketBad["automatico"]): void {
    this.automatico = automatico;
  }
  public setOrden(orden: IPinesSalidaSocketBad["orden"]): void {
    this.orden = orden;
  }

  public toJSON(): IPinesSalidaSocketBad {
    const result: IPinesSalidaSocketBad = {
      ps_id: this.ps_id,
      pin: this.pin,
      es_id: this.es_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
      automatico: this.automatico,
      orden: this.orden,
    };

    return result;
  }
  
}

interface EquiTest extends EquipoSalida {
  pines_salida:{
    [ps_id:string]:PinesSalidaSocket
  }
}
interface PinesSalidaObserver {
  updateEquiposSalida(data:EquipoSalida[]): void;
  updateListPinesSalida(data: PinesSalida[]): void;
  updateItemPinSalida(data: IPinesSalidaSocket): void;
}

interface PinesSalidaSubject {
  registerObserver(ctrl_id: number, observer: PinesSalidaObserver): void;
  unregisterObserver(ctrl_id: number, observer: PinesSalidaObserver): void;
  notifyEquiposSalida(ctrl_id: number, data: EquipoSalida[]): void;
  notifyListPinesSalida(ctrl_id: number,es_id: number,data: PinesSalida[]): void;
  notifyItemPinSalida(ctrl_id: number, es_id: number, ps_id: number,data: IPinesSalidaSocket): void;
}


class PinesSalidaSocketObserver implements PinesSalidaObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }

  updateEquiposSalida(data: EquipoSalida[]): void {
    this.socket.nsp.emit("equipos_salida", data);
  }

  updateListPinesSalida(data: PinesSalida[]): void {
    this.socket.nsp.emit("list_pines_salida", data);
  }

  updateItemPinSalida(data: IPinesSalidaSocket): void {
    this.socket.nsp.emit("item_pin_salida", data);
  }
}

export class PinesSalidaMap  {
  
  static map : { [ctrl_id: string]: { [es_id: string]: EquiTest } } = {};
  private static equiposalida: EquipoSalida[] = []
  static observers: {[ctrl_id: string]:PinesSalidaObserver} = {};

  public static registerObserver(ctrl_id: number, observer: PinesSalidaObserver): void {
    if(!PinesSalidaMap.observers[ctrl_id]){
      PinesSalidaMap.observers[ctrl_id] = observer
    }
  }
  public static unregisterObserver(ctrl_id: number): void {
    if(PinesSalidaMap.observers[ctrl_id]){
      delete PinesSalidaMap.observers[ctrl_id]
    }
  }
  public static notifyEquiposSalida(ctrl_id: number, data: EquipoSalida[]): void {
    if(PinesSalidaMap.observers[ctrl_id]){
      PinesSalidaMap.observers[ctrl_id].updateEquiposSalida(data)
    }
  }
  // public static notifyListPinesSalida(ctrl_id: number, es_id: number, data: PinesSalida[]): void {
  public static notifyListPinesSalida(ctrl_id: number, data: PinesSalida[]): void {
    if(PinesSalidaMap.observers[ctrl_id]){
      PinesSalidaMap.observers[ctrl_id].updateListPinesSalida(data)
    }
  }
  // public static notifyItemPinSalida(ctrl_id: number, es_id: number, ps_id: number, data: IPinesSalidaSocket): void {
  public static notifyItemPinSalida(ctrl_id: number, data: IPinesSalidaSocket): void {
    if(PinesSalidaMap.observers[ctrl_id]){
      PinesSalidaMap.observers[ctrl_id].updateItemPinSalida(data)
    }
  }

  private static exists(args: { ctrl_id: string; es_id: string ; ps_id: string }) {
    const { ctrl_id, ps_id , es_id } = args;

    let is_ctrl_id: boolean = false;
    let is_es_id:boolean = false;
    let is_ps_id: boolean = false;

    for (const ctrl_id_key in PinesSalidaMap.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
      }

      for (const es_id_key in PinesSalidaMap.map[ctrl_id_key]) {
        if (es_id_key == es_id) {
          is_es_id = true;
        }

        for (const ps_id_key in PinesSalidaMap.map[ctrl_id_key][es_id_key].pines_salida) {
          if (ps_id_key == ps_id) {
            is_ps_id = true;
          }
        }

      }
    }

    return is_ctrl_id && is_es_id && is_ps_id;
  }

  private static add(pinSal: PinesSalidaSocket) {
    const { ctrl_id, ps_id ,es_id} = pinSal.toJSON();

    if (!PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      PinesSalidaMap.map[ctrl_id] = {};
    }

    if (!PinesSalidaMap.map[ctrl_id].hasOwnProperty(es_id)) {
      let foundEquiSalida = PinesSalidaMap.equiposalida.find((equiSal)=> equiSal.es_id == es_id)
      if(foundEquiSalida){
        PinesSalidaMap.map[ctrl_id][es_id] = {...foundEquiSalida,pines_salida:{}}
        let newEquipSal = PinesSalidaMap.getEquiposSalida(String(ctrl_id))
        PinesSalidaMap.notifyEquiposSalida(ctrl_id,newEquipSal)
      }else{
        return // No llegara a este caso:
        // PinesSalidaMap.map[ctrl_id][es_id] = { activo:1, actuador:"no_definido", descripcion:"no_definido", es_id:es_id, pines_salida:{}}
      }
    }
    if (!PinesSalidaMap.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id)) {
      PinesSalidaMap.map[ctrl_id][es_id].pines_salida[ps_id] = pinSal;
      let newListPinSal = PinesSalidaMap.getListPinesSalida(String(ctrl_id),String(es_id))
      PinesSalidaMap.notifyListPinesSalida(ctrl_id,newListPinSal)
    }
  }

  private static update(pinSal: PinesSalidaSocket) {
    const { ctrl_id, ps_id,es_id,activo,automatico,descripcion,estado,orden,pin } = pinSal.toJSON();
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(es_id)) {
        if(PinesSalidaMap.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id)){

          const currentPinSal = PinesSalidaMap.map[ctrl_id][es_id].pines_salida[ps_id];
          if (currentPinSal.ctrl_id != ctrl_id ) currentPinSal.setCtrlId(ctrl_id);
          if (currentPinSal.ps_id != ps_id ) currentPinSal.setPsId(ps_id);
          if (currentPinSal.es_id != es_id ) currentPinSal.setEsId(es_id);
          if (currentPinSal.activo != activo ) currentPinSal.setActivo(activo);
          if (currentPinSal.automatico != automatico ) currentPinSal.setAutomatico(automatico);
          if (currentPinSal.descripcion != descripcion ) currentPinSal.setDescripcion(descripcion);
          if (currentPinSal.estado != estado ) currentPinSal.setEstado(estado);
          if (currentPinSal.orden != orden ) currentPinSal.setOrden(orden);
          if (currentPinSal.pin != pin ) currentPinSal.setPin(pin);

          PinesSalidaMap.notifyItemPinSalida(ctrl_id,pinSal.toJSON())
        }
      }
    }
  }

  public static async init(){
    try {
      const equiSalidaData = await PinSalida.getEquiposSalida()
      PinesSalidaMap.equiposalida = equiSalidaData

      const pinSalidaData = await PinSalida.getAllPinesSalida()
      for (let pinSal of pinSalidaData) {
        let newPinSalida = new PinesSalidaSocket({...pinSal, automatico: false ,orden:0});
        PinesSalidaMap.add_update(newPinSalida);
      }
      
    } catch (error) {
      console.log(`Socket Medidor Energia | PinesSalidaMap | Error al inicilizar equipos de salida`);
      console.error(error);
    }
  }

  public static delete(pinSal: PinesSalidaSocket | PinesSalidaSocketBad) {
    if(pinSal instanceof PinesSalidaSocket){
      const { ctrl_id, ps_id, es_id} = pinSal.toJSON();
      if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
        if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(es_id)) {
          if(PinesSalidaMap.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id)){
            // delete PinesSalidaMap.map[ctrl_id][es_id].pines_salida[ps_id];
            PinesSalidaMap.map[ctrl_id][es_id].pines_salida[ps_id].setActivo(0)
            let newListPinSal = PinesSalidaMap.getListPinesSalida(String(ctrl_id),String(es_id))
            PinesSalidaMap.notifyListPinesSalida(ctrl_id,newListPinSal)
  
          }
        }
      }
    }else{
      const { ctrl_id, ps_id, es_id} = pinSal.toJSON();
      const newPinSalSocket = PinesSalidaMap.getEsId(pinSal)
      if(newPinSalSocket){
        if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
          if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(newPinSalSocket.es_id)) {
            if(PinesSalidaMap.map[ctrl_id][newPinSalSocket.es_id].pines_salida.hasOwnProperty(ps_id)){
              // delete PinesSalidaMap.map[ctrl_id][newPinSalSocket.es_id].pines_salida[ps_id];
              PinesSalidaMap.map[ctrl_id][newPinSalSocket.es_id].pines_salida[ps_id].setActivo(0)
              let newListPinSal = PinesSalidaMap.getListPinesSalida(String(ctrl_id),String(newPinSalSocket.es_id))
              PinesSalidaMap.notifyListPinesSalida(ctrl_id,newListPinSal)
            }
          }
        }       
      }
    }
  }

  public static add_update(pinSal: PinesSalidaSocket | PinesSalidaSocketBad ) {
    if(pinSal instanceof PinesSalidaSocket){
      const { ps_id, ctrl_id,es_id } = pinSal.toJSON();
      const exists = PinesSalidaMap.exists({ctrl_id: String(ctrl_id),ps_id: String(ps_id),es_id:String(es_id)});
  
      if (!exists) {
        PinesSalidaMap.add(pinSal);
      } else {
        PinesSalidaMap.update(pinSal);
      }
    }else{
      const { ps_id, ctrl_id,es_id ,activo,automatico,descripcion,estado,orden,pin } = pinSal.toJSON();
      if(ps_id !== null && ctrl_id != null){ 
        const currentPinSalSocket = PinesSalidaMap.getEsId(pinSal)
        if(currentPinSalSocket){ // existe pin salida
          // actualizar
          if (es_id !== null && currentPinSalSocket.es_id != es_id ) currentPinSalSocket.setEsId(es_id);
          if (activo !== null && currentPinSalSocket.activo != activo ) currentPinSalSocket.setActivo(activo);
          if (currentPinSalSocket.automatico != automatico ) currentPinSalSocket.setAutomatico(automatico);
          if (descripcion !== null && currentPinSalSocket.descripcion != descripcion ) currentPinSalSocket.setDescripcion(descripcion);
          if (estado !== null && currentPinSalSocket.estado != estado ) currentPinSalSocket.setEstado(estado);
          if (orden !== null && currentPinSalSocket.orden != orden ) currentPinSalSocket.setOrden(orden);
          if (currentPinSalSocket.pin != pin ) currentPinSalSocket.setPin(pin);

          // PinesSalidaMap.update(currentPinSalSocket);
          PinesSalidaMap.notifyItemPinSalida(ctrl_id,currentPinSalSocket)

        } else {
          // agregar 
          if( es_id != null && activo != null && automatico != null && descripcion != null && estado != null && orden != null && pin != null ){
            const newPinSalSocket = new PinesSalidaSocket({ ps_id, ctrl_id,es_id ,activo,automatico,descripcion,estado,orden,pin })
            PinesSalidaMap.add(newPinSalSocket);
          }
        }
      }
    }
  }

  private static getEsId(pinSal: PinesSalidaSocketBad){
    const { ps_id, ctrl_id,es_id , pin } = pinSal.toJSON();

    let foundPinSalida : PinesSalidaSocket | null = null ;
    for (const ctrl_id_key in PinesSalidaMap.map) {
      if(ctrl_id_key == String(ctrl_id)){
        for (const es_id_key in PinesSalidaMap.map[ctrl_id_key]) {
          // if(es_id_key == String(es_id)){}
          for (const ps_id_key in PinesSalidaMap.map[ctrl_id_key][es_id_key].pines_salida) {
            if (ps_id_key == String(ps_id)) {
              foundPinSalida = PinesSalidaMap.map[ctrl_id_key][es_id_key].pines_salida[ps_id_key]
            }
          }
  
        }
      }      
    }
    return foundPinSalida
  }

  public static getEquiposSalida(ctrl_id:string) : EquipoSalida[] {
    let result : EquipoSalida[] = []
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      for (const es_id_key in PinesSalidaMap.map[ctrl_id]){
        let {pines_salida,...equisal} = PinesSalidaMap.map[ctrl_id][es_id_key]
        if(PinesSalidaMap.hasActivesPinesSalida(pines_salida)){
          result.push(equisal)
        }
      }
    }
    let resultOrdered = result.sort((a,b)=> a.es_id - b.es_id)
    return resultOrdered
  }

  public static getListPinesSalida(ctrl_id:string,es_id:string) : IPinesSalidaSocket[] {
    let result : IPinesSalidaSocket[] = []
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)){
      if(PinesSalidaMap.map[ctrl_id].hasOwnProperty(es_id)){
        let pinesSalida = PinesSalidaMap.map[ctrl_id][es_id].pines_salida
        let pinesSalidaActives = Object.values(pinesSalida).reduce((acc,cur)=>{
          let prevResult = acc;
          if(cur.activo == 1){
            prevResult.push(cur.toJSON())
          }
          return prevResult
        },[] as IPinesSalidaSocket[])

        result = pinesSalidaActives
      }
    }
    let pinesSalidaActivesOrdered = result.sort((a,b)=> a.ps_id - b.ps_id)
    return pinesSalidaActivesOrdered
  }

  public static getItemPinSalida(ctrl_id:string,es_id:string,ps_id:string){
    let resultData: IPinesSalidaSocket | null = null ;
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(es_id)) {
        if(PinesSalidaMap.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id)){
          resultData = PinesSalidaMap.map[ctrl_id][es_id].pines_salida[ps_id].toJSON()
        }
      }
    }

    return resultData
  }

  private static hasActivesPinesSalida(pines_salida: EquiTest["pines_salida"]) : boolean {
    const hasActive = Object.values(pines_salida).some(ps => ps.activo === 1)
    return  hasActive
  }

}


(() => {

  // setInterval(() => {
  //   const randomNumber = Math.round(Math.random())
  //   const randomNumber2 = Math.round(Math.random());

  //   const newSensorTemp = new PinesSalidaSocket({ps_id: 1,pin: 1,es_id: 3,descripcion: "Salida 1",estado: randomNumber,activo: 1,automatico:true,ctrl_id:1,orden:0});
  //   const newSensorTemp2 = new PinesSalidaSocket({ ps_id: 2, pin: 2, es_id: 1, descripcion: "Salida 2", estado: randomNumber2, activo: 1,automatico:true,ctrl_id:1,orden:0 });

  //   PinesSalidaMap.add_update(newSensorTemp);
  //   PinesSalidaMap.add_update(newSensorTemp2);

  // }, 2000);

  // setTimeout(()=>{
  //   const randomNumber = Math.round(Math.random());
  //   const newSensorTemp = new PinesSalidaSocket({ ps_id: 3, pin: 3, es_id: 2, descripcion: "Salida 3", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
  //   PinesSalidaMap.add_update(newSensorTemp)
  // },10000)

  // setTimeout(()=>{
  //   const randomNumber = Math.round(Math.random());
  //   const newSensorTemp = new PinesSalidaSocket({ ps_id: 10, pin: 10, es_id: 1, descripcion: "Salida N", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
  //   PinesSalidaMap.add_update(newSensorTemp)
  // },10000)

  // setTimeout(()=>{
  //   const randomNumber = Math.round(Math.random());
  //   const newSensorTemp = new PinesSalidaSocket({ ps_id: 4, pin: 4, es_id: 5, descripcion: "Salida 4", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
  //   PinesSalidaMap.add_update(newSensorTemp)
  // },20000)

  // setTimeout(()=>{
  //   const randomNumber = Math.round(Math.random());
  //   const newSensorTemp = new PinesSalidaSocket({ ps_id: 4, pin: 4, es_id: 5, descripcion: "Salida 4", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 })
  //   PinesSalidaMap.delete(newSensorTemp)
  // },60000)

  // setInterval(()=>{
  //   const randomNumber = Math.floor(Math.random() * 3) - 1; // -1 0 1
  //   const newSensorTemp = new PinesSalidaSocket({ ps_id: 2, pin: 2, es_id: 1, descripcion: "Descrip 2", estado: 1, activo: 1,automatico:false,ctrl_id:27,orden:randomNumber });
  //   PinesSalidaMap.add_update(newSensorTemp)
  // },5000)

})();