import { Server, Socket } from "socket.io";

export const voiceStreamSocket = async (io: Server, socket: Socket) => {
    
  const nspStream = socket.nsp;
  const [, , ctrl_id, ip] = nspStream.name.split("/"); // Namespace : "/voice_stream/:ctrl_id/:ip"

  console.log("Llego peticion voice_stream", ctrl_id, ip);

  socket.on("audioStream", (base64String) => {
    console.log(base64String)
    socket.broadcast.emit("audioStream", base64String);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado voice_stream");
  });
};
