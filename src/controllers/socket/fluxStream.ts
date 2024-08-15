import { ChildProcessByStdio, spawn} from "child_process";
import { Server, Socket, } from "socket.io";
import { createImageBase64, getFfmpegArgs, verifyImageMarkers, } from "../../utils/stream";
import { CustomError } from "../../utils/CustomError";
import { vmsLogger } from "../../services/loggers";
import { z } from "zod";

const streamSchema = z.object({
  ctrl_id: z.coerce.number().int().nonnegative(),
  ip: z.string().ip(),
  q : z.enum(['q1', 'q2','q3']),
});

export const streamSocket = async (io: Server, socket: Socket) => {

  // Obtener ip y calidad
  const nspStream = socket.nsp;
  const [, , xctrl_id, xip, xq] = nspStream.name.split("/"); // Namespace : "/stream/nodo_id/camp_ip/calidad"

  // Validar
  const result = streamSchema.safeParse({ ctrl_id: xctrl_id, ip: xip, q : xq });
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
  
  const validatedNsp = result.data;
  const direction : StreamDirection = { ctrl_id: validatedNsp.ctrl_id, ip: validatedNsp.ip, q: validatedNsp.q as StreamQuality, };
  const {ctrl_id,ip,q} = direction

  console.log(`Cliente ID: ${socket.id} | Petición Stream ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`)
  
  StreamSocketManager.createProccess(direction)
  const observer = new StreamSocketObserver(socket);
  StreamSocketManager.registerObserver(direction, observer);

  // Manejar cierre de conexión
  socket.on("disconnect", () => {
    console.log("Cliente desconectado ID:", socket.id);
    const clientsCount = io.of(`/stream/${ctrl_id}/${ip}/${q}`).sockets.size;
    console.log(`Numero de clientes conectados: ${clientsCount} | ctrl_id: ${ctrl_id}, ip: ${ip}, q:${q}`)
    if (clientsCount == 0 ) {
      StreamSocketManager.killProcess(direction)
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
    [ip: string]: {
      [q : string]: {
        ffmpegProcess: ChildProcessByStdio<null, any, null>;
        isChunkInFrame: boolean;
        bufferFrame: Buffer;
      };
    };
  };
}

interface IStreamProccesObserver {
  [ctrl_id: number]: {
    [ip: string]: {
      [q : string]: {
        observer: StreamObserver,
        canDelete: boolean
      }
    };
  };
}
interface IStreamProccesObserverFinal {
  [ctrl_id: number]: {
    [ip: string]: Partial<{
      [q in StreamQuality]: Map<string,{observer: StreamObserver,canDelete: boolean}>
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
  static observerFinal : IStreamProccesObserverFinal  = {}

  static registerObserver(direction: StreamDirection, observer: StreamObserver): void {
    const {ctrl_id,ip,q} = direction

    if (!StreamSocketManager.observer.hasOwnProperty(ctrl_id)) {
      StreamSocketManager.observer[ctrl_id] = {}
    }

    if (!StreamSocketManager.observer[ctrl_id].hasOwnProperty(ip)) {
      StreamSocketManager.observer[ctrl_id][ip] = {}
    }

    if (!StreamSocketManager.observer[ctrl_id][ip].hasOwnProperty(q)) {
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
          // cambiar estado -> configurando
          StreamSocketManager.notifyState({ctrl_id,ip,q}, false ,"isSuccess");
          StreamSocketManager.notifyState({ctrl_id,ip,q}, true ,"isConfiguring");
          // cambiar estado observador -> para que no se elimine la instancia

          StreamSocketManager.#setObserverState({ctrl_id,ip,q},false)
          // eliminar instancia
          StreamSocketManager.killProcess({ctrl_id,ip,q})

          setTimeout(() => {
            // crear nuevo proceso
            console.log("Creando nuevo proceso : ",{ctrl_id,ip,q})
            StreamSocketManager.createProccess({ctrl_id,ip,q})
            // cambiar estado observador
            StreamSocketManager.#setObserverState({ctrl_id,ip,q},true)
            // cambiar estado 
            // StreamSocketManager.notifyState({ctrl_id,ip,q}, false ,"isConfiguring");
            // StreamSocketManager.notifyState({ctrl_id,ip,q}, false ,"isSuccess");
          }, 200);

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
        if (StreamSocketManager.observer[ctrl_id][ip].hasOwnProperty(q)) {
          return StreamSocketManager.observer[ctrl_id][ip][q]
        }
      }
    }

    return undefined
  }

  static async createProccess(direction: StreamDirection ){

    const {ctrl_id,ip,q} = direction

    setTimeout( async () => { // esperar un tiempo -> correcto cierre de procesos

      if (!StreamSocketManager.process.hasOwnProperty(ctrl_id)) {
        StreamSocketManager.process[ctrl_id] = {}
  
      }
  
      if (!StreamSocketManager.process[ctrl_id].hasOwnProperty(ip)) {
        StreamSocketManager.process[ctrl_id][ip] = {}
      }
  
      if (!StreamSocketManager.process[ctrl_id][ip].hasOwnProperty(q) ) {
        try {
          
          StreamSocketManager.notifyState(direction, false ,"isConfiguring")
          StreamSocketManager.notifyState(direction,true,"isLoading");
          StreamSocketManager.notifyState(direction,false,"isSuccess");


          const newFfmpegArg = await getFfmpegArgs(ctrl_id, ip, q);
  
          const newFfmpegProcess = spawn("ffmpeg", newFfmpegArg,{stdio:["ignore","pipe", "ignore"]});
  
          StreamSocketManager.process[ctrl_id][ip][q]= {ffmpegProcess: newFfmpegProcess,isChunkInFrame: false, bufferFrame: Buffer.alloc(0)}
            
        } catch (error) {
          // console.error(error)
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
  
      // Redirigir la salida de ffmpeg al cliente Socket.IO
      StreamSocketManager.process[ctrl_id][ip][q].ffmpegProcess.stdout.on("data", (data: Buffer) => {

        if(StreamSocketManager.process[ctrl_id][ip][q]){

          StreamSocketManager.notifyState(direction, false ,"isConfiguring")
          StreamSocketManager.notifyState(direction,false,"isLoading");
          StreamSocketManager.notifyState(direction,true,"isSuccess");
    
          // Verificar marcadores
          let isMarkStart = verifyImageMarkers(data, "start");
          let isMarkEnd = verifyImageMarkers(data, "end");
    
          if (!StreamSocketManager.process[ctrl_id][ip][q].isChunkInFrame && isMarkStart) {
            // Si no estamos dentro de una imagen y se encuentra el marcador de inicio
            StreamSocketManager.process[ctrl_id][ip][q].isChunkInFrame = true;
          }
    
          if (StreamSocketManager.process[ctrl_id][ip][q].isChunkInFrame) {
            // Concatenar nuevos datos al buffer existente
    
            StreamSocketManager.process[ctrl_id][ip][q].bufferFrame = Buffer.concat([StreamSocketManager.process[ctrl_id][ip][q].bufferFrame, data])
    
            if (verifyImageMarkers(StreamSocketManager.process[ctrl_id][ip][q].bufferFrame, "complete")) {
              //Imagen completa
              const imageBase64 = createImageBase64(StreamSocketManager.process[ctrl_id][ip][q].bufferFrame);
              StreamSocketManager.notifyFlux(direction, imageBase64) ; // Emitir datos al cliente a través de Socket.IO
            }
          }
    
          if (isMarkEnd) {
            // Limpiar el búfer para la siguiente imagen
            StreamSocketManager.process[ctrl_id][ip][q].bufferFrame = Buffer.alloc(0)
            StreamSocketManager.process[ctrl_id][ip][q].isChunkInFrame = false;
          }
        }
  
      });
  
      StreamSocketManager.process[ctrl_id][ip][q].ffmpegProcess.on("close", (code, signal) => {
        console.log( `Proceso ffmpeg cerrado con código ${code} y señal ${signal}` );
        if (StreamSocketManager.process[ctrl_id][ip][q]) {
          // delete observer
          // StreamSocketManager.unregisterObserver({ctrl_id,ip,q})
  
          console.log("Delete proccess stream ", direction)
          delete StreamSocketManager.process[ctrl_id][ip][q];
        }
      });

    }, 100);
  }

  static killProcess(direction: StreamDirection){
    const {ctrl_id,ip,q} = direction ;
    if(StreamSocketManager.process.hasOwnProperty(ctrl_id)){
      if(StreamSocketManager.process[ctrl_id].hasOwnProperty(ip)){
        if( StreamSocketManager.process[ctrl_id][ip].hasOwnProperty(q) ){
          const currentProcess = StreamSocketManager.process[ctrl_id][ip][q]
          if(currentProcess){
            // delete observer
            StreamSocketManager.unregisterObserver({ctrl_id,ip,q})
            console.log("KillProcess ", direction)
            currentProcess.ffmpegProcess.kill();
          }

        }
      }
    }
  }
  
}