import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../database/mysql";
import { Controlador } from "../types/db";
import { handleErrorWithArgument } from "../utils/simpleErrorHandler";
import dayjs from "dayjs";

export type RegisterArgs = {fecha_fin: Date,fecha_inicio: Date,tipo_registro: string} & Pick<Controlador,"ctrl_id">

export class Register {
  static getRegistroByNodoAndTypeAndDateTimeRange = handleErrorWithArgument<RowDataPacket[] | [],RegisterArgs> (
    async ({fecha_fin,fecha_inicio, tipo_registro, ctrl_id}) => {
    const año_inicio = dayjs(fecha_inicio).format('YYYY')
    const registrosFilter : Record<string,{table_name: string, sql_query: string}> = {
        Acceso: { table_name: "registroacceso", sql_query:`SELECT CAST(ra_id AS CHAR) AS ra_id,serie,administrador,autorizacion, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha ,tipo FROM ${"nodo" + ctrl_id}.registroacceso WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'` },
        Camaras: { table_name: "registroarchivocamara" ,sql_query:`SELECT CAST(rac_id AS CHAR) AS rac_id,cmr_id,tipo,ruta, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registroarchivocamara WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`  },
        Energia: { table_name: "registroenergia" ,sql_query:`SELECT CAST(re_id AS CHAR) AS re_id,me_id,voltaje,amperaje,fdp,frecuencia,potenciaw,potenciakwh, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registroenergia WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        Entradas: { table_name: "registroentrada" ,sql_query:`SELECT CAST(rentd_id AS CHAR) AS rentd_id, pin, estado, ee_id, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registroentrada WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        "Estado Camara":{table_name: "registroestadocamara" , sql_query:`SELECT CAST(rec_id AS CHAR) AS rec_id, cmr_id, conectado, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registroestadocamara WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        "Micro SD": { table_name: "registromicrosd" ,sql_query:`SELECT CAST(rmsd_id AS CHAR) AS rmsd_id, estd_id, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registromicrosd WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        Peticiones: { table_name: "registropeticion" ,sql_query:`SELECT CAST(rp_id AS CHAR) AS rp_id, pin, estd_id, orden, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registropeticion WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        Salidas: { table_name: "registrosalida" ,sql_query:`SELECT CAST(rs_id AS CHAR) AS rs_id, pin, estado, es_id, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registrosalida WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        Seguridad: { table_name: "registroseguridad" ,sql_query:`SELECT CAST(rsg_id AS CHAR) AS rsg_id, estado, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registroseguridad WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'`},
        SPI: { table_name: "registrospi",sql_query:`SELECT CAST(rspi_id AS CHAR) AS rspi_id, spi_id,datos, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registrospi WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}'` },
        Temperatura: { table_name: "registrotemperatura",sql_query:`SELECT CAST(rtmp_id AS CHAR) AS rtmp_id, st_id,valor, DATE_FORMAT(fecha, '%d-%m-%Y %H:%i:%s') AS fecha FROM ${"nodo" + ctrl_id}.registrotemperatura${año_inicio} WHERE fecha BETWEEN '${fecha_inicio}' AND '${fecha_fin}' LIMIT 50` },
        Ticket: { table_name: "registroticket",sql_query:`SELECT CAST(rt_id AS CHAR) AS rt_id, p_id, telefono, correo, tt_id, prioridad, descripcion, DATE_FORMAT(fechacomienzo, '%d-%m-%Y %H:%i:%s') AS fechacomienzo,DATE_FORMAT(fechatermino, '%d-%m-%Y %H:%i:%s') AS fechatermino, estd_id,DATE_FORMAT(fechaestadofinal, '%d-%m-%Y %H:%i:%s') AS fechaestadofinal,DATE_FORMAT(fechacreacion , '%d-%m-%Y %H:%i:%s') AS fechacreacion FROM ${"nodo" + ctrl_id}.registroticket WHERE fechacomienzo BETWEEN '${fecha_inicio}' AND '${fecha_fin}'` },
      };

    if(registrosFilter.hasOwnProperty(tipo_registro)){

      const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:`${registrosFilter[tipo_registro].sql_query}`})
  
      if(registros.length>0){
        return registros;
      }
      return []
    }
    
    return [];
  } , "Register.getRegistroByNodoAndTypeAndDateTimeRange");

  static getRegistros = handleErrorWithArgument<RowDataPacket[],{type: string,ctrl_id: string,start_date:string,end_date:string, cursor:string,limit:number}> (
    async ({ctrl_id,cursor,end_date,limit,start_date,type}) => {
      const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroacceso WHERE fecha BETWEEN ? AND ? ORDER BY ra_id DESC LIMIT ?`,values:[start_date,end_date,Number(limit)]})
  
      if(registros.length>0){
        return registros;
      }
      return []
  } , "Register.getRegistros");
}
