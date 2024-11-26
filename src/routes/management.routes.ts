import { Router } from 'express';
import { UserController } from '../controllers/management/usuario/user.controller';
import { MySQLUserRepository } from '../controllers/management/usuario/mysql.user.repository';
import { BcryptPasswordHasher } from '../controllers/management/usuario/security/bycript.password.hasher';

const mysqlUserRepository = new MySQLUserRepository();
const bycriptPasswordHasher = new BcryptPasswordHasher();
const userController = new UserController(mysqlUserRepository, bycriptPasswordHasher);

export const managementRoutes = Router();
managementRoutes.get('/management/users', userController.listUsers);
