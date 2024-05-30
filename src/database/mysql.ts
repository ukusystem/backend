import { createPool, Pool ,PoolConnection,QueryOptions, ResultSetHeader, RowDataPacket} from "mysql2/promise";
import { credentialsAccess } from "../configs/db.configs";
import * as queries from '../models/controllerapp/src/queries'

export class MySQL2 {
  private static instance: MySQL2;
  private static pool: Pool;

  private constructor() {}

  static async create() {
    try {
      if (!MySQL2.instance) {
        console.log("Creando instacia MySQL2");
        MySQL2.instance = new MySQL2();
      }

      const pool = createPool(credentialsAccess);
      // Testear conexion
      const connection = await pool.getConnection(); // Crear conexión
      connection.release(); // Liberar la conexión
      // Establecer pool
      MySQL2.pool = pool;
      console.log(`Conexión establecida con éxito a la base de datos. | host: ${credentialsAccess.host} | port: ${credentialsAccess.port}`);

      return MySQL2.instance;
    } catch (error) {
      console.error(`No se pudo establecer conexión con la base de datos. | host: ${credentialsAccess.host} | port: ${credentialsAccess.port}`);
      throw error;
    }
  }

  static get getInstance(): MySQL2 {
    if (!MySQL2.instance) {
      console.log("Creando instacia MySQL2");
      MySQL2.instance = new MySQL2();
    }
    return MySQL2.instance;
  }

  static async getConnection(): Promise<PoolConnection> {
    const connection = await MySQL2.pool.getConnection();
    return connection;
  }

  static releaseConnection(connection: PoolConnection) {
    connection.release(); // Liberar la conexión
  }

  // static async executeSelect<T extends RowDataPacket[]>(queryOptions: QueryOptions){
  //   const connection = await MySQL2.getConnection()
  //   const {sql,values} = queryOptions
  //   const [result] = await connection.query<T>(sql,values)
  //   connection.release()
  //   return result
  // }

  // static async executeUpdateInsert(queryOptions: QueryOptions){
  //   const connection = await MySQL2.getConnection()
  //   const {sql,values} = queryOptions
  //   const [result] = await connection.query<ResultSetHeader>(sql,values)
  //   connection.release()
  //   return result
  // }

  static async executeQuery<T extends RowDataPacket[] | ResultSetHeader>(queryOptions: QueryOptions, config:boolean = false) {
    const connection = await MySQL2.getConnection();
    if(config){
      await connection.query<ResultSetHeader>(queries.setStatExpiry);
    }
    const [result] = await connection.query<T>(queryOptions);
    connection.release();
    return result;
  }
}