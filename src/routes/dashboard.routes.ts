import { Router } from "express";
import { accesoTarjetaRemoto, activePinEntrada, activePinSalida, acumuladoKWH, cameraStates, countAlarma, countTarjeta, ingresoContrata, maxTemperaturaSensor, ticketContrata } from "../controllers/dashboard";
import { requestDataValidator } from "../middlewares/validator.middleware";
import { dashboardSharedSchema } from "../schemas/dashboard";
const dashboardRouter = Router()

dashboardRouter.get("/dashboard/pinentrada",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),activePinEntrada)
dashboardRouter.get("/dashboard/pinsalida",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),activePinSalida)
dashboardRouter.get("/dashboard/alarma",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),countAlarma)
dashboardRouter.get("/dashboard/tarjeta",countTarjeta)
dashboardRouter.get("/dashboard/camera",requestDataValidator({querySchema:dashboardSharedSchema.omit({date:true,monthly:true})},{hasQuery:true}),cameraStates)
dashboardRouter.get("/dashboard/ticketcontrata",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),ticketContrata)
dashboardRouter.get("/dashboard/ingresocontrata",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),ingresoContrata)
dashboardRouter.get("/dashboard/kwh",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),acumuladoKWH)
dashboardRouter.get("/dashboard/temperatura",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),maxTemperaturaSensor)
dashboardRouter.get("/dashboard/acceso",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),accesoTarjetaRemoto)

export {dashboardRouter}