import { CronJob } from 'cron';
import { MySQL2 } from '../database/mysql';
import { ResultSetHeader } from 'mysql2';
import { genericLogger } from '../services/loggers';
import dayjs from 'dayjs';
import { Auth } from './auth';
import { fcmService } from '../services/firebase/FcmNotificationService';

export class TokenManger {
  private static async deleteRevokeTokens() {
    try {
      const curDate = dayjs().format('YYYY-MM-DD HH:mm:ss');
      await MySQL2.executeQuery<ResultSetHeader>({ sql: `DELETE FROM general.user_token WHERE revoked = 1 OR expires_at < '${curDate}' ` });
    } catch (error) {
      genericLogger.error('Error al eliminar token revocados.', error);
    }
  }

  private static async unsuscribeDivices() {
    try {
      const userTokens = await Auth.getRevokedOrExpiredSessions();

      const unsubscribePromises = userTokens.map(async ({ fcm_token, user_id }) => {
        try {
          if (fcm_token) {
            await fcmService.unsubscribeFromTopic(fcm_token, { u_id: user_id });
          }
        } catch (error) {
          genericLogger.error('Error al desuscribir token revocado', error);
        }
      });

      await Promise.all(unsubscribePromises);
    } catch (error) {
      genericLogger.error('Error al eliminar tokens revocados.', error);
    }
  }
  static async init() {
    try {
      await TokenManger.unsuscribeDivices();
      await TokenManger.deleteRevokeTokens();

      const deleteTokenJob = CronJob.from({
        cronTime: '0 0 * * * *',
        onTick: async function () {
          await TokenManger.unsuscribeDivices();
          await TokenManger.deleteRevokeTokens();
        },
        onComplete: null,
        start: false,
      });
      deleteTokenJob.start();
    } catch (error) {
      genericLogger.error('Error al inicializar TokenManager', error);
      throw error;
    }
  }
}
