import { Server, Socket } from "socket.io";
import { Controlador, EquipoEntrada, PinesEntrada } from "../../types/db";
import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../../database/mysql";

type PinesEntradaData = PinesEntrada & Pick<EquipoEntrada, "detector">
interface PinesEntradaRowsData extends PinesEntradaData ,RowDataPacket {}

export const pinesEntradaSocket =async (io:Server, socket: Socket) => {
    let intervalId: NodeJS.Timeout | null = null; 
    if (!intervalId) {
      intervalId = setInterval(async () => {
        const nspPinesEntrada = socket.nsp;
  
        const [,,ctrl_id] = nspPinesEntrada.name.split("/"); // Namespace: "/pines_entrada/ctrl_id"

        const pinesEntradaData = await MySQL2.executeQuery<PinesEntradaRowsData[]>({sql:`SELECT pe_id , pin , pe.ee_id , pe.descripcion, estado, pe.activo, detector FROM ${"nodo" + ctrl_id}.pinesentrada pe INNER JOIN  general.equipoentrada  ee ON pe.ee_id= ee.ee_id WHERE pe.activo = 1`})
    
        const resultObject : Record<string, PinesEntradaData[]> = {};
  
        pinesEntradaData.forEach((item) => {
          const key = item.detector;

          if (!resultObject[key]) {
            resultObject[key] = [];
          }

          resultObject[key].push(item);
        });

        socket.emit("pines_entrada", Object.values(resultObject));
      }, 1000);
    }
  
    socket.on("disconnect", () => {
      if(intervalId){
        clearInterval(intervalId);
        intervalId = null;
      }
    });
    
}


interface EquipoEntradaRowData extends RowDataPacket, EquipoEntrada {}

const intervalPinesEntrada : {[ctrl_id: string]: NodeJS.Timeout } = {}
let equiposEntrada : EquipoEntrada[] | null = null

type PinesEntradaDataSocket =IPinesEntradaSocket &  Pick<EquipoEntrada,"detector">

function getPinesEntradaData(pinesEntrada: IPinesEntradaSocket[]) : PinesEntradaDataSocket[][] {
  if (equiposEntrada !== null) {
    // juntar pines entrada con equipo de entrada
    const resultadoPrev = pinesEntrada.reduce((prev, cur) => {
      const result = prev;
      if(equiposEntrada !== null){
        const findEquip = equiposEntrada.find((equipo) => equipo.ee_id === cur.ee_id);
        if (findEquip) {
          const { detector } = findEquip;
          result.push({ ...cur, detector });
        }
      }
      return result;
    }, [] as PinesEntradaDataSocket[]);

    // agrupar por detector
    const resultObject: Record<string, PinesEntradaDataSocket[]> = {};
    resultadoPrev.forEach((item) => {
      const key = item.detector;

      if (!resultObject[key]) {
        resultObject[key] = [];
      }

      resultObject[key].push(item);
    });

    // ordenar por pe_id para cada detector
    Object.keys(resultObject).forEach((key) => {
      let detectorArray = resultObject[key];
      let detectorArraySorted = detectorArray.sort((a, b) => a.pe_id - b.pe_id);
      resultObject[key] = detectorArraySorted;
    });

    // ordenar por ee_id
    let resultValues = Object.values(resultObject);
    let resultValuesSorted = resultValues.sort((a, b) => a[0].ee_id - b[0].ee_id);

    return resultValuesSorted;
  }
  return []
}

export const pinesEntradaSocketFinal =async (io:Server, socket: Socket) => {

  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/pines_entradafinal/ctrl_id"

  console.log(`Socket Pines Entrada | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  if(equiposEntrada == null){
    try {
      const equiEntData = await MySQL2.executeQuery<EquipoEntradaRowData[]>({sql: `SELECT * FROM general.equipoentrada`})
      equiposEntrada = equiEntData
    } catch (error) {
      console.log(`Socket Pines Entrada | Error al obtener equipos de entrada`)
      console.error(error)
    }
  }


  if(!intervalPinesEntrada.hasOwnProperty(ctrl_id)){
    intervalPinesEntrada[ctrl_id] = setInterval(() => {
      const data = PinesEntradaMap.getDataByCtrlID(ctrl_id)
      const finalData = getPinesEntradaData(data)
      socket.nsp.emit("pinesentradafinal", finalData);
    }, 1000)
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/pines_entradafinal/${ctrl_id}`).sockets.size;
    console.log(`Socket Pines Entrada | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      if(intervalPinesEntrada.hasOwnProperty(ctrl_id)){
        console.log(`Socket Pines Entrada | Eliminado SetInterval | ctrl_id = ${ctrl_id}`)
        clearInterval(intervalPinesEntrada[ctrl_id])
        delete intervalPinesEntrada[ctrl_id]
      }
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Pines Entrada | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });

}

type IPinesEntradaSocket = PinesEntrada & Pick<Controlador, "ctrl_id">;

export class PinesEntradaSocket implements IPinesEntradaSocket {
  pe_id: number;
  pin: number;
  ee_id: number;
  descripcion: string;
  estado: number;
  activo: number;
  ctrl_id: number;

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

  public toJSON(){
    const result: IPinesEntradaSocket ={
      pe_id: this.pe_id,
      pin: this.pin,
      ee_id: this.ee_id,
      descripcion: this.descripcion,
      estado: this.estado,
      activo: this.activo,
      ctrl_id: this.ctrl_id,
    }
    return result
  }
}

export class PinesEntradaMap {
  static map : { [ctrl_id: string]: { [pe_id: string]: PinesEntradaSocket } } = {};

  private static exists(args: { ctrl_id: string; pe_id: string }) {
    const { ctrl_id, pe_id } = args;

    let is_ctrl_id: boolean = false;
    let is_pe_id: boolean = false;

    for (const ctrl_id_key in PinesEntradaMap.map) {
      if (ctrl_id_key == ctrl_id) {
        is_ctrl_id = true;
      }
      for (const pe_id_key in PinesEntradaMap.map[ctrl_id_key]) {
        if (pe_id_key == pe_id) {
          is_pe_id = true;
        }
      }
    }

    return is_ctrl_id && is_pe_id;
  }

  private static add(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id } = pinEnt.toJSON();

    if (!PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      PinesEntradaMap.map[ctrl_id] = {};
    }

    if (!PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
      PinesEntradaMap.map[ctrl_id][pe_id] = pinEnt;
    }
  }

  private static update(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id } = pinEnt.toJSON();
    if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
        PinesEntradaMap.map[ctrl_id][pe_id] = pinEnt;
      }
    }
  }
  
  public static delete(pinEnt: PinesEntradaSocket) {
    const { ctrl_id, pe_id } = pinEnt.toJSON();
    if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      if (PinesEntradaMap.map[ctrl_id].hasOwnProperty(pe_id)) {
        delete PinesEntradaMap.map[ctrl_id][pe_id];
      }
    }
  }

  public static add_update(pinEnt: PinesEntradaSocket) {
    const { pe_id, ctrl_id } = pinEnt.toJSON();
    const exists = PinesEntradaMap.exists({ctrl_id: String(ctrl_id),pe_id: String(pe_id),});

    if (!exists) {
      PinesEntradaMap.add(pinEnt);
    } else {
      PinesEntradaMap.update(pinEnt);
    }
  }

  public static getDataByCtrlID(ctrl_id: string) {
    let resultData: IPinesEntradaSocket[] = [];
    if (PinesEntradaMap.map.hasOwnProperty(ctrl_id)) {
      for (const pe_id_key in PinesEntradaMap.map[ctrl_id]) {
        let sensorData = PinesEntradaMap.map[ctrl_id][pe_id_key].toJSON();
        if (sensorData.activo == 1) {
          resultData.push(sensorData);
        }
      }
    }
    return resultData;
  }
}


(() => {

  // setInterval(() => {
  //   const randomNumber = Math.round(Math.random())
  //   const randomNumber2 = Math.round(Math.random());

  //   const newSensorTemp = new PinesEntradaSocket({pe_id: 1, pin: 1, ee_id: 1, descripcion: "Entrada 1", estado: randomNumber, activo: 1, ctrl_id: 1});
  //   const newSensorTemp2 = new PinesEntradaSocket({pe_id: 2, pin: 2, ee_id: 2, descripcion: "Entrada 2", estado: randomNumber2, activo: 1, ctrl_id: 1 });

  //   PinesEntradaMap.add_update(newSensorTemp);
  //   PinesEntradaMap.add_update(newSensorTemp2);

  // }, 2000);

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesEntradaSocket({pe_id: 10,pin: 10,ee_id: 1,descripcion: "Entrada 10",estado: randomNumber,activo: 1,ctrl_id: 27});
//     PinesEntradaMap.add_update(newSensorTemp)
//   },10000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesEntradaSocket({pe_id: 5,pin: 5,ee_id: 5,descripcion: "Entrada 5",estado: randomNumber,activo: 1,ctrl_id: 27});
//     PinesEntradaMap.add_update(newSensorTemp)
//   },20000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesEntradaSocket({pe_id: 10,pin: 10,ee_id: 1,descripcion: "Entrada 10",estado: randomNumber,activo: 1,ctrl_id: 27})
//     PinesEntradaMap.delete(newSensorTemp)
//   },60000)

//   setTimeout(()=>{
//     const randomNumber = Math.round(Math.random());
//     const newSensorTemp = new PinesEntradaSocket({pe_id: 5,pin: 5,ee_id: 5,descripcion: "Entrada 5",estado: randomNumber,activo: 1,ctrl_id: 27});
//     PinesEntradaMap.delete(newSensorTemp)
//   },70000)

})();

