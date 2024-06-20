import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../database/mysql";
import { Controlador } from "../types/db";
import { handleErrorWithArgument } from "../utils/simpleErrorHandler";
import dayjs from "dayjs";

export type RegisterArgs = {fecha_fin: Date,fecha_inicio: Date,tipo_registro: string} & Pick<Controlador,"ctrl_id">
export type RegisterType =  "acceso" | "energia" | "entrada" | "estadocamara" | "microsd" | "peticion" | "salida" | "seguridad" | "temperatura" | "ticket" 
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

  static getRegistros = handleErrorWithArgument<RowDataPacket[],{type: string,ctrl_id: string,start_date:string,end_date:string, cursor:string | undefined,limit:string | undefined}> (
    async ({ctrl_id,cursor,end_date,limit,start_date,type,...rest}) => {
      let registerOption = RegisterConfigOptions[type as RegisterType]
      // if(registerOption){
      //   const otherQueryParams = Register.getRegisterQueryParams(type as RegisterType,rest);

      //   let select_clause : string = `SELECT *`;
      //   let from_clause : string = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name}`;
      //   let where_clause : string = cursor != undefined ? `WHERE ${registerOption.order_by} < ${Number(cursor)}` : `WHERE ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'`;
      //   let additional_where_clause : string = Register.getPartialSqlQuery(otherQueryParams);
      //   let orderby_clause : string = `ORDER BY ${registerOption.order_by} DESC`
      //   let limit_clause: string = `LIMIT ${Register.adjustLimitRange(limit)}`

      //   const general_query = select_clause.concat(select_clause," ",from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)
      //   // const general_query = `SELECT * FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name} WHERE ${registerOption.datetime_compare} BETWEEN ? AND ? ORDER BY ${registerOption.order_by} DESC LIMIT ?`
      // }
      const otherQueryParams = Register.getRegisterQueryParams(type as RegisterType,rest);
      console.log(otherQueryParams)
      let select_clause : string = `SELECT *`;
      let from_clause : string = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name}`;
      let where_clause : string = cursor != undefined ? `WHERE ${registerOption.order_by} < ${Number(cursor)}` : `WHERE ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'`;
      let additional_where_clause : string = Register.getPartialSqlQuery(otherQueryParams);
      let orderby_clause : string = `ORDER BY ${registerOption.order_by} DESC`
      let limit_clause: string = `LIMIT ${Register.adjustLimitRange(limit)}`
      const general_query = select_clause.concat(" ",from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)
      console.log(general_query)
      // const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroacceso WHERE fecha BETWEEN ? AND ? ORDER BY ra_id DESC LIMIT ?`,values:[start_date,end_date,Number(limit)]})
      const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query})
      if(registros.length>0){
        return registros;
      }
      return []
  } , "Register.getRegistros");

  static adjustLimitRange(limit: string | undefined){
    if(limit == undefined) return 10 ; // default value
    return Math.min(Math.max(Number(limit), 0), 100)
  }

  static getRegisterQueryParams(type_register: RegisterType, reqQuery: Record<string,string>){
    let result: Record<string,string> = {}
    let regisOption = RegisterConfigOptions[type_register]
  
    if(regisOption){
      for(let q_key in reqQuery){
        if(regisOption.table_columns.includes(q_key)){
          if(typeof reqQuery[q_key] != "object" && reqQuery[q_key] != "" ){
            result[q_key] = reqQuery[q_key]
          }
        }
      }
      return result
    }
  
    return result
  }

  static getPartialSqlQuery(query_params:Record<string,string>){
    let resultQuery = []
    for (const [key, value] of Object.entries(query_params)) {
      resultQuery.push(`${key} LIKE '${value}%'`)
    }
    let prevResult = resultQuery.join(" AND ").trim()
    let initialCondition = "AND"
    if(prevResult.length > 1){
      return initialCondition.concat(" ", prevResult)
    }
    return ""
  }
}


export const RegisterConfigOptions: {[key in RegisterType]: { has_yearly_tables: boolean; base_table_name: string;table_columns: string[];order_by:string;datetime_compare:string}} = {
  acceso: {
    has_yearly_tables: false,
    base_table_name: "registroacceso",
    table_columns: ["ra_id", "serie", "administrador", "autorizacion", "fecha", "co_id", "ea_id", "tipo", "sn_id"],
    order_by: "ra_id",
    datetime_compare: "fecha"
  },
  energia: {
    has_yearly_tables: true,
    base_table_name: "registroenergia",
    table_columns: ["re_id", "me_id", "voltaje", "amperaje", "fdp", "frecuencia", "potenciaw", "potenciakwh", "fecha"],
    order_by: "re_id",
    datetime_compare: "fecha"
  },
  entrada: {
    has_yearly_tables: true,
    base_table_name: "registroentrada",
    table_columns: ["rentd_id", "pin", "estado", "fecha", "ee_id"],
    order_by: "rentd_id",
    datetime_compare: "fecha"
  },
  estadocamara: {
    has_yearly_tables: false,
    base_table_name: "registroestadocamara",
    table_columns: ["rec_id", "cmr_id", "fecha", "conectado"],
    order_by: "rec_id",
    datetime_compare: "fecha"
  },
  microsd: {
    has_yearly_tables: false,
    base_table_name: "registromicrosd",
    table_columns: ["rmsd_id", "fecha", "estd_id"],
    order_by: "rmsd_id",
    datetime_compare: "fecha"
  },
  peticion: {
    has_yearly_tables: false,
    base_table_name: "registropeticion",
    table_columns: ["rp_id", "pin", "orden", "fecha", "estd_id"],
    order_by: "rp_id",
    datetime_compare: "fecha"
  },
  salida: {
    has_yearly_tables: true,
    base_table_name: "registrosalida",
    table_columns: ["rs_id", "pin", "estado", "fecha", "es_id"],
    order_by: "rs_id",
    datetime_compare: "fecha"
  },
  seguridad: {
    has_yearly_tables: false,
    base_table_name: "registroseguridad",
    table_columns: ["rsg_id", "estado", "fecha"],
    order_by: "rsg_id",
    datetime_compare: "fecha"
  },
  temperatura: {
    has_yearly_tables: true,
    base_table_name: "registrotemperatura",
    table_columns: ["rtmp_id", "st_id", "valor", "fecha"],
    order_by: "rtmp_id",
    datetime_compare: "fecha"
  },
  ticket: {
    has_yearly_tables: false,
    base_table_name: "registroticket",
    table_columns: ["rt_id", "telefono", "correo", "descripcion", "fechacomienzo", "fechatermino", "estd_id", "fechaestadofinal", "fechacreacion", "prioridad", "p_id", "tt_id", "sn_id", "enviado", "co_id"],
    order_by: "rt_id",
    datetime_compare: "fechacomienzo"
  },
};
