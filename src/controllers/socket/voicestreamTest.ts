import path from "path";
import { Server, Socket } from "socket.io";
import fs from 'fs'

export const voiceStreamSocketTest = async (io: Server, socket: Socket) => {

  const nspStream = socket.nsp;
  const [, , ctrl_id, ip] = nspStream.name.split("/"); // Namespace : "/voice_stream/:ctrl_id/:ip"

  console.log("Llego peticion voice_stream", ctrl_id, ip);

  const fileName = `audio-${Date.now()}.webm`;
  const filePath = path.join(__dirname, fileName);
  const writeStream = fs.createWriteStream(filePath);

  socket.on("audioStream", (data: ArrayBuffer) => {

    console.log("Received buffer of size:", data.byteLength);
    const buffer = Buffer.from(data);
    writeStream.write(buffer);

    // socket.emit("audioStreamFinal", Buffer.from(data).toString("base64"));
  });

  socket.on("disconnect", () => {
    writeStream.end();
  });

};
