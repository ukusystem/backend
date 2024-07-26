import express, { Application } from "express";
import cookieParser from "cookie-parser";
import { PORT } from "../configs/server.configs";
import { MySQL2 } from "../database/mysql";
import cors from "cors";
import { authRoutes } from "../routes/auth.routes";
import { errorController } from "../controllers/error";
import { initRoutes } from "../routes/init.routes";
import { cameraRoutes } from "../routes/camera.routes";
import { registerRoutes } from "../routes/register.routes";
import { ticketRoutes } from "../routes/ticket.routes";

import { createServer } from "node:http";
import path from "node:path";
import { Sockets } from "./socket";
import {smartMapRoutes } from "../routes/smartmap.routes";
import { siteRoutes } from "../routes/site.routes";

import { vmsRoutes } from "../routes/vms.routes";
import { frontEndRoutes } from "../routes/frontend.routes";
import { DeteccionMovimiento } from "./camera/CameraMotion";
import { main } from "./controllerapp/controller";
import { MedidorEnergiaMap, PinesEntradaMap, PinesSalidaMap, RegistroAccesoMap, RegistroEntradaMap, SensorTemperaturaMap } from "../controllers/socket";
import { ContrataMap, EquipoAccesoMap, EquipoEntradaMap, EquipoSalidaMap } from "./maps";
import { dashboardRouter } from "../routes/dashboard.routes";

import { createServer as createServerHttps } from "https";
import fs from "fs";

export class ServerApp {
  #app: Application;
  #port: number;
  #httpServer
  
  constructor() {
    this.#app = express();
    this.#port = PORT;
    // this.#httpServer = createServer(this.#app);
    this.#httpServer = createServerHttps(
      {
        key: fs.readFileSync(path.resolve( __dirname, '../../crtssl/key.pem')),
        cert: fs.readFileSync(path.resolve( __dirname, '../../crtssl/crt.pem')),
        passphrase: "test123",
      },
      this.#app
    );
    this.middlewares();
    this.routes();
    this.listen();
  }

  static create( ): ServerApp {
    const server = new ServerApp();
    return server;
  }

  listen() {
    this.#httpServer.listen(this.#port, () => {
      console.log(`Servidor corriendo en el puerto ${this.#port}`);
    });
  }

  static async connectDataBase(){
    await MySQL2.create()
  }

  middlewares() {
    //Cors
    this.#app.use(
      cors({
        credentials: true,
        origin: ["http://localhost:5173","http://localhost:5174", "http://172.16.4.53:3005","http://172.16.4.53:3000","http://172.16.4.3:3000"],
      })
    );
    this.#app.use(express.urlencoded({ extended: false }));
    // Desplegar el directorio público
    this.#app.use( express.static( path.resolve( __dirname, '../../public' )));
    this.#app.use( express.static( path.resolve( __dirname, '../../' ) ) );

    // Parsear y transformar el req.body en json
    this.#app.use(express.json({limit:"10mb"}));
    // Parsear cookies
    this.#app.use(cookieParser());
  }

  routes() {
    // Autentificacion
    this.#app.use("/api/v1", authRoutes);
    // InitApp
    this.#app.use("/api/v1", initRoutes)
    // Camera
    this.#app.use("/api/v1", cameraRoutes)
    // Dashboard:
    this.#app.use("/api/v1",dashboardRouter)
    // Register
    this.#app.use("/api/v1", registerRoutes)
    // Ticket
    this.#app.use("/api/v1", ticketRoutes)
    // Vms
    this.#app.use("/api/v1",vmsRoutes)
    // SmartMap
    this.#app.use("/api/v1",smartMapRoutes)
    // ==== SITE ====
    // Controles:
    this.#app.use("/api/v1", siteRoutes)

    // FrontEnd
    this.#app.use(frontEndRoutes)
    // Otros
    this.#app.all("*", errorController.notFound);

    // Global error handler
    this.#app.use(errorController.globalError);
  }

  async motion() {
    try {
      await DeteccionMovimiento()
    } catch (error) {
      throw error
    }
  }

  websocket(){
    const socket= new  Sockets(this.#httpServer)
    socket.initEvents()
  }

  async initmaps(){
    try {
      // inicializar maps generales primero:
      await ContrataMap.init() // inicializar antes que RegistroAccesoMap
      await EquipoAccesoMap.init()
      await EquipoEntradaMap.init()
      await EquipoSalidaMap.init()

      await SensorTemperaturaMap.init()
      await MedidorEnergiaMap.init()
      await PinesSalidaMap.init()
      await PinesEntradaMap.init()
      await RegistroAccesoMap.init()
      await RegistroEntradaMap.init()
      // await TicketMap.init() // iniciar despues de controller

    } catch (error) {
      console.log("Server Model | Error init maps")
      console.log(error)
    }
  }

  runController(){
    main()
  }
}
