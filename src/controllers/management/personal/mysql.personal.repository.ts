import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { Personal } from './personal.entity';
import { PersonalRepository } from './personal.repository';
import { CreatePersonalDTO } from './dtos/create.personal.dto';
import { UpdatePersonalDTO } from './dtos/update.personal.dto';

interface PersonalRowData extends RowDataPacket, Personal {}

interface TotalPersonalRowData extends RowDataPacket {
  total: number;
}

export class MySQLPersonalRespository implements PersonalRepository {
  async findByContrataId(co_id: number): Promise<Personal[]> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE activo = 1 AND co_id = ? `, values: [co_id] });
    return listPersonal;
  }

  async softDeleteByContrata(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET activo = 0 WHERE activo = 1 AND co_id = ?`, values: [co_id] });
  }

  async countTotalByCotrataId(co_id: number): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalPersonalRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.personal WHERE activo = 1 AND co_id = ? `, values: [co_id] });
    return totals[0].total;
  }
  async findByDni(dni: string): Promise<Personal | undefined> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE dni = ? AND activo = 1 LIMIT 1`, values: [dni] });
    return listPersonal[0];
  }
  async create(data: CreatePersonalDTO): Promise<number> {
    const { nombre, apellido, telefono, dni, c_id, co_id, foto, correo } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.personal ( nombre, apellido, telefono, dni, c_id, co_id, foto, correo , activo ) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , 1 )`, values: [nombre, apellido, telefono, dni, c_id, co_id, foto, correo] });
    return result.insertId;
  }

  async update(p_id: number, fieldsUpdate: UpdatePersonalDTO): Promise<void> {
    const keyValueList = Object.entries(fieldsUpdate).filter(([, value]) => value !== undefined);
    const queryValues = keyValueList.reduce<{ setQuery: string; setValues: string[] }>(
      (prev, cur, index, arr) => {
        const result = prev;
        const [key, value] = cur;
        result.setQuery = `${result.setQuery.trim()} ${key} = ? ${index < arr.length - 1 ? ', ' : ''}`;
        result.setValues.push(value);
        return result;
      },
      { setQuery: '', setValues: [] },
    );

    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET ${queryValues.setQuery} WHERE p_id = ? LIMIT 1`, values: [...queryValues.setValues, p_id] });

    if (result.affectedRows === 0) {
      throw new Error(`Error al actualizar personal`);
    }
  }

  async softDelete(p_id: number): Promise<void> {
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET activo = 0 WHERE p_id = ? LIMIT 1`, values: [p_id] });
    if (result.affectedRows === 0) {
      throw new Error(`Error al eliminar personal`);
    }
  }

  async findByOffsetPagination(limit: number, offset: number): Promise<Personal[]> {
    const personales = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE activo = 1 ORDER BY p_id ASC LIMIT ? OFFSET ?`, values: [limit, offset] });
    return personales;
  }

  async countTotal(_filters?: any): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalPersonalRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.personal WHERE activo = 1` });
    return totals[0].total;
  }

  async findById(p_id: number): Promise<Personal | undefined> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE p_id = ? AND activo = 1 LIMIT 1`, values: [p_id] });
    return listPersonal[0];
  }
}
