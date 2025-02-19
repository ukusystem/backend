import { ResultSetHeader } from 'mysql2';
import { MySQL2 } from '../database/mysql';

export interface UserNotificationPayload {
  id: string;
  u_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  data?: Record<string, unknown>; // Datos adicionales que puedes enviar
}

export class UserNotification {
  static async save(payload: UserNotificationPayload) {
    const { id, u_id, tipo, titulo, mensaje, fecha } = payload;
    await MySQL2.executeQuery<ResultSetHeader>({
      sql: `INSERT INTO general.notificacion_usuario ( id, u_id, tipo, titulo, mensaje, fecha ) VALUES ( ? , ? , ? , ? , ? , ? )`,
      values: [id, u_id, tipo, titulo, mensaje, fecha],
    });
  }
}
