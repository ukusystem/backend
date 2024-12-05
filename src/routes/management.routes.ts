import { Router } from 'express';
import { UserController } from '../controllers/management/usuario/user.controller';
import { MySQLUserRepository } from '../controllers/management/usuario/mysql.user.repository';
import { BcryptPasswordHasher } from '../controllers/management/usuario/security/bycript.password.hasher';
import { MySQLPersonalRespository } from '../controllers/management/personal/mysql.personal.repository';
import { MySQLRolRepository } from '../controllers/management/rol/mysql.rol.repository';
import { requestValidator } from '../middlewares/validator.middleware';
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
import { MySQLEquipoAccesoRepository } from '../controllers/management/equipoacceso/mysql.equipo.acceso.repository';
import { AccesoController } from '../controllers/management/acceso/acceso.controller';
import { MySQLAccesoRepository } from '../controllers/management/acceso/mysql.acceso.repository';
import { paginationAccesoSchema } from '../controllers/management/acceso/schemas/pagination.acceso.schema';
import { updateAccesoBodySchema, updateAccesoParamSchema } from '../controllers/management/acceso/schemas/update.acceso.schema';
import { createAccesoSchema } from '../controllers/management/acceso/schemas/create.acceso.schema';
import { authenticate } from '../middlewares/auth.middleware';
import { rolParamIdSchema } from '../controllers/management/rol/schemas/param.id.schema';
import { RolController } from '../controllers/management/rol/rol.controller';

const mysqlUserRepository = new MySQLUserRepository();
const bycriptPasswordHasher = new BcryptPasswordHasher();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mysqlRolRepository = new MySQLRolRepository();
const mysqlCargoRepository = new MySQLCargoRepository();
const mysqlContrataRepository = new MySQLContrataRepository();
const mysqlEquipoAccesoRepository = new MySQLEquipoAccesoRepository();
const mysqlAccesoRepository = new MySQLAccesoRepository();
const mysqlRubroRepository = new MySQLRubroRepository();

const userController = new UserController(mysqlUserRepository, bycriptPasswordHasher, mysqlPersonalRepository, mysqlRolRepository);
const personalController = new PersonalController(mysqlPersonalRepository, mysqlCargoRepository, mysqlContrataRepository);
const contrataController = new ContrataController(mysqlContrataRepository, mysqlRubroRepository);
const accesoController = new AccesoController(mysqlAccesoRepository, mysqlPersonalRepository, mysqlEquipoAccesoRepository);
const rolController = new RolController(mysqlRolRepository);

export const managementRoutes = Router();

// ========== Usuario ==========
// GET	/management/users?limit=number&offset=number Listar todos los usuarios por paginacion
managementRoutes.get('/management/users', authenticate, requestValidator({ query: paginationUserSchema }), userController.listUsersOffset);
// GET	/management/users/:u_id Obtener usuario por id
managementRoutes.get('/management/users/:u_id', authenticate, requestValidator({ params: updateUserParamSchema }), userController.singleUser);
// POST	/management/users Crear un nuevo usuario.
managementRoutes.post('/management/users', authenticate, requestValidator({ body: createUserSchema }), userController.create);
// PATCH /management/users/:u_id Actualizar un usuario.
managementRoutes.patch('/management/users/:u_id', authenticate, requestValidator({ body: updateUserBodySchema, params: updateUserParamSchema }), userController.update);
// DELETE /management/users/:u_id Eliminar un usuario.
managementRoutes.delete('/management/users/:u_id', authenticate, requestValidator({ params: updateUserParamSchema }), userController.delete);

// ========== Personal ==========
// GET	/management/personales?limit=number&offset=number Listar todos los personales por paginacion
managementRoutes.get('/management/personales', authenticate, requestValidator({ query: paginationPersonalSchema }), personalController.listPersonalesOffset);
// GET /management/personales/:p_id Obtener personal por id
managementRoutes.get('/management/personales/:p_id', authenticate, requestValidator({ params: updatePersonalParamSchema }), personalController.singlePersonal);
// POST	/management/personales Crear un nuevo personal.
managementRoutes.post('/management/personales', authenticate, GeneralMulterMiddleware(personalController.createMulterConfig), personalController.create);
// PATCH /management/personales/:p_id Actualizar un personal.
managementRoutes.patch('/management/personales/:p_id', authenticate, requestValidator({ params: updatePersonalParamSchema }), GeneralMulterMiddleware(personalController.createMulterConfig), personalController.update);
// DELETE /management/personales/:p_id Eliminar un personal.
managementRoutes.delete('/management/personales/:p_id', authenticate, requestValidator({ params: updatePersonalParamSchema }), personalController.delete);

// ========== Contrata ==========
// GET	/management/contratas?limit=number&offset=number Listar todos las contratas por paginacion
managementRoutes.get('/management/contratas', authenticate, requestValidator({ query: paginationContrataSchema }), contrataController.listContratasOffset);
// GET /management/contratas/:co_id Obtener contrata por id
managementRoutes.get('/management/contratas/:co_id', authenticate, requestValidator({ params: updateContrataParamSchema }), contrataController.singleContrata);
// POST	/management/contratas Crear una nueva contrata.
managementRoutes.post('/management/contratas', authenticate, requestValidator({ body: createContrataSchema }), contrataController.create);
// PATCH /management/contratas/:co_id Actualizar una contrata.
managementRoutes.patch('/management/contratas/:co_id', authenticate, requestValidator({ body: updateContrataBodySchema, params: updateContrataParamSchema }), contrataController.update);
// DELETE /management/contratas/:co_id Eliminar una contrata.
managementRoutes.delete('/management/contratas/:co_id', authenticate, requestValidator({ params: updateContrataParamSchema }), contrataController.delete);

// ========== Acceso ==========
// GET	/management/accesos?limit=number&offset=number Listar todos los accesos por paginacion
managementRoutes.get('/management/accesos', authenticate, requestValidator({ query: paginationAccesoSchema }), accesoController.listAccesosOffset);
// GET /management/accesos/:a_id Obtener acceso por id
managementRoutes.get('/management/accesos/:a_id', authenticate, requestValidator({ params: updateAccesoParamSchema }), accesoController.singleAcceso);
// POST	/management/accesos Crear una nueva acceso.
managementRoutes.post('/management/accesos', authenticate, requestValidator({ body: createAccesoSchema }), accesoController.create);
// PATCH /management/accesos/:a_id Actualizar un acceso.
managementRoutes.patch('/management/accesos/:a_id', authenticate, authenticate, requestValidator({ body: updateAccesoBodySchema, params: updateAccesoParamSchema }), accesoController.update);
// DELETE /management/accesos/:a_id Eliminar un acceso.
managementRoutes.delete('/management/accesos/:a_id', authenticate, requestValidator({ params: updateAccesoParamSchema }), accesoController.delete);

// ========== Rol ==========
// GET	/management/roles Listar todos los roles
managementRoutes.get('/management/roles', authenticate, rolController.listRoles);
// GET /management/roles/:rl_id Obtener rol por id
managementRoutes.get('/management/roles/:rl_id', authenticate, requestValidator({ params: rolParamIdSchema }), rolController.singleRol);
