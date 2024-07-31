import { z, TypeOf } from "zod";

export const jwtEnv = z.object({
  ACCESS_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRE: z.string().default("1m"),
  // ACCESS_TOKEN_COOKIE_NAME: z.string().default("ukus_token"),
  REFRESH_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_EXPIRE: z.string().default("1d"),
  // REFRESH_TOKEN_COOKIE_NAME: z.string().default("ukus_refresh_token"),
});

export interface IJwtEnv extends TypeOf<typeof jwtEnv> {}