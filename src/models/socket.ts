import { Server as HttpServer } from "http";
import { Server } from "socket.io";
import {  ticketSocket , streamRecordSocket, lastSnapshotSocket, pinEntradaSocket, registroEntradaSocket, voiceStreamSocket, NamespaceControllerState, contollerStateSocket, NamespacePinSalida, pinSalidaSocket, NamespaceMedEnergia, medEnergiaSocket, senTemperaturaSocket, NamespaceSenTemperature, NamespaceSidebarNav, navbarNavSocket, NamespaceLastSnapshot, NamespaceAlarm, alarmSocket, NamespaceRegistroEntrada, NamespacePinEntrada } from "../controllers/socket";
import { camStreamSocket } from "../controllers/socket/stream/camera.stream.socket";
import { NamespaceRegistroAcceso, registroAccesoSocket } from "../controllers/socket/registro.acceso";

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
          "http://172.16.4.3:3000",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.initEvents();
  }

  initEvents() {
    // Manejar conexión de sockets en el namespace principal
    this.#io.of("/").on("connection", (socket) => {

      // Manejar cierre de conexión Socket.IO
      socket.on("disconnect", () => {
      });
      
      // Manejar errores de Socket.IO
      socket.on("error", (error) => {
        console.error(`Error en la conexión Socket.IO: ${error.message}`);
      });

    });

    // Namespace "/stream/nodo_id/cmr_id/calidad"
    this.#io.of(/^\/stream\/(\d+)\/(\d+)\/(q\d+)$/).use(async (socket, next) => {
        try {
          // const cookiesHeader = socket.handshake.headers.cookie; // "token=fsddfjs"
          // console.log(cookiesHeader)
          // const cookies = parserCookie(cookiesHeader)
          // console.log(cookies)
          // if (cookies["token"] === undefined) {
          //   return next(new Error("Token no proporcionado"));
          // }
          // console.log(cookies)
          // const tokenPayload = await Auth.verifyAccessToken(cookies["token"]);
          // if (!tokenPayload) {
          //   console.log("Error de token");
          //   return next(new Error("Token no valido"));
          // }
          // console.log(
          //   `Stream Socket |Host: ${socket.handshake.headers.host} | Address: ${socket.handshake.address} | UserID: ${tokenPayload.id} | Time: ${socket.handshake.time}`
          // );
          next();
        } catch (error) {
          return next(new Error("Error de autentificacion"));
        }
      })
      .on("connection", (socket) => {
        camStreamSocket(this.#io, socket);
      });


    // Namespace : "/sensor_temperatura/ctrl_id/id"
    const SenTempNSP: NamespaceSenTemperature = this.#io.of(/^\/sensor_temperatura\/\d+$/);
    SenTempNSP.on("connection", (socket)=>{senTemperaturaSocket(this.#io,socket)})

    // Namespace : "/modulo_energia/ctrl_id"
    const ModEnergiaNSP: NamespaceMedEnergia = this.#io.of(/^\/modulo_energia\/\d+$/);
    ModEnergiaNSP.on("connection", (socket) => { medEnergiaSocket(this.#io, socket); });

    // Namespace: /sidebar_nav
    const SidebarNavNSP: NamespaceSidebarNav = this.#io.of("/sidebar_nav");
    SidebarNavNSP.on("connection",(socket)=>{navbarNavSocket(this.#io, socket)})

    // Namespace :  "/registro_acceso/ctrl_id"
    const RegAccesoNSP: NamespaceRegistroAcceso = this.#io.of(/^\/registro_acceso\/\d+$/);
    RegAccesoNSP.on("connection", (socket) => { registroAccesoSocket(this.#io, socket); });

    // Namespace :  "/registro_entrada/ctrl_id"
    const RegEntNSP: NamespaceRegistroEntrada = this.#io.of(/^\/registro_entrada\/\d+$/);
    RegEntNSP.on("connection", (socket) => { registroEntradaSocket(this.#io, socket); });

    // Namespace: "/tickets/ctrl_id/"
    this.#io.of(/^\/tickets\/\d+$/).on("connection", (socket) => { ticketSocket(this.#io, socket); });

    // Namespace: "/pin_entrada/ctrl_id"
    const PinEntradaNSP : NamespacePinEntrada = this.#io.of(/^\/pin_entrada\/\d+$/);
    PinEntradaNSP.on("connection", (socket) => { pinEntradaSocket(this.#io, socket); })

    // Namespace: "/controller_state/ctrl_id"    
    const ControllerStateNSP: NamespaceControllerState = this.#io.of(/^\/controller_state\/\d+$/);
    ControllerStateNSP.on("connection",(socket)=>{contollerStateSocket(this.#io,socket);});

    // Namespace: "/pines_salida/ctrl_id"
    const PinSalidaNSP: NamespacePinSalida = this.#io.of(/^\/pines_salida\/\d+$/);
    PinSalidaNSP.on("connection", (socket) => { pinSalidaSocket(this.#io, socket); });

    // Namespace: "/record_stream/ctrl_id/cmr_id"
    this.#io.of(/^\/record_stream\/(\d+)\/\d+$/).on("connection", (socket) => {  streamRecordSocket(this.#io, socket);});

    // Namespace : "/last_snapshot/ctrl_id"
    const LastSnapshotNSP : NamespaceLastSnapshot  = this.#io.of(/^\/last_snapshot\/\d+$/);
    LastSnapshotNSP.on("connection", (socket)=>{ lastSnapshotSocket(this.#io, socket)})

    // Namespace: "/voice_stream/ctrl_id/ip"
    this.#io.of(/^\/voice_stream\/(\d+)\/([\d\.]+)$/).on("connection", (socket) => { voiceStreamSocket(this.#io, socket);});

    // Namespace : "/last_snapshot/ctrl_id"
    const AlarmNSP : NamespaceAlarm  = this.#io.of("/alarm_notification");
    AlarmNSP.on("connection", (socket)=>{ alarmSocket(this.#io, socket)})

  }

  static #parserCookie(cookies: string | undefined) {
    if(cookies === undefined){
      return {}
    }
    const cookieSplit = cookies.split("; ");
    const cookieObject = cookieSplit.reduce<Record<any, string>>(
      (acc, curr) => {
        const result = acc;
        const tokenSplit = curr.split("=");
        result[tokenSplit[0]] = tokenSplit[1] ? tokenSplit[1] : "";
        return result;
      },
      {}
    );
    return cookieObject;
  }

  // async initMaps() {
  //   try {
  //     await SensorTemperaturaManager.init();
  //   } catch (error) {
  //     console.log("Socket Model | Error init maps");
  //     console.log(error);
  //   }
  // }
}


