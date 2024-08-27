import { Server, Socket } from "socket.io";
import { CameraMotionMap, MotionDeteccionSocketObserver } from "../../models/camera/CameraMotion";

export const lastSnapshotSocket = async (io: Server, socket: Socket) => {
  const nspEnergias = socket.nsp;

  const [, , ctrl_id] = nspEnergias.name.split("/"); // Namespace : "/lastsnapshot/ctrl_id"

  let newObserver = new MotionDeteccionSocketObserver(socket)
  CameraMotionMap.registerObserver(Number(ctrl_id),newObserver)

  // emit initial data
  if(CameraMotionMap.lastImage[ctrl_id]){
    socket.emit("lastsnapshot",CameraMotionMap.lastImage[ctrl_id]);
  }
  
  socket.on("disconnect", () => {
    const clientsCount = io.of(`/lastsnapshot/${ctrl_id}`).sockets.size;
    console.log(`Socket LastSnapshot | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0 ) {
      console.log(`Socket LastSnapshot | Eliminado Obeserver | ctrl_id = ${ctrl_id}`)
      CameraMotionMap.unregisterObserver(Number(ctrl_id))
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket LastSnapshot | Error | ctrl_id = ${ctrl_id}`)
    console.error(error)
  });
};