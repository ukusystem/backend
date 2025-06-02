import { z } from 'zod';

export const fcmEnv = z.object({
  FCM_PROJECT_ID: z.string(),
  FCM_CLIENT_EMAIL: z.string(),
  FCM_PRIVATE_KEY: z.string(),
  FCM_MESSAGING_SENDER_ID: z.string(),
  FCM_STORAGE_BUCKET: z.string(),
  FCM_AUTH_DOMAIN: z.string(),
  FCM_WEB_API_KEY: z.string(),
  FCM_WEB_APP_ID: z.string(),
  FCM_WEB_VAPID: z.string(),
  FCM_ANDROID_API_KEY: z.string(),
  FCM_ANDROID_APP_ID: z.string(),
  FCM_IOS_API_KEY: z.string(),
  FCM_IOS_APP_ID: z.string(),
  FCM_IOS_BUNDLE_ID: z.string(),
  FCM_PUBLISH_TIMEOUT: z.coerce.number().int().positive().default(60),
});
