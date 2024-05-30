import { Server, Socket } from "socket.io";
import { MySQL2 } from "../../database/mysql";
import type {RegistroArchivoCamara} from '../../types/db'
import { RowDataPacket } from "mysql2";

interface RegistroArchivoCamaraRowData extends RowDataPacket, RegistroArchivoCamara {}

export const lastSnapshotSocket = async (io: Server, socket: Socket) => {
  let intervalId: NodeJS.Timeout | null = null;
  if (!intervalId) {
    intervalId = setInterval(async () => {
      const nspEnergias = socket.nsp;

      const [, , ctrl_id] = nspEnergias.name.split("/"); // Namespace : "/lastsnapshot/ctrl_id"

      const lastSnapshot = await MySQL2.executeQuery<RegistroArchivoCamaraRowData[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroarchivocamara WHERE tipo= 0 ORDER BY rac_id DESC LIMIT 1`})
  
      if(lastSnapshot.length>0){
          socket.emit("lastsnapshot", lastSnapshot[0]);
      }
    }, 1000);
  }

  socket.on("disconnect", () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  });
};