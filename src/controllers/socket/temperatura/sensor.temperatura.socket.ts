import { Server } from "socket.io";
import { SocketSenTemperature } from "./sensor.temperatura.types";
import { senTempNamespaceSchema } from "./sensor.temperatura.schema";
import { SensorTemperaturaManager, SenTempSocketObserver } from "./sensor.temperatura.manager";
import { genericLogger } from "../../../services/loggers";


export const senTemperaturaSocket = async ( io: Server, socket: SocketSenTemperature ) => {

    const nspSenTemp = socket.nsp;
    const [, , xctrl_id] = nspSenTemp.name.split("/"); // Namespace : "/sensor_temperatura/ctrl_id"

    const result = senTempNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

    if (!result.success) {
      socket.disconnect(true);
      return;
    }

    const { ctrl_id } = result.data;

    const observer = new SenTempSocketObserver(socket);
    SensorTemperaturaManager.registerObserver(ctrl_id,observer);

    const data = SensorTemperaturaManager.getDataByCtrlID(ctrl_id);
    socket.emit("initial_list_temperature",data);

    socket.on("disconnect", () => {
      const clientsCount = io.of(`/sensor_temperatura/${ctrl_id}`).sockets.size;
      if (clientsCount == 0) {
        SensorTemperaturaManager.unregisterObserver(ctrl_id);
      }
    });

    socket.on("error", (error: any) => {
      genericLogger.error(`Socket Sensor Temperatura | Error | ctrl_id = ${ctrl_id}`,error);
    });
};
