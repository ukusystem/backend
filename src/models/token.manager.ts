import { CronJob } from 'cron';
import { MySQL2 } from '../database/mysql';
import { ResultSetHeader } from 'mysql2';
import { genericLogger } from '../services/loggers';

export class TokenManger {
  private static async deleteRevokeTokens() {
    try {
      await MySQL2.executeQuery<ResultSetHeader>({ sql: `DELETE FROM general.user_token WHERE revoked = 1` });
    } catch (error) {
      genericLogger.error('Error al eliminar token revocados.', error);
    }
  }
  static async init() {
    await TokenManger.deleteRevokeTokens();

    const deleteTokenJob = CronJob.from({
      cronTime: '0 0 0 * * *',
      onTick: async function () {
        try {
          await MySQL2.executeQuery<ResultSetHeader>({ sql: `DELETE FROM general.user_token WHERE revoked = 1` });
        } catch (error) {
          console.log(error);
        }
      },
      onComplete: null,
      start: false,
    });
    deleteTokenJob.start();
  }
}
