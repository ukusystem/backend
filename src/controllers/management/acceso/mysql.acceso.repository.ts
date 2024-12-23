import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { Acceso } from './acceso.entity';
import { AccesoRepository } from './acceso.repository';
import { CreateAccesoDTO } from './dtos/create.acceso.dto';
import { UpdateAccesoDTO } from './dtos/update.acceso.dto';
import { MySQL2 } from '../../../database/mysql';

interface AccesoRowData extends RowDataPacket, Acceso {}
interface TotalAccespRowData extends RowDataPacket {
  total: number;
}

export class MySQLAccesoRepository implements AccesoRepository {
  async findBySerie(serie: number): Promise<Acceso | undefined> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE serie = ? AND activo = 1 LIMIT 1`, values: [serie] });
    return accesos[0];
  }

  async findById(a_id: number): Promise<Acceso | undefined> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE a_id = ? AND activo = 1 LIMIT 1`, values: [a_id] });
    return accesos[0];
  }

  async create(data: CreateAccesoDTO): Promise<number> {
    const { serie, administrador, p_id, ea_id } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.acceso ( serie, administrador, p_id, ea_id , activo ) VALUES ( ? , ? , ? , ? , 1 )`, values: [serie, administrador, p_id, ea_id] });
    return result.insertId;
  }

  async update(a_id: number, fieldsUpdate: UpdateAccesoDTO): Promise<void> {
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

    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET ${queryValues.setQuery} WHERE a_id = ? LIMIT 1`, values: [...queryValues.setValues, a_id] });

    if (result.affectedRows === 0) {
      throw new Error(`Error al actualizar acceso`);
    }
  }

  async softDelete(a_id: number): Promise<void> {
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET activo = 0 WHERE a_id = ? LIMIT 1`, values: [a_id] });
    if (result.affectedRows === 0) {
      throw new Error(`Error al eliminar acceso`);
    }
  }

  async findByOffsetPagination(limit: number, offset: number): Promise<Acceso[]> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE activo = 1 ORDER BY a_id ASC LIMIT ? OFFSET ?`, values: [limit, offset] });
    return accesos;
  }

  async countTotal(_filters?: any): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalAccespRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.acceso WHERE activo = 1` });
    return totals[0].total;
  }
}
