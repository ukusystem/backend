import { RowDataPacket } from 'mysql2';
import { MySQL2 } from '../../../database/mysql';
import { Cargo } from './cargo.entity';
import { CargoRepository } from './cargo.repository';

interface CargoRowData extends RowDataPacket, Cargo {}

export class MySQLCargoRepository implements CargoRepository {
  async findById(c_id: number): Promise<Cargo | undefined> {
    const cargos = await MySQL2.executeQuery<CargoRowData[]>({ sql: `SELECT * FROM general.cargo WHERE c_id = ? LIMIT 1`, values: [c_id] });
    return cargos[0];
  }
}
