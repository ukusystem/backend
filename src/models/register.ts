import { RowDataPacket } from "mysql2";
import { MySQL2 } from "../database/mysql";
import { Controlador } from "../types/db";
import { handleErrorWithArgument } from "../utils/simpleErrorHandler";
import dayjs from "dayjs";
import { CustomError } from "../utils/CustomError";

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

interface TotalRegistroRowDataPacket extends RowDataPacket {
  total_registros: number;
}

export class Register {

  static #NUM_PARTITION : number = 50;
  static #MAX_REGISTER_DOWNLOAD: number = 50000;

  static getRegistros = handleErrorWithArgument<{data:RowDataPacket[],order_by:string},GetRegisterProps> (
    async ({ctrl_id,cursor,end_date,is_next,limit,start_date,type,p_action,...rest}) => {

      let registerOption = RegisterConfigOptions[type as RegisterType];
      const otherQueryParams = Register.getRegisterFilterParamsAndValidate(type as RegisterType,rest);
      let {ordenation,relational} = Register.getRelationalOperatorAndOrdenation(p_action);

      const startDate = dayjs(start_date,"YYYY-MM-DD HH:mm:ss")
      const endDate = dayjs(end_date,"YYYY-MM-DD HH:mm:ss");

      const select_clause : string = `SELECT *`;
      const from_clause : string = `FROM ${"nodo" + ctrl_id}.${registerOption.table_name}`;
      const partitioning : string = `PARTITION ( p${(startDate.year())%Register.#NUM_PARTITION} , p${(endDate.year())%Register.#NUM_PARTITION})`;
      const where_clause : string = cursor != undefined ? `WHERE ${registerOption.order_by} ${relational} ${Number(cursor)} AND ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'` : `WHERE ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'`;
      const additional_where_clause : string = Register.getPartialSqlQuery(otherQueryParams);
      const orderby_clause : string = `ORDER BY ${registerOption.order_by} ${cursor == undefined ? "DESC" : ordenation }`;
      const limit_clause: string = `LIMIT ${Register.adjustLimitRange(limit)}`;

      let general_query = select_clause.concat(" ",from_clause);
      if(registerOption.has_partition){
        general_query = general_query.concat(" ",partitioning);
      }
      general_query = general_query.concat(" ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause);

      const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query})

      return {data: p_action == "prev" ? registros.reverse() : registros , order_by: registerOption.order_by};

  } , "Register.getRegistros");

  static getRegistrosDownload = handleErrorWithArgument<{data: RowDataPacket[], columns: string[]},GetRegisterDownload> (
    async ({ctrl_id,end_date,start_date,type,col_delete,...rest}) => {

      let registerOption = RegisterConfigOptions[type as RegisterType];
      const columns_visible = Register.getVisibleColumnAndValidate(type as RegisterType,col_delete);
      const filter_params = Register.getRegisterFilterParamsAndValidate(type as RegisterType,rest);
 
      const startDate = dayjs(start_date,"YYYY-MM-DD HH:mm:ss")
      const endDate = dayjs(end_date,"YYYY-MM-DD HH:mm:ss");

      const select_clause : string = `SELECT ${columns_visible.join(" , ")}`;
      const select_count_clause : string = `SELECT COUNT(*) AS total_registros`;
      const from_clause : string = `FROM ${"nodo" + ctrl_id}.${registerOption.table_name}`;
      const partitioning : string = `PARTITION ( p${(startDate.year())%Register.#NUM_PARTITION} , p${(endDate.year())%Register.#NUM_PARTITION})`;
      const where_clause : string = `WHERE ${registerOption.datetime_compare} BETWEEN '${start_date}' AND '${end_date}'` ;
      const additional_where_clause : string = Register.getPartialSqlQuery(filter_params);
      const orderby_clause : string = `ORDER BY ${registerOption.order_by} ASC`;
      const limit_clause: string = `LIMIT ${Register.#MAX_REGISTER_DOWNLOAD}`;

      let count_query = select_count_clause.concat(" ",from_clause);
      let general_query = select_clause.concat(" ",from_clause);

      if(registerOption.has_partition){
        count_query = count_query.concat(" ",partitioning);
        general_query = general_query.concat(" ",partitioning);
      }
      count_query = count_query.concat(" ",where_clause," ",additional_where_clause," ",orderby_clause);
      general_query = general_query.concat(" ",where_clause," ",additional_where_clause," ",orderby_clause," ",limit_clause);

      // count registers:
      let totalRegistros: number = 0;
      const countRegistros = await MySQL2.executeQuery<TotalRegistroRowDataPacket[]>({sql:count_query});
      if(countRegistros.length > 0){
        totalRegistros = countRegistros[0].total_registros;
      }

      if(totalRegistros > Register.#MAX_REGISTER_DOWNLOAD){
        throw new CustomError(`Maximo ${Register.#MAX_REGISTER_DOWNLOAD} registros permitidos. Se encontraron ${totalRegistros}.`,404,"Exceso de registros encontrados");
      }

      const registros = await MySQL2.executeQuery<RowDataPacket[]>({sql:general_query});

      if(registros.length > 0){
        return {data:registros , columns:columns_visible};
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


export const RegisterConfigOptions: {[key in RegisterType]: { has_partition: boolean; table_name: string;table_columns: string[];order_by:string;datetime_compare:string}} = {
  acceso: {
    has_partition: false,
    table_name: "registroacceso",
    table_columns: ["ra_id", "serie", "administrador", "autorizacion", "fecha", "co_id", "ea_id", "tipo", "sn_id"],
    order_by: "ra_id",
    datetime_compare: "fecha"
  },
  energia: {
    has_partition: true,
    table_name: "registroenergia",
    table_columns: ["re_id", "me_id", "voltaje", "amperaje", "fdp", "frecuencia", "potenciaw", "potenciakwh", "fecha"],
    order_by: "re_id",
    datetime_compare: "fecha"
  },
  entrada: {
    has_partition: true,
    table_name: "registroentrada",
    table_columns: ["rentd_id", "pin", "estado", "fecha", "ee_id"],
    order_by: "rentd_id",
    datetime_compare: "fecha"
  },
  estadocamara: {
    has_partition: false,
    table_name: "registroestadocamara",
    table_columns: ["rec_id", "cmr_id", "fecha", "conectado"],
    order_by: "rec_id",
    datetime_compare: "fecha"
  },
  microsd: {
    has_partition: false,
    table_name: "registromicrosd",
    table_columns: ["rmsd_id", "fecha", "estd_id"],
    order_by: "rmsd_id",
    datetime_compare: "fecha"
  },
  peticion: {
    has_partition: false,
    table_name: "registropeticion",
    table_columns: ["rp_id", "pin", "orden", "fecha", "estd_id"],
    order_by: "rp_id",
    datetime_compare: "fecha"
  },
  salida: {
    has_partition: true,
    table_name: "registrosalida",
    table_columns: ["rs_id", "pin", "estado", "fecha", "es_id"],
    order_by: "rs_id",
    datetime_compare: "fecha"
  },
  seguridad: {
    has_partition: false,
    table_name: "registroseguridad",
    table_columns: ["rsg_id", "estado", "fecha"],
    order_by: "rsg_id",
    datetime_compare: "fecha"
  },
  temperatura: {
    has_partition: true,
    table_name: "registrotemperatura",
    table_columns: ["rtmp_id", "st_id", "valor", "fecha"],
    order_by: "rtmp_id",
    datetime_compare: "fecha"
  },
  ticket: {
    has_partition: false,
    table_name: "registroticket",
    table_columns: ["rt_id", "telefono", "correo", "descripcion", "fechacomienzo", "fechatermino", "estd_id", "fechaestadofinal", "fechacreacion", "prioridad", "p_id", "tt_id", "sn_id", "enviado", "co_id"],
    order_by: "rt_id",
    datetime_compare: "fechacomienzo"
  },
};
