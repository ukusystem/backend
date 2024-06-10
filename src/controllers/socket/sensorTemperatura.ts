import { Server, Socket } from "socket.io";
import { Temperatura } from "../../models/site/temperatura";
import { Controlador, SensorTemperatura } from "../../types/db";

export const sensorTemperaturaSocket = async (io: Server, socket: Socket) => {
  const nspSensores = socket.nsp;
  const [, ,ctrl_id ,st_id] = nspSensores.name.split("/"); // Namespace : "/sensor_temperatura/ctrl_id/id" 
  const observer = new TemperatureItemSocketObserver(socket);
  SensorTemperaturaMap.registerItemObserver(Number(ctrl_id),Number(st_id),observer)
  //emit initial data
  const data = SensorTemperaturaMap.getSensorTemperatura(ctrl_id,st_id)
  if(data){
    socket.nsp.emit("temperatura", data.toJSON());
  }
  
  socket.on("disconnect", () => {
    const clientsCount = io.of(`/sensor_temperatura/${ctrl_id}/${st_id}`).sockets.size;
      console.log(`Socket Sensor Temperatura Item | clientes_conectados = ${clientsCount}| ctrl_id = ${ctrl_id} | st_id = ${st_id}`);
      if (clientsCount == 0 ) {
        console.log(`Socket Sensor Temperatura Item | Eliminado Observer | ctrl_id = ${ctrl_id} | st_id = ${st_id}`)
        SensorTemperaturaMap.unregisterItemObserver(Number(ctrl_id),Number(st_id))
      }
  });
  
  socket.on("error", (error: any) => {
    console.log(`Socket Sensor Temperatura Item | Error | ctrl_id = ${ctrl_id} | st_id = ${st_id}`);
    console.error(error)
  });

};

export const sensorTemperaturaSocketFinal = async ( io: Server, socket: Socket ) => {

  const nspStream = socket.nsp;
  const [, , ctrl_id] = nspStream.name.split("/"); // Namespace : "/sensor_temperaturafinal/ctrl_id"
  console.log(`Socket Sensor Temperatura | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);
  
  const observerList = new TemperatureListSocketObserver(socket);
  SensorTemperaturaMap.registerListObserver(Number(ctrl_id),observerList)
  //emit initial data
  const data = SensorTemperaturaMap.getDataByCtrlID(ctrl_id)
  socket.nsp.emit("temperaturafinal", data);

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/sensor_temperaturafinal/${ctrl_id}`).sockets.size;
    console.log(`Socket Sensor Temperatura | clientes_conectados = ${clientsCount}| ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket Sensor Temperatura | Eliminado ListObserver | ctrl_id = ${ctrl_id}`)
      SensorTemperaturaMap.unregisterListObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Sensor Temperatura | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
};

interface TemperatureListObserver {
  update(data: ISensorTemperaturaSocket[]): void;
}

interface TemperatureItemObserver {
  update(data: ISensorTemperaturaSocket): void;
}

class TemperatureListSocketObserver implements TemperatureListObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }

  update(data: ISensorTemperaturaSocket[]): void {
      this.socket.nsp.emit("temperaturafinal", data);
  }
}

class TemperatureItemSocketObserver implements TemperatureItemObserver {
  private socket: Socket;

  constructor(socket: Socket) {
      this.socket = socket;
  }

  update(data: ISensorTemperaturaSocket): void {
    let nowDate = Date.now()
    this.socket.nsp.emit("temperatura", {...data,hora_min:nowDate});
  }
}

type ISensorTemperaturaSocket = SensorTemperatura & Pick<Controlador,"ctrl_id">

interface ISensorTemperaturaSocketBad {
  ctrl_id: number;
  st_id: number;
  serie: string | null;
  ubicacion: string | null;
  actual: number | null;
  activo: number | null;
}

export class SensorTemperaturaSocketBad implements ISensorTemperaturaSocketBad {
  ctrl_id: number;
  st_id: number;
  serie: string | null;
  ubicacion: string | null;
  actual: number | null;
  activo: number | null;

  constructor(props: ISensorTemperaturaSocketBad) {
    const { ctrl_id, activo, actual, serie, st_id, ubicacion } = props;
    this.ctrl_id = ctrl_id;
    this.activo = activo;
    this.actual = actual;
    this.ubicacion = ubicacion;
    this.st_id = st_id;
    this.serie = serie;
  }

  public setCtrlId(ctrl_id: ISensorTemperaturaSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }

  public setStId(st_id: ISensorTemperaturaSocketBad["st_id"]): void {
    this.st_id = st_id;
  }

  public setSerie(serie: ISensorTemperaturaSocketBad["serie"]): void {
    this.serie = serie;
  }

  public setUbicacion(ubicacion: ISensorTemperaturaSocketBad["ubicacion"]): void {
    this.ubicacion = ubicacion;
  }

  public setActual(actual: ISensorTemperaturaSocketBad["actual"]): void {
    this.actual = actual;
  }

  public setActivo(activo: ISensorTemperaturaSocketBad["activo"]): void {
    this.activo = activo;
  }

  public toJSON(): ISensorTemperaturaSocketBad {
    const result: ISensorTemperaturaSocketBad = {
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

export class SensorTemperaturaSocket implements ISensorTemperaturaSocket {
  st_id: number;
  serie: string;
  ubicacion: string;
  actual: number;
  activo: number;
  ctrl_id: number;

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

  static observers: {[ctrl_id: string]:{ [st_id: string]: TemperatureItemObserver }} = {};
  static listobservers: {[ctrl_id: string]:TemperatureListObserver} = {};

  public static registerItemObserver(ctrl_id: number,st_id: number, observer: TemperatureItemObserver): void {
    if(!SensorTemperaturaMap.observers[ctrl_id]){
      SensorTemperaturaMap.observers[ctrl_id] = {}
    }
    if(!SensorTemperaturaMap.observers[ctrl_id][st_id]){
      SensorTemperaturaMap.observers[ctrl_id][st_id] = observer
    }
  }

  public static registerListObserver(ctrl_id: number, observer: TemperatureListObserver): void {
    if(!SensorTemperaturaMap.listobservers[ctrl_id]){
      SensorTemperaturaMap.listobservers[ctrl_id] = observer
    }
  }

  public static unregisterItemObserver(ctrl_id: number,st_id: number): void {
    if(SensorTemperaturaMap.observers[ctrl_id]){
      if(SensorTemperaturaMap.observers[ctrl_id][st_id]){
        delete SensorTemperaturaMap.observers[ctrl_id][st_id]
      }
    }
  }

  public static unregisterListObserver(ctrl_id: number): void {
    if(SensorTemperaturaMap.listobservers[ctrl_id]){
      delete SensorTemperaturaMap.listobservers[ctrl_id]
    }
  }

  public static notifyItemObserver(ctrl_id: number,st_id: number,sensor: SensorTemperaturaSocket):void{
    if(SensorTemperaturaMap.observers[ctrl_id]){
      if(SensorTemperaturaMap.observers[ctrl_id][st_id]){
        SensorTemperaturaMap.observers[ctrl_id][st_id].update(sensor.toJSON())
      }
    }
  }

  public static notifyListObserver(ctrl_id: number,data: SensorTemperaturaSocket):void{
    if(SensorTemperaturaMap.listobservers[ctrl_id]){
      const tempList = SensorTemperaturaMap.getDataByCtrlID(String(data.ctrl_id))
      SensorTemperaturaMap.listobservers[ctrl_id].update(tempList)
    }
  }
  

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
      SensorTemperaturaMap.notifyListObserver(ctrl_id,sensor)
    }
  }

  private static update(sensor: SensorTemperaturaSocket) {
    const { ctrl_id, st_id, activo, actual, serie, ubicacion } = sensor.toJSON();
    if (SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
      if (SensorTemperaturaMap.map[ctrl_id].hasOwnProperty(st_id)) {
        const currentSenTemp = SensorTemperaturaMap.map[ctrl_id][st_id];
        if (currentSenTemp.ctrl_id != ctrl_id) currentSenTemp.setCtrlId(ctrl_id);
        if (currentSenTemp.st_id != st_id) currentSenTemp.setStId(st_id);
        if (currentSenTemp.actual != actual) currentSenTemp.setActual(actual);
        if (currentSenTemp.serie != serie) currentSenTemp.setSerie(serie);
        if (currentSenTemp.ubicacion != ubicacion) currentSenTemp.setUbicacion(ubicacion);
        if (currentSenTemp.activo != activo) {
          currentSenTemp.setActivo(activo)
          SensorTemperaturaMap.notifyListObserver(ctrl_id,sensor);
        };
        
        SensorTemperaturaMap.notifyItemObserver(ctrl_id,st_id,sensor)

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

  public static delete(sensor: SensorTemperaturaSocket | SensorTemperaturaSocketBad ) {
    if(sensor instanceof SensorTemperaturaSocket ){
      const { ctrl_id, st_id } = sensor.toJSON();
      if (SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
        if (SensorTemperaturaMap.map[ctrl_id].hasOwnProperty(st_id)) {
          SensorTemperaturaMap.map[ctrl_id][st_id].setActivo(0);
          SensorTemperaturaMap.notifyListObserver(ctrl_id,sensor)
        }
      }
    }else{
      const { st_id, ctrl_id } = sensor.toJSON();
      if(st_id != null && ctrl_id != null){
        const currentSenTemp = SensorTemperaturaMap.getSensorTemperatura(String(ctrl_id),String(st_id))
        if(currentSenTemp){
          SensorTemperaturaMap.map[ctrl_id][st_id].setActivo(0);
          SensorTemperaturaMap.notifyListObserver(ctrl_id,SensorTemperaturaMap.map[ctrl_id][st_id])
        }
      }
    }
  }

  public static add_update(sensor: SensorTemperaturaSocket | SensorTemperaturaSocketBad) {
    if(sensor instanceof SensorTemperaturaSocket ){
      const { st_id, ctrl_id } = sensor.toJSON();
      const exists = SensorTemperaturaMap.exists({ ctrl_id: String(ctrl_id), st_id: String(st_id), });
  
      if (!exists) {
        SensorTemperaturaMap.add(sensor);
      } else {
        SensorTemperaturaMap.update(sensor);
      }
    }else{
      const { st_id, ctrl_id,activo,actual,serie,ubicacion } = sensor.toJSON();
      if(st_id != null && ctrl_id != null ){
        const currentSenTemp = SensorTemperaturaMap.getSensorTemperatura(String(ctrl_id),String(st_id))
        if(currentSenTemp){ // existe sensor temperatura
          // actualizar
          if(actual != null && currentSenTemp.actual != actual) currentSenTemp.setActual(actual);
          if(serie != null && currentSenTemp.serie != serie) currentSenTemp.setSerie(serie);
          if(ubicacion != null && currentSenTemp.ubicacion != ubicacion) currentSenTemp.setUbicacion(ubicacion);
          if(activo != null && currentSenTemp.activo != activo){
            currentSenTemp.setActivo(activo);
            SensorTemperaturaMap.notifyListObserver(ctrl_id,currentSenTemp);
          } 

          SensorTemperaturaMap.notifyItemObserver(ctrl_id,st_id,currentSenTemp)
          // SensorTemperaturaMap.update(currentSenTemp)
        }else{
          // agregar
          if( activo != null && actual != null && serie != null && ubicacion != null){
            const newSenTemp = new SensorTemperaturaSocket({ st_id, ctrl_id,activo,actual,serie,ubicacion})
            SensorTemperaturaMap.add(newSenTemp);
          }
        }
      }
    }
  }

  public static getSensorTemperatura(ctrl_id: string,st_id: string){
    let result:SensorTemperaturaSocket | null = null;
    if (SensorTemperaturaMap.map.hasOwnProperty(ctrl_id)) {
      if(SensorTemperaturaMap.map[ctrl_id].hasOwnProperty(st_id)){
        result = SensorTemperaturaMap.map[ctrl_id][st_id]
      }
    }
    return result

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
    let sortedData = resultData.sort((r1, r2) => r1.st_id - r2.st_id);
    return sortedData;
  }

}

(()=>{
  // setInterval(()=>{

  //   const randomNumber = Math.floor(Math.random() * 11) + 20;
  //   const randomNumber2 = Math.floor(Math.random() * 11) + 20;

  //   const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:1,ubicacion:"Ubicacion"})
  //   const newSensorTemp2 = new SensorTemperaturaSocket({activo:1,actual:randomNumber2, ctrl_id:27,serie:"rewrew",st_id:2,ubicacion:"Ubicacion2"})

  //   SensorTemperaturaMap.add_update(newSensorTemp)
  //   SensorTemperaturaMap.add_update(newSensorTemp2)

  // },2000)

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * 11) + 20;
  //   const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:3,ubicacion:"Ubicacion3"})
  //   SensorTemperaturaMap.add_update(newSensorTemp)
  // },10000)

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * 11) + 20;
  //   const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:4,ubicacion:"Ubicacion4"})
  //   SensorTemperaturaMap.add_update(newSensorTemp)
  // },20000)

  // setTimeout(()=>{
  //   const randomNumber = Math.floor(Math.random() * 11) + 20;
  //   const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:3,ubicacion:"Ubicacion3"})
  //   SensorTemperaturaMap.delete(newSensorTemp)
  // },60000)
  //   setInterval(()=>{
  //   const randomNumber = Math.floor(Math.random() * 11) + 20;
  
  //   const newSensorTemp = new SensorTemperaturaSocket({activo:1,actual:randomNumber, ctrl_id:27,serie:"rewrew",st_id:3,ubicacion:"Ubicacion X"})
  //   SensorTemperaturaMap.add_update(newSensorTemp)
  // },2000)
})()
