import { Socket } from "socket.io";
import { IPinesEntradaSocket, IPinesEntradaSocketBad, PinesEntradaObserver } from "./pinentrada.types";
import { EquipoEntrada, PinesEntrada } from "../../../types/db";
import { PinEntrada } from "../../../models/site";
import { AlarmManager } from "../alarm";

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

  public toJSON(): IPinesEntradaSocket {
    const result: IPinesEntradaSocket = {
      pe_id: this.pe_id,
      pin: this.pin,
      ee_id: this.ee_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
    };
    return result;
  }
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
  public setDescripcion(
    descripcion: IPinesEntradaSocketBad["descripcion"]
  ): void {
    this.descripcion = descripcion;
  }
  public setEstado(estado: IPinesEntradaSocketBad["estado"]): void {
    this.estado = estado;
  }
  public setActivo(activo: IPinesEntradaSocketBad["activo"]): void {
    this.activo = activo;
  }

  public toJSON(): IPinesEntradaSocketBad {
    const result: IPinesEntradaSocketBad = {
      pe_id: this.pe_id,
      pin: this.pin,
      ee_id: this.ee_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
    };
    return result;
  }
}

export class PinesSalidaSocketObserver implements PinesEntradaObserver {
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
  
export class PinEntradaManager {
  static map: { [ctrl_id: string]: { [pe_id: string]: PinesEntradaSocket } } = {};
  private static equipoentrada: EquipoEntrada[] = [];
  static observers: { [ctrl_id: string]: PinesEntradaObserver } = {};

  public static registerObserver( ctrl_id: number, observer: PinesEntradaObserver ): void {
    if (!PinEntradaManager.observers[ctrl_id]) {
      PinEntradaManager.observers[ctrl_id] = observer;
    }
  }
  public static unregisterObserver(ctrl_id: number): void {
    if (PinEntradaManager.observers[ctrl_id]) {
      delete PinEntradaManager.observers[ctrl_id];
    }
  }
  public static notifyListPinesEntrada(data: PinesEntradaSocket): void {
    if (PinEntradaManager.observers[data.ctrl_id]) {
      let listPinEntrada = PinEntradaManager.getListPinesEntrada(
        String(data.ctrl_id)
      );
      PinEntradaManager.observers[data.ctrl_id].updateListPinesEntrada(
        listPinEntrada
      );
    }
  }
  public static notifyItemPinEntrada(data: PinesEntradaSocket): void {
    if (PinEntradaManager.observers[data.ctrl_id]) {
      PinEntradaManager.observers[data.ctrl_id].updateItemPinEntrada(
        data.toJSON()
      );
    }
  }

  public static notifyControllerMode(ctrl_id: number, data: 0 | 1): void {
    if (PinEntradaManager.observers[ctrl_id]) {
      PinEntradaManager.observers[ctrl_id].updateControllerMode(data);
    }
  }
  public static notifyControllerSecurity(ctrl_id: number, data: 0 | 1): void {
    if (PinEntradaManager.observers[ctrl_id]) {
      PinEntradaManager.observers[ctrl_id].updateControllerSecurity(data);
    }
  }

  private static exists(args: { ctrl_id: string; pe_id: string }) {
    const { ctrl_id, pe_id } = args;

    let is_ctrl_id: boolean = false;
    let is_pe_id: boolean = false;

    for (const ctrl_id_key in PinEntradaManager.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
        for (const pe_id_key in PinEntradaManager.map[ctrl_id_key]) {
          if (pe_id_key == pe_id) {
            is_pe_id = true;
            return is_ctrl_id && is_pe_id;
          }
        }
      }
    }

    return is_ctrl_id && is_pe_id;
  }

  private static add(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id } = pinEnt.toJSON();

    if (!PinEntradaManager.map.hasOwnProperty(ctrl_id)) {
      PinEntradaManager.map[ctrl_id] = {};
    }

    if (!PinEntradaManager.map[ctrl_id].hasOwnProperty(pe_id)) {
      PinEntradaManager.map[ctrl_id][pe_id] = pinEnt;
      PinEntradaManager.notifyListPinesEntrada(pinEnt);
      AlarmManager.notifyPinEntrada(ctrl_id,pe_id,"add");
    }
  }

  private static update(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id, activo, descripcion, ee_id, estado, pin } =
      pinEnt.toJSON();
    if (PinEntradaManager.map.hasOwnProperty(ctrl_id)) {
      if (PinEntradaManager.map[ctrl_id].hasOwnProperty(pe_id)) {
        const currentPinEntrada = PinEntradaManager.map[ctrl_id][pe_id];

        if (currentPinEntrada.descripcion != descripcion)
          currentPinEntrada.setDescripcion(descripcion);
        if (currentPinEntrada.ee_id != ee_id) currentPinEntrada.setEeId(ee_id);
        if (currentPinEntrada.estado != estado)
          currentPinEntrada.setEstado(estado);
        if (currentPinEntrada.pin != pin) currentPinEntrada.setPin(pin);
        if (currentPinEntrada.activo != activo) {
          currentPinEntrada.setActivo(activo);
          PinEntradaManager.notifyListPinesEntrada(pinEnt);
        }

        PinEntradaManager.notifyItemPinEntrada(pinEnt);
        AlarmManager.notifyPinEntrada(ctrl_id,pe_id,"update");
      }
    }
  }

  public static async init() {
    try {
      const equiEntradaData = await PinEntrada.getEquiposEntrada();
      PinEntradaManager.equipoentrada = equiEntradaData;

      const pinEntradaData = await PinEntrada.getAllPinesEntrada();
      for (let pinEntrada of pinEntradaData) {
        let newPinSalida = new PinesEntradaSocket(pinEntrada);
        PinEntradaManager.add_update(newPinSalida);
      }
    } catch (error) {
      console.log(
        `Socket Pines Entrada | PinEntradaManager | Error al inicilizar equipos de entrada`
      );
      console.error(error);
      throw error
    }
  }

  public static delete(pinEnt: PinesEntradaSocket | PinesEntradaSocketBad) {
    if (pinEnt instanceof PinesEntradaSocket) {
      const { ctrl_id, pe_id } = pinEnt.toJSON();
      if (PinEntradaManager.map.hasOwnProperty(ctrl_id)) {
        if (PinEntradaManager.map[ctrl_id].hasOwnProperty(pe_id)) {
          PinEntradaManager.map[ctrl_id][pe_id].setActivo(0);
          // Notificar observer
          PinEntradaManager.notifyListPinesEntrada(pinEnt);
          AlarmManager.notifyPinEntrada(ctrl_id,pe_id,"delete");
        }
      }
    } else {
      const { ctrl_id, pe_id } = pinEnt.toJSON();
      if (ctrl_id != null && pe_id != null) {
        const currentPinEntrada = PinEntradaManager.getPinEntrada(
          String(ctrl_id),
          String(pe_id)
        );
        if (currentPinEntrada) {
          currentPinEntrada.setActivo(0);
          // Notificar observer
          PinEntradaManager.notifyListPinesEntrada(currentPinEntrada);
          AlarmManager.notifyPinEntrada(ctrl_id,pe_id,"delete");
        }
      }
    }
  }

  public static add_update(pinEnt: PinesEntradaSocket | PinesEntradaSocketBad) {
    if (pinEnt instanceof PinesEntradaSocket) {
      const { pe_id, ctrl_id } = pinEnt.toJSON();
      const exists = PinEntradaManager.exists({
        ctrl_id: String(ctrl_id),
        pe_id: String(pe_id),
      });

      if (!exists) {
        PinEntradaManager.add(pinEnt);
      } else {
        PinEntradaManager.update(pinEnt);
      }
    } else {
      const { pe_id, ctrl_id, activo, descripcion, ee_id, estado, pin } = pinEnt.toJSON();
      if (pe_id != null && ctrl_id != null) {
        const currentPinEntrada = PinEntradaManager.getPinEntrada( String(ctrl_id), String(pe_id) );
        if (currentPinEntrada) {
          // existe pin entrada
          // actualizar
          if ( descripcion !== null && currentPinEntrada.descripcion != descripcion ) currentPinEntrada.setDescripcion(descripcion);
          if (ee_id !== null && currentPinEntrada.ee_id != ee_id) currentPinEntrada.setEeId(ee_id);
          if (estado !== null && currentPinEntrada.estado != estado) currentPinEntrada.setEstado(estado);
          if (pin !== null && currentPinEntrada.pin != pin) currentPinEntrada.setPin(pin);
          if (activo !== null && currentPinEntrada.activo != activo) {
            currentPinEntrada.setActivo(activo);
            PinEntradaManager.notifyListPinesEntrada(currentPinEntrada);
          }

          // Notificar observer
          PinEntradaManager.notifyItemPinEntrada(currentPinEntrada);
          AlarmManager.notifyPinEntrada(ctrl_id,pe_id,"update");

        } else {
          // agregar
          if ( activo != null && descripcion != null && ee_id != null && estado != null && pin != null ) {
            const newPinEntrada = new PinesEntradaSocket({ pe_id, ctrl_id, activo, descripcion, ee_id, estado, pin, });
            PinEntradaManager.add(newPinEntrada);
            AlarmManager.notifyPinEntrada(ctrl_id,pe_id,"add");
          }
        }
      }
    }
  }

  public static getPinEntrada(ctrl_id: string, pe_id: string) {
    let resultData: PinesEntradaSocket | null = null;
    if (PinEntradaManager.map.hasOwnProperty(ctrl_id)) {
      if (PinEntradaManager.map[ctrl_id].hasOwnProperty(pe_id)) {
        resultData = PinEntradaManager.map[ctrl_id][pe_id];
      }
    }
    return resultData;
  }

  public static getListPinesEntrada(ctrl_id: string) {
    let resultData: IPinesEntradaSocket[] = [];
    if (PinEntradaManager.map.hasOwnProperty(ctrl_id)) {
      for (const pe_id_key in PinEntradaManager.map[ctrl_id]) {
        let sensorData = PinEntradaManager.map[ctrl_id][pe_id_key].toJSON();
        if (sensorData.activo == 1) {
          resultData.push(sensorData);
        }
      }
    }
    let orderedResult = resultData.sort((a, b) => a.estado - b.estado);
    return orderedResult;
  }
}

// (()=>{
//   setTimeout(() => {
//     const pinSal = new PinesEntradaSocket({
//       pe_id: 1,
//       pin: 1,
//       ee_id: 1,
//       descripcion: 'Entrada 1',
//       estado: 1,
//       activo: 1,
//       ctrl_id:4
//     });
  
//     PinEntradaManager.add_update(pinSal)
//   }, 20000);
// })()