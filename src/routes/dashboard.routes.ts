import { Router } from 'express';
import { accesoTarjetaRemoto, activePinEntrada, activePinSalida, acumuladoKWH, cameraStates, countAlarma, countTarjeta, maxTemperaturaSensor, ticketContrata } from '../controllers/dashboard';
import { requestValidator } from '../middlewares/validator.middleware';
import { dashboardSharedSchema } from '../schemas/dashboard';
import { dashboardStates } from '../controllers/dashboard/dashboardStates';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { UserRol } from '../types/rol';
const dashboardRouter = Router();

dashboardRouter.get('/dashboard/pinentrada', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), activePinEntrada);
dashboardRouter.get('/dashboard/pinsalida', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), activePinSalida);
dashboardRouter.get('/dashboard/alarma', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), countAlarma);
dashboardRouter.get('/dashboard/tarjeta', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), countTarjeta);
dashboardRouter.get('/dashboard/camera', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema.omit({ date: true, monthly: true }) }), cameraStates);
dashboardRouter.get('/dashboard/state', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema.omit({ date: true, monthly: true }) }), dashboardStates);
dashboardRouter.get('/dashboard/ticketcontrata', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), ticketContrata);
// dashboardRouter.get("/dashboard/ingresocontrata",authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({query:dashboardSharedSchema}),ingresoContrata)
dashboardRouter.get('/dashboard/kwh', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), acumuladoKWH);
dashboardRouter.get('/dashboard/temperatura', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), maxTemperaturaSensor);
dashboardRouter.get('/dashboard/acceso', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: dashboardSharedSchema }), accesoTarjetaRemoto);

export { dashboardRouter };
