// import { ResultSetHeader } from 'mysql2';
// import { MySQL2 } from '../../database/mysql';
// import { Notification } from '../../types/db';

// export class NotificationRepository {
//   static async save(payload: Omit<Notification, 'n_id'>) {
//     const { n_uuid, evento, titulo, mensaje, data, fecha } = payload;
//     await MySQL2.executeQuery<ResultSetHeader>({
//       sql: `INSERT INTO general.notificacion ( n_uuid, evento, titulo, mensaje, data, fecha ) VALUES ( ? , ? , ? , ? , ? , ? )`,
//       values: [n_uuid, evento, titulo, mensaje, JSON.stringify(data), fecha],
//     });
//   }
// }
