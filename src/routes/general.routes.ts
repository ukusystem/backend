import { Router } from 'express';
import { ControladorController } from '../controllers/general/controlador.controller';
import { MySQLContraldorRepository } from '../models/general/controlador/mysql.controlador.repository';
import { authenticate } from '../middlewares/auth.middleware';
import { requestValidator } from '../middlewares/validator.middleware';
import { controladorParamIdSchema } from '../schemas/general/controlador';

const mysqlControladorRepository = new MySQLContraldorRepository();

const controladorController = new ControladorController(mysqlControladorRepository);

export const generalRoutes = Router();
// ========== Controlador ==========

// GET	/general/controlador Obtener controladores
generalRoutes.get('/general/controlador', authenticate, controladorController.listController);
// GET	/general/controlador/:ctrl_id Obtener controlador por id
generalRoutes.get('/general/controlador/:ctrl_id', authenticate, requestValidator({ params: controladorParamIdSchema }), controladorController.singleController);
