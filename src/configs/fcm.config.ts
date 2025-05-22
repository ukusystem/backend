import { z } from 'zod';

export const fcmEnv = z.object({
  FCM_PROJECT_ID: z.string(),
  FCM_CLIENT_EMAIL: z.string(),
  FCM_PRIVATE_KEY: z.string(),
});
