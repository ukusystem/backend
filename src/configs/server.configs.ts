import { z, TypeOf } from "zod";

export const serverEnv = z.object({
  NODE_ENV: z.enum(['development', 'production','test']).default("development"),
  SERVER_IP: z.string().ip(),
  SERVER_PORT: z.coerce.number().int().positive().max(65535).default(9001),
  MANAGER_PORT: z.coerce.number().int().positive().max(65535).default(54321),
});

export interface IServerEnv extends TypeOf<typeof serverEnv> {}




