import { Server, Socket } from "socket.io";
import { MySQL2 } from "../../database/mysql";
import { Contrata, Controlador, RegistroAcceso } from "../../types/db";
import { RowDataPacket } from "mysql2";

interface RegistroAccesoRowData extends RegistroAcceso , RowDataPacket {
  contrata: string | null
}

export const accesoSocket = async (io: Server, socket: Socket) => {
  let intervalId: NodeJS.Timeout | null = null;
  if (!intervalId) {
    intervalId = setInterval(async () => {
      
      try {
        const nspAccesos = socket.nsp;
  
        const [, , ctrl_id] = nspAccesos.name.split("/"); // Namespace :  "/accesos/nodo_id"
        
        const registroAcceso = await MySQL2.executeQuery<RegistroAccesoRowData[]>({sql:`SELECT ra.* , co.contrata FROM ${"nodo" + ctrl_id}.registroacceso ra LEFT JOIN general.contrata co ON ra.co_id = co.co_id  ORDER BY ra_id DESC LIMIT 5;`})
        
        socket.emit("accesos", registroAcceso);
      } catch (error) {
        console.log("Ocurrio un error en accesoSocket", error)
      }
    }, 1000);
  }

  socket.on("disconnect", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });

};

const intervalRegistroAcceso : {[ctrl_id: string]: NodeJS.Timeout } = {}

export const registroAccesoSocket = async (io: Server, socket: Socket) => {
  const nspEnergia = socket.nsp;
  const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/registro_acceso/ctrl_id"

  console.log(`Socket Registro Acceso | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);

  if(!intervalRegistroAcceso.hasOwnProperty(ctrl_id)){
    intervalRegistroAcceso[ctrl_id] = setInterval(async () => {
      const data = await RegistroAccesoMap.getDataByCtrlID(ctrl_id)
      socket.nsp.emit("registroacceso", data);
    }, 1000)
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/registro_acceso/${ctrl_id}`).sockets.size;
    console.log(`Socket Registro Acceso | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      if(intervalRegistroAcceso.hasOwnProperty(ctrl_id)){
        console.log(`Socket Registro Acceso | Eliminado SetInterval | ctrl_id = ${ctrl_id}`)
        clearInterval(intervalRegistroAcceso[ctrl_id])
        delete intervalRegistroAcceso[ctrl_id]
      }
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket Registro Acceso | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
}

type IRegistroAccesoSocket = RegistroAcceso & Pick<Controlador, "ctrl_id"> & Pick<Contrata,"contrata">;

interface RegistroAccesoRowDataSocket extends RegistroAcceso ,Pick<Contrata,"contrata"> ,RowDataPacket {}

export class RegistroAccesoSocket implements IRegistroAccesoSocket {

  ra_id: number;
  serie: number;
  ea_id: number;
  co_id: number;
  administrador: number;
  autorizacion: number;
  fecha: string;
  tipo: number;
  sn_id: number;
  ctrl_id: number;
  contrata: string;

  constructor(props: IRegistroAccesoSocket) {
    const {administrador,autorizacion,co_id,ctrl_id,ea_id,fecha,ra_id,serie,sn_id,tipo,contrata} = props;
    this.ra_id = ra_id;
    this.serie = serie;
    this.ea_id = ea_id;
    this.co_id = co_id;
    this.administrador = administrador;
    this.autorizacion = autorizacion;
    this.fecha = fecha;
    this.tipo = tipo;
    this.sn_id = sn_id;
    this.ctrl_id = ctrl_id;
    this.contrata = contrata;
  }

  public toJSON() : IRegistroAccesoSocket {
    const result: IRegistroAccesoSocket ={
      ra_id : this.ra_id ,
      serie : this.serie ,
      ea_id : this.ea_id ,
      co_id : this.co_id ,
      administrador : this.administrador ,
      autorizacion : this.autorizacion ,
      fecha : this.fecha ,
      tipo : this.tipo ,
      sn_id : this.sn_id ,
      ctrl_id : this.ctrl_id ,
      contrata: this.contrata
    }
    return result
  }
}

export class RegistroAccesoMap {

  static map : { [ctrl_id: string]: RegistroAccesoSocket[] } = {};

  public static async add(regAcc: RegistroAccesoSocket) {
    const { ctrl_id } = regAcc.toJSON();

    if (!RegistroAccesoMap.map.hasOwnProperty(ctrl_id)) {

      RegistroAccesoMap.map[ctrl_id] = []

      let regisAccInit = await RegistroAccesoMap.get_init_data(ctrl_id)

      regisAccInit.forEach(item => {
        let newRegAccSoc = new RegistroAccesoSocket({...item, ctrl_id})
        RegistroAccesoMap.map[ctrl_id].push(newRegAccSoc)
      })

    }

    RegistroAccesoMap.map[ctrl_id].unshift(regAcc)  // agregar elementos al comienzo
    RegistroAccesoMap.map[ctrl_id].splice(5) // elimina elementos desde el index 5

  }

  private static async get_init_data(ctrl_id: Controlador["ctrl_id"]){
    const regisAccesoInit = await  MySQL2.executeQuery<RegistroAccesoRowDataSocket[]>({sql: `SELECT ra.* , co.contrata FROM ${"nodo" + ctrl_id}.registroacceso ra LEFT JOIN general.contrata co ON ra.co_id = co.co_id  ORDER BY ra_id DESC LIMIT 5`})
    return regisAccesoInit
  }

  public static async getDataByCtrlID(ctrl_id: string) {
    let resultData: IRegistroAccesoSocket[] = [];
    if (RegistroAccesoMap.map.hasOwnProperty(ctrl_id)) {
      RegistroAccesoMap.map[ctrl_id].forEach((item) => {
        resultData.push(item.toJSON());
      });
    }
    return resultData;
  }


}

// (()=>{
//   let count = 0
//   setInterval(async ()=>{

//     const randomNumber = Math.floor(Math.random() * 11) + 20;
//     // const randomNumber2 = Math.floor(Math.random() * 11) + 20;

//     const newSensorTemp = new RegistroAccesoSocket({
//       "ra_id": 226,
//       "serie": 63744,
//       "administrador": 0,
//       "autorizacion": randomNumber,
//       "fecha": "2024-04-12 17:51:41",
//       "co_id": 0,
//       "ea_id": 0,
//       "tipo": 0,
//       "sn_id": 1,
//       contrata:`Contrata N ${count}`,
//       ctrl_id: 27
//     })

//     count= count + 1

//     await RegistroAccesoMap.add(newSensorTemp)


//   },10000)

// })()

