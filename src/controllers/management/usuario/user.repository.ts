import { CreateUserDTO } from './dtos/create.user.dto';
import { UpdateUserDTO } from './dtos/update.user.dto';
import { Usuario } from './user.entity';

export interface UserWithRoleAndPersonal {
  u_id: number;
  usuario: string;
  fecha: string;
  rol: {
    rl_id: number;
    rol: string;
  };
  personal: {
    p_id: number;
    nombre: string;
    apellido: string;
  };
}

export interface UserRepository {
  create(data: CreateUserDTO): Promise<number>;
  findById(u_id: number): Promise<Usuario | undefined>;
  findWithRoleAndPersonalById(u_id: number): Promise<UserWithRoleAndPersonal | undefined>;
  update(u_id: number, fieldsUpdate: UpdateUserDTO): Promise<void>;
  findAll(): Promise<Usuario[]>;
  isUsernameAvailable(username: string): Promise<boolean>;
  isPersonalAvailable(p_id: number): Promise<boolean>;
  softDelete(u_id: number): Promise<void>;
  softDeleteByPersonalId(p_id: number): Promise<void>;
  findByCursorPagination(limit: number, cursor?: number): Promise<Usuario[]>;
  // findByOffsetPagination(limit: number, offset: number): Promise<Usuario[]>;
  findByOffsetPagination(limit: number, offset: number): Promise<UserWithRoleAndPersonal[]>;

  countTotal(filters?: any): Promise<number>;
}

// export interface UserRepository {
//     // Métodos básicos
//     create(data: UserCreateDTO): Promise<number>; // Crear un nuevo usuario y devolver su ID
//     findByUsername(username: string): Promise<Usuario | null>; // Buscar usuario por nombre de usuario
//     findById(u_id: number): Promise<Usuario | null>; // Buscar usuario por ID
//     update(u_id: number, newUser: Usuario): Promise<void>; // Actualizar usuario por ID
//     findAll(): Promise<Usuario[]>; // Obtener todos los usuarios

//     // Métodos de eliminación
//     delete(u_id: number): Promise<void>; // Eliminación permanente (hard delete)
//     softDelete(u_id: number): Promise<void>; // Marcado como eliminado (soft delete)
//     restore(u_id: number): Promise<void>; // Restaurar usuario eliminado (soft delete)

//     // Métodos de búsqueda avanzada
//     findByEmail(email: string): Promise<Usuario | null>; // Buscar usuario por correo
//     search(criteria: Partial<Usuario>): Promise<Usuario[]>; // Búsqueda por criterios dinámicos

//     // Métodos de autenticación y seguridad
//     updatePassword(u_id: number, newPassword: string): Promise<void>; // Actualizar contraseña
//     findByCredentials(username: string, password: string): Promise<Usuario | null>; // Buscar por credenciales

//     // Paginación y filtrado
//     findAllPaginated(page: number, limit: number): Promise<{ data: Usuario[]; total: number }>; // Búsqueda paginada

//     // Métodos de validación y verificación
//     verifyAccount(u_id: number): Promise<void>; // Verificar la cuenta del usuario
//     isUsernameAvailable(username: string): Promise<boolean>; // Verificar disponibilidad del nombre de usuario

//     // Métodos de auditoría
//     logChanges(u_id: number, changes: Partial<Usuario>): Promise<void>; // Registrar cambios realizados en el usuario
//   }
