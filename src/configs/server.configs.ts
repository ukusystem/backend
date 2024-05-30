import "dotenv/config";

export const SERVER_IP = process.env.SERVER_IP || '172.16.4.3'
export const PORT: number = process.env.PORT !== undefined ? Number(process.env.PORT) : 9001;
export const MANAGER_PORT: number = process.env.MANAGER_PORT !== undefined ? Number(process.env.MANAGER_PORT) : 54321;

export const TECHNICIAN_SERVER_IP = process.env.TECHNICIAN_SERVER_IP || '172.16.4.3'
export const TECHNICIAN_PORT = process.env.TECHNICIAN_PORT || '55555'

export const ENCRYPT_SALT = process.env.ENCRYPT_SALT ?? "75rt8gh3jnbvvc"
export const ENCRYPT_SECRET_KEY =  process.env.ENCRYPT_SECRET_KEY ?? "67MNB5EDFGM7654EACVBDFG"

// Agregar esto

export const DB_USER = process.env.DB_USERNAME ?? "root";
export const DB_PWD = process.env.DB_PASSWORD ?? "admin";