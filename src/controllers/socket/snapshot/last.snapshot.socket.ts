import { Server } from "socket.io";
import { LastSnapShotManager, LastSnapshotSocketObserver } from "./last.snapshot.manager";
import { SocketLastSnapshot } from "./last.snapshot.types";
import { lastSnapshotNamespaceSchema } from "./last.snapshot.schema";

export const lastSnapshotSocket = async ( io: Server, socket: SocketLastSnapshot ) => {

  const nspLastSnapshot = socket.nsp;
  const [, , xctrl_id] = nspLastSnapshot.name.split("/"); // Namespace : "/last_snapshot/ctrl_id"

  const result = lastSnapshotNamespaceSchema.safeParse({ ctrl_id: xctrl_id });

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

  let newObserver = new LastSnapshotSocketObserver(socket);
  LastSnapShotManager.registerObserver(ctrl_id, newObserver);

  // emit initial data
  if (LastSnapShotManager.snapshot[ctrl_id]) {
    socket.emit("last_snapshot", LastSnapShotManager.snapshot[ctrl_id]);
  }

  socket.on("disconnect", () => {
    const clientsCount = io.of(`/last_snapshot/${ctrl_id}`).sockets.size;
    console.log(`Socket LastSnapshot | clientes_conectados = ${clientsCount} | ctrl_id = ${ctrl_id}`);
    if (clientsCount == 0) {
      console.log(`Socket LastSnapshot | Eliminado Obeserver | ctrl_id = ${ctrl_id}`);
      LastSnapShotManager.unregisterObserver(ctrl_id);
    }
  });

  socket.on("error", (error: any) => {
    console.log(`Socket LastSnapshot | Error | ctrl_id = ${ctrl_id}`);
    console.error(error);
  });
};