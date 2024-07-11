import { ChildProcessByStdio, spawn} from "child_process";
import { Server, Socket } from "socket.io";
import { createImageBase64, getFfmpegArgs, verifyImageMarkers, } from "../../utils/stream";
import { CustomError } from "../../utils/CustomError";
import { vmsLogger } from "../../services/loggers";

interface IFmmpegProcess {
  [ctrl_id: string]: {
    [ip: string]: { [cal: string]: [ChildProcessByStdio<null, any, null> , boolean , Buffer] }; // ffmpegprocess ,isInsideImage, imageBuffer
  };
}

interface IFmmpegProcessLogs {
  [ctrl_id: string]: {
    [ip: string]: { [cal: string]: {pid:number | undefined , timestamp: number} };
  };
}

const ffmpegProcess: IFmmpegProcess = {};

const ffmpegProccessLogs : IFmmpegProcessLogs ={}

export const streamSocketFinal = async (io: Server, socket: Socket) => {

  // Obtener ip y calidad
  const nspStream = socket.nsp;
  const [, , ctrl_id, ip, q] = nspStream.name.split("/"); // Namespace : "/stream/nodo_id/camp_ip/calidad"

  setTimeout(async () => {
    // console.log(`Cliente ID: ${socket.id} | Petición Stream ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`);
    vmsLogger.info(`Cliente ID: ${socket.id} | Petición Stream ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`)

    if (!ffmpegProcess.hasOwnProperty(ctrl_id)) {
      ffmpegProcess[ctrl_id] = {};
      ffmpegProccessLogs[ctrl_id]={}
    }

    if (!ffmpegProcess[ctrl_id].hasOwnProperty(ip)) {
      ffmpegProcess[ctrl_id][ip] = {};
      ffmpegProccessLogs[ctrl_id][ip]={}
    }

    if (!ffmpegProcess[ctrl_id][ip].hasOwnProperty(q)) {
      if (q !== "q1" && q !== "q2" && q !== "q3") {
        return;
      }
      try {
        const newFfmpegArg = await getFfmpegArgs(parseInt(ctrl_id, 10), ip, q);
        if (!newFfmpegArg) {
          return;
        }
        socket.emit("isLoading", true);
        const newFfmpegProcess = spawn("ffmpeg", newFfmpegArg,{stdio:["ignore","pipe", "ignore"]});

        ffmpegProcess[ctrl_id][ip][q] = [newFfmpegProcess , false , Buffer.alloc(0)];
        ffmpegProccessLogs[ctrl_id][ip][q] = {pid: newFfmpegProcess.pid , timestamp: Date.now()}

      } catch (error) {
        console.error(error)
        if (error instanceof CustomError || error instanceof Error) {
          socket.emit("isLoading", false);
          socket.emit("isError", true, error.message);

          vmsLogger.error(error.message, error.stack)
          return;
        }

        socket.emit("isLoading", false);
        socket.emit( "isError", true, "Se ha producido un error inesperado al intentar obtener el stream." );
        vmsLogger.error(`Se ha producido un error inesperado al intentar obtener el stream | ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`)
        return;
      }
    }

    // console.log(`Procesos Ffmpeg en ejecución:`);
    // console.log(JSON.stringify(ffmpegProccessLogs))

    // Redirigir la salida de ffmpeg al cliente Socket.IO
    ffmpegProcess[ctrl_id][ip][q][0].stdout.on("data", (data: Buffer) => {

      socket.emit("isLoading", false);
      if(ffmpegProcess[ctrl_id][ip].hasOwnProperty(q)){
        // Verificar marcadores
        let isMarkStart = verifyImageMarkers(data, "start");
        let isMarkEnd = verifyImageMarkers(data, "end");

        if (!ffmpegProcess[ctrl_id][ip][q][1] && isMarkStart) {
          // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
          ffmpegProcess[ctrl_id][ip][q][1] = true;
        }

        if (ffmpegProcess[ctrl_id][ip][q][1]) {
          // Concatenar nuevos datos al buffer existente
          // imageBuffer = Buffer.concat([imageBuffer, data]);
          ffmpegProcess[ctrl_id][ip][q][2] = Buffer.concat([ffmpegProcess[ctrl_id][ip][q][2], data])

          if (verifyImageMarkers(ffmpegProcess[ctrl_id][ip][q][2], "complete")) {
            //Imagen completa
            const imageBase64 = createImageBase64(ffmpegProcess[ctrl_id][ip][q][2]);
            socket.emit("videostream", imageBase64); // Emitir datos al cliente a través de Socket.IO
          }
        }

        if (isMarkEnd) {
          // Limpiar el búfer para la siguiente imagen
          // imageBuffer = Buffer.alloc(0);
          ffmpegProcess[ctrl_id][ip][q][2] = Buffer.alloc(0)
          ffmpegProcess[ctrl_id][ip][q][1] = false;
        }

      }
      

    });

    ffmpegProcess[ctrl_id][ip][q][0].on("close", (code, signal) => {
      console.log( `Proceso ffmpeg cerrado con código ${code} y señal ${signal}` );
      if (ffmpegProcess[ctrl_id][ip][q]) {
        console.log("Delete ", ffmpegProccessLogs[ctrl_id][ip][q])
        delete ffmpegProcess[ctrl_id][ip][q];
      }
    });
  }, 100);

  // Manejar cierre de conexión
  socket.on("disconnect", () => {
    console.log("Cliente desconectado ID:", socket.id);
    const clientsCount = io.of(`/stream/${ctrl_id}/${ip}/${q}`).sockets.size;
    console.log(`Numero de clientes conectados: ${clientsCount} | ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`)
    if (clientsCount == 0 ) {
      if(ffmpegProcess.hasOwnProperty(ctrl_id)){
        if(ffmpegProcess[ctrl_id].hasOwnProperty(ip)){
          if(ffmpegProcess[ctrl_id][ip].hasOwnProperty(q)){
            console.log("Kill ", ffmpegProccessLogs[ctrl_id][ip][q] )
            ffmpegProcess[ctrl_id][ip][q][0].kill();
          }
        }
      }
      
    }
  });

  // Manejar errores
  socket.on("error", (error) => {
    console.error(`Error en la conexión Socket.IO: ${error.message}`);
  });
};
