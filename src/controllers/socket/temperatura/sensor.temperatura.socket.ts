import { Server } from "socket.io";
import { SocketSenTemperature } from "./sensor.temperatura.types";
import { senTempNamespaceSchema } from "./sensor.temperatura.schema";
import { SensorTemperaturaManager, SenTempSocketObserver } from "./sensor.temperatura.manager";


export const senTemperaturaSocket = async ( io: Server, socket: SocketSenTemperature ) => {

    const nspSenTemp = socket.nsp;
    const [, , xctrl_id] = nspSenTemp.name.split("/"); // Namespace : "/sensor_temperatura/ctrl_id"

    const result = senTempNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

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

    const observer = new SenTempSocketObserver(socket);
    SensorTemperaturaManager.registerObserver(ctrl_id,observer);

    const data = SensorTemperaturaManager.getDataByCtrlID(ctrl_id);
    socket.emit("initial_list_temperature",data);

    socket.on("disconnect", () => {
      const clientsCount = io.of(`/sensor_temperatura/${ctrl_id}`).sockets.size;
      console.log(`Socket Sensor Temperatura | clientes_conectados = ${clientsCount}| ctrl_id = ${ctrl_id}`);
      if (clientsCount == 0) {
        console.log(`Socket Sensor Temperatura | Eliminado Observer | ctrl_id = ${ctrl_id}`);
        SensorTemperaturaManager.unregisterObserver(ctrl_id);
      }
    });

    socket.on("error", (error: any) => {
      console.log(`Socket Sensor Temperatura | Error | ctrl_id = ${ctrl_id}`);
      console.error(error);
    });
};
