import { Server, Socket } from "socket.io";
import { CamStreamDirection, CamStreamQuality } from "./camera.stream.types";
import { CamStreamSocketManager, CamStreamSocketObserver, } from "./camera.stream.manager";
import { camStreamSocketSchema } from "./camera.stream.schema";
import { vmsLogger } from "../../../services/loggers";

export const camStreamSocket = async (io: Server, socket: Socket) => {
  // Obtener ip y calidad
  const nspStream = socket.nsp;
  const [, , xctrl_id, xip, xq] = nspStream.name.split("/"); // Namespace : "/stream/nodo_id/camp_ip/calidad"

  // Validar
  const result = camStreamSocketSchema.safeParse({ ctrl_id: xctrl_id, ip: xip, q: xq, });

  if (!result.success) {
    socket.disconnect(true);
    return;
  }

  const validatedNsp = result.data;
  const direction: CamStreamDirection = { ctrl_id: validatedNsp.ctrl_id, ip: validatedNsp.ip, q: validatedNsp.q as CamStreamQuality, };
  const { ctrl_id, ip, q } = direction;

  vmsLogger.info(`Camera Stream Socket | Cliente ID: ${socket.id} | Petición Stream`,{ctrl_id,ip,q});

  CamStreamSocketManager.createProccess(direction);
  
  const observer = new CamStreamSocketObserver(socket);
  CamStreamSocketManager.registerObserver(direction, observer);

  // Manejar cierre de conexión
  socket.on("disconnect", () => {
    vmsLogger.info(`Camera Stream Socket | Cliente desconectado ID: ${socket.id}`,{ctrl_id,ip,q});
    const clientsCount = io.of(`/stream/${ctrl_id}/${ip}/${q}`).sockets.size;
    vmsLogger.info(`Camera Stream Socket | Numero de clientes conectados: ${clientsCount} | ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`);
    if (clientsCount == 0) {
      CamStreamSocketManager.killProcess(direction);
    }
  });

  // Manejar errores
  socket.on("error", (error) => {
    vmsLogger.error(`Camera Stream Socket | Error en la conexión Socket.IO: ${error.message}`,{ctrl_id,ip,q});
  });
};
