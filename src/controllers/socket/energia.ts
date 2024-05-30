import { Server, Socket } from "socket.io";
import { MySQL2 } from "../../database/mysql";
import { Controlador, MedidorEnergia } from "../../types/db";

export const energiaSocket = async (io: Server, socket: Socket) => {
  let intervalId: NodeJS.Timeout | null = null;
  if (!intervalId) {
    intervalId = setInterval(async () => {
      const nspEnergias = socket.nsp;

      const [, , ctrl_id] = nspEnergias.name.split("/");// Namespace : "/energias/nodo_id"

      const registroEnergias = await MySQL2.executeQuery({sql:`SELECT * FROM ${"nodo" + ctrl_id}.medidorenergia WHERE activo = 1`})

      socket.emit("energias", registroEnergias);
    }, 1000);
  }

  socket.on("disconnect", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  
};


const intervalEnergia : {[ctrl_id: string]: NodeJS.Timeout } = {}

export const moduloEnergiaSocket = async (io: Server, socket: Socket) => {
  
    const nspEnergia = socket.nsp;
    const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/modulo_energia/ctrl_id"

    console.log(`Socket Modulo Energia | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

    if(!intervalEnergia.hasOwnProperty(ctrl_id)){
      intervalEnergia[ctrl_id] = setInterval(() => {
        const data = MedidorEnergiaMap.getDataByCtrlID(ctrl_id)
        socket.nsp.emit("moduloenergia", data);
      }, 1000)
    }

    socket.on("disconnect", () => {
      const clientsCount = io.of(`/modulo_energia/${ctrl_id}`).sockets.size;
      console.log(`Socket Modulo Energia | clientes_conectados = ${clientsCount}| ctrl_id = ${ctrl_id}`);
      if (clientsCount == 0 ) {
        if(intervalEnergia.hasOwnProperty(ctrl_id)){
          console.log(`Socket Modulo Energia | Eliminado SetInterval | ctrl_id = ${ctrl_id}`)
          clearInterval(intervalEnergia[ctrl_id])
          delete intervalEnergia[ctrl_id]
        }
      }
    });
  
    socket.on("error", (error: any) => {
      console.log(`Socket Modulo Energia | Error | ctrl_id = ${ctrl_id}`)
      console.error(error)
    });

}

type IMedidorEnergiaSocket = MedidorEnergia & Pick<Controlador,"ctrl_id">

export class MedidorEnergiaSocket implements IMedidorEnergiaSocket {
  ctrl_id: number;
  me_id: number;
  serie: number | string;
  descripcion: string;
  voltaje: number;
  amperaje: number;
  fdp: number;
  frecuencia: number;
  potenciaw: number;
  potenciakwh: number;
  activo: number;

  constructor(props: IMedidorEnergiaSocket) {
    const {ctrl_id,me_id,serie,descripcion,voltaje,amperaje,fdp,frecuencia,potenciaw,potenciakwh ,activo} = props
    this.ctrl_id = ctrl_id;
    this.me_id = me_id;
    this.serie = serie;
    this.descripcion = descripcion;
    this.voltaje = voltaje;
    this.amperaje = amperaje;
    this.fdp = fdp;
    this.frecuencia = frecuencia;
    this.potenciaw = potenciaw;
    this.potenciakwh = potenciakwh;
    this.activo = activo
  }

  public toJSON(): IMedidorEnergiaSocket {
    const result : IMedidorEnergiaSocket = {
      ctrl_id: this.ctrl_id,
      me_id: this.me_id,
      serie: this.serie,
      descripcion: this.descripcion,
      voltaje: this.voltaje,
      amperaje: this.amperaje,
      fdp: this.fdp,
      frecuencia: this.frecuencia,
      potenciaw: this.potenciaw,
      potenciakwh: this.potenciakwh,
      activo: this.activo
    };
    return result;
  }

}

export class MedidorEnergiaMap {
  static map: { [ctrl_id: string]: { [me_id: string]: MedidorEnergiaSocket } } = {};

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
    }
  }

  private static update(medidor: MedidorEnergiaSocket) {
    const { ctrl_id, me_id } = medidor.toJSON();
    if (MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
      if (MedidorEnergiaMap.map[ctrl_id].hasOwnProperty(me_id)) {
        MedidorEnergiaMap.map[ctrl_id][me_id] = medidor;
      }
    }
  }

  public static delete(medidor: MedidorEnergiaSocket) {
    const { ctrl_id, me_id } = medidor.toJSON();
    if (MedidorEnergiaMap.map.hasOwnProperty(ctrl_id)) {
      if (MedidorEnergiaMap.map[ctrl_id].hasOwnProperty(me_id)) {
        delete MedidorEnergiaMap.map[ctrl_id][me_id];
      }
    }
  }

  public static add_update(medidor: MedidorEnergiaSocket) {
    const { me_id, ctrl_id } = medidor.toJSON();
    const exists = MedidorEnergiaMap.exists({ ctrl_id: String(ctrl_id), me_id: String(me_id), });

    if (!exists) {
      MedidorEnergiaMap.add(medidor);
    } else {
      MedidorEnergiaMap.update(medidor);
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
    let sortedData = resultData.sort((r1, r2) => r1.me_id- r2.me_id); // ordenamiento ascendente
    return sortedData;
  }

}


(() => {

  // setInterval(() => {
  //   const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
  //   const randomNumber2 = Math.floor(Math.random() * (220 - 200 + 1)) + 200;

  //   const newSensorTemp = new MedidorEnergiaSocket({ me_id: 4, serie: "SERIE4", descripcion: "Medidor 4", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 27 });
  //   const newSensorTemp2 = new MedidorEnergiaSocket({me_id: 6,serie: "SERIE6",descripcion: "Medidor 6 con transformador",voltaje: randomNumber2,amperaje: 0.23,fdp: 0.67,frecuencia: 59.9,potenciaw: 33.9,potenciakwh: 5.95,activo: 1,ctrl_id: 27,});

  //   MedidorEnergiaMap.add_update(newSensorTemp);
  //   MedidorEnergiaMap.add_update(newSensorTemp2);

  // }, 2000);

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
  //   const newSensorTemp = new MedidorEnergiaSocket({ me_id: 5, serie: "SERIE5", descripcion: "Medidor 5", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 27 });
  //   MedidorEnergiaMap.add_update(newSensorTemp)
  // },10000)

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
  //   const newSensorTemp = new MedidorEnergiaSocket({ me_id: 7, serie: "SERIE7", descripcion: "Medidor 7", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 27 });
  //   MedidorEnergiaMap.add_update(newSensorTemp)
  // },20000)

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
  //   const newSensorTemp = new MedidorEnergiaSocket({ me_id: 5, serie: "SERIE5", descripcion: "Medidor 5", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 27 });
  //   MedidorEnergiaMap.delete(newSensorTemp)
  // },60000)

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * (220 - 200 + 1)) + 200;
  //   const newSensorTemp = new MedidorEnergiaSocket({ me_id: 7, serie: "SERIE7", descripcion: "Medidor 7", voltaje: randomNumber, amperaje: 0, fdp: 0, frecuencia: 60, potenciaw: 0, potenciakwh: 0.03, activo: 1, ctrl_id: 27 });
  //   MedidorEnergiaMap.delete(newSensorTemp)
  // },70000)

})();