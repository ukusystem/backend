import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { Contrata } from './contrata.entity';
import { ContrataRepository, ContrataWithRubro } from './contrata.repository';
import { CreateContrataDTO } from './dtos/create.contrata.dto';
import { UpdateContrataDTO } from './dtos/update.contrata.dto';

interface TotalContrataRowData extends RowDataPacket {
  total: number;
}
interface ContrataRowData extends RowDataPacket, Contrata {}
interface ContrataRubroRowData extends RowDataPacket {
  co_id: number;
  contrata: string;
  descripcion: string;
  activo: number;
  r_id: number;
  rubro: string;
}

export class MySQLContrataRepository implements ContrataRepository {
  async create(data: CreateContrataDTO): Promise<number> {
    const { contrata, r_id, descripcion } = data;
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `INSERT INTO general.contrata ( contrata, r_id, descripcion , activo ) VALUES ( ? , ? , ? , 1 )`, values: [contrata, r_id, descripcion] });
    return result.insertId;
  }

  async update(co_id: number, fieldsUpdate: UpdateContrataDTO): Promise<void> {
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

    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.contrata SET ${queryValues.setQuery} WHERE co_id = ? LIMIT 1`, values: [...queryValues.setValues, co_id] });

    if (result.affectedRows === 0) {
      throw new Error(`Error al actualizar contrata`);
    }
  }

  async softDelete(co_id: number): Promise<void> {
    const result = await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.contrata SET activo = 0 WHERE co_id = ? LIMIT 1`, values: [co_id] });
    if (result.affectedRows === 0) {
      throw new Error(`Error al eliminar contrata`);
    }
  }

  async findByOffsetPagination(limit: number, offset: number, filters?: { rubros?: (string | number)[] }): Promise<ContrataWithRubro[]> {
    if (filters !== undefined) {
      // if(fi)
    }
    // const tess = filters?.rubros
    const contratas = await MySQL2.executeQuery<ContrataRubroRowData[]>({ sql: `SELECT c.* , r.rubro FROM general.contrata c INNER JOIN general.rubro r ON c.r_id = r.r_id WHERE c.activo = 1 ORDER BY c.co_id DESC LIMIT ? OFFSET ?`, values: [limit, offset] });

    return contratas.map(({ activo, co_id, contrata, descripcion, r_id, rubro }) => ({ activo, co_id, contrata, descripcion, rubro: { r_id, rubro } }));
  }
  async countTotal(_filters?: any): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalContrataRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.contrata WHERE activo = 1` });
    return totals[0].total;
  }
  async findWithRubroById(co_id: number): Promise<ContrataWithRubro | undefined> {
    const contratas = await MySQL2.executeQuery<ContrataRubroRowData[]>({ sql: `SELECT c.* , r.rubro FROM general.contrata c INNER JOIN general.rubro r ON c.r_id = r.r_id WHERE c.co_id = ? AND c.activo = 1 LIMIT 1`, values: [co_id] });
    if (contratas[0]) {
      const { activo, co_id, contrata, descripcion, r_id, rubro } = contratas[0];
      return { activo, co_id, contrata, descripcion, rubro: { r_id, rubro } };
    }
    return undefined;
  }
  async findById(co_id: number): Promise<Contrata | undefined> {
    const contratas = await MySQL2.executeQuery<ContrataRowData[]>({ sql: `SELECT * FROM general.contrata WHERE co_id = ? AND activo = 1 LIMIT 1`, values: [co_id] });
    return contratas[0];
  }
}
