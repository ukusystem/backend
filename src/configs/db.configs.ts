import { PoolOptions } from "mysql2";
import "dotenv/config";

export const credentialsAccess: PoolOptions = {
  host: process.env.DB_HOST || "172.16.4.3",
  port: process.env.DB_PORT !== undefined ? Number(process.env.DB_PORT) : 3306,
  user: process.env.DB_USERNAME || "usuario0",
  password: process.env.DB_PASSWORD || "Everytel1",
  database: process.env.DB_DATABASE || "general",
};
