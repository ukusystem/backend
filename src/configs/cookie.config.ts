import { z, TypeOf } from "zod";

export const cookieEnv = z.object({
    COOKIE_ACCESS_TOKEN_NAME: z.string().default("ukus_token"),
    COOKIE_ACCESS_TOKEN_MAX_AGE: z.coerce.number().positive().default(60*1000), // 1m
    COOKIE_REFRESH_TOKEN_NAME: z.string().default("ukus_refresh_token"),
    COOKIE_REFRESH_TOKEN_MAX_AGE: z.coerce.number().positive().default(24*60*60*1000), // 1d
});

export interface ICookieEnv extends TypeOf<typeof cookieEnv> {}