import { ActionPinSal, EquSalPinSalida, IPinSalidaSocket, IPinSalidaSocketBad, IPinSalObject, PinSalidaObserver, SocketPinSalida } from "./pinsalida.types";
import { EquipoSalida } from "../../../types/db";
import { PinSalida } from "../../../models/site";
import { genericLogger } from "../../../services/loggers";

export class PinSalidaSocket implements IPinSalObject {
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
  // orden: number;
  // orden: 0 | 1 | -1;
  orden: ActionPinSal;

  constructor(props: IPinSalidaSocket) {
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

  public setPsId(ps_id: IPinSalidaSocket["ps_id"]): void {
    this.ps_id = ps_id;
  }
  public setPin(pin: IPinSalidaSocket["pin"]): void {
    this.pin = pin;
  }
  public setEsId(es_id: IPinSalidaSocket["es_id"]): void {
    this.es_id = es_id;
  }
  public setDescripcion(descripcion: IPinSalidaSocket["descripcion"]): void {
    this.descripcion = descripcion;
  }
  public setActivo(activo: IPinSalidaSocket["activo"]): void {
    this.activo = activo;
  }
  public setEstado(estado: IPinSalidaSocket["estado"]): void {
    this.estado = estado;
  }
  public setCtrlId(ctrl_id: IPinSalidaSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setAutomatico(automatico: IPinSalidaSocket["automatico"]): void {
    this.automatico = automatico;
  }
  public setOrden(orden: IPinSalidaSocket["orden"]): void {
    this.orden = orden;
  }

  public toJSON(): IPinSalidaSocket {
    const result: IPinSalidaSocket = {
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

export class PinSalidaSocketBad implements IPinSalidaSocketBad {
  ps_id: number;
  pin: number;
  es_id: number | null;
  descripcion: string | null;
  estado: number | null;
  activo: number | null;
  automatico: boolean;
  ctrl_id: number;
  orden: number | null;

  constructor(props: IPinSalidaSocketBad) {
    const {activo,ctrl_id,descripcion,es_id,estado,pin,ps_id,automatico,orden,} = props;
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

  public setPsId(ps_id: IPinSalidaSocketBad["ps_id"]): void {
    this.ps_id = ps_id;
  }
  public setPin(pin: IPinSalidaSocketBad["pin"]): void {
    this.pin = pin;
  }
  public setEsId(es_id: IPinSalidaSocketBad["es_id"]): void {
    this.es_id = es_id;
  }
  public setDescripcion(descripcion: IPinSalidaSocketBad["descripcion"]): void {
    this.descripcion = descripcion;
  }
  public setActivo(activo: IPinSalidaSocketBad["activo"]): void {
    this.activo = activo;
  }
  public setEstado(estado: IPinSalidaSocketBad["estado"]): void {
    this.estado = estado;
  }
  public setCtrlId(ctrl_id: IPinSalidaSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }
  public setAutomatico(automatico: IPinSalidaSocketBad["automatico"]): void {
    this.automatico = automatico;
  }
  public setOrden(orden: IPinSalidaSocketBad["orden"]): void {
    this.orden = orden;
  }

  public toJSON(): IPinSalidaSocketBad {
    const result: IPinSalidaSocketBad = {
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

export class PinSalidaSocketObserver implements PinSalidaObserver {
  private socket: SocketPinSalida;

  constructor(socket: SocketPinSalida) {
    this.socket = socket;
  }

  updateEquiposSalida(data: EquipoSalida[]): void {
    this.socket.nsp.emit("equipos_salida", data);
  }

  updateListPinesSalida(data: IPinSalidaSocket[], info: EquipoSalida): void {
    this.socket.nsp.emit("list_pines_salida", data, info);
  }

  updateItemPinSalida(data: IPinSalidaSocket): void {
    this.socket.nsp.emit("item_pin_salida", data);
  }
}

export class PinSalidaManager {

  static map: { [ctrl_id: number]: { [es_id: number]: EquSalPinSalida } } = {};
  private static equiposalida: EquipoSalida[] = [];
  static observers: { [ctrl_id: string]: PinSalidaObserver } = {};
  static readonly ES_ID_ARMADO : number = 21

  public static registerObserver( ctrl_id: number, observer: PinSalidaObserver ): void {
    if (!PinSalidaManager.observers[ctrl_id]) {
      PinSalidaManager.observers[ctrl_id] = observer;
    }
  }

  public static unregisterObserver(ctrl_id: number): void {
    if (PinSalidaManager.observers[ctrl_id]) {
      delete PinSalidaManager.observers[ctrl_id];
    }
  }
  
  public static notifyEquiposSalida( ctrl_id: number, data: EquipoSalida[] ): void {
    if (PinSalidaManager.observers[ctrl_id]) {
      const equiSalFiltered = data.filter((equiSal)=> equiSal.es_id !== PinSalidaManager.ES_ID_ARMADO)
      PinSalidaManager.observers[ctrl_id].updateEquiposSalida(equiSalFiltered);
    }
  }

  public static notifyListPinesSalida( ctrl_id: number, equipo_salida: EquipoSalida, data: IPinSalidaSocket[] ): void {
    if (PinSalidaManager.observers[ctrl_id]) {
      if(equipo_salida.es_id !== PinSalidaManager.ES_ID_ARMADO){
        PinSalidaManager.observers[ctrl_id].updateListPinesSalida( data, equipo_salida );
      }
    }
  }

  public static notifyItemPinSalida( ctrl_id: number, data: IPinSalidaSocket ): void {
    if (PinSalidaManager.observers[ctrl_id]) {
      if(data.es_id !== PinSalidaManager.ES_ID_ARMADO){
        PinSalidaManager.observers[ctrl_id].updateItemPinSalida(data);
      }
    }
  }

  private static exists(args: { ctrl_id: string; ps_id: string }) {
    const { ctrl_id, ps_id } = args;

    let found_ctrl_id: number = -1;
    let found_es_id: number = -1;
    let found_ps_id: number = -1;

    for (const ctrl_id_key in PinSalidaManager.map) {
      if (ctrl_id_key == ctrl_id) {
        found_ctrl_id = Number(ctrl_id_key);
        for (const es_id_key in PinSalidaManager.map[ctrl_id_key]) {
          for (const ps_id_key in PinSalidaManager.map[ctrl_id_key][es_id_key].pines_salida) {
            if (ps_id_key == ps_id) {
              found_es_id = Number(es_id_key);
              found_ps_id = Number(ps_id_key);
            }
          }
        }
      }

    }
    const newResult = {
      exists: found_ctrl_id > -1 && found_es_id > -1 && found_ps_id > -1,
      data: { ctrl_id: found_ctrl_id, es_id: found_es_id, ps_id: found_ps_id },
    };
    return newResult;
  }

  private static add(pinSal: PinSalidaSocket) {

    const { ctrl_id, ps_id, es_id } = pinSal.toJSON();

    if (!PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
      PinSalidaManager.map[ctrl_id] = {};
    }

    if (!PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)) {
      const foundEquiSalida = PinSalidaManager.equiposalida.find( (equiSal) => equiSal.es_id == es_id );
      if (foundEquiSalida) {
        PinSalidaManager.map[ctrl_id][es_id] = {...foundEquiSalida,pines_salida: {},};
        const newEquipSal = PinSalidaManager.getEquiposSalida(ctrl_id);
        PinSalidaManager.notifyEquiposSalida(ctrl_id, newEquipSal);
      } else {
        return; // No llegara a este caso:
        // PinSalidaManager.map[ctrl_id][es_id] = { activo:1, actuador:"no_definido", descripcion:"no_definido", es_id:es_id, pines_salida:{}}
      }
    }
    if ( !PinSalidaManager.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id) ) {
      PinSalidaManager.map[ctrl_id][es_id].pines_salida[ps_id] = pinSal;
      const newListPinSal = PinSalidaManager.getListPinesSalida( ctrl_id, es_id );
      const { pines_salida, ...equisal } = PinSalidaManager.map[ctrl_id][es_id];
      PinSalidaManager.notifyListPinesSalida(ctrl_id, equisal, newListPinSal);
    }
  }

  private static update(pinSal: PinSalidaSocket) {
    const { ctrl_id, ps_id, es_id, activo, automatico, descripcion, estado, orden, pin, } = pinSal.toJSON();

    if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
      if (PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)) {
        if (PinSalidaManager.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id)) {

          const currentPinSal = PinSalidaManager.map[ctrl_id][es_id].pines_salida[ps_id];
          if (currentPinSal.ps_id != ps_id) currentPinSal.setPsId(ps_id);
          if (currentPinSal.automatico != automatico) currentPinSal.setAutomatico(automatico);
          if (currentPinSal.descripcion != descripcion) currentPinSal.setDescripcion(descripcion);
          if (currentPinSal.estado != estado) currentPinSal.setEstado(estado);
          if (currentPinSal.orden != orden) currentPinSal.setOrden(orden);
          if (currentPinSal.pin != pin) currentPinSal.setPin(pin);
          if (currentPinSal.activo != activo) {
            currentPinSal.setActivo(activo);
            const newListPinSal = PinSalidaManager.getListPinesSalida( ctrl_id, es_id );
            const { pines_salida, ...equisal } = PinSalidaManager.map[ctrl_id][es_id];
            PinSalidaManager.notifyListPinesSalida( ctrl_id, equisal, newListPinSal );
          }
          PinSalidaManager.notifyItemPinSalida(ctrl_id, pinSal.toJSON());
        }
      }
    }
  }

  public static async init() {
    try {
      const equiSalidaData = await PinSalida.getEquiposSalida();
      PinSalidaManager.equiposalida = equiSalidaData;

      const pinSalidaData = await PinSalida.getAllPinesSalida();
      for (const pinSal of pinSalidaData) {
        const newPinSalida = new PinSalidaSocket({...pinSal,automatico: false,orden: 0,});
        PinSalidaManager.add_update(newPinSalida);
      }
    } catch (error) {
      genericLogger.error(`Error al inicializar pines salida | PinSalidaManager`,error);
      throw error;
    }
  }

  public static delete( pinSal: PinSalidaSocket | PinSalidaSocketBad, permanent: boolean = false ) {
    if (pinSal instanceof PinSalidaSocket) {
      const { ctrl_id, ps_id, es_id } = pinSal.toJSON();
      if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
        if (PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)) {
          if (PinSalidaManager.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id)) {
            if (permanent) {
              delete PinSalidaManager.map[ctrl_id][es_id].pines_salida[ps_id];
            } else {
              PinSalidaManager.map[ctrl_id][es_id].pines_salida[ps_id].setActivo(0);
            }
            const newListPinSal = PinSalidaManager.getListPinesSalida(ctrl_id,es_id);
            const { pines_salida, ...equisal } = PinSalidaManager.map[ctrl_id][es_id];
            PinSalidaManager.notifyListPinesSalida(ctrl_id,equisal,newListPinSal);
          }
        }
      }
    } else {
      const { ctrl_id, ps_id } = pinSal.toJSON();
      const newPinSalSocket = PinSalidaManager.getEsId(pinSal);
      if (newPinSalSocket) {
        if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
          if (PinSalidaManager.map[ctrl_id].hasOwnProperty(newPinSalSocket.es_id)) {
            if (PinSalidaManager.map[ctrl_id][newPinSalSocket.es_id].pines_salida.hasOwnProperty(ps_id)) {
              if (permanent) {
                delete PinSalidaManager.map[ctrl_id][newPinSalSocket.es_id].pines_salida[ps_id];
              } else {
                PinSalidaManager.map[ctrl_id][newPinSalSocket.es_id].pines_salida[ps_id].setActivo(0);
              }
              const newListPinSal = PinSalidaManager.getListPinesSalida(ctrl_id,newPinSalSocket.es_id);
              const { pines_salida, ...equisal } = PinSalidaManager.map[ctrl_id][newPinSalSocket.es_id];
              PinSalidaManager.notifyListPinesSalida(ctrl_id,equisal,newListPinSal);
            }
          }
        }
      }
    }
  }

  public static add_update(pinSal: PinSalidaSocket | PinSalidaSocketBad) {

    const existsInfo = PinSalidaManager.exists({ ctrl_id: String(pinSal.ctrl_id), ps_id: String(pinSal.ps_id), });

    if (pinSal instanceof PinSalidaSocket) {
      if (!existsInfo.exists) {
        PinSalidaManager.add(pinSal);
      } else {
        if (existsInfo.data.es_id != pinSal.es_id) {
          // cambio equipo acceso
          const currentPinSal = PinSalidaManager.map[existsInfo.data.ctrl_id][existsInfo.data.es_id] .pines_salida[existsInfo.data.ps_id];
          PinSalidaManager.delete(currentPinSal, true);
          PinSalidaManager.add(pinSal);
        } else {
          PinSalidaManager.update(pinSal);
        }
      }
    } else {
      const {ps_id,ctrl_id,activo,automatico,descripcion,es_id,estado,orden,pin,} = pinSal.toJSON();
      if (!existsInfo.exists) {
        if ( es_id != null && activo != null && automatico != null && descripcion != null && estado != null && orden != null && pin != null ) {
          const newPinSalSocket = new PinSalidaSocket({ps_id,ctrl_id,es_id,activo,automatico,descripcion,estado,orden,pin,});
          PinSalidaManager.add(newPinSalSocket);
        }
      } else {
        // actualizar
        const currentPinSal = PinSalidaManager.map[existsInfo.data.ctrl_id][existsInfo.data.es_id].pines_salida[existsInfo.data.ps_id];

        const newPinSalProps = { ...currentPinSal };

        if (newPinSalProps.automatico != automatico) newPinSalProps.automatico = automatico;
        if (descripcion !== null && newPinSalProps.descripcion != descripcion) newPinSalProps.descripcion = descripcion;
        if (estado !== null && newPinSalProps.estado != estado) newPinSalProps.estado = estado;
        if (orden !== null && newPinSalProps.orden != orden) newPinSalProps.orden = orden;
        if (newPinSalProps.pin != pin) newPinSalProps.pin = pin;
        if (activo !== null && newPinSalProps.activo != activo) newPinSalProps.activo = activo;
        if (es_id !== null && existsInfo.data.es_id != es_id) {
          PinSalidaManager.delete(currentPinSal, true);
          const newPinSalSocket = new PinSalidaSocket({ ...newPinSalProps, es_id: es_id, });
          PinSalidaManager.add(newPinSalSocket);
          return;
        }

        const newPinSalSocket = new PinSalidaSocket({ ...newPinSalProps });
        PinSalidaManager.update(newPinSalSocket);
      }
    }
  }

  public static updateArmado(ctrl_id:number, newState: 0 | 1){

    if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
      if (PinSalidaManager.map[ctrl_id].hasOwnProperty(PinSalidaManager.ES_ID_ARMADO)) {
        const currPinSalArmado = PinSalidaManager.map[ctrl_id][PinSalidaManager.ES_ID_ARMADO].pines_salida
        Object.values(currPinSalArmado).forEach((pinSal)=>{
            if(pinSal.estado !== newState){
                pinSal.setEstado(newState);
                PinSalidaManager.notifyItemPinSalida(ctrl_id, pinSal)
            }
        })

      }
    }
  }

  private static getEsId(pinSal: PinSalidaSocketBad) {
    const { ps_id, ctrl_id} = pinSal.toJSON();

    let foundPinSalida: PinSalidaSocket | null = null;
    for (const ctrl_id_key in PinSalidaManager.map) {
      if (ctrl_id_key == String(ctrl_id)) {
        for (const es_id_key in PinSalidaManager.map[ctrl_id_key]) {
          for (const ps_id_key in PinSalidaManager.map[ctrl_id_key][es_id_key].pines_salida) {
            if (ps_id_key == String(ps_id)) {
              foundPinSalida = PinSalidaManager.map[ctrl_id_key][es_id_key].pines_salida[ps_id_key];
              return foundPinSalida
            }
          }
        }
      }
    }
    return foundPinSalida;
  }

  public static getEquiposSalida(ctrl_id: number): EquipoSalida[] {
    let result: EquipoSalida[] = [];
    if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
      for (const es_id_key in PinSalidaManager.map[ctrl_id]) {
        const { pines_salida, ...equisal } = PinSalidaManager.map[ctrl_id][es_id_key];
        if (PinSalidaManager.hasActivesPinesSalida(pines_salida)) {
          result.push(equisal);
        }
      }
    }
    const resultOrdered = result.sort((a, b) => a.es_id - b.es_id);
    return resultOrdered;
  }

  public static getListPinesSalida( ctrl_id: number, es_id: number ): IPinSalidaSocket[] {
    let result: IPinSalidaSocket[] = [];
    if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
      if (PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)) {
        const pinesSalida = PinSalidaManager.map[ctrl_id][es_id].pines_salida;
        const pinesSalidaActives = Object.values(pinesSalida).reduce<IPinSalidaSocket[]>(
          (acc, cur) => {
            const prevResult = acc;
            if (cur.activo == 1) {
              prevResult.push(cur.toJSON());
            }
            return prevResult;
          },
          []
        );

        result = pinesSalidaActives;
      }
    }
    const pinesSalidaActivesOrdered = result.sort((a, b) => a.ps_id - b.ps_id);
    return pinesSalidaActivesOrdered;
  }

  public static getItemPinSalida( ctrl_id: number, es_id: number, ps_id: number ) {
    let resultData: IPinSalidaSocket | null = null;
    if (PinSalidaManager.map.hasOwnProperty(ctrl_id)) {
      if (PinSalidaManager.map[ctrl_id].hasOwnProperty(es_id)) {
        if ( PinSalidaManager.map[ctrl_id][es_id].pines_salida.hasOwnProperty(ps_id) ) {
          resultData = PinSalidaManager.map[ctrl_id][es_id].pines_salida[ps_id].toJSON();
        }
      }
    }

    return resultData;
  }

  private static hasActivesPinesSalida( pines_salida: EquSalPinSalida["pines_salida"] ): boolean {
    const hasActive = Object.values(pines_salida).some((ps) => ps.activo === 1);
    return hasActive;
  }
}