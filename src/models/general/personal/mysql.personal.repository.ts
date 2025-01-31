import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { Personal } from './personal.entity';
import { PersonalRepository } from './personal.repository';
import { CreatePersonalDTO } from './dtos/create.personal.dto';
import { UpdatePersonalDTO } from './dtos/update.personal.dto';
import { v4 as uuidv4 } from 'uuid';
interface PersonalRowData extends RowDataPacket, Personal {}

interface TotalPersonalRowData extends RowDataPacket {
  total: number;
}

export class MySQLPersonalRespository implements PersonalRepository {
  async findRepresentanteByCoUuId(co_uuid: string): Promise<Personal | undefined> {
    const personales = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal p INNER JOIN general.contrata c ON p.co_id = c.co_id WHERE c.co_uuid = ? AND p.representante = 1 AND p.activo = 1 LIMIT 1`, values: [co_uuid] });
    return personales[0];
  }
  async isAvailableRepresentante(co_id: number): Promise<boolean> {
    const personales = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE co_id = ? AND representante = 1 AND activo = 1 LIMIT 1`, values: [co_id] });
    return personales.length === 0;
  }
  async countTotalByCotrataUuId(co_uuid: string): Promise<number> {
    const totals = await MySQL2.executeQuery<TotalPersonalRowData[]>({ sql: `SELECT COUNT(*) AS total FROM general.personal p INNER JOIN general.contrata c ON p.co_id = c.co_id WHERE p.activo = 1 AND p.representante = 0 AND c.co_uuid = ? `, values: [co_uuid] });
    return totals[0].total;
  }
  async findByCoUuIdAndOffsetPagination(co_uuid: string, limit: number, offset: number): Promise<Personal[]> {
    const personales = await MySQL2.executeQuery<PersonalRowData[]>({
      sql: `SELECT p.* , c.co_uuid FROM general.personal p INNER JOIN general.contrata c ON p.co_id = c.co_id WHERE p.activo = 1 AND p.representante = 0 AND c.co_uuid = ?  ORDER BY p.p_id ASC LIMIT ? OFFSET ?`,
      values: [co_uuid, limit, offset],
    });
    return personales;
  }
  async findByUuId(p_uuid: string): Promise<Personal | undefined> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE p_uuid = ? AND activo = 1 LIMIT 1`, values: [p_uuid] });
    return listPersonal[0];
  }

  async findByContrataId(co_id: number): Promise<Personal[]> {
    const listPersonal = await MySQL2.executeQuery<PersonalRowData[]>({ sql: `SELECT * FROM general.personal WHERE activo = 1 AND co_id = ? `, values: [co_id] });
    return listPersonal;
  }

  async softDeleteByContrataId(co_id: number): Promise<void> {
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
  async create(data: CreatePersonalDTO, isRepresentante: boolean = false): Promise<Personal> {
    const { nombre, apellido, telefono, dni, co_id, foto, correo } = data;
    const new_p_uuid = uuidv4();
    const representante = isRepresentante ? 1 : 0;
    const result = await MySQL2.executeQuery<ResultSetHeader>({
      sql: `INSERT INTO general.personal ( representante , p_uuid, nombre, apellido, telefono, dni, co_id, foto, correo, c_id, activo ) VALUES ( ? , ? , ? , ? , ? , ? , ? , ? , ? , 1 , 1 )`,
      values: [representante, new_p_uuid, nombre, apellido, telefono, dni, co_id, foto, correo],
    });
    return { nombre, apellido, telefono, dni, co_id, foto, correo, c_id: 1, activo: 1, p_id: result.insertId, p_uuid: new_p_uuid, representante };
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

    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET ${queryValues.setQuery} WHERE p_id = ? LIMIT 1`, values: [...queryValues.setValues, p_id] });
  }

  async softDelete(p_id: number): Promise<void> {
    await MySQL2.executeQuery<ResultSetHeader>({ sql: `UPDATE general.personal SET activo = 0 WHERE activo = 1 AND p_id = ? LIMIT 1`, values: [p_id] });
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
