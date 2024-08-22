import { Server } from "socket.io";
import { SocketControllerState } from "./controller.state.types";
import { ConfigManager } from "../../../models/config/config.manager";
import { controllerStateSocketSchema } from "./controller.state.schema";
import { ControllerStateManager, ControllerStateSocketObserver } from "./controller.state.manager";

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

    return;
  }

  const { ctrl_id } = result.data;

  const observer = new ControllerStateSocketObserver(socket);
  ControllerStateManager.registerObserver(ctrl_id, observer);

  socket.on("setMode", (newMode) => {
    ConfigManager.updateController(ctrl_id, { CONTROLLER_MODE: newMode });
  });

  socket.on("setSecurity", (newSecurity) => {
    // console.log("setSecurity",ctrl_id, newSecurity)
    ConfigManager.updateController(ctrl_id, {
      CONTROLLER_SECURITY: newSecurity,
    });
  });

  socket.on("getInfo", (fields) => {
    fields.forEach((field) => {
      if (field === "mode") {
        try {
          const ctrlConfig = ConfigManager.getController(ctrl_id);
          socket.nsp.emit(field, ctrlConfig.CONTROLLER_MODE);
        } catch (error) {
          console.log(error);
        }
      } else if (field === "security") {
        try {
          const ctrlConfig = ConfigManager.getController(ctrl_id);
          socket.nsp.emit(field, ctrlConfig.CONTROLLER_SECURITY);
        } catch (error) {
          console.log(error);
        }
      } else {
        const value = ControllerStateManager.getPropertyValue(ctrl_id, field);
        if (value !== undefined) {
          const emitData = { [field]: value };
          socket.nsp.emit("data", ctrl_id, emitData);
        }
      }
    });
  });

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/controller_state/${ctrl_id}`).sockets.size;
    if (clientsCount == 0) {
      ControllerStateManager.unregisterObserver(ctrl_id);
    }
  });
};
