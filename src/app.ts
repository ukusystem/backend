import { ConfigManager } from "./models/config/config.manager";
import { ServerApp } from "./models/server";
import { TicketMap } from "./models/ticketschedule";

(async () => {
  try {
    // Conectar a la base de datos:
    await ServerApp.connectDataBase();

    await ConfigManager.init()
    
    // Crear un servidor
    const server = new ServerApp();
    // Inicializar websockets
    server.websocket();
    // Inicializar dectecion de movimiento
    // await server.motion()

    // Init Maps
    await server.initmaps()

    // Mio
    server.runController();

    await TicketMap.init()

    // test()
  } catch (error) {
    console.log(error);
    process.exit(1)
  }
})();

