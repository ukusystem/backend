import { Router } from 'express';
import { ControladorController } from '../controllers/general/controlador.controller';
import { MySQLContraldorRepository } from '../models/general/controlador/mysql.controlador.repository';
import { authenticate, rolChecker } from '../middlewares/auth.middleware';
import { requestValidator } from '../middlewares/validator.middleware';
import { controladorParamIdSchema } from '../schemas/general/controlador';
import { UserRol } from '../types/rol';
import { MySQLUserRepository } from '../models/general/usuario/mysql.user.repository';
import { BcryptPasswordHasher } from '../models/general/usuario/security/bycript.password.hasher';
import { MySQLPersonalRespository } from '../models/general/personal/mysql.personal.repository';
import { MySQLRolRepository } from '../models/general/rol/mysql.rol.repository';
import { UserController } from '../controllers/general/user.controller';
// import { paginationUserSchema } from '../models/general/usuario/schemas/pagination.user.schema';
import { updateUserBodySchema, updateUserParamSchema } from '../models/general/usuario/schemas/update.user.schema';
import { createUserSchema } from '../models/general/usuario/schemas/create.user.schema';
import { PersonalController } from '../controllers/general/personal.controller';
import { MySQLContrataRepository } from '../models/general/contrata/mysql.contrata.repository';
import { MySQLAccesoRepository } from '../models/general/acceso/mysql.acceso.repository';
import { GeneralMulterMiddleware } from '../middlewares/multer.middleware';
import { paginationPersonalSchema } from '../models/general/personal/schemas/pagination.personal.schema';
import { updatePersonalParamSchema } from '../models/general/personal/schemas/update.personal.schema';
import { ContrataController } from '../controllers/general/contrata.controller';
import { MySQLRubroRepository } from '../models/general/rubro/mysql.rubro.repository';
import { paginationContrataSchema } from '../models/general/contrata/schemas/pagination.contrata.schema';
import { updateContrataBodySchema, updateContrataParamSchema } from '../models/general/contrata/schemas/update.contrata.schema';
import { createContrataSchema } from '../models/general/contrata/schemas/create.contrata.schema';
import { AccesoController } from '../controllers/general/acceso.controller';
import { MySQLEquipoAccesoRepository } from '../models/general/equipoacceso/mysql.equipo.acceso.repository';
import { paginationAccesoSchema } from '../models/general/acceso/schemas/pagination.acceso.schema';
import { updateAccesoBodySchema, updateAccesoParamSchema } from '../models/general/acceso/schemas/update.acceso.schema';
import { createAccesoSchema } from '../models/general/acceso/schemas/create.acceso.schema';
import { RubroController } from '../controllers/general/rubro.controller';
// import { CargoController } from '../controllers/general/cargo.controller';
// import { RolController } from '../controllers/general/rol.controller';
import { EquipoAccesoController } from '../controllers/general/equipo.acceso.controller';
// import { MySQLCargoRepository } from '../models/general/cargo/mysql.cargo.repository';
import { rubroParamIdSchema } from '../models/general/rubro/schemas/param.id.schema';
// import { cargoParamIdSchema } from '../models/general/cargo/schemas/param.id.schema';
// import { rolParamIdSchema } from '../models/general/rol/schemas/param.id.schema';
import { equipoAccesoParamIdSchema } from '../models/general/equipoacceso/schemas/param.id.schema';

const mysqlControladorRepository = new MySQLContraldorRepository();

const mysqlUserRepository = new MySQLUserRepository();
const bycriptPasswordHasher = new BcryptPasswordHasher();
const mysqlPersonalRepository = new MySQLPersonalRespository();
const mysqlRolRepository = new MySQLRolRepository();
const mysqlContrataRepository = new MySQLContrataRepository();
const mysqlAccesoRepository = new MySQLAccesoRepository();
const mysqlRubroRepository = new MySQLRubroRepository();
const mysqlEquipoAccesoRepository = new MySQLEquipoAccesoRepository();
// const mysqlCargoRepository = new MySQLCargoRepository();

const controladorController = new ControladorController(mysqlControladorRepository);
const userController = new UserController(mysqlUserRepository, bycriptPasswordHasher, mysqlPersonalRepository, mysqlRolRepository);
const personalController = new PersonalController(mysqlPersonalRepository, mysqlContrataRepository, mysqlUserRepository, mysqlAccesoRepository);
const contrataController = new ContrataController(mysqlContrataRepository, mysqlRubroRepository, mysqlPersonalRepository, mysqlUserRepository, mysqlAccesoRepository, mysqlControladorRepository);
const accesoController = new AccesoController(mysqlAccesoRepository, mysqlPersonalRepository, mysqlEquipoAccesoRepository);
const rubroController = new RubroController(mysqlRubroRepository);
// const cargoController = new CargoController(mysqlCargoRepository);
// const rolController = new RolController(mysqlRolRepository);
const equipoAccesoController = new EquipoAccesoController(mysqlEquipoAccesoRepository);

export const generalRoutes = Router();

// ========== Controlador ==========
// GET	/general/controlador Obtener controladores
generalRoutes.get('/general/controlador', authenticate, controladorController.listController);
// GET	/general/controlador/:ctrl_id Obtener controlador por id
generalRoutes.get('/general/controlador/:ctrl_id', authenticate, requestValidator({ params: controladorParamIdSchema }), controladorController.singleController);

// ========== Usuario ==========
// GET	/usuarios?limit=number&offset=number Listar todos los usuarios por paginacion
// generalRoutes.get('/usuarios', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationUserSchema }), userController.listUsersOffset); // NO VA
// GET	/usuarios/:u_uuid Obtener usuario por id
generalRoutes.get('/usuarios/:u_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updateUserParamSchema }), userController.singleUser);
// POST	/usuarios Crear un nuevo usuario.
generalRoutes.post('/usuarios', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ body: createUserSchema }), userController.create); // gestor : solo puede crear de un representante, representante: solo puede crear de un integrante
// PATCH /usuarios/:u_uuid Actualizar un usuario.
generalRoutes.patch('/usuarios/:u_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ body: updateUserBodySchema, params: updateUserParamSchema }), userController.update); // gestor : solo puede actualizar de un representante, representante: solo puede actualizar de un integrante
// DELETE /usuarios/:u_uuid Eliminar un usuario.
generalRoutes.delete('/usuarios/:u_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updateUserParamSchema }), userController.delete); // gestor : solo puede eleminar un representante , representante: solo puede eleminar a los integrantes

// ========== Personal ==========
// GET	/personales?limit=number&offset=number Listar todos los personales por paginacion
// generalRoutes.get('/personales', authenticate, rolChecker([UserRol.Administrador, UserRol.Gestor]), requestValidator({ query: paginationPersonalSchema }), personalController.listPersonalesOffset); // NO VA
// GET	/personales/contrata/:co_uuid?limit=number&offset=number Paginacion de los perosnales por contrata
generalRoutes.get('/personales/contrata/:co_uuid', authenticate, rolChecker([UserRol.Representante]), requestValidator({ query: paginationPersonalSchema, params: updateContrataParamSchema }), personalController.offsetPaginationByContrata); // todos los integrantes menos el representante
// GET /personales/:p_uuid Obtener personal por id
generalRoutes.get('/personales/:p_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante, UserRol.Integrante]), requestValidator({ params: updatePersonalParamSchema }), personalController.singlePersonal);
// GET /personales/:p_uuid/usuario Obtener usuario por personal por id
generalRoutes.get('/personales/:p_uuid/usuario', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updatePersonalParamSchema }), personalController.singleUserPersonal);
// GET /personales/:p_uuid/foto Obtener foto personal por id
generalRoutes.get('/personales/:p_uuid/foto', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante, UserRol.Integrante]), requestValidator({ params: updatePersonalParamSchema }), personalController.getPhoto);
// POST	/personales Crear un nuevo personal.
generalRoutes.post('/personales', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), GeneralMulterMiddleware(personalController.createMulterConfig), personalController.createPersonalRepresentante); // gestor solo puede crear un representante, representante max n integrantes
// PATCH /personales/:p_uuid Actualizar un personal.
generalRoutes.patch('/personales/:p_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updatePersonalParamSchema }), GeneralMulterMiddleware(personalController.createMulterConfig), personalController.update); // gestor : solo puede actualizar un representante , representante: solo puede actualizar a los integrantes
// DELETE /personales/:p_uuid Eliminar un personal.
generalRoutes.delete('/personales/:p_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updatePersonalParamSchema }), personalController.delete); // gestor : solo puede eleminar un representante , representante: solo puede eleminar a los integrantes

// ========== Contrata ==========
// GET	/contratas?limit=number&offset=number Listar todos las contratas por paginacion
generalRoutes.get('/contratas', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ query: paginationContrataSchema }), contrataController.listContratasOffset);
// GET /contratas/:co_uuid Obtener contrata por id
generalRoutes.get('/contratas/:co_uuid', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updateContrataParamSchema }), contrataController.singleContrata);
// GET /contratas/:co_uuid Obtener representante por contrata por id
generalRoutes.get('/contratas/:co_uuid/representante', authenticate, rolChecker([UserRol.Gestor, UserRol.Representante]), requestValidator({ params: updateContrataParamSchema }), contrataController.representante);
// POST	/contratas Crear una nueva contrata.
generalRoutes.post('/contratas', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ body: createContrataSchema }), contrataController.create);
// PATCH /contratas/:co_uuid Actualizar una contrata.
generalRoutes.patch('/contratas/:co_uuid', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ body: updateContrataBodySchema, params: updateContrataParamSchema }), contrataController.update);
// DELETE /contratas/:co_uuid Eliminar una contrata.
generalRoutes.delete('/contratas/:co_uuid', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ params: updateContrataParamSchema }), contrataController.delete);

// ========== Acceso ==========
// GET	/accesos?limit=number&offset=number Listar todos los accesos por paginacion
generalRoutes.get('/accesos', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ query: paginationAccesoSchema }), accesoController.listAccesosOffset);
// GET /accesos/:a_id Obtener acceso por id
generalRoutes.get('/accesos/:a_id', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ params: updateAccesoParamSchema }), accesoController.singleAcceso);
// POST	/accesos Crear una nueva acceso.
generalRoutes.post('/accesos', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ body: createAccesoSchema }), accesoController.create);
// PATCH /accesos/:a_id Actualizar un acceso.
generalRoutes.patch('/accesos/:a_id', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ body: updateAccesoBodySchema, params: updateAccesoParamSchema }), accesoController.update);
// DELETE /accesos/:a_id Eliminar un acceso.
generalRoutes.delete('/accesos/:a_id', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ params: updateAccesoParamSchema }), accesoController.delete);

// ========== Rubro ==========
// GET	/rubros Listar todos los rubros
generalRoutes.get('/rubros', authenticate, rolChecker([UserRol.Gestor]), rubroController.list);
// GET /rubros/:r_id Obtener rubro por id
generalRoutes.get('/rubros/:r_id', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ params: rubroParamIdSchema }), rubroController.item);

// ========== Cargo ==========
// GET	/cargos Listar todos los cargos
// generalRoutes.get('/cargos', authenticate, rolChecker([UserRol.Gestor ]), cargoController.list); // no va
// GET /cargos/:c_id Obtener cargo por id
// generalRoutes.get('/cargos/:c_id', authenticate, rolChecker([UserRol.Gestor ]), requestValidator({ params: cargoParamIdSchema }), cargoController.item); // nova

// ========== Rol ==========
// GET	/roles Listar todos los roles
// generalRoutes.get('/roles', authenticate, rolChecker([UserRol.Gestor ]), rolController.list); // no va
// GET /roles/:rl_id Obtener rol por id
// generalRoutes.get('/roles/:rl_id', authenticate, rolChecker([UserRol.Gestor ]), requestValidator({ params: rolParamIdSchema }), rolController.item); // no va

// ========== Equipo de Acceso ==========
// GET	/equiposacceso Listar todos los equipos de acceso
generalRoutes.get('/equiposacceso', authenticate, rolChecker([UserRol.Gestor]), equipoAccesoController.list);
// GET /equiposacceso/:rl_id Obtener equipo acceso por id
generalRoutes.get('/equiposacceso/:ea_id', authenticate, rolChecker([UserRol.Gestor]), requestValidator({ params: equipoAccesoParamIdSchema }), equipoAccesoController.item);
