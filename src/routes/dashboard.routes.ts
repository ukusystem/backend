import { Router } from "express";
import { activePinEntrada, activePinSalida, cameraStates, countAlarma, countTarjeta } from "../controllers/dashboard";
import { requestDataValidator } from "../middlewares/validator.middleware";
import { dashboardSharedSchema } from "../schemas/dashboard";
const dashboardRouter = Router()

dashboardRouter.get("/dashboard/pinentrada",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),activePinEntrada)
dashboardRouter.get("/dashboard/pinsalida",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),activePinSalida)
dashboardRouter.get("/dashboard/alarma",requestDataValidator({querySchema:dashboardSharedSchema},{hasQuery:true}),countAlarma)
dashboardRouter.get("/dashboard/tarjeta",countTarjeta)
dashboardRouter.get("/dashboard/camera",requestDataValidator({querySchema:dashboardSharedSchema.omit({date:true,monthly:true})},{hasQuery:true}),cameraStates)

export {dashboardRouter}