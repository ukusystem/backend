
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

    // Inicializar dectecion de movimiento
    // await server.motion()

    // inciar modo nvr
    // server.startNvrMode()
    
    // Mio
    server.runController();

    await TicketMap.init()

    // test()
  } catch (error) {
    console.log(error);
    process.exit(1)
  }
})();

