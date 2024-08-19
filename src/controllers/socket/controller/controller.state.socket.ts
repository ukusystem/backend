import { Server } from "socket.io";
import { SocketControllerState } from "./controller.state.types";
import { ConfigManager } from "../../../models/config/config.manager";
import { controllerStateSocketSchema } from "./controller.state.schema";
import { ControllerStateManager, ControllerStateSocketObserver } from "./controller.state.manager";

export const contollerStateSocket = async (io: Server, socket: SocketControllerState) => {

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

    const observer = new ControllerStateSocketObserver(socket)
    ControllerStateManager.registerObserver(ctrl_id,observer)

    const ctrlConfig  = ConfigManager.getController(ctrl_id)
    socket.nsp.emit("mode", ctrlConfig.CONTROLLER_MODE)
    socket.nsp.emit("security", ctrlConfig.CONTROLLER_SECURITY)

    socket.on("setMode", (newMode) => {
        ConfigManager.updateController(ctrl_id,{CONTROLLER_MODE: newMode})
    });

    socket.on("setSecurity", (newSecurity) => {
        console.log("setSecurity",ctrl_id, newSecurity)
        ConfigManager.updateController(ctrl_id,{CONTROLLER_SECURITY: newSecurity})
    });

    socket.on("initialInfo", (fields)=>{
        // const test = fields[0]
        // ControllerStateManager.state[1][test]

    })
};
