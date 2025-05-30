// import { messaging } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, Message, Messaging } from 'firebase-admin/messaging';
import { v4 as uuid } from 'uuid';
import { appConfig } from '../../configs';
import dayjs from 'dayjs';
import { genericLogger } from '../loggers';
import { Notification } from '../../types/db';
import { MySQL2 } from '../../database/mysql';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { UserRol } from '../../types/rol';
import { Auth } from '../../models/auth';

interface UserInfoFcm {
  rl_id: number;
  co_id: number;
  u_id: number;
}
interface NotificationPayload {
  n_uuid?: string;
  evento: string;
  titulo: string;
  mensaje: string;
  fecha?: string;
  // data?: Record<string, unknown>;
}

interface FcmNotificationPayload {
  title: string;
  body: string;
  imageUrl?: string;
}

interface FcmNotificationData {
  n_uuid: string;
  evento: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  [key: string]: string;
}

interface TopicInfo {
  topic: string;
  topic_name: string;
}

interface FCMConfig {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

interface PendingTopicNotification {
  condition: string;
  payload: FcmNotificationPayload;
  data: FcmNotificationData;
  assigments: UserNotificationAssigment[];
}

interface UserNotificationAssigment {
  u_id: number;
  n_uuid: string;
}
interface UserRowData extends RowDataPacket {
  u_id: number;
  rl_id: number;
}

class FcmNotificationServiceFinal {
  private readonly BASE_TOPIC: string = '/topics';
  private canPublish = false;
  private pendingTopicNotifications: Map<string, PendingTopicNotification> = new Map();
  private messaging: Messaging | null = null;

  constructor(config: FCMConfig) {
    this.initializeFirebase(config);
  }

  /**
   * Inicializa Firebase con la configuración proporcionada.
   * @param config Credenciales FCM (projectId, clientEmail, privateKey)
   * @remarks Habilita la publicación después del timeout configurado.
   */
  private initializeFirebase(config: FCMConfig): void {
    try {
      const firebaseApp = initializeApp(
        {
          credential: cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
          }),
        },
        'JanoxBackend',
      );

      this.messaging = getMessaging(firebaseApp);

      setTimeout(() => {
        this.canPublish = true;
        genericLogger.info(`Notificacion FCM inicializado.`);

        this.publishPendingTopicNotifications();
      }, appConfig.mqtt.publish_timeout * 1000);
    } catch (error) {
      genericLogger.error(`Error al inicializar FCM`, error);
    }
  }

  /**
   * Getter para la instancia de Messaging de Firebase.
   * @throws Error si Firebase no está inicializado.
   * @returns Instancia configurada de Firebase Messaging.
   */
  private get fcmMessaging(): Messaging {
    if (this.messaging === null) {
      throw new Error('Firebase messaging not initialized');
    }

    return this.messaging;
  }

  /**
   * Publicar y eliminar notificaciones a topics pendientes conservados durante el tiempo de espera
   */
  private async publishPendingTopicNotifications(): Promise<void> {
    if (!this.canPublish) return;

    const notifications = Array.from(this.pendingTopicNotifications.values());
    notifications.forEach(({ condition, payload, data, assigments }) => {
      this.sendToCondition(condition, payload, data, assigments);
    });
    this.pendingTopicNotifications.clear();
  }

  /**
   * Genera el topic FCM para un usuario.
   * @param userInfo - Objeto con información del usuario
   * @returns Objeto con información del topic
   */
  private getTopic(userInfo: UserInfoFcm): TopicInfo {
    const { u_id } = userInfo;

    const userTopicName = this.getUserTopicName(u_id);
    return { topic: `${this.BASE_TOPIC}/${userTopicName}`, topic_name: userTopicName };
  }

  /**
   * Genera el nombre de un topic FCM para un usuario.
   * @param u_id Identificador del usuario
   * @returns Nombre del topic
   */
  private getUserTopicName(u_id: number): string {
    const userTopicName = `user_${u_id}`;
    return userTopicName;
  }

  /**
   * Guarda una notificación en la base de datos.
   * @param payload Datos de la notificación (sin n_id)
   * @throws Error si falla la persistencia
   */
  private async saveNotification(payload: Omit<Notification, 'n_id'>): Promise<void> {
    try {
      const { n_uuid, evento, titulo, mensaje, data, fecha } = payload;
      await MySQL2.executeQuery<ResultSetHeader>({
        sql: `INSERT INTO general.notificacion ( n_uuid, evento, titulo, mensaje, data, fecha ) VALUES ( ? , ? , ? , ? , ? , ? )`,
        values: [n_uuid, evento, titulo, mensaje, JSON.stringify(data), fecha],
      });
    } catch {
      throw new Error('Error al persistir notificación.');
    }
  }

  /**
   * Verifica si un token FCM es válido sin enviar una notificación real.
   * @param token El token FCM a validar.
   * @returns `true` si el token es válido, `false` si no lo es.
   */
  async verifyFcmToken(token: string): Promise<boolean> {
    try {
      await this.fcmMessaging.send(
        {
          token: token,
          data: { test: 'true' },
        },
        true, // `dryRun: true` evita el envío real
      );

      return true;
    } catch (error) {
      genericLogger.debug(`Token FCM invalido`, error);
      return false;
    }
  }

  /**
   * Suscribe un dispositivo (o lista de dispositivos) a un topic de FCM basado en información del usuario.
   * @param deviceToken Token FCM individual o array de tokens a suscribir
   * @param userInfo - Objeto con información del usuario
   */
  async subscribeToTopic(deviceToken: string | string[], userInfo: UserInfoFcm): Promise<void> {
    const topicInfo = this.getTopic(userInfo);
    try {
      const tokens = Array.isArray(deviceToken) ? deviceToken : [deviceToken];
      const response = await this.fcmMessaging.subscribeToTopic(tokens, topicInfo.topic);
      genericLogger.debug(`Dispositivos suscritos al topic ${topicInfo.topic_name}: ${response.successCount} éxitos, ${response.failureCount} fallos`);
    } catch (error) {
      genericLogger.debug(`Error al suscribir al topic: ${topicInfo.topic_name}`, error);
      throw new Error('Error al suscribir al topic');
    }
  }

  /**
   * Desuscribe un dispositivo (o lista de dispositivos) a un topic de FCM basado en información del usuario.
   * @param deviceToken Token FCM individual o array de tokens a desuscribir
   * @param userInfo - Objeto con información del usuario
   */
  async unsubscribeFromTopic(deviceToken: string | string[], userInfo: UserInfoFcm): Promise<void> {
    const topicInfo = this.getTopic(userInfo);
    try {
      const tokens = Array.isArray(deviceToken) ? deviceToken : [deviceToken];
      const response = await this.fcmMessaging.unsubscribeFromTopic(tokens, topicInfo.topic);
      genericLogger.debug(`Dispositivos desuscritos del topic ${topicInfo.topic_name}: ${response.successCount} éxitos, ${response.failureCount} fallos`);
    } catch (error) {
      genericLogger.debug(`Error al desuscribir del topic: ${topicInfo.topic_name}`, error);
      throw new Error('Error al desuscribir del topic');
    }
  }

  // /**
  //  * Envía una notificación a un topic
  //  * @param topic Nombre del topic
  //  * @param payload Contenido de la notificación
  //  * @param data Datos adicionales (opcional)
  //  */
  // private async sendToTopic(topic: string, payload: FcmNotificationPayload, data?: FcmNotificationData): Promise<void> {
  //   const message: Message = {
  //     topic: topic,
  //     notification: payload,
  //     data: data,
  //     android: {
  //       priority: 'high',
  //     },
  //     apns: {
  //       payload: {
  //         aps: {
  //           contentAvailable: true,
  //         },
  //       },
  //     },
  //   };

  //   try {
  //     await this.fcmMessaging.send(message);
  //     genericLogger.info(`Notificación enviada al topic : ${topic} => Contenido: ${payload.body}`);
  //   } catch (error) {
  //     genericLogger.error(`Error al enviar notificación al topic : ${topic} => Contenido: ${payload.body}`, error);
  //   }
  // }

  /**
   * Envía una notificación a múltiples topics usando condiciones
   * Ejemplo de condición: "'TopicA' in topics && ('TopicB' in topics || 'TopicC' in topics)"
   * @param condition Condición FCM para los topics
   * @param payload Contenido de la notificación
   * @param data Datos adicionales (opcional)
   * @param assigments Lista de notificaciones asignadas a cada usuario
   * @param confirm Conservar notificacion producida antes del tiempo de espera de publicacion (opcional)
   */
  private async sendToCondition(condition: string, payload: FcmNotificationPayload, data: FcmNotificationData, assigments: UserNotificationAssigment[], confirm?: boolean): Promise<void> {
    if (!this.canPublish) {
      if (confirm) {
        this.pendingTopicNotifications.set(data.n_uuid, { condition: condition, payload: payload, data: data, assigments });
      }
      return;
    }
    const message: Message = {
      condition: condition,
      notification: payload,
      data: data,
      android: {
        priority: 'high',
      },
      apns: {
        payload: {
          aps: {
            contentAvailable: true,
          },
        },
      },
    };

    try {
      await this.saveNotification({ ...data, data: undefined });
      await this.createUserNotifications(assigments);
      if (condition.length > 0) {
        await this.fcmMessaging.send(message);
        genericLogger.info(`Notificación enviada : ${payload.body}`);
      }
    } catch (error) {
      genericLogger.error(`Error al enviar notificación`, error);
    }
  }

  /**
   * Publicar notificaciones de administrador a FCM
   * @param payload Contenido de la notificación
   * @param confirm Conservar notificacion producida antes del tiempo de espera de publicacion (opcional)
   */
  public async publisAdminNotification(payload: NotificationPayload, confirm?: boolean) {
    const fcmPayload: FcmNotificationPayload = {
      title: payload.titulo,
      body: payload.mensaje,
      imageUrl: undefined,
    };

    const fcmData: FcmNotificationData = {
      n_uuid: payload.n_uuid ?? uuid(),
      evento: payload.evento,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    const adminSessions = await Auth.getAdminSessions();
    const userTopics = adminSessions.reduce<string[]>((prev, cur) => {
      const result = prev;
      const { user_id } = cur;
      const userTopic = this.getUserTopicName(user_id);
      result.push(userTopic);
      return result;
    }, []);
    const condition = userTopics.map((topic) => `'${topic}' in topics`).join(' || ');

    const adminUsers = await this.getAdminUsers();
    const notificacionAssigments = adminUsers.map<UserNotificationAssigment>(({ u_id }) => ({ u_id, n_uuid: fcmData.n_uuid }));

    this.sendToCondition(condition, fcmPayload, fcmData, notificacionAssigments, confirm);
  }

  /**
   * Publicar notificaciones de una contrata a FCM
   * @param payload Contenido de la notificación
   * @param co_id ID de la contrata
   * @param confirm Conservar notificacion producida antes del tiempo de espera de publicacion (opcional)
   */
  public async publisContrataNotification(payload: NotificationPayload, co_id: number, confirm?: boolean) {
    const fcmPayload: FcmNotificationPayload = {
      title: payload.titulo,
      body: payload.mensaje,
      imageUrl: undefined,
    };

    const fcmData: FcmNotificationData = {
      n_uuid: payload.n_uuid ?? uuid(),
      evento: payload.evento,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
    };

    const userSessions = await Auth.getAdminAndGuestContrataSessions(co_id);
    const userTopics = userSessions.reduce<string[]>((prev, cur) => {
      const result = prev;
      const { user_id } = cur;
      const userTopic = this.getUserTopicName(user_id);
      result.push(userTopic);
      return result;
    }, []);
    const condition = userTopics.map((topic) => `'${topic}' in topics`).join(' || ');

    const users = await this.getAdminAndGuestContrataUsers(co_id);
    const notificacionAssigments = users.map<UserNotificationAssigment>(({ u_id }) => ({ u_id, n_uuid: fcmData.n_uuid }));

    this.sendToCondition(condition, fcmPayload, fcmData, notificacionAssigments, confirm);
  }

  /**
   * Obtener lista de usuarios con rol administrador y gestor
   */
  async getAdminUsers(): Promise<UserRowData[]> {
    const adminUsers = await MySQL2.executeQuery<UserRowData[]>({
      sql: `SELECT u_id, rl_id FROM  general.usuario WHERE ( rl_id = ${UserRol.Administrador} OR rl_id = ${UserRol.Gestor} ) AND activo = 1`,
    });

    return adminUsers;
  }
  /**
   * Obtener lista de usuarios con rol administrador , gestor e invitados que pertenecen a una contrata
   * @param co_id ID de la contrata
   */
  async getAdminAndGuestContrataUsers(co_id: number) {
    const users = await MySQL2.executeQuery<UserRowData[]>({
      sql: `SELECT u_id, rl_id FROM  general.usuario u INNER JOIN general.personal p ON u.p_id = p.p_id WHERE ( ( u.rl_id = ${UserRol.Administrador} OR u.rl_id = ${UserRol.Gestor} ) OR ( u.rl_id = ${UserRol.Invitado} AND p.co_id = ? ) ) AND u.activo = 1`,
      values: [co_id],
    });

    return users;
  }

  /**
   * Crear notificaciones de usuario
   * @param assigments Lista de notificaciones asignadas a cada usuario
   */
  async createUserNotifications(assigments: UserNotificationAssigment[]): Promise<void> {
    if (assigments.length === 0) return;

    const fecha_creacion = dayjs().format('YYYY-MM-DD HH:mm:ss');
    const fecha_lectura = null;
    const fecha_entrega = null;
    const leido = 0;

    const placeholders = assigments.map(() => '(?, ?, ?, ?, ?, ?, ?)').join(', ');

    const query = `
    INSERT INTO general.notificacion_usuario
    (nu_id, u_id, n_uuid, fecha_creacion, fecha_entrega, fecha_lectura, leido)
    VALUES ${placeholders}
  `;

    const values = assigments.flatMap((n) => [uuid(), n.u_id, n.n_uuid, fecha_creacion, fecha_entrega, fecha_lectura, leido]);

    await MySQL2.executeQuery<ResultSetHeader>({ sql: query, values: values });
  }
}

const fcmService = new FcmNotificationServiceFinal({
  projectId: appConfig.fcm.project_id,
  clientEmail: appConfig.fcm.client_email,
  privateKey: appConfig.fcm.private_key,
});

export { fcmService };
