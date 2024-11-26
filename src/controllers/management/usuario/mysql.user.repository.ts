import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { CreateUserDTO } from './dtos/create.user.dto';
import { Usuario } from './user.entity';
import { UserRepository } from './user.repository';
import { UpdateUserDTO } from './dtos/update.user.dto';

interface UsuarioRowData extends RowDataPacket, Usuario {}

export class MySQLUserRepository implements UserRepository {
  async findByCursorPagination(limit: number, cursor?: number): Promise<Usuario[]> {
    const firtsQuery = `SELECT u_id, usuario, rl_id, fecha, p_id, activo FROM general.usuario WHERE activo = 1 ORDER BY u_id DESC LIMIT ${limit}`;
    const othersQuery = `SELECT u_id, usuario, rl_id, fecha, p_id, activo FROM general.usuario WHERE u_id < ${cursor} AND activo = 1 ORDER BY u_id DESC LIMIT ${limit} `;
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: cursor ? othersQuery : firtsQuery });
    return users;
  }

  async create(data: CreateUserDTO): Promise<number> {
    const { usuario, contraseña, rl_id, p_id } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.usuario ( usuario , contraseña , rl_id , p_id , activo ) VALUES ( ? , ? , ? , ? , 1 )`, values: [usuario, contraseña, rl_id, p_id] });
    return result.insertId;
  }

  async findById(u_id: number): Promise<Usuario | undefined> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE u_id = ? AND activo = 1 LIMIT 1`, values: [u_id] });
    return users[0];
  }

  async update(u_id: number, fieldsUpdate: UpdateUserDTO): Promise<void> {
    const keyValueArrayList = Object.entries(fieldsUpdate).filter(([, value]) => value !== undefined);
    const queryValues = keyValueArrayList.reduce<{ setQuery: string; setValues: string[] }>(
      (prev, cur) => {
        const result = prev;
        const [key, value] = cur;
        result.setQuery = `${result.setQuery.trim()} ${key} = ? `;
        result.setValues.push(value);
        return result;
      },
      { setQuery: '', setValues: [] },
    );
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario SET ${queryValues.setQuery} WHERE u_id = ? LIMIT 1`, values: [...queryValues.setValues, u_id] });

    if (result.affectedRows === 0) {
      throw new Error(`Error al actualizar usuario`);
    }
  }

  async findAll(): Promise<Usuario[]> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE activo = 1` });
    return users;
  }

  async isUsernameAvailable(username: string): Promise<boolean> {
    const users = await MySQL2.executeQuery<UsuarioRowData[]>({ sql: `SELECT * FROM general.usuario WHERE usuario = ? AND activo = 1 LIMIT 1`, values: [username] });
    return users[0] === undefined;
  }

  async softDelete(u_id: number): Promise<void> {
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.usuario SET activo = 0 WHERE u_id = ? LIMIT 1`, values: [u_id] });
    if (result.affectedRows === 0) {
      throw new Error(`Error al eliminar usuario`);
    }
  }
}
