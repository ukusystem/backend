import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../database/mysql";
import { Controlador } from "../types/db";
import { handleErrorWithArgument } from "../utils/simpleErrorHandler";
import dayjs from "dayjs";

export type RegisterArgs = {fecha_fin: Date,fecha_inicio: Date,tipo_registro: string} & Pick<Controlador,"ctrl_id">
export type RegisterType =  "acceso" | "energia" | "entrada" | "estadocamara" | "microsd" | "peticion" | "salida" | "seguridad" | "temperatura" | "ticket";
export type PaginationAction = "next" | "prev" | "lim" | "init";

interface GetRegisterProps {
  type: string;
  ctrl_id: string;
  start_date: string;
  end_date: string;
  is_next: string;
  p_action: PaginationAction;
  cursor: string | undefined;
  limit: string | undefined;
  // [key: string]: any
}

interface GetRegisterDownload {
  type: string;
  ctrl_id: string;
  start_date: string;
  end_date: string;
  col_delete: string | undefined | string[]
}

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

  static getRegistros = handleErrorWithArgument<{data:RowDataPacket[],order_by:string},GetRegisterProps> (
    async ({ctrl_id,cursor,end_date,is_next,limit,start_date,type,p_action,...rest}) => {

      let registerOption = RegisterConfigOptions[type as RegisterType];
      const otherQueryParams = Register.getRegisterFilterParamsAndValidate(type as RegisterType,rest);
      let {ordenation,relational} = Register.getRelationalOperatorAndOrdenation(p_action);

      const startDate = dayjs(start_date,"YYYY-MM-DD HH:mm:ss")
      const endDate = dayjs(end_date,"YYYY-MM-DD HH:mm:ss");

      let select_clause : string = `SELECT *`;
      let from_clause : string = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name}`;
      let where_clause : string = cursor != undefined ? `WHERE ${registerOption.order_by} ${relational} ${Number(cursor)} AND ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'` : `WHERE ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'`;
      let additional_where_clause : string = Register.getPartialSqlQuery(otherQueryParams);
      let orderby_clause : string = `ORDER BY ${registerOption.order_by} ${cursor == undefined ? "DESC" : ordenation }`;
      let limit_clause: string = `LIMIT ${Register.adjustLimitRange(limit)}`;

      if(registerOption.has_yearly_tables){

        if(startDate.year() - endDate.year() == 0){
          let new_from_clause = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name + startDate.year()}`;
          const general_query = select_clause.concat(" ",new_from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)

          const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query})
          if(registros.length>0){
            return {data: p_action == "prev" ? registros.reverse() : registros , order_by: registerOption.order_by};
          }
        }else{ // dos años continuos
          let new_from_clause1 = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name + startDate.year()}`;
          let new_from_clause2 = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name + endDate.year()}`;

          let general_query1 = select_clause.concat(" ",new_from_clause1," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)
          const registros1 = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query1});
          const registros1Data = p_action == "prev" ? registros1.reverse() : registros1;
          let limit_client = Register.adjustLimitRange(limit); // 1-100

          if(registros1.length < limit_client){
            let general_query2 = select_clause.concat(" ",new_from_clause2," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)
            const registros2 = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query2});
            const registros2Data = p_action == "prev" ? registros2.reverse() : registros2

            let numRegisMissing = limit_client - registros1.length

            const registrosFinal = [...registros1Data,...registros2Data.slice(0,numRegisMissing)];

            return {data: registrosFinal , order_by: registerOption.order_by};

          }else{ // no consultar tabla siguiente
            return {data: registros1Data , order_by: registerOption.order_by};
          }

        }
        
      }else{
        const general_query = select_clause.concat(" ",from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)
        const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query})
        console.log(general_query)
        if(registros.length>0){// dos años continuos
          return {data: p_action == "prev" ? registros.reverse() : registros , order_by: registerOption.order_by};
        }
      }


      // const general_query = select_clause.concat(" ",from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause)
      // console.log(general_query)
      // // const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:`SELECT * FROM ${"nodo" + ctrl_id}.registroacceso WHERE fecha BETWEEN ? AND ? ORDER BY ra_id DESC LIMIT ?`,values:[start_date,end_date,Number(limit)]})
      // const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query})
      // if(registros.length>0){
      //   return {data: p_action == "prev" ? registros.reverse() : registros , order_by: registerOption.order_by};
      // }
      return {data: [], order_by: registerOption.order_by}
  } , "Register.getRegistros");

  static getRegistrosDownload = handleErrorWithArgument<{data: RowDataPacket[], columns: string[]},GetRegisterDownload> (
    async ({ctrl_id,end_date,start_date,type,col_delete,...rest}) => {

      let registerOption = RegisterConfigOptions[type as RegisterType];
      const columns_visible = Register.getVisibleColumnAndValidate(type as RegisterType,col_delete);
      const filter_params = Register.getRegisterFilterParamsAndValidate(type as RegisterType,rest);
      // console.log("filter params: ", filter_params)
      // let {ordenation,relational} = Register.getRelationalOperatorAndOrdenation(p_action);

      const startDate = dayjs(start_date,"YYYY-MM-DD HH:mm:ss")
      const endDate = dayjs(end_date,"YYYY-MM-DD HH:mm:ss");

      let select_clause : string = `SELECT ${columns_visible.join(" , ")}`;
      let from_clause : string = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name}`;
      let where_clause : string = `WHERE ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'` ;
      let additional_where_clause : string = Register.getPartialSqlQuery(filter_params);
      let orderby_clause : string = `ORDER BY ${registerOption.order_by} ASC`;
      // let limit_clause: string = `LIMIT ${Register.adjustLimitRange(limit)}`;
      if(registerOption.has_yearly_tables){
        if(startDate.year() - endDate.year() == 0){
          let new_from_clause = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name + startDate.year()}`;
          const general_query = select_clause.concat(" ",new_from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause)

          const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query})
          if(registros.length > 0){
            return {data:registros , columns:columns_visible}
          }

        }else{
          let new_from_clause1 = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name + startDate.year()}`;
          let new_from_clause2 = `FROM ${"nodo" + ctrl_id}.${registerOption.base_table_name + endDate.year()}`;

          let general_query1 = select_clause.concat(" ",new_from_clause1," ",where_clause," ",additional_where_clause," ",orderby_clause)
          const registros1 = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query1});

          let general_query2 = select_clause.concat(" ",new_from_clause2," ",where_clause," ",additional_where_clause," ",orderby_clause)
          const registros2 = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query2});

          return  {data:registros1.concat(registros2) , columns:columns_visible};

        }

      }else{
        const general_query = select_clause.concat(" ",from_clause," ",where_clause," ",additional_where_clause," ",orderby_clause)
        const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query});
        console.log(general_query)
        if(registros.length > 0){
          return {data:registros , columns:columns_visible};
        }
      }

    
      return {data:[] , columns:columns_visible}
  } , "Register.getRegistrosDownload");

  private static adjustLimitRange(limit: string | undefined){
    if(limit == undefined) return 10 ; // default value
    return Math.min(Math.max(Number(limit), 0), 100)
  }

  static getVisibleColumnAndValidate(type_register: RegisterType,col_detele: GetRegisterDownload["col_delete"]){
    const regisColumns = RegisterConfigOptions[type_register].table_columns;

    if(typeof col_detele == "string"){
      if(regisColumns.includes(col_detele)) return [col_detele];
    }else if( typeof col_detele == "object"){ // string[]
      const result : string[] = [...regisColumns]
      for(let col_del of col_detele){
        if(result.includes(col_del)) {
          let indexDelete = result.indexOf(col_del)
          if(indexDelete > -1){
            result.splice(indexDelete,1)
          }
        }
      }

      return result;
    }
    return regisColumns
  }

  private static getRegisterFilterParamsAndValidate(type_register: RegisterType, reqQuery: Record<string,string>){
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

  private static getPartialSqlQuery(filter_params:Record<string,string>){
    let resultQuery = []
    for (const [key, value] of Object.entries(filter_params)) {
      resultQuery.push(`${key} LIKE '${value}%'`)
    }
    let prevResult = resultQuery.join(" AND ").trim()
    let initialCondition = "AND"
    if(prevResult.length > 1){
      return initialCondition.concat(" ", prevResult)
    }
    return ""
  }

  private static getRelationalOperatorAndOrdenation(p_action: PaginationAction){
    if(p_action == "init"){
      return {relational:"<",ordenation:"DESC"}
    }else if (p_action == "lim") {
      return {relational:"<=",ordenation:"DESC"}
    }else if (p_action == "next"){
      return {relational:"<",ordenation:"DESC"}
    }else if (p_action == "prev"){
      return {relational:">",ordenation:"ASC" }
    }else{
      return {relational:"<",ordenation:"DESC"} // default
    }
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
