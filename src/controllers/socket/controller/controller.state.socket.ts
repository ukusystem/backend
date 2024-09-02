import { Server } from "socket.io";
import { SocketControllerState } from "./controller.state.types";
import { controllerStateSocketSchema } from "./controller.state.schema";
import { ControllerStateManager, ControllerStateSocketObserver } from "./controller.state.manager";
import { ControllerMapManager } from "../../../models/maps";

export const contollerStateSocket = async ( io: Server, socket: SocketControllerState ) => {
  const nspControllerState = socket.nsp;
  const [, , xctrl_id] = nspControllerState.name.split("/"); // Namespace: "/controller_state/ctrl_id"

  // Validar
  const result = controllerStateSocketSchema.safeParse({ ctrl_id: xctrl_id });

  if (!result.success) {
    console.log(
      result.error.errors.map((errorDetail) => ({
        message: errorDetail.message,
        status: errorDetail.code,
        path: errorDetail.path,
      }))
    );

    socket.emit("error_message",{message:`Ocurrio un error al validar el controlador`});
    socket.disconnect(true);
    return;
  }

  const { ctrl_id } = result.data;

  const controller = ControllerStateManager.getController(ctrl_id);

  if(controller === undefined){
    socket.emit("error_message",{message:`Controlador no disponible`});
    socket.disconnect(true);
    return;
  }

  socket.emit("controller_info", controller);

  const observer = new ControllerStateSocketObserver(socket);
  ControllerStateManager.registerObserver(ctrl_id, observer);

  socket.on("setMode", (newMode) => {
    ControllerMapManager.updateController(ctrl_id,{modo: newMode})

  });

  socket.on("setSecurity", (newSecurity) => {
    ControllerMapManager.updateController(ctrl_id,{seguridad: newSecurity});
  });

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/controller_state/${ctrl_id}`).sockets.size;
    if (clientsCount == 0) {
      ControllerStateManager.unregisterObserver(ctrl_id);
    }
  });
};
