import { Server } from "socket.io";
import { SocketModEnergia } from "./modulo.energia.types";
import { modEnerNamespaceSchema } from "./modulo.energia.schema";
import { ModuloEnergiaManager, ModuloEnergiaObserver } from "./modulo.energia.manager";

export const modEnergiaSocket = async ( io: Server, socket: SocketModEnergia ) => {

    const nspModEn = socket.nsp;
    const [, , xctrl_id] = nspModEn.name.split("/"); // Namespace : "/modulo_enegia/ctrl_id"

    const result = modEnerNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

    if (!result.success) {
      console.log(
        result.error.errors.map((errorDetail) => ({
          message: errorDetail.message,
          status: errorDetail.code,
          path: errorDetail.path,
        }))
      );

      return;
    }

    const { ctrl_id } = result.data;

    const observer = new ModuloEnergiaObserver(socket);
    ModuloEnergiaManager.registerObserver(ctrl_id,observer);

    const data = ModuloEnergiaManager.getDataByCtrlID(ctrl_id);
    socket.emit("initial_list_energia",data);

    socket.on("disconnect", () => {
      const clientsCount = io.of(`/modulo_enegia/${ctrl_id}`).sockets.size;
      console.log(`Socket Modulo Energia | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}` );
      if (clientsCount == 0) {
        console.log(`Socket Modulo Energia | Eliminado Observer | ctrl_id = ${ctrl_id}`);
        ModuloEnergiaManager.unregisterObserver(ctrl_id);
      }
    });

    socket.on("error", (error: any) => {
      console.log(`Socket Modulo Energia | Error | ctrl_id = ${ctrl_id}`);
      console.error(error);
    });
};
