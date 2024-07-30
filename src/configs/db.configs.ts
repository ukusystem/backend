import { PoolOptions } from "mysql2";
import "dotenv/config";
import { TypeOf, z } from "zod";

export const dbEnv = z.object({
  DB_HOST: z.string().ip().default("127.0.0.1"),
  DB_PORT: z.coerce.number().int().positive().max(65536).default(3306),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_DATABASE: z.string(),
  DB_WAIT_FOR_CONNECTIONS: z.boolean().default(true).optional(),
  DB_CONNECTION_LIMIT: z.number().int().positive().default(10).optional(),
  DB_MAX_IDLE: z.number().int().positive().default(10).optional(),
  DB_IDLE_TIMEOUT: z.number().int().positive().default(60000).optional(),
  DB_QUEUE_LIMIT: z.number().int().positive().default(0).optional(),
  DB_ENABLE_KEEP_ALIVE: z.boolean().default(true).optional(),
  DB_KEEP_ALIVE_INITIAL_DELAY: z.number().int().positive().default(0).optional(),
});

export interface IDbEnv extends TypeOf<typeof dbEnv> {}

// type User = z.infer<typeof dbEnv>;

export const credentialsAccess: PoolOptions = {
  host: process.env.DB_HOST || "172.16.4.3",
  port: process.env.DB_PORT !== undefined ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USERNAME || "usuario0",
  password: process.env.DB_PASSWORD || "Everytel1",
  database: process.env.DB_DATABASE || "general",
  waitForConnections: true,
  connectionLimit: 10,
  maxIdle: 10, // max idle connections, the default value is the same as `connectionLimit`
  idleTimeout: 60000, // idle connections timeout, in milliseconds, the default value 60000
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};
