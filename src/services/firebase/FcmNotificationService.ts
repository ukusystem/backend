// import { messaging } from 'firebase-admin';
import { initializeApp, cert } from 'firebase-admin/app';
import { getMessaging, Message, Messaging } from 'firebase-admin/messaging';
import { v4 as uuid } from 'uuid';
import { appConfig } from '../../configs';
import { UserRol } from '../../types/rol';
import dayjs from 'dayjs';
import { genericLogger } from '../loggers';
import { Notification } from '../../types/db';
import { MySQL2 } from '../../database/mysql';
import { ResultSetHeader } from 'mysql2';

interface UserInfoFcm {
  rl_id: number;
  co_id: number;
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

interface PendingNotification {
  condition: string;
  payload: FcmNotificationPayload;
  data: FcmNotificationData;
}

class FcmNotificationService {
  private readonly BASE_TOPIC: string = '/topics';
  private canPublish = false;
  private pendingNotifications: Map<string, PendingNotification> = new Map();
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

        this.publishPendingNotifications();
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
   * Publicar y eliminar notificaciones pendientes conservados durante el tiempo de espera
   */
  private async publishPendingNotifications(): Promise<void> {
    if (!this.canPublish) return;

    const notifications = Array.from(this.pendingNotifications.values());
    notifications.forEach(({ condition, payload, data }) => {
      this.sendToCondition(condition, payload, data);
    });
    this.pendingNotifications.clear();
  }

  /**
   * Genera el topic FCM según el rol del usuario.
   * @param userInfo - Objeto con información del usuario
   * @returns Objeto con información del topic
   */
  private getTopic(userInfo: UserInfoFcm): TopicInfo {
    const { co_id, rl_id } = userInfo;
    if (rl_id === UserRol.Administrador || rl_id === UserRol.Gestor) {
      return this.getAdminTopic();
    }

    return this.getContrataTopic(co_id);
  }

  /**
   * Genera el topic para usuarios administradores.
   * @returns Objeto con información del topic
   */
  private getAdminTopic(): TopicInfo {
    const adminTopicName = 'admin';
    return { topic: `${this.BASE_TOPIC}/${adminTopicName}`, topic_name: adminTopicName };
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
   * Genera el topic para una contrata específica.
   * @param co_id ID de la contrata
   * @returns Objeto con información del topic
   */
  private getContrataTopic(co_id: number): TopicInfo {
    const contrataTopicName = `contrata_${co_id}`;
    return { topic: `${this.BASE_TOPIC}/${contrataTopicName}`, topic_name: contrataTopicName };
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
   * @param confirm Conservar notificacion producida antes del tiempo de espera de publicacion (opcional)
   */
  private async sendToCondition(condition: string, payload: FcmNotificationPayload, data: FcmNotificationData, confirm?: boolean): Promise<void> {
    if (!this.canPublish) {
      if (confirm) {
        this.pendingNotifications.set(data.n_uuid, { condition: condition, payload: payload, data: data });
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
      await this.fcmMessaging.send(message);
      genericLogger.info(`Notificación enviada con condición: ${condition} => Contenido: ${payload.body}`);
    } catch (error) {
      genericLogger.error(`Error al enviar notificación con condición: ${condition} => Contenido: ${payload.body}`, error);
    }
  }

  /**
   * Publicar notificaciones de administrador a FCM
   * @param payload Contenido de la notificación
   * @param confirm Conservar notificacion producida antes del tiempo de espera de publicacion (opcional)
   */
  public publisAdminNotification(payload: NotificationPayload, confirm?: boolean) {
    const topicInfo = this.getAdminTopic();

    const condition: string = `'${topicInfo.topic_name}' in topics`;

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

    this.sendToCondition(condition, fcmPayload, fcmData, confirm);
  }

  /**
   * Publicar notificaciones de una contrata a FCM
   * @param payload Contenido de la notificación
   * @param co_id ID de la contrata
   * @param confirm Conservar notificacion producida antes del tiempo de espera de publicacion (opcional)
   */
  public publisContrataNotification(payload: NotificationPayload, co_id: number, confirm?: boolean) {
    const adminTopicInfo = this.getAdminTopic();
    const contrataTopicInfo = this.getContrataTopic(co_id);

    const condition: string = `'${adminTopicInfo.topic_name}' in topics || '${contrataTopicInfo.topic_name}' in topics`;

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

    this.sendToCondition(condition, fcmPayload, fcmData, confirm);
  }
}

const fcmService = new FcmNotificationService({
  projectId: appConfig.fcm.project_id,
  clientEmail: appConfig.fcm.client_email,
  privateKey: appConfig.fcm.private_key,
});

export { fcmService };
