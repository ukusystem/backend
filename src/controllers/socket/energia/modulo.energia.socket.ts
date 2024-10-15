import { Server } from "socket.io";
import { SocketModEnergia } from "./modulo.energia.types";
import { modEnerNamespaceSchema } from "./modulo.energia.schema";
import { ModuloEnergiaManager, ModuloEnergiaObserver } from "./modulo.energia.manager";
import { genericLogger } from "../../../services/loggers";

export const modEnergiaSocket = async ( io: Server, socket: SocketModEnergia ) => {

    const nspModEn = socket.nsp;
    const [, , xctrl_id] = nspModEn.name.split("/"); // Namespace : "/modulo_enegia/ctrl_id"

    const result = modEnerNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

    if (!result.success) {
      socket.disconnect(true);
      return;
    }

    const { ctrl_id } = result.data;

    const observer = new ModuloEnergiaObserver(socket);
    ModuloEnergiaManager.registerObserver(ctrl_id,observer);

    const data = ModuloEnergiaManager.getDataByCtrlID(ctrl_id);
    socket.emit("initial_list_energia",data);

    socket.on("disconnect", () => {
      const clientsCount = io.of(`/modulo_enegia/${ctrl_id}`).sockets.size;
      if (clientsCount == 0) {
        ModuloEnergiaManager.unregisterObserver(ctrl_id);
      }
    });

    socket.on("error", (error: any) => {
      genericLogger.error(`Error en el namespace de modulos de energia | ${ctrl_id}`,error);
    });
};
