import mqtt, { MqttClient } from 'mqtt';
import { UserNotificationPayload } from '../../models/UserNotification';
import { v4 as uuid } from 'uuid';
import dayjs from 'dayjs';
interface MqttConfig {
  host: string;
  port: number;
  username: string;
  password: string;
}

export interface AlarmNotificationPayload {
  id?: string;
  u_id?: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  fecha?: string;
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

  public sendAlarmNotification(payload: AlarmNotificationPayload) {
    const topic = this.getAlarmTopic();

    const message: AlarmNotificationPayload = {
      id: payload.id ?? uuid(),
      u_id: payload.u_id,
      tipo: payload.tipo,
      titulo: payload.titulo,
      mensaje: payload.mensaje,
      fecha: payload.fecha ?? dayjs().format('YYYY-MM-DD HH:mm:ss'),
      data: payload.data,
    };
    if (this.client.connected) {
      this.client.publish(topic, JSON.stringify(message), { qos: 1, retain: true }, (error) => {
        if (error) {
          console.error('❌ Error al enviar notificación:', error);
        } else {
          console.log(`🔔 Notificación enviada a alarms: ${JSON.stringify(message)}`);
          // guardar notificacion
        }
      });
    }
  }

  private getUserTopic(user_id: number) {
    return `${this.BASE_TOPIC}/user/${user_id}`;
  }

  private getAlarmTopic() {
    return `${this.BASE_TOPIC}/alarms`;
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
