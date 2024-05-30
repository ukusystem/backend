import { Server, Socket } from "socket.io";
import { Controlador, EquipoSalida, PinesSalida } from "../../types/db";
import { MySQL2 } from "../../database/mysql";
import { RowDataPacket } from "mysql2";

const intervalPinesSalida : {[ctrl_id: string]: NodeJS.Timeout } = {}
let equiposSalida : EquipoSalida[] | null = null

interface PinesSalidaDataSocket {
  es_id: EquipoSalida["es_id"],
  actuador: EquipoSalida["actuador"],
  data: IPinesSalidaSocket[]
}

function getPinesSalidaData(pinesSalida: IPinesSalidaSocket[]): PinesSalidaDataSocket[]{
  if(equiposSalida !== null){

    // agrupar pines de salida por es_id
    let resultadoPrev = pinesSalida.reduce((acc,curr) => {
      const result = acc;
      const existingGroup = result.find(item => item.es_id === curr.es_id);
      if (existingGroup) {
        existingGroup.data.push(curr)
      } else {
        if(equiposSalida !== null){
          const findEquip = equiposSalida.find((equipo) => equipo.es_id === curr.es_id);
          if(findEquip){
            result.push({ es_id: curr.es_id,actuador: findEquip.actuador , data: [curr] });
          }
        }
      }

      return result
    },[] as PinesSalidaDataSocket[] )

    // ordenar por es_id
    let resultadoPrevSorted = resultadoPrev.sort((a,b)=> a.es_id - b.es_id)

    // ordenar data de cada actuador por ps_id
    const resultFinal : PinesSalidaDataSocket[] = resultadoPrevSorted.map((item) => {
      const { actuador, data, es_id } = item;
      let dataSorted = data.sort((a, b) => a.ps_id - b.ps_id);
      return { es_id, actuador, data: dataSorted };
    });

    return resultFinal

  }

  return []
}

interface EquipoSalidaRowData extends RowDataPacket, EquipoSalida {}

export const pinesSalidaSocket =async (io:Server, socket: Socket) => {
  
  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/pines_salida/ctrl_id"

  console.log(`Socket Pines Salida | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  if(equiposSalida == null){
    try {
      const equiSalData = await MySQL2.executeQuery<EquipoSalidaRowData[]>({sql: `SELECT * FROM general.equiposalida`})
      equiposSalida = equiSalData
    } catch (error) {
      console.log(`Socket Pines Salida | Error al obtener equipos de salida`)
      console.error(error)
    }
  }

  if(!intervalPinesSalida.hasOwnProperty(ctrl_id)){
    intervalPinesSalida[ctrl_id] = setInterval(() => {
      let data = PinesSalidaMap.getDataByCtrlID(ctrl_id)
      let finalData = getPinesSalidaData(data)
      // console.log(JSON.stringify(finalData))
      socket.nsp.emit("pinessalida", finalData);
    }, 1000)
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/pines_salida/${ctrl_id}`).sockets.size;
    console.log(`Socket Pines Salida | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      if(intervalPinesSalida.hasOwnProperty(ctrl_id)){
        console.log(`Socket Pines Salida | Eliminado SetInterval | ctrl_id = ${ctrl_id}`)
        clearInterval(intervalPinesSalida[ctrl_id])
        delete intervalPinesSalida[ctrl_id]
      }
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Pines Salida | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}

type IPinesSalidaSocket = PinesSalida & Pick<Controlador, "ctrl_id"> & {automatico: boolean , orden: number };

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
  // orden: 0 | 1 | -1;
  orden: number;

  constructor(props: IPinesSalidaSocket) {
    const { activo, ctrl_id, descripcion, es_id, estado, pin, ps_id, automatico, orden } = props;
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

export class PinesSalidaMap {
  static map : { [ctrl_id: string]: { [ps_id: string]: PinesSalidaSocket } } = {};

  private static exists(args: { ctrl_id: string; ps_id: string }) {
    const { ctrl_id, ps_id } = args;

    let is_ctrl_id: boolean = false;
    let is_ps_id: boolean = false;

    for (const ctrl_id_key in PinesSalidaMap.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const ps_id_key in PinesSalidaMap.map[ctrl_id_key]) {
        if (ps_id_key == ps_id) {
          is_ps_id = true;
        }
      }
    }

    return is_ctrl_id && is_ps_id;
  }

  private static add(pinSal: PinesSalidaSocket) {
    const { ctrl_id, ps_id } = pinSal.toJSON();

    if (!PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      PinesSalidaMap.map[ctrl_id] = {};
    }

    if (!PinesSalidaMap.map[ctrl_id].hasOwnProperty(ps_id)) {
      PinesSalidaMap.map[ctrl_id][ps_id] = pinSal;
    }
  }

  private static update(pinSal: PinesSalidaSocket) {
    const { ctrl_id, ps_id } = pinSal.toJSON();
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(ps_id)) {
        PinesSalidaMap.map[ctrl_id][ps_id] = pinSal;
      }
    }
  }

  public static delete(pinSal: PinesSalidaSocket) {
    const { ctrl_id, ps_id } = pinSal.toJSON();
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesSalidaMap.map[ctrl_id].hasOwnProperty(ps_id)) {
        delete PinesSalidaMap.map[ctrl_id][ps_id];
      }
    }
  }

  public static add_update(pinSal: PinesSalidaSocket) {
    const { ps_id, ctrl_id } = pinSal.toJSON();
    const exists = PinesSalidaMap.exists({ctrl_id: String(ctrl_id),ps_id: String(ps_id),});

    if (!exists) {
      PinesSalidaMap.add(pinSal);
    } else {
      PinesSalidaMap.update(pinSal);
    }
  }

  public static getDataByCtrlID(ctrl_id: string) {
    let resultData: IPinesSalidaSocket[] = [];
    if (PinesSalidaMap.map.hasOwnProperty(ctrl_id)) {
      for (const ps_id_key in PinesSalidaMap.map[ctrl_id]) {
        let sensorData = PinesSalidaMap.map[ctrl_id][ps_id_key].toJSON();
        if (sensorData.activo == 1) {
          resultData.push(sensorData);
        }
      }
    }
    return resultData;
  }

}


// (() => {

  // setInterval(() => {
  //   const randomNumber = Math.round(Math.random())
  //   const randomNumber2 = Math.round(Math.random());

  //   const newSensorTemp = new PinesSalidaSocket({ps_id: 1,pin: 1,es_id: 3,descripcion: "Salida 1",estado: randomNumber,activo: 1,automatico:true,ctrl_id:1,orden:0});
  //   const newSensorTemp2 = new PinesSalidaSocket({ ps_id: 2, pin: 2, es_id: 1, descripcion: "Salida 2", estado: randomNumber2, activo: 1,automatico:true,ctrl_id:1,orden:0 });

  //   PinesSalidaMap.add_update(newSensorTemp);
  //   PinesSalidaMap.add_update(newSensorTemp2);

  // }, 2000);

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesSalidaSocket({ ps_id: 3, pin: 3, es_id: 2, descripcion: "Salida 3", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
//     PinesSalidaMap.add_update(newSensorTemp)
//   },10000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesSalidaSocket({ ps_id: 10, pin: 10, es_id: 1, descripcion: "Salida N", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
//     PinesSalidaMap.add_update(newSensorTemp)
//   },10000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesSalidaSocket({ ps_id: 4, pin: 4, es_id: 5, descripcion: "Salida 4", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
//     PinesSalidaMap.add_update(newSensorTemp)
//   },20000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesSalidaSocket({ ps_id: 4, pin: 4, es_id: 5, descripcion: "Salida 4", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 })
//     PinesSalidaMap.delete(newSensorTemp)
//   },60000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesSalidaSocket({ ps_id: 3, pin: 3, es_id: 2, descripcion: "Salida 3", estado: randomNumber, activo: 1,automatico:false,ctrl_id:27,orden:0 });
//     PinesSalidaMap.delete(newSensorTemp)
//   },70000)

// })();