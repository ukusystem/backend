import { PoolOptions } from "mysql2";
import "dotenv/config";

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
