import { Temperatura } from "../../../models/site/temperatura";
import { SensorTemperaturaSocket, SensorTemperaturaSocketBad, SensorTemperatureObserver, SenTempAction, SenTempState, SocketSenTemperature } from "./sensor.temperatura.types";

export class SenTempSocketObserver implements SensorTemperatureObserver {
  #socket: SocketSenTemperature;

  constructor(socket: SocketSenTemperature) {
    this.#socket = socket;
  }
  updateListSenTemp( data: SensorTemperaturaSocket, action: SenTempAction ): void {
    this.#socket.nsp.emit("list_temperature",data,action)
  }
  updateSenTemp(data: SensorTemperaturaSocket): void {
    this.#socket.nsp.emit("temperature",data)
  }
}

export class SenTemperaturaVO implements SensorTemperaturaSocket {
  st_id: number;
  serie: string;
  ubicacion: string;
  actual: number;
  activo: number;
  ctrl_id: number;

  constructor(props: SensorTemperaturaSocket) {
    const { ctrl_id, activo, actual, serie, st_id, ubicacion } = props;
    this.ctrl_id = ctrl_id;
    this.activo = activo;
    this.actual = actual;
    this.ubicacion = ubicacion;
    this.st_id = st_id;
    this.serie = serie;
  }

  public setCtrlId(ctrl_id: SensorTemperaturaSocket["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }

  public setStId(st_id: SensorTemperaturaSocket["st_id"]): void {
    this.st_id = st_id;
  }

  public setSerie(serie: SensorTemperaturaSocket["serie"]): void {
    this.serie = serie;
  }

  public setUbicacion(ubicacion: SensorTemperaturaSocket["ubicacion"]): void {
    this.ubicacion = ubicacion;
  }

  public setActual(actual: SensorTemperaturaSocket["actual"]): void {
    this.actual = actual;
  }

  public setActivo(activo: SensorTemperaturaSocket["activo"]): void {
    this.activo = activo;
  }

  public toJSON(): SensorTemperaturaSocket {
    const result: SensorTemperaturaSocket = {
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

export class SenTemperaturaBadVO implements SensorTemperaturaSocketBad {
  ctrl_id: number;
  st_id: number;
  serie: string | null;
  ubicacion: string | null;
  actual: number | null;
  activo: number | null;

  constructor(props: SensorTemperaturaSocketBad) {
    const { ctrl_id, activo, actual, serie, st_id, ubicacion } = props;
    this.ctrl_id = ctrl_id;
    this.activo = activo;
    this.actual = actual;
    this.ubicacion = ubicacion;
    this.st_id = st_id;
    this.serie = serie;
  }

  public setCtrlId(ctrl_id: SensorTemperaturaSocketBad["ctrl_id"]): void {
    this.ctrl_id = ctrl_id;
  }

  public setStId(st_id: SensorTemperaturaSocketBad["st_id"]): void {
    this.st_id = st_id;
  }

  public setSerie(serie: SensorTemperaturaSocketBad["serie"]): void {
    this.serie = serie;
  }

  public setUbicacion(ubicacion: SensorTemperaturaSocketBad["ubicacion"]): void {
    this.ubicacion = ubicacion;
  }

  public setActual(actual: SensorTemperaturaSocketBad["actual"]): void {
    this.actual = actual;
  }

  public setActivo(activo: SensorTemperaturaSocketBad["activo"]): void {
    this.activo = activo;
  }

  public toJSON(): SensorTemperaturaSocketBad {
    const result: SensorTemperaturaSocketBad = {
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

export class SensorTemperaturaManager  {
    static map: { [ctrl_id: number]: { [st_id: number]: SenTemperaturaVO }; } = {};
    static observers: {[ctrl_id: number]: SensorTemperatureObserver} = {};

    static registerObserver(ctrl_id: number, observer: SensorTemperatureObserver): void {
        if(!SensorTemperaturaManager.observers[ctrl_id]){
            SensorTemperaturaManager.observers[ctrl_id] = observer
        }
    }
    static unregisterObserver(ctrl_id: number): void {
        if (SensorTemperaturaManager.observers[ctrl_id]) {
          delete SensorTemperaturaManager.observers[ctrl_id];
        }
    }

    static notifyListSenTemp(ctrl_id: number, data: SensorTemperaturaSocket, action: SenTempAction): void {
        if(SensorTemperaturaManager.observers[ctrl_id]){
            SensorTemperaturaManager.observers[ctrl_id].updateListSenTemp(data,action)
        }
    }
    static notifySenTemp(ctrl_id: number, data: SensorTemperaturaSocket): void {
        if(SensorTemperaturaManager.observers[ctrl_id]){
            SensorTemperaturaManager.observers[ctrl_id].updateSenTemp(data)
        }
    }

    static #exists(args: { ctrl_id: number; st_id: number }) {
      const { ctrl_id, st_id } = args;
  
      let is_ctrl_id: boolean = false;
      let is_st_id: boolean = false;
  
      for (const ctrl_id_key in SensorTemperaturaManager.map) {
        if (Number(ctrl_id_key) == ctrl_id) {
          is_ctrl_id = true;
        }
        for (const st_id_key in SensorTemperaturaManager.map[ctrl_id_key]) {
          if (Number(st_id_key) == st_id) {
            is_st_id = true;
          }
        }
      }
  
      return is_ctrl_id && is_st_id;
    }
  
    static #add(sensor: SenTemperaturaVO) {
      const { ctrl_id, st_id } = sensor.toJSON();
  
      if (!SensorTemperaturaManager.map.hasOwnProperty(ctrl_id)) {
        SensorTemperaturaManager.map[ctrl_id] = {};
      }
  
      if (!SensorTemperaturaManager.map[ctrl_id].hasOwnProperty(st_id)) {
        SensorTemperaturaManager.map[ctrl_id][st_id] = sensor;
        if(sensor.activo === SenTempState.Activo){
          SensorTemperaturaManager.notifyListSenTemp(ctrl_id,sensor.toJSON(),"add");
        }
      }
    }
  
    static #update(sensor: SenTemperaturaVO) {
      const { ctrl_id, st_id, activo, actual, serie, ubicacion } = sensor.toJSON();
      if (SensorTemperaturaManager.map.hasOwnProperty(ctrl_id)) {
        if (SensorTemperaturaManager.map[ctrl_id].hasOwnProperty(st_id)) {
          const currentSenTemp = SensorTemperaturaManager.map[ctrl_id][st_id];
        //   if (currentSenTemp.ctrl_id != ctrl_id) currentSenTemp.setCtrlId(ctrl_id);
        //   if (currentSenTemp.st_id != st_id) currentSenTemp.setStId(st_id);
          if (currentSenTemp.actual != actual) currentSenTemp.setActual(actual);
          if (currentSenTemp.serie != serie) currentSenTemp.setSerie(serie);
          if (currentSenTemp.ubicacion != ubicacion) currentSenTemp.setUbicacion(ubicacion);
          if (currentSenTemp.activo != activo) {
            if(currentSenTemp.activo === SenTempState.Activo){
                SensorTemperaturaManager.notifyListSenTemp(ctrl_id, sensor.toJSON(),"delete");
            }
            if(currentSenTemp.activo === SenTempState.Desactivado){
                SensorTemperaturaManager.notifyListSenTemp(ctrl_id, sensor.toJSON(),"add");
            }
            currentSenTemp.setActivo(activo);

          };
          
          SensorTemperaturaManager.notifySenTemp(ctrl_id,sensor.toJSON())
  
        }
      }
    }
  
    public static async init() {
      try {
        let initData = await Temperatura.getAllSensoresTemperatura()
        for (let sensor of initData) {
          let newSenTemp = new SenTemperaturaVO(sensor);
          SensorTemperaturaManager.add_update(newSenTemp);
        }
      } catch (error) {
        console.log(`Socket Sensor Temperatura Map | SensorTemperaturaMap | Error al inicilizar sensores`)
        console.error(error)
        throw error
      }
    }
  
    public static delete(sensor: SenTemperaturaVO | SenTemperaturaBadVO ) {
      if(sensor instanceof SenTemperaturaVO ){
        const { ctrl_id, st_id } = sensor.toJSON();
        if (SensorTemperaturaManager.map.hasOwnProperty(ctrl_id)) {
          if (SensorTemperaturaManager.map[ctrl_id].hasOwnProperty(st_id)) {
            SensorTemperaturaManager.map[ctrl_id][st_id].setActivo(0);
            SensorTemperaturaManager.notifyListSenTemp(ctrl_id, sensor.toJSON(),"delete");
          }
        }
      }else{
        const { st_id, ctrl_id } = sensor.toJSON();
        if(st_id != null && ctrl_id != null){
          const currentSenTemp = SensorTemperaturaManager.getSensorTemperatura(ctrl_id,st_id)
          if(currentSenTemp !== null){
            SensorTemperaturaManager.map[ctrl_id][st_id].setActivo(0);
            SensorTemperaturaManager.notifyListSenTemp(ctrl_id, currentSenTemp.toJSON(),"delete");
          }
        }
      }
    }
  
    public static add_update(sensor: SenTemperaturaVO | SenTemperaturaBadVO) {
      if(sensor instanceof SenTemperaturaVO ){
        const { st_id, ctrl_id } = sensor.toJSON();
        const exists = SensorTemperaturaManager.#exists({st_id, ctrl_id });
    
        if (!exists) {
          SensorTemperaturaManager.#add(sensor);
        } else {
          SensorTemperaturaManager.#update(sensor);
        }
      }else{
        const { st_id, ctrl_id,activo,actual,serie,ubicacion } = sensor.toJSON();
        if(st_id != null && ctrl_id != null ){
          const currentSenTemp = SensorTemperaturaManager.getSensorTemperatura(ctrl_id,st_id)
          if(currentSenTemp){ // existe sensor temperatura
            // actualizar
            if(actual != null && currentSenTemp.actual != actual) currentSenTemp.setActual(actual);
            if(serie != null && currentSenTemp.serie != serie) currentSenTemp.setSerie(serie);
            if(ubicacion != null && currentSenTemp.ubicacion != ubicacion) currentSenTemp.setUbicacion(ubicacion);
            if (activo != null && currentSenTemp.activo != activo) {
              if (currentSenTemp.activo === SenTempState.Activo) {
                SensorTemperaturaManager.notifyListSenTemp(ctrl_id,currentSenTemp.toJSON(),"delete");
              }
              if (currentSenTemp.activo === SenTempState.Desactivado) {
                SensorTemperaturaManager.notifyListSenTemp(ctrl_id,currentSenTemp.toJSON(),"add");
              }

              currentSenTemp.setActivo(activo);
            } 
  
            SensorTemperaturaManager.notifySenTemp(ctrl_id,currentSenTemp.toJSON())
          }else{
            // agregar
            if( activo != null && actual != null && serie != null && ubicacion != null){
              const newSenTemp = new SenTemperaturaVO({ st_id, ctrl_id,activo,actual,serie,ubicacion})
              SensorTemperaturaManager.#add(newSenTemp);
            }
          }
        }
      }
    }
  
    public static getSensorTemperatura(ctrl_id: number,st_id: number){
      let result: SenTemperaturaVO | null = null;
      if (SensorTemperaturaManager.map.hasOwnProperty(ctrl_id)) {
        if(SensorTemperaturaManager.map[ctrl_id].hasOwnProperty(st_id)){
          result = SensorTemperaturaManager.map[ctrl_id][st_id]
        }
      }
      return result
  
    }
  
    public static getDataByCtrlID(ctrl_id: number) {
      let resultData: SensorTemperaturaSocket[] = [];
      if (SensorTemperaturaManager.map.hasOwnProperty(ctrl_id)) {
        for (const st_id_key in SensorTemperaturaManager.map[ctrl_id]) {
          let sensorData = SensorTemperaturaManager.map[ctrl_id][st_id_key].toJSON();
          if (sensorData.activo == 1) {
            resultData.push(sensorData);
          }
        }
      }
      let sortedData = resultData.sort((r1, r2) => r1.st_id - r2.st_id);
      return sortedData;
    }
  
}


// (()=>{
//   setInterval(()=>{

//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     const randomNumber2 = Math.floor(Math.random() * 11) + 20;

//     const newSensorTemp = new SenTemperaturaVO({activo:1,actual:randomNumber, ctrl_id:1,serie:"rewrew",st_id:1,ubicacion:"Ubicacion_test"})
//     const newSensorTemp2 = new SenTemperaturaVO({activo:1,actual:randomNumber2, ctrl_id:1,serie:"rewrew",st_id:2,ubicacion:"Ubicacion2"})

//     SensorTemperaturaManager.add_update(newSensorTemp)
//     SensorTemperaturaManager.add_update(newSensorTemp2)

//   },20000)

// })()