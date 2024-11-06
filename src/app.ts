
import { ServerApp } from "./models/server";
import { SystemManager } from "./models/system";
import { TicketMap } from "./models/ticketschedule";

(async () => {
  try {
    // Conectar a la base de datos:
    await ServerApp.connectDataBase();

    await SystemManager.init()
    
    // Crear un servidor
    const server = new ServerApp();
    // Inicializar websockets
    server.websocket();
    // Init Maps
    await server.initmaps()

    // Iniciar dectecion de movimiento
    if(process.env.START_MOTION_DETECTION === "true"){
      console.log("Detección de movimiento: ON")
      await server.motion()
    }else{
      console.log("Detección de movimiento: OFF")
    }

    // Iniciar modo nvr
    if(process.env.START_NVR === "true"){
      server.startNvrMode()
    }
    
    // Mio
    server.runController();

    await TicketMap.init()

    // test()
  } catch (error) {
    console.error(error);
    process.exit(1)
  }
})();

