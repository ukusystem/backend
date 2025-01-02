import { Router } from "express";
import { accesoTarjetaRemoto, activePinEntrada, activePinSalida, acumuladoKWH, cameraStates, countAlarma, countTarjeta, maxTemperaturaSensor, ticketContrata } from "../controllers/dashboard";
import { requestDataValidator } from "../middlewares/validator.middleware";
import { dashboardSharedSchema } from "../schemas/dashboard";
import { dashboardStates } from "../controllers/dashboard/dashboardStates";
import { authenticate } from "../middlewares/auth.middleware";
const dashboardRouter = Router()

dashboardRouter.get("/dashboard/pinentrada",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),activePinEntrada)
dashboardRouter.get("/dashboard/pinsalida",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),activePinSalida)
dashboardRouter.get("/dashboard/alarma",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),countAlarma)
dashboardRouter.get("/dashboard/tarjeta",authenticate,countTarjeta)
dashboardRouter.get("/dashboard/camera",authenticate,requestDataValidator({querySchema:dashboardSharedSchema.omit({date:true,monthly:true})},{hasQuery:true}),cameraStates)
dashboardRouter.get("/dashboard/state",authenticate,requestDataValidator({querySchema:dashboardSharedSchema.omit({date:true,monthly:true})},{hasQuery:true}),dashboardStates)
dashboardRouter.get("/dashboard/ticketcontrata",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),ticketContrata)
// dashboardRouter.get("/dashboard/ingresocontrata",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),ingresoContrata)
dashboardRouter.get("/dashboard/kwh",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),acumuladoKWH)
dashboardRouter.get("/dashboard/temperatura",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),maxTemperaturaSensor)
dashboardRouter.get("/dashboard/acceso",authenticate,requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),accesoTarjetaRemoto)

export {dashboardRouter}