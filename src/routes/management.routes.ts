import { Router } from 'express';
import { UserController } from '../controllers/management/usuario/user.controller';
import { MySQLUserRepository } from '../controllers/management/usuario/mysql.user.repository';
import { BcryptPasswordHasher } from '../controllers/management/usuario/security/bycript.password.hasher';
import { MySQLPersonalRespository } from '../controllers/management/personal/mysql.personal.repository';
import { MySQLRolRepository } from '../controllers/management/rol/mysql.rol.repository';
import { requestDataValidator } from '../middlewares/validator.middleware';
import { paginationUserSchema } from '../controllers/management/usuario/schemas/pagination.user.schema';
import { createUserSchema } from '../controllers/management/usuario/schemas/create.user.schema';
import { updateUserBodySchema, updateUserParamSchema } from '../controllers/management/usuario/schemas/update.user.schema';
import { PersonalController } from '../controllers/management/personal/personal.controller';
import { GeneralMulterMiddleware } from '../middlewares/multer.middleware';
import { MySQLCargoRepository } from '../controllers/management/cargo/mysql.cargo.repository';
import { MySQLContrataRepository } from '../controllers/management/contrata/mysql.contrata.repository';
import { paginationPersonalSchema } from '../controllers/management/personal/schemas/pagination.personal.schema';
import { updatePersonalParamSchema } from '../controllers/management/personal/schemas/update.personal.schema';
import { MySQLRubroRepository } from '../controllers/management/rubro/mysql.rubro.repository';
import { ContrataController } from '../controllers/management/contrata/contrata.controller';
import { createContrataSchema } from '../controllers/management/contrata/schemas/create.contrata.schema';
import { updateContrataBodySchema, updateContrataParamSchema } from '../controllers/management/contrata/schemas/update.contrata.schema';
import { paginationContrataSchema } from '../controllers/management/contrata/schemas/pagination.contrata.schema';

const mysqlUserRepository = new MySQLUserRepository();
const bycriptPasswordHasher = new BcryptPasswordHasher();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mysqlRolRepository = new MySQLRolRepository();
const mysqlCargoRepository = new MySQLCargoRepository();
const mysqlContrataRepository = new MySQLContrataRepository();

const mysqlRubroRepository = new MySQLRubroRepository();

const userController = new UserController(mysqlUserRepository, bycriptPasswordHasher, mysqlPersonalRepository, mysqlRolRepository);

const personalController = new PersonalController(mysqlPersonalRepository, mysqlCargoRepository, mysqlContrataRepository);

const contrataController = new ContrataController(mysqlContrataRepository, mysqlRubroRepository);

export const managementRoutes = Router();

// ========== Usuario ==========

// GET	/management/users?limit=number&offset=number Listar todos los usuarios por paginacion
managementRoutes.get('/management/users', requestDataValidator({ querySchema: paginationUserSchema }, { hasQuery: true }), userController.listUsersOffset);
// GET	/management/users/:u_id Obtener usuario por id
managementRoutes.get('/management/users/:u_id', requestDataValidator({ paramSchema: updateUserParamSchema }, { hasParam: true }), userController.singleUser);
// POST	/management/users Crear un nuevo usuario.
managementRoutes.post('/management/users', requestDataValidator({ bodySchema: createUserSchema }, { hasBody: true }), userController.create);
// PATCH /management/users/:u_id Actualizar un usuario.
managementRoutes.patch('/management/users/:u_id', requestDataValidator({ bodySchema: updateUserBodySchema, paramSchema: updateUserParamSchema }, { hasBody: true, hasParam: true }), userController.update);
// DELETE /management/users/:u_id Eliminar un usuario.
managementRoutes.delete('/management/users/:u_id', requestDataValidator({ paramSchema: updateUserParamSchema }, { hasParam: true }), userController.delete);

// ========== Personal ==========

// GET	/management/personales?limit=number&offset=number Listar todos los personales por paginacion
managementRoutes.get('/management/personales', requestDataValidator({ querySchema: paginationPersonalSchema }, { hasQuery: true }), personalController.listPersonalesOffset);
// GET /management/personales/:p_id Obtener personal por id
managementRoutes.get('/management/personales/:p_id', requestDataValidator({ paramSchema: updatePersonalParamSchema }, { hasParam: true }), personalController.singlePersonal);
// POST	/management/personales Crear un nuevo personal.
managementRoutes.post('/management/personales', GeneralMulterMiddleware(personalController.createMulterConfig), personalController.create);
// PATCH /management/personales/:p_id Actualizar un personal.
managementRoutes.patch('/management/personales/:p_id', requestDataValidator({ paramSchema: updatePersonalParamSchema }, { hasParam: true }), GeneralMulterMiddleware(personalController.createMulterConfig), personalController.update);
// DELETE /management/personales/:p_id Eliminar un personal.
managementRoutes.delete('/management/personales/:p_id', requestDataValidator({ paramSchema: updatePersonalParamSchema }, { hasParam: true }), personalController.delete);

// ========== Contrata ==========

// GET	/management/contratas?limit=number&offset=number Listar todos las contratas por paginacion
managementRoutes.get('/management/contratas', requestDataValidator({ querySchema: paginationContrataSchema }, { hasQuery: true }), contrataController.listContratasOffset);
// GET /management/contratas/:co_id Obtener contrata por id
managementRoutes.get('/management/contratas/:co_id', requestDataValidator({ paramSchema: updateContrataParamSchema }, { hasParam: true }), contrataController.singleContrata);
// POST	/management/contratas Crear una nueva contrata.
managementRoutes.post('/management/contratas', requestDataValidator({ bodySchema: createContrataSchema }, { hasBody: true }), contrataController.create);
// PATCH /management/contratas/:co_id Actualizar un usuario.
managementRoutes.patch('/management/contratas/:co_id', requestDataValidator({ bodySchema: updateContrataBodySchema, paramSchema: updateContrataParamSchema }, { hasBody: true, hasParam: true }), contrataController.update);
// DELETE /management/contratas/:co_id Eliminar un usuario.
managementRoutes.delete('/management/contratas/:co_id', requestDataValidator({ paramSchema: updateContrataParamSchema }, { hasParam: true }), contrataController.delete);
