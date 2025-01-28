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
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { rolParamIdSchema } from '../controllers/management/rol/schemas/param.id.schema';
import { RolController } from '../controllers/management/rol/rol.controller';
import { rubroParamIdSchema } from '../controllers/management/rubro/schemas/param.id.schema';
import { RubroController } from '../controllers/management/rubro/rubro.controller';
import { UserRol } from '../types/rol';
import { MySQLContraldorRepository } from '../models/general/controlador/mysql.controlador.repository';
import { cargoParamIdSchema } from '../controllers/management/cargo/schemas/param.id.schema';
import { MySQLCargoRepository } from '../controllers/management/cargo/mysql.cargo.repository';
import { CargoController } from '../controllers/management/cargo/cargo.controller';
import { EquipoAccesoController } from '../controllers/management/equipoacceso/equipo.acceso.controller';
import { equipoAccesoParamIdSchema } from '../controllers/management/equipoacceso/schemas/param.id.schema';

const mysqlUserRepository = new MySQLUserRepository();
const bycriptPasswordHasher = new BcryptPasswordHasher();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mysqlRolRepository = new MySQLRolRepository();
const mysqlContrataRepository = new MySQLContrataRepository();
const mysqlEquipoAccesoRepository = new MySQLEquipoAccesoRepository();
const mysqlAccesoRepository = new MySQLAccesoRepository();
const mysqlRubroRepository = new MySQLRubroRepository();
const mysqlControladorRepository = new MySQLContraldorRepository();
const mysqlCargoRepository = new MySQLCargoRepository();

const userController = new UserController(mysqlUserRepository, bycriptPasswordHasher, mysqlPersonalRepository, mysqlRolRepository);
const personalController = new PersonalController(mysqlPersonalRepository, mysqlContrataRepository, mysqlUserRepository, mysqlAccesoRepository);
const contrataController = new ContrataController(mysqlContrataRepository, mysqlRubroRepository, mysqlPersonalRepository, mysqlUserRepository, mysqlAccesoRepository, mysqlControladorRepository);
const accesoController = new AccesoController(mysqlAccesoRepository, mysqlPersonalRepository, mysqlEquipoAccesoRepository);
const rolController = new RolController(mysqlRolRepository);
const rubroController = new RubroController(mysqlRubroRepository);
const cargoController = new CargoController(mysqlCargoRepository);
const equipoAccesoController = new EquipoAccesoController(mysqlEquipoAccesoRepository);

export const managementRoutes = Router();
//  rolChecker([UserRol.Administrador, UserRol.Gestor]) rolChecker([UserRol.Administrador])

// ========== Usuario ==========
// GET	/usuarios?limit=number&offset=number Listar todos los usuarios por paginacion
managementRoutes.get('/usuarios', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationUserSchema }), userController.listUsersOffset);
// GET	/usuarios/:u_id Obtener usuario por id
managementRoutes.get('/usuarios/:u_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updateUserParamSchema }), userController.singleUser);
// POST	/usuarios Crear un nuevo usuario.
managementRoutes.post('/usuarios', authenticate, rolChecker([UserRol.Administrador]), requestValidator({ body: createUserSchema }), userController.create);
// PATCH /usuarios/:u_id Actualizar un usuario.
managementRoutes.patch('/usuarios/:u_id', authenticate, rolChecker([UserRol.Administrador]), requestValidator({ body: updateUserBodySchema, params: updateUserParamSchema }), userController.update);
// DELETE /usuarios/:u_id Eliminar un usuario.
managementRoutes.delete('/usuarios/:u_id', authenticate, rolChecker([UserRol.Administrador]), requestValidator({ params: updateUserParamSchema }), userController.delete);

// ========== Personal ==========
// GET	/personales?limit=number&offset=number Listar todos los personales por paginacion
managementRoutes.get('/personales', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationPersonalSchema }), personalController.listPersonalesOffset);
// GET /personales/:p_id Obtener personal por id
managementRoutes.get('/personales/:p_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updatePersonalParamSchema }), personalController.singlePersonal);
// POST	/personales Crear un nuevo personal.
managementRoutes.post('/personales', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), GeneralMulterMiddleware(personalController.createMulterConfig), personalController.create);
// PATCH /personales/:p_id Actualizar un personal.
managementRoutes.patch('/personales/:p_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updatePersonalParamSchema }), GeneralMulterMiddleware(personalController.createMulterConfig), personalController.update);
// DELETE /personales/:p_id Eliminar un personal.
managementRoutes.delete('/personales/:p_id', authenticate, rolChecker([UserRol.Administrador]), requestValidator({ params: updatePersonalParamSchema }), personalController.delete);
// GET /personales/:p_id/foto Obtener foto personal por id
managementRoutes.get('/personales/:p_id/foto', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updatePersonalParamSchema }), personalController.getPhoto);

// ========== Contrata ==========
// GET	/contratas?limit=number&offset=number Listar todos las contratas por paginacion
// managementRoutes.get('/contratas', authenticate, requestValidator({ query: paginationContrataSchema }), contrataController.listContratasOffset);
managementRoutes.get('/contratas', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationContrataSchema }), contrataController.listContratasOffset);
// GET /contratas/:co_id Obtener contrata por id
managementRoutes.get('/contratas/:co_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updateContrataParamSchema }), contrataController.singleContrata);
// POST	/contratas Crear una nueva contrata.
managementRoutes.post('/contratas', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: createContrataSchema }), contrataController.create);
// PATCH /contratas/:co_id Actualizar una contrata.
managementRoutes.patch('/contratas/:co_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: updateContrataBodySchema, params: updateContrataParamSchema }), contrataController.update);
// DELETE /contratas/:co_id Eliminar una contrata.
managementRoutes.delete('/contratas/:co_id', authenticate, rolChecker([UserRol.Administrador]), requestValidator({ params: updateContrataParamSchema }), contrataController.delete);

// ========== Acceso ==========
// GET	/accesos?limit=number&offset=number Listar todos los accesos por paginacion
managementRoutes.get('/accesos', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationAccesoSchema }), accesoController.listAccesosOffset);
// GET /accesos/:a_id Obtener acceso por id
managementRoutes.get('/accesos/:a_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updateAccesoParamSchema }), accesoController.singleAcceso);
// POST	/accesos Crear una nueva acceso.
managementRoutes.post('/accesos', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: createAccesoSchema }), accesoController.create);
// PATCH /accesos/:a_id Actualizar un acceso.
managementRoutes.patch('/accesos/:a_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ body: updateAccesoBodySchema, params: updateAccesoParamSchema }), accesoController.update);
// DELETE /accesos/:a_id Eliminar un acceso.
managementRoutes.delete('/accesos/:a_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: updateAccesoParamSchema }), accesoController.delete);

// ========== Rubro ==========
// GET	/rubros Listar todos los rubros
managementRoutes.get('/rubros', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), rubroController.list);
// GET /rubros/:r_id Obtener rubro por id
managementRoutes.get('/rubros/:r_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: rubroParamIdSchema }), rubroController.item);

// ========== Cargo ==========
// GET	/cargos Listar todos los cargos
managementRoutes.get('/cargos', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), cargoController.list);
// GET /cargos/:c_id Obtener cargo por id
managementRoutes.get('/cargos/:c_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: cargoParamIdSchema }), cargoController.item);

// ========== Rol ==========
// GET	/roles Listar todos los roles
managementRoutes.get('/roles', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), rolController.list);
// GET /roles/:rl_id Obtener rol por id
managementRoutes.get('/roles/:rl_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: rolParamIdSchema }), rolController.item);

// ========== Equipo de Acceso ==========
// GET	/equiposacceso Listar todos los equipos de acceso
managementRoutes.get('/equiposacceso', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), equipoAccesoController.list);
// GET /equiposacceso/:rl_id Obtener equipo acceso por id
managementRoutes.get('/equiposacceso/:ea_id', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ params: equipoAccesoParamIdSchema }), equipoAccesoController.item);
