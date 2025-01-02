import { z, TypeOf } from 'zod';

export const jwtEnv = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRE: z.string().default('1m'),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRE: z.string().default('1d'),
  ENCRYPT_TOKEN_SECRET: z.string(),
});

export interface IJwtEnv extends TypeOf<typeof jwtEnv> {}
