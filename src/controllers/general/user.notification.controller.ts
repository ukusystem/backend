import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { CreateEntityResponse, EntityResponse, OffsetPaginationResponse, UpdateResponse } from '../../types/shared';
import { UserNoficationData, UserNotificationRepository } from '../../models/general/UserNotification/UserNoficationRepository';
import { PaginationUserNotification } from '../../models/general/UserNotification/schemas/PaginationUserNotificationSchema';
import { RequestWithUser } from '../../types/requests';
import { UserNofication } from '../../models/general/UserNotification/UserNofication';
import { CreateUserNotificationBody } from '../../models/general/UserNotification/schemas/CreateUserNotificationSchema';
import { NotificationRepository } from '../../models/general/Notification/NotificationRepository';
import dayjs from 'dayjs';
import { fcmService } from '../../services/firebase/FcmNotificationService';
import { Auth } from '../../models/auth';
import { genericLogger } from '../../services/loggers';

export class UserNoficationController {
  constructor(
    private readonly user_notification_repository: UserNotificationRepository,
    private readonly notification_repository: NotificationRepository,
  ) {}

  get create() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const userNotificationDTO: CreateUserNotificationBody = req.body;

      const notificationFound = await this.notification_repository.findByUuId(userNotificationDTO.n_uuid);
      if (!notificationFound) {
        return res.status(404).json({ success: false, message: `Notificacion no diponible.` });
      }

      const userNotification = await this.user_notification_repository.findByUuId(user.u_id, notificationFound.n_uuid);

      if (userNotification) {
        return res.status(202).json({ success: true, message: `La notificacion ya se encuentra registrado` });
      }

      const newUserNotification = await this.user_notification_repository.create({ ...userNotificationDTO, u_id: user.u_id });

      const response: CreateEntityResponse = {
        id: newUserNotification.nu_id,
        message: 'Notificacion de usuario creado satisfactoriamente',
      };

      res.status(201).json(response);
    });
  }
  get setNotificationRead() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { n_uuid } = req.params as { n_uuid: string };

      const userNotificationFound = await this.user_notification_repository.findByUuId(user.u_id, n_uuid);
      if (!userNotificationFound) {
        return res.status(404).json({ success: false, message: `Notificacion de usuario no diponible.` });
      }

      await this.user_notification_repository.update(user.u_id, userNotificationFound.nu_id, { fecha_lectura: dayjs().format('YYYY-MM-DD HH:mm:ss'), leido: 1 });

      const response: UpdateResponse<UserNofication> = {
        message: 'La notificación ha sido marcada como leída.',
      };

      return res.status(200).json(response);
    });
  }
  get readAllNotification() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      await this.user_notification_repository.readAll(user.u_id);

      const response: UpdateResponse<UserNofication> = {
        message: 'Todas las notificaciónes han sido marcadas como leída.',
      };

      return res.status(200).json(response);
    });
  }

  get listOffsetPagination() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const { offset, limit, unread } = req.query as PaginationUserNotification;

      const final_limit: number = limit !== undefined ? Math.min(Math.max(Number(limit), 0), 100) : 10; // default limit : 10 ,  max limit : 100

      const final_offset: number = offset !== undefined ? Number(offset) : 0; // default offset : 0

      const userNotifications = await this.user_notification_repository.findByOffsetPagination(user.u_id, final_limit, final_offset, unread === 'true');
      // const total = await this.user_notification_repository.countTotal(user.u_id);

      const response: OffsetPaginationResponse<UserNoficationData> = {
        data: userNotifications,
        meta: {
          limit: final_limit,
          offset: final_offset,
          currentCount: userNotifications.length,
          totalCount: 0,
        },
      };

      return res.json(response);
    });
  }

  get suscribeToFcmTopic() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { fcmToken } = req.body as { fcmToken: string };
      // const isValidTOken = await fcmService.verifyFcmToken(fcmToken);

      // if (!isValidTOken) {
      //   res.status(400).json({ message: 'Token FCM invalido.' });
      //   return;
      // }

      await fcmService.subscribeToTopic(fcmToken, { rl_id: user.rl_id, co_id: user.co_id, u_id: user.u_id });

      res.json({ message: 'Dispositivo suscrito' });
    });
  }

  get updateSuscribeFcmTopic() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      const ut_uuid = req.ut_uuid;

      if (user === undefined || ut_uuid === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { fcmToken } = req.body as { fcmToken: string };

      const curTokenStored = await Auth.getTokenStoredByUtUuid(ut_uuid);

      if (curTokenStored === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      if (curTokenStored.fcm_token !== fcmToken) {
        await Auth.updateFcmToken(ut_uuid, fcmToken);
        if (curTokenStored.fcm_token) {
          try {
            await fcmService.unsubscribeFromTopic(curTokenStored.fcm_token, { co_id: user.co_id, rl_id: user.rl_id, u_id: user.u_id });
          } catch {
            genericLogger.debug('Error al desuscribir dispositivo. ');
          }
        }
      }

      await fcmService.subscribeToTopic(fcmToken, { rl_id: user.rl_id, co_id: user.co_id, u_id: user.u_id });

      res.json({ message: 'Suscripcion actualizado.' });
    });
  }

  get unsuscribeFromFcmTopic() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }

      const { fcmToken } = req.body as { fcmToken: string };

      await fcmService.unsubscribeFromTopic(fcmToken, { rl_id: user.rl_id, co_id: user.co_id, u_id: user.u_id });

      res.json({ message: 'Dispositivo suscrito' });
    });
  }

  get item() {
    return asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
      const user = req.user;
      if (user === undefined) {
        return res.status(401).json({ message: 'No autorizado' });
      }
      const { n_uuid } = req.params as { n_uuid: string };
      const userNotification = await this.user_notification_repository.findByUuId(user.u_id, n_uuid);
      if (!userNotification) {
        return res.status(400).json({ success: false, message: 'Notificacion de usuario no disponible' });
      }
      const response: EntityResponse<UserNoficationData> = userNotification;
      res.status(200).json(response);
    });
  }
}
