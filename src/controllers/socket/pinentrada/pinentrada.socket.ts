import { Server, Socket } from "socket.io";
import { PinEntradaManager, PinesSalidaSocketObserver } from "./pinentrada.manager";
import { SystemManager } from "../../../models/system";


export const pinEntradaSocket = async (io:Server, socket: Socket) => {

    const nspEnergia = socket.nsp;
    const [, , ctrl_id] = nspEnergia.name.split("/"); // Namespace : "/pin_entrada/ctrl_id"
  
    console.log(`Socket Pines Entrada | Cliente ID: ${socket.id} | Petición ctrl_id: ${ctrl_id}`);
    const observer = new PinesSalidaSocketObserver(socket);
    PinEntradaManager.registerObserver(Number(ctrl_id),observer);
    //emit initial data:
    const data = PinEntradaManager.getListPinesSalida(ctrl_id)
    socket.emit("list_pines_entrada", data);
    try {
      const {CONTROLLER_MODE, CONTROLLER_SECURITY} = SystemManager.getController(Number(ctrl_id))
      socket.emit("controller_mode",CONTROLLER_MODE);
      socket.emit("controller_security",CONTROLLER_SECURITY);
    } catch (error) {
      console.log(`Socket Pines Entrada | Error al obtener modo y seguridad | ctrl_id = ${ctrl_id}`)
      console.error(error)
    }
  
    socket.on("disconnect", () => {
      const clientsCount = io.of(`/pines_entradafinal/${ctrl_id}`).sockets.size;
      console.log(`Socket Pines Entrada | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
      if (clientsCount == 0 ) {
        console.log(`Socket Pines Entrada | Eliminado Observer | ctrl_id = ${ctrl_id}`)
        PinEntradaManager.unregisterObserver(Number(ctrl_id))
      }
    });
  
    socket.on("error", (error: any) => {
      console.log(`Socket Pines Entrada | Error | ctrl_id = ${ctrl_id}`)
      console.error(error)
    });
  
  }