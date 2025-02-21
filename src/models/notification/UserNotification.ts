import { ResultSetHeader } from 'mysql2';
import { MySQL2 } from '../../database/mysql';
import { UserNofication } from '../../types/db';

export class UserNotificationRepository {
  static async save(payload: UserNofication) {
    const { nu_id, u_id, n_uuid, fecha } = payload;
    await MySQL2.executeQuery<ResultSetHeader>({
      sql: `INSERT INTO general.notificacion_usuario ( nu_id, u_id, n_uuid, fecha ) VALUES ( ? , ? , ? , ? )`,
      values: [nu_id, u_id, n_uuid, fecha],
    });
  }
}
