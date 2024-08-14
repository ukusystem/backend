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



export enum StreamQuality {
  Primary = "q1",
  Secondary = "q2",
  Auxiliary = "q3",
}

interface StreamState {
  isConfiguring: boolean,
  isLoading:boolean,
  isError: boolean,
  isSuccess: boolean
}

interface IStreamFfmpegProcess {
  [ctrl_id: number]: {
    [ip: string]: Partial<{
      [q in StreamQuality]: {
        ffmpegProcess: ChildProcessByStdio<null, any, null>;
        isChunkInFrame: boolean;
        bufferFrame: Buffer;
      };
    }>;
  };
}

interface IStreamProccesObserver {
  [ctrl_id: number]: {
    [ip: string]: Partial<{
      [q in StreamQuality]: {
        observer: StreamObserver,
        canDelete: boolean
      }
    }>;
  };
}

interface StreamObserver {
  updateState(state: boolean , typeState : keyof StreamState): void ;
  updateFlux(frameBase64: string):void
  updateError(message: string):void
}

type StreamDirection = { ctrl_id: number; ip: string; q: StreamQuality };

interface StreamSubject {
  registerObserver(direction:StreamDirection , observer: StreamObserver): void;
  unregisterObserver(direction:StreamDirection): void;
  notifyState(direction:StreamDirection ,state: boolean, typeState : keyof StreamState): void
  notifyFlux(direction:StreamDirection,frameBase64: string): void
  notifyError(direction:StreamDirection,message: string): void
}

class StreamSocketObserver implements StreamObserver {
  #socket: Socket;
  
  constructor(socket: Socket) {
    this.#socket = socket;
  }

  updateState(state: boolean, typeState: keyof StreamState): void {
    this.#socket.nsp.emit("stream_state", { state, typeState });
  }
  updateFlux(frameBase64: string): void {
    this.#socket.nsp.emit("stream_flux", frameBase64);
  }
  updateError(message: string): void {
    this.#socket.nsp.emit("stream_error", message);
  }
}


export class StreamSocketManager  {
  
  static process : IStreamFfmpegProcess = {}
  static observer : IStreamProccesObserver  = {}

  static registerObserver(direction: StreamDirection, observer: StreamObserver): void {
    const {ctrl_id,ip,q} = direction

    if (!StreamSocketManager.observer.hasOwnProperty(ctrl_id)) {
      StreamSocketManager.observer[ctrl_id] = {}
    }

    if (!StreamSocketManager.observer[ctrl_id].hasOwnProperty(ip)) {
      StreamSocketManager.observer[ctrl_id][ip] = {}
    }

    if (!StreamSocketManager.observer[ctrl_id][ip].hasOwnProperty(q) || StreamSocketManager.observer[ctrl_id][ip][q] === undefined ) {
      StreamSocketManager.observer[ctrl_id][ip][q] = {observer, canDelete: true}
    }

  }

  static unregisterObserver(direction: StreamDirection): void {
    const {ctrl_id,ip,q} = direction
    const observerConfig = StreamSocketManager.#getObserver(direction);
    if(observerConfig){
      if(observerConfig.canDelete){
        delete StreamSocketManager.observer[ctrl_id][ip][q]
      }
    }
  }

  static notifyState(direction: StreamDirection, state: boolean, typeState: keyof StreamState): void {
    const observerConfig = StreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.observer.updateState(state, typeState);
    }
  }
  static notifyFlux(direction: StreamDirection, frameBase64: string): void {
    const observerConfig = StreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.observer.updateFlux(frameBase64);
    }
  }
  static notifyError(direction: StreamDirection, message: string): void {
    const observerConfig = StreamSocketManager.#getObserver(direction);
    if (observerConfig) {
      observerConfig.observer.updateError(message);
    }
  }

  static notifyChangeConfig(ctrl_id:number , q: StreamQuality): void {
    // notificar a todas las camaras que esten emitiendo con la calidad 'q'
    if (StreamSocketManager.process.hasOwnProperty(ctrl_id)) {

      for (const ip in StreamSocketManager.process[ctrl_id]) {
        const qualities = StreamSocketManager.process[ctrl_id][ip];
        if (qualities.hasOwnProperty(q)) {
          if (qualities[q] !== undefined) {
            // cambiar estado -> configurando
            StreamSocketManager.notifyState({ctrl_id,ip,q}, true ,"isConfiguring");
            // cambiar estado observador -> para que no se elimine la instancia
            StreamSocketManager.#setObserverState({ctrl_id,ip,q},false)
            // eliminar instancia
            StreamSocketManager.killProcess({ctrl_id,ip,q})

            // crear nuevo proceso
            StreamSocketManager.createProccess({ctrl_id,ip,q})
            // cambiar estado observador
            StreamSocketManager.#setObserverState({ctrl_id,ip,q},true)
            // cambiar estado 
            StreamSocketManager.notifyState({ctrl_id,ip,q}, false ,"isConfiguring");

          }
        }
      }

    }
    
  }

  static #setObserverState(direction: StreamDirection, newState: boolean){
    const observerConfig = StreamSocketManager.#getObserver(direction);
    if(observerConfig){
      observerConfig.canDelete = newState
    }
  }

  static #getObserver(direction: StreamDirection){
    const {ctrl_id,ip,q} = direction
    if (StreamSocketManager.observer.hasOwnProperty(ctrl_id)) {
      if (StreamSocketManager.observer[ctrl_id].hasOwnProperty(ip)) {
        if (StreamSocketManager.observer[ctrl_id][ip].hasOwnProperty(q) && StreamSocketManager.observer[ctrl_id][ip][q] !== undefined ) {
          return StreamSocketManager.observer[ctrl_id][ip][q]
        }
      }
    }

    return undefined
  }

  static async createProccess(direction: StreamDirection){

    const {ctrl_id,ip,q} = direction

    setTimeout( async () => { // esperar un tiempo -> correcto cierre de procesos

      if (!StreamSocketManager.process.hasOwnProperty(ctrl_id)) {
        StreamSocketManager.process[ctrl_id] = {}

      }
  
      if (!StreamSocketManager.process[ctrl_id].hasOwnProperty(ip)) {
        StreamSocketManager.process[ctrl_id][ip] = {}
      }
  
      if (!StreamSocketManager.process[ctrl_id][ip].hasOwnProperty(q) || StreamSocketManager.process[ctrl_id][ip][q] === undefined ) {

        try {
          const newFfmpegArg = await getFfmpegArgs(ctrl_id, ip, q);

          StreamSocketManager.notifyState(direction,true,"isLoading");

          const newFfmpegProcess = spawn("ffmpeg", newFfmpegArg,{stdio:["ignore","pipe", "ignore"]});
  
          StreamSocketManager.process[ctrl_id][ip][q]= {ffmpegProcess: newFfmpegProcess,isChunkInFrame: false, bufferFrame: Buffer.alloc(0)}
            
        } catch (error) {
          console.error(error)
          if (error instanceof CustomError || error instanceof Error) {

            StreamSocketManager.notifyState(direction,false,"isLoading");

            StreamSocketManager.notifyState(direction,true,"isError");
            StreamSocketManager.notifyError(direction,error.message);

            return;
          }
  
          StreamSocketManager.notifyState(direction,false,"isLoading");
          
          StreamSocketManager.notifyState(direction,true,"isError");
          StreamSocketManager.notifyError(direction,"Se ha producido un error inesperado al intentar obtener el stream.");
          return;
        }
      }


      if( StreamSocketManager.process[ctrl_id][ip].hasOwnProperty(q) ){
        const currentProcess = StreamSocketManager.process[ctrl_id][ip][q]; 
        if(currentProcess){
          // Redirigir la salida de ffmpeg al cliente Socket.IO
          currentProcess.ffmpegProcess.stdout.on("data", (data: Buffer) => {
    
            StreamSocketManager.notifyState(direction,false,"isLoading");
  
            if( StreamSocketManager.process[ctrl_id][ip].hasOwnProperty(q)){
              const currentProcess = StreamSocketManager.process[ctrl_id][ip][q];
              if(currentProcess){
                // Verificar marcadores
                let isMarkStart = verifyImageMarkers(data, "start");
                let isMarkEnd = verifyImageMarkers(data, "end");
        
                if (!currentProcess.isChunkInFrame && isMarkStart) {
                  // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
                  currentProcess.isChunkInFrame = true;
                }
        
                if (currentProcess.isChunkInFrame) {
                  // Concatenar nuevos datos al buffer existente
      
                  currentProcess.bufferFrame = Buffer.concat([currentProcess.bufferFrame, data])
        
                  if (verifyImageMarkers(currentProcess.bufferFrame, "complete")) {
                    //Imagen completa
                    const imageBase64 = createImageBase64(currentProcess.bufferFrame);
                    StreamSocketManager.notifyFlux(direction, imageBase64) ; // Emitir datos al cliente a través de Socket.IO
                  }
                }
        
                if (isMarkEnd) {
                  // Limpiar el búfer para la siguiente imagen
                  currentProcess.bufferFrame = Buffer.alloc(0)
                  currentProcess.isChunkInFrame = false;
                }
      
              }
            }
    
          });
  
          currentProcess.ffmpegProcess.on("close", (code, signal) => {
            console.log( `Proceso ffmpeg cerrado con código ${code} y señal ${signal}` );
            if (StreamSocketManager.process[ctrl_id][ip][q]) {
              // delete observer
              StreamSocketManager.unregisterObserver({ctrl_id,ip,q})
    
              console.log("Delete proccess stream ", direction)
              delete StreamSocketManager.process[ctrl_id][ip][q];
            }
          });
        }
      }
  

    }, 100);
  }

  static killProcess(direction: StreamDirection){
    const {ctrl_id,ip,q} = direction ;
    if(StreamSocketManager.process.hasOwnProperty(ctrl_id)){
      if(StreamSocketManager.process[ctrl_id].hasOwnProperty(ip)){
        if( StreamSocketManager.process[ctrl_id][ip].hasOwnProperty(q) ){
          const currentProcess = StreamSocketManager.process[ctrl_id][ip][q]
          if(currentProcess){
            console.log("KillProcess ", direction)
            currentProcess.ffmpegProcess.kill();
          }

        }
      }
    }
  }
  
}