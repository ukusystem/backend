import { Server, Socket } from "socket.io";
// import { MySQL2 } from "../../database/mysql";
// import type {RegistroArchivoCamara} from '../../types/db'
// import { RowDataPacket } from "mysql2";
import { CameraMotionMap, MotionDeteccionSocketObserver } from "../../models/camera/CameraMotion";

// interface RegistroArchivoCamaraRowData extends RowDataPacket, RegistroArchivoCamara {}

// export const lastSnapshotSocket = async (io: Server, socket: Socket) => {
//   let intervalId: NodeJS.Timeout | null = null;
//   if (!intervalId) {
//     intervalId = setInterval(async () => {
//       const nspEnergias = socket.nsp;

//       const [, , ctrl_id] = nspEnergias.name.split("/"); // Namespace : "/lastsnapshot/ctrl_id"

//       const lastSnapshot = await MySQL2.executeQuery<RegistroArchivoCamaraRowData[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroarchivocamara WHERE tipo= 0 ORDER BY rac_id DESC LIMIT 1`})
  
//       if(lastSnapshot.length>0){
//           socket.emit("lastsnapshot", lastSnapshot[0]);
//       }
//     }, 1000);
//   }

//   socket.on("disconnect", () => {
//     if (intervalId) {
//       clearInterval(intervalId);
//       intervalId = null;
//     }
//   });
// };

export const lastSnapshotSocket = async (io: Server, socket: Socket) => {
  const nspEnergias = socket.nsp;

  const [, , ctrl_id] = nspEnergias.name.split("/"); // Namespace : "/lastsnapshot/ctrl_id"

  let newObserver = new MotionDeteccionSocketObserver(socket)
  CameraMotionMap.registerObserver(Number(ctrl_id),newObserver)

  // emit initial data
  if(CameraMotionMap.lastImage[ctrl_id]){
    socket.emit("lastsnapshot",CameraMotionMap.lastImage[ctrl_id]);
  }


  // if (!intervalId) {
  //   intervalId = setInterval(async () => {
  //     const nspEnergias = socket.nsp;

  //     const [, , ctrl_id] = nspEnergias.name.split("/"); // Namespace : "/lastsnapshot/ctrl_id"

  //     const lastSnapshot = await MySQL2.executeQuery<RegistroArchivoCamaraRowData[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroarchivocamara WHERE tipo= 0 ORDER BY rac_id DESC LIMIT 1`})
  
  //     if(lastSnapshot.length>0){
  //         socket.emit("lastsnapshot", lastSnapshot[0]);
  //     }
  //   }, 1000);
  // }
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