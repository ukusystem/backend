import { Server, Socket } from "socket.io";
import { Temperatura } from "../../models/site/temperatura";
import { Controlador, SensorTemperatura } from "../../types/db";


export const sensorTemperaturaSocket = async (io: Server, socket: Socket) => {
    
    let intervalId: NodeJS.Timeout | null = null; // Referencia al intervalo

    if (!intervalId) {
    intervalId = setInterval(async () => {
      const nspSensores = socket.nsp;
      const [, , ctrl_id , id] = nspSensores.name.split("/"); // Namespace : "/sensor_temperatura/ctrl_id/id" 

      const test = await Temperatura.getSensorDataByCtrlIdAndStId({ctrl_id: Number(ctrl_id), st_id: Number(id)})

      if( test){
        // const currentLoad = Math.floor(Math.random() * 11) + 10;
        const horaAleatoria = Math.floor(Math.random() * 24);
        socket.emit("temperatura", {hora_min: horaAleatoria, temperatura: test.actual});
      }
    }, 1000);
  }

  socket.on("disconnect", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

  socket.on("eror", () => {
    console.log("Error de conexion");
  });
};

const intervalSensorTemp : {[ctrl_id: string]: NodeJS.Timeout } = {}

export const sensorTemperaturaSocketFinal = async ( io: Server, socket: Socket ) => {

  const nspStream = socket.nsp;
  const [, , ctrl_id] = nspStream.name.split("/"); // Namespace : "/sensor_temperaturafinal/ctrl_id"
  console.log(`Socket Sensor Temperatura | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);
  if(!intervalSensorTemp.hasOwnProperty(ctrl_id)){
    intervalSensorTemp[ctrl_id] = setInterval(() => {
      const data = SensorTemperaturaMap.getDataByCtrlID(ctrl_id)
      socket.nsp.emit("temperaturafinal", data);
    }, 1000)
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/sensor_temperaturafinal/${ctrl_id}`).sockets.size;
    console.log(`Socket Sensor Temperatura | clientes_conectados = ${clientsCount}| ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      if(intervalSensorTemp.hasOwnProperty(ctrl_id)){
        console.log(`Socket Sensor Temperatura | Eliminado SetInterval | ctrl_id = ${ctrl_id}`)
        clearInterval(intervalSensorTemp[ctrl_id])
        delete intervalSensorTemp[ctrl_id]
      }
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Sensor Temperatura | Error | ctrl_id = ${ctrl_id}`)
      console.error(error)
  });
};


interface ISensorTemperaturaSocket {
  ctrl_id: number;
  st_id: number;
  serie: string | null;
  ubicacion: string | null;
  actual: number | null;
  activo: number | null;
}

export class SensorTemperaturaSocket implements ISensorTemperaturaSocket {
  ctrl_id: number;
  st_id: number;
  serie: string | null;
  ubicacion: string | null;
  actual: number | null;
  activo: number | null;

  constructor(props: ISensorTemperaturaSocket) {
    const { ctrl_id, activo, actual, serie, st_id, ubicacion } = props;
    this.ctrl_id = ctrl_id;
    this.activo = activo;
    this.actual = actual;
    this.ubicacion = ubicacion;
    this.st_id = st_id;
    this.serie = serie;
  }

  public setCtrlId(ctrl_id: ISensorTemperaturaSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }

  public setStId(st_id: ISensorTemperaturaSocket["st_id"]): void {
    this.st_id = st_id;
  }

  public setSerie(serie: ISensorTemperaturaSocket["serie"]): void {
    this.serie = serie;
  }

  public setUbicacion(ubicacion: ISensorTemperaturaSocket["ubicacion"]): void {
    this.ubicacion = ubicacion;
  }

  public setActual(actual: ISensorTemperaturaSocket["actual"]): void {
    this.actual = actual;
  }

  public setActivo(activo: ISensorTemperaturaSocket["activo"]): void {
    this.activo = activo;
  }

  public toJSON(): ISensorTemperaturaSocket {
    const result: ISensorTemperaturaSocket = {
      ctrl_id: this.ctrl_id,
      activo: this.activo,
      actual: this.actual,
      ubicacion: this.ubicacion,
      st_id: this.st_id,
      serie: this.serie,
    };
    return result;
  }
}

export class SensorTemperaturaMap {

  static map: { [ctrl_id: string]: { [st_id: string]: SensorTemperaturaSocket }; } = {};

  private static exists(args: { ctrl_id: string; st_id: string }) {
    const { ctrl_id, st_id } = args;

    let is_ctrl_id: boolean = false;
    let is_st_id: boolean = false;

    for (const ctrl_id_key in SensorTemperaturaMap.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const st_id_key in SensorTemperaturaMap.map[ctrl_id_key]) {
        if (st_id_key == st_id) {
          is_st_id = true;
        }
      }
    }

    return is_ctrl_id && is_st_id;
  }

  private static add(sensor: SensorTemperaturaSocket) {
    const { ctrl_id, st_id } = sensor.toJSON();

    if (!SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
      SensorTemperaturaMap.map[ctrl_id] = {};
    }

    if (!SensorTemperaturaMap.map[ctrl_id].hasOwnProperty(st_id)) {
      SensorTemperaturaMap.map[ctrl_id][st_id] = sensor;
    }
  }

  private static update(sensor: SensorTemperaturaSocket) {
    const { ctrl_id, st_id, activo, actual, serie, ubicacion } = sensor.toJSON();
    if (SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
      if (SensorTemperaturaMap.map[ctrl_id].hasOwnProperty(st_id)) {
        const currentSenTemp = SensorTemperaturaMap.map[ctrl_id][st_id];
        currentSenTemp.setCtrlId(ctrl_id);
        currentSenTemp.setStId(st_id);
        if (activo) currentSenTemp.setActivo(activo);
        if (actual) currentSenTemp.setActual(actual);
        if (serie) currentSenTemp.setSerie(serie);
        if (ubicacion) currentSenTemp.setUbicacion(ubicacion);
      }
    }
  }

  public static async init() {
    try {
      let initData = await Temperatura.getAllSensoresTemperatura()
      for (let sensor of initData) {
        let newSenTemp = new SensorTemperaturaSocket(sensor);
        SensorTemperaturaMap.add_update(newSenTemp);
      }
    } catch (error) {
      console.log(`Socket Sensor Temperatura Map | SensorTemperaturaMap | Error al inicilizar sensores`)
      console.error(error)
    }
  }

  public static delete(sensor: SensorTemperaturaSocket) {
    const { ctrl_id, st_id } = sensor.toJSON();
    if (SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
      if (SensorTemperaturaMap.map[ctrl_id].hasOwnProperty(st_id)) {
        SensorTemperaturaMap.map[ctrl_id][st_id].setActivo(0);
      }
    }
  }

  public static add_update(sensor: SensorTemperaturaSocket) {
    const { st_id, ctrl_id } = sensor.toJSON();
    const exists = SensorTemperaturaMap.exists({ ctrl_id: String(ctrl_id), st_id: String(st_id), });

    if (!exists) {
      SensorTemperaturaMap.add(sensor);
    } else {
      SensorTemperaturaMap.update(sensor);
    }
  }

  public static getDataByCtrlID(ctrl_id: string) {
    let resultData: ISensorTemperaturaSocket[] = [];
    if (SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
      for (const st_id_key in SensorTemperaturaMap.map[ctrl_id]) {
        let sensorData = SensorTemperaturaMap.map[ctrl_id][st_id_key].toJSON();
        if (sensorData.activo == 1) {
          resultData.push(sensorData);
        }
      }
    }
    let sortedData = resultData.sort((r1, r2) => r1.st_id > r2.st_id ? 1 : r1.st_id < r2.st_id ? -1 : 0 );
    return sortedData;
  }
}

// (()=>{
//   setInterval(()=>{

//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     const randomNumber2 = Math.floor(Math.random() * 11) + 20;

//     const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:1,ubicacion:"Ubicacion"})
//     const newSensorTemp2 = new SensorTemperaturaSocket({activo:1,actual:randomNumber2, ctrl_id:27,serie:"rewrew",st_id:2,ubicacion:"Ubicacion2"})

//     SensorTemperaturaMap.add_update(newSensorTemp)
//     SensorTemperaturaMap.add_update(newSensorTemp2)

//   },2000)

//   setTimeout(()=>{
//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:3,ubicacion:"Ubicacion3"})
//     SensorTemperaturaMap.add_update(newSensorTemp)
//   },10000)

//   setTimeout(()=>{
//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:4,ubicacion:"Ubicacion4"})
//     SensorTemperaturaMap.add_update(newSensorTemp)
//   },20000)

//   setTimeout(()=>{
//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:3,ubicacion:"Ubicacion3"})
//     SensorTemperaturaMap.delete(newSensorTemp)
//   },60000)
// })()
