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
  async softDeleteByPersonalId(p_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET activo = 0 WHERE activo = 1 AND p_id = ?`, values: [p_id] });
  }
  async findByPersonalId(p_id: number): Promise<Array<Acceso>> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE activo = 1 AND p_id = ?  `, values: [p_id] });
    return accesos;
  }
  async findByContrataId(co_id: number): Promise<Array<Acceso>> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT a.* FROM general.acceso a INNER JOIN general.personal p  ON a.p_id = p.p_id AND a.activo = 1 AND p.co_id = ?`, values: [co_id] });
    return accesos;
  }
  async softDeleteByContrataId(co_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso a INNER JOIN general.personal p  ON a.p_id = p.p_id AND a.activo = 1 AND p.co_id = ? SET a.activo = 0`, values: [co_id] });
  }
  async findBySerie(serie: number): Promise<Acceso | undefined> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE serie = ? AND activo = 1 LIMIT 1`, values: [serie] });
    return accesos[0];
  }

  async findById(a_id: number): Promise<Acceso | undefined> {
    const accesos = await MySQL2.executeQuery<AccesoRowData[]>({ sql: `SELECT * FROM general.acceso WHERE a_id = ? AND activo = 1 LIMIT 1`, values: [a_id] });
    return accesos[0];
  }

  async create(data: CreateAccesoDTO): Promise<Acceso> {
    const { serie, administrador, p_id, ea_id } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.acceso ( serie, administrador, p_id, ea_id , activo ) VALUES ( ? , ? , ? , ? , 1 )`, values: [serie, administrador, p_id, ea_id] });
    return { serie, administrador, p_id, ea_id, activo: 1, a_id: result.insertId };
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

    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET ${queryValues.setQuery} WHERE a_id = ? LIMIT 1`, values: [...queryValues.setValues, a_id] });
  }

  async softDelete(a_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.acceso SET activo = 0 WHERE a_id = ? LIMIT 1`, values: [a_id] });
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
