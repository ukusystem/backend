
import { Server, Socket } from "socket.io";
import { MySQL2 } from "../../database/mysql";
import { Controlador, RegistroEntrada } from "../../types/db";
import { RowDataPacket } from "mysql2";


const intervalRegistroEntrada : {[ctrl_id: string]: NodeJS.Timeout } = {}

export const registroEntradaSocket = async (io: Server, socket: Socket) => {
  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/registro_entrada/ctrl_id"

  console.log(`Socket Registro Entrada | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  if(!intervalRegistroEntrada.hasOwnProperty(ctrl_id)){
    intervalRegistroEntrada[ctrl_id] = setInterval(async () => {
      const data = await RegistroEntradaMap.getDataByCtrlID(ctrl_id)
      socket.nsp.emit("registroentrada", data);
    }, 1000)
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/registro_acceso/${ctrl_id}`).sockets.size;
    console.log(`Socket Registro Entrada | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      if(intervalRegistroEntrada.hasOwnProperty(ctrl_id)){
        console.log(`Socket Registro Entrada | Eliminado SetInterval | ctrl_id = ${ctrl_id}`)
        clearInterval(intervalRegistroEntrada[ctrl_id])
        delete intervalRegistroEntrada[ctrl_id]
      }
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Registro Entrada | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}

type IRegistroEntradaSocket = RegistroEntrada & Pick<Controlador, "ctrl_id">
interface RegistroEntradaRowDataSocket extends RegistroEntrada, RowDataPacket {}

export class RegistroEntradaSocket implements IRegistroEntradaSocket {
  rentd_id: number;
  pin: number;
  estado: number;
  ee_id: number;
  fecha: string;
  ctrl_id: number;

  constructor(props: IRegistroEntradaSocket) {
    const { ctrl_id, ee_id, estado, fecha, pin, rentd_id } = props;
    this.rentd_id = rentd_id;
    this.pin = pin;
    this.estado = estado;
    this.ee_id = ee_id;
    this.fecha = fecha;
    this.ctrl_id = ctrl_id;
  }

  public toJSON() : IRegistroEntradaSocket {
    const result: IRegistroEntradaSocket = {
      rentd_id: this.rentd_id,
      pin: this.pin,
      estado: this.estado,
      ee_id: this.ee_id,
      fecha: this.fecha,
      ctrl_id: this.ctrl_id,
    };
    return result
  }
}

export class RegistroEntradaMap {
  static map : { [ctrl_id: string]: RegistroEntradaSocket[] } = {};

  public static async add(regEnt: RegistroEntradaSocket) {
    const { ctrl_id } = regEnt.toJSON();

    if (!RegistroEntradaMap.map.hasOwnProperty(ctrl_id)) {

      RegistroEntradaMap.map[ctrl_id] = []

      let regisAccInit = await RegistroEntradaMap.get_init_data(ctrl_id)

      regisAccInit.forEach(item => {
        let newRegAccSoc = new RegistroEntradaSocket({...item, ctrl_id})
        RegistroEntradaMap.map[ctrl_id].push(newRegAccSoc)
      })

    }

    RegistroEntradaMap.map[ctrl_id].unshift(regEnt)  // agregar elementos al comienzo
    RegistroEntradaMap.map[ctrl_id].splice(5) // elimina elementos desde el index 5

  }

  private static async get_init_data(ctrl_id: Controlador["ctrl_id"]){
    const regisEntradaInit = await  MySQL2.executeQuery<RegistroEntradaRowDataSocket[]>({sql: `SELECT * FROM ${"nodo" + ctrl_id}.registroentrada ORDER BY rentd_id DESC LIMIT 5`})
    return regisEntradaInit
  }

  public static async getDataByCtrlID(ctrl_id: string) {
    let resultData: IRegistroEntradaSocket[] = [];
    if (RegistroEntradaMap.map.hasOwnProperty(ctrl_id)) {
      RegistroEntradaMap.map[ctrl_id].forEach((item) => {
        resultData.push(item.toJSON());
      });
    }
    return resultData;
  }
}


// (()=>{
//   let count = 60
//   setInterval(async ()=>{

//     const randomNumber = Math.floor(Math.random() * (100 - 10) + 10);
//     const randomNumber2 = Math.round(Math.random())

//     const newSensorTemp = new RegistroEntradaSocket({
//       "rentd_id": count,
//       "pin": randomNumber,
//       "estado": randomNumber2,
//       "fecha": "2024-04-12 15:19:27",
//       "ee_id": 1,
//       ctrl_id:27
//     })

//     count= count + 1

//     await RegistroEntradaMap.add(newSensorTemp)


//   },10000)

// })()


