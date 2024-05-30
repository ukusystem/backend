import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { accesoSocket, alarmaSocket, energiaSocket, pinesEntradaSocket, sensorTemperaturaSocket, ticketSocket , streamRecordSocket, lastSnapshotSocket, sensorTemperaturaSocketFinal, moduloEnergiaSocket, pinesEntradaSocketFinal, registroAccesoSocket, registroEntradaSocket, SensorTemperaturaMap } from "../controllers/socket";
import { streamSocketFinal } from "../controllers/socket/streamFinal";
import { Auth } from "./auth";
import { pinesSalidaSocket } from "../controllers/socket/pinesSalida";

export class Sockets {
  #io: Server;
  
  constructor(httpServer: HttpServer) {

    this.#io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:5173",
          "http://localhost:5174",
          "http://172.16.4.53:3005",
          "http://172.16.4.53:3000",
          "http://172.16.4.3:3000"
        ],
        methods: ["GET", "POST"],
      },
      transports: ["websocket", "polling"],
    });

    this.initEvents()
  }

  initEvents() {
    // Manejar conexión de sockets en el namespace principal
    this.#io.of("/").on("connection", (socket) => {
      console.log("==========================================================");
      console.log("Cliente conectado id:", socket.id);

      // Manejar cierre de conexión Socket.IO
      socket.on("disconnect", () => {
        // console.log("Cliente desconectado:", socket.id);
        // // Obtener el número de clientes conectados después de la desconexión
        // const count = io.engine.clientsCount;
        // const count2 = io.of("/").sockets.size;
        // console.log("clientes: ", count2);
      });

      // Manejar errores de Socket.IO
      socket.on("error", (error) => {
        console.error(`Error en la conexión Socket.IO: ${error.message}`);
      });
    });

    // Namespace "/stream/nodo_id/camp_ip/calidad"
    this.#io.of(/^\/stream\/(\d+)\/([^\/]+)\/(q\d+)$/).use(async (socket, next)=>{
      try {
        const tokenClient = socket.handshake.auth.token;
        const tokenPayload = await Auth.verifyAccessToken(tokenClient);
        if (!tokenPayload) {
          console.log("Error de token")
          return next(new Error("Token no valido"));
        }
        console.log(`Stream Socket |Host: ${socket.handshake.headers.host} | Address: ${socket.handshake.address} | Time: ${socket.handshake.time}`)
        next()
      } catch (error) {
        return next(new Error("Error de autentificacion"));
      }

    }).on("connection", (socket)=>{streamSocketFinal(this.#io, socket)});

    // Namespace : "/sensor/tipo_sensor/region/nodo/id"
    // this.#io.of(/^\/sensor\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/[a-zA-Z0-9]+\/\d+$/).on("connection", (socket)=>{sensorTemperaturaSocket(this.#io, socket)})

    // Namespace : "/sensor_temperatura/ctrl_id/id" 
    this.#io.of(/^\/sensor_temperatura\/\d+\/\d+$/).on("connection", (socket)=>{sensorTemperaturaSocket(this.#io, socket)})
    // Namespace : "/sensor_temperaturafinal/ctrl_id" 
    this.#io.of(/^\/sensor_temperaturafinal\/\d+$/).on("connection", (socket)=>{sensorTemperaturaSocketFinal(this.#io, socket)})

    
    // Namespace : "/energias/nodo_id"
    this.#io.of(/^\/energias\/\d+$/).on("connection", (socket)=>{energiaSocket(this.#io, socket)})
    // Namespace : "/modulo_energia/ctrl_id"
    this.#io.of(/^\/modulo_energia\/\d+$/).on("connection", (socket)=>{moduloEnergiaSocket(this.#io, socket)})


    // Namespace :  "/accesos/nodo_id"
    this.#io.of(/^\/accesos\/\d+$/).on("connection", (socket)=>{accesoSocket(this.#io, socket)})
    // Namespace :  "/registro_acceso/ctrl_id"
    this.#io.of(/^\/registro_acceso\/\d+$/).on("connection", (socket)=>{registroAccesoSocket(this.#io, socket)})

    // Namespace: "/alarmas/nodo_id/"
    this.#io.of(/^\/alarmas\/\d+$/).on("connection", (socket)=>{alarmaSocket(this.#io, socket)})
    // Namespace :  "/registro_entrada/ctrl_id"
    this.#io.of(/^\/registro_entrada\/\d+$/).on("connection", (socket)=>{registroEntradaSocket(this.#io, socket)})


    // Namespace: "/tickets/ctrl_id/"
    this.#io.of(/^\/tickets\/\d+$/).on("connection", (socket)=>{ticketSocket(this.#io, socket)})

    // Namespace: "/pines_entrada/ctrl_id"
    this.#io.of(/^\/pines_entrada\/\d+$/).on("connection", (socket)=>{pinesEntradaSocket(this.#io, socket)})
    // Namespace: "/pines_entradafinal/ctrl_id"
    this.#io.of(/^\/pines_entradafinal\/\d+$/).on("connection", (socket)=>{pinesEntradaSocketFinal(this.#io, socket)})


    // Namespace: "/pines_salida/ctrl_id"
    this.#io.of(/^\/pines_salida\/\d+$/).on("connection", (socket)=>{pinesSalidaSocket(this.#io, socket)}) // nuevo

    // Namespace: "/record_stream/ctrl_id/ip"
    this.#io.of(/^\/record_stream\/(\d+)\/([\d\.]+)$/).on("connection", (socket)=>{streamRecordSocket(this.#io, socket)})

    // Namespace : "/lastsnapshot/ctrl_id"
    this.#io.of(/^\/lastsnapshot\/\d+$/).on("connection", (socket)=>{lastSnapshotSocket(this.#io, socket)})


  }

  async initMaps(){
    try {
      await SensorTemperaturaMap.init()
    } catch (error) {
      console.log("Socket Model | Error init maps")
      console.log(error)
    }
  }

}


