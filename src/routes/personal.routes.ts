import { Router } from 'express';
import { MySQLCargoRepository } from '../models/general/cargo/mysql.cargo.repository';
import { MySQLUserRepository } from '../models/general/usuario/mysql.user.repository';
import { MySQLAccesoRepository } from '../models/general/Acceso/MySQLAccesoRepository';

import { authenticate } from '../middlewares/auth.middleware';
import { PersonalController } from '../controllers/general/personal.controller';
import { MySQLContrataRepository } from '../models/general/contrata/mysql.contrata.repository';
import { MySQLPersonalRespository } from '../models/general/personal/mysql.personal.repository';
import { GeneralMulterMiddleware } from '../middlewares/multer.middleware';
import { multerCreatePersonalArgs } from '../controllers/personal/personalConfigMulter';
const mysqlContrataRepository = new MySQLContrataRepository();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mySQLcargoRepository = new MySQLCargoRepository();
const mySQLUserRepository = new MySQLUserRepository();
const mySQLAccesoRepository = new MySQLAccesoRepository();

const personalController = new PersonalController(mysqlPersonalRepository, mysqlContrataRepository, mySQLUserRepository, mySQLAccesoRepository, mySQLcargoRepository);

export const personalRoutes = Router();
// ========== Controlador ==========

personalRoutes.get('/personales', authenticate, personalController.listPersonalesOffset);
personalRoutes.get('/personales/contrata/:co_id', authenticate, personalController.listPersonalesPorcontrataOffset);

personalRoutes.post('/personales', authenticate, GeneralMulterMiddleware(multerCreatePersonalArgs), personalController.create);
personalRoutes.get('/personales/:p_id', authenticate, personalController.singlePersonal);
personalRoutes.delete('/personales/:p_id', authenticate, personalController.delete);
personalRoutes.put('/personales/:p_id', authenticate, GeneralMulterMiddleware(multerCreatePersonalArgs), personalController.update);
