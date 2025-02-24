import { Router } from 'express';
import { ControladorController } from '../controllers/general/controlador.controller';
import { MySQLContraldorRepository } from '../models/general/controlador/mysql.controlador.repository';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { requestValidator } from '../middlewares/validator.middleware';
import { controladorParamIdSchema } from '../schemas/general/controlador';
import { UserRol } from '../types/rol';
import { paginationUserNotificationSchema } from '../models/general/UserNotification/schemas/PaginationUserNotificationSchema';
import { MySQLUserNotificationRepository } from '../models/general/UserNotification/MySQLUserNotificationRepository';
import { UserNoficationController } from '../controllers/general/user.notification.controller';
import { MySQLNotificationRepository } from '../models/general/Notification/MySQLNotificationRepository';
import { userNotificationParamIdSchema } from '../models/general/UserNotification/schemas/ParamIdSchema';
import { createUserNotificationSchema } from '../models/general/UserNotification/schemas/CreateUserNotificationSchema';

const mysqlControladorRepository = new MySQLContraldorRepository();
const mysqlUserNotificationRepository = new MySQLUserNotificationRepository();
const mysqlNotificationRepository = new MySQLNotificationRepository();

const controladorController = new ControladorController(mysqlControladorRepository);
const userNoficationController = new UserNoficationController(mysqlUserNotificationRepository, mysqlNotificationRepository);

export const generalRoutes = Router();
// ========== Controlador ==========

// GET	/general/controlador Obtener controladores
generalRoutes.get('/general/controlador', authenticate, controladorController.listController);
// GET	/general/controlador/:ctrl_id Obtener controlador por id
generalRoutes.get('/general/controlador/:ctrl_id', authenticate, requestValidator({ params: controladorParamIdSchema }), controladorController.singleController);

// ========== Notificacion Usuario ==========

// GET	/notifications?limit=number&offset=number Listar todos las notificaciones del usuario por paginacion
generalRoutes.get('/notifications', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ query: paginationUserNotificationSchema }), userNoficationController.listOffsetPagination);
// GET	/notifications/:nu_id Obtener notificacion por id
generalRoutes.get('/notifications/:nu_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ params: userNotificationParamIdSchema }), userNoficationController.item);
// POST	/notifications Crear una nueva notificacion.
generalRoutes.post('/notifications', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ body: createUserNotificationSchema }), userNoficationController.create);
// PATCH /notifications/:nu_id Actualizar un notificacion como leido.
generalRoutes.patch('/notifications/:nu_id/read', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor, UserRol.Invitado]), requestValidator({ params: userNotificationParamIdSchema }), userNoficationController.setNotificationRead);
