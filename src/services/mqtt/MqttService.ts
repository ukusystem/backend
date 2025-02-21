import mqtt, { MqttClient } from 'mqtt';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
import { Notification } from '../../types/db';
import { NotificationRepository } from '../../models/notification/Notification';
interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface NotificationPayload {
  id?: string;
  u_id?: number;
  evento: string;
  titulo: string;
  mensaje: string;
  fecha?: string;
  data?: Record<string, unknown>; // Datos adicionales que puedes enviar
}

interface UserNotificationPayload {
  id: string;
  u_id: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha: string;
  data?: Record<string, unknown>; // Datos adicionales que puedes enviar
}

class MqttService {
  private readonly client: MqttClient;
  private readonly BASE_TOPIC: string = 'notifications';
  constructor(config: MqttConfig) {
    this.client = mqtt.connect(`mqtt://${config.host}`, { port: config.port, username: config.username, password: config.password });
    this.client.on('connect', () => {
      console.log('✅ Conectado al broker MQTT');
    });
  }

  async #publishNotification(notification: Omit<Notification, 'n_id'>, topics: Array<string>) {
    if (this.client.connected) {
      // guardar notificacion
      await NotificationRepository.save(notification);
      topics.forEach((topic) => {
        this.client.publish(topic, JSON.stringify(notification), { qos: 1, retain: true }, async (error) => {
          try {
            if (error) {
              console.error('❌ Error al enviar notificación:', error);
            } else {
              console.log(`🔔 Notificación enviada | Topic "${topic}" | ${JSON.stringify(notification)}`);
            }
          } catch (error) {
            console.log(error);
          }
        });
      });
    }
  }

  public sendUserNotification(payload: UserNotificationPayload) {
    const topic = this.getUserTopic(payload.u_id);

    const message = JSON.stringify(payload);
    if (this.client.connected) {
      this.client.publish(topic, message, { qos: 1, retain: true }, (error) => {
        if (error) {
          console.error('❌ Error al enviar notificación:', error);
        } else {
          console.log(`🔔 Notificación enviada a ${payload.u_id}: ${message}`);
          // guardar notificacion
        }
      });
    }
  }

  public publisAdminNotification(payload: NotificationPayload) {
    const topic = this.getAdminTopic();

    const newNotification: Omit<Notification, 'n_id'> = {
      n_uuid: payload.id ?? uuid(),
      evento: payload.evento,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: payload.data,
    };
    this.#publishNotification(newNotification, [topic]);
  }
  public publisContrataNotification(payload: NotificationPayload, co_id: number) {
    const topicContrata = this.getContrataTopic(co_id);
    const topicAdmin = this.getAdminTopic();

    const newNotification: Omit<Notification, 'n_id'> = {
      n_uuid: payload.id ?? uuid(),
      evento: payload.evento,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: payload.data,
    };
    this.#publishNotification(newNotification, [topicContrata, topicAdmin]);
  }

  private getUserTopic(user_id: number) {
    return `${this.BASE_TOPIC}/user/${user_id}`;
  }

  private getAdminTopic() {
    return `${this.BASE_TOPIC}/admin`;
  }

  private getContrataTopic(co_id: number) {
    return `${this.BASE_TOPIC}/contrata/${co_id}`;
  }
}

const mqttConfig: MqttConfig = {
  host: 'localhost',
  port: 1883,
  username: 'usuario1',
  password: 'password123',
};

const mqqtSerrvice = new MqttService(mqttConfig);

export { mqqtSerrvice };
