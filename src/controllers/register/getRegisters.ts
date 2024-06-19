import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { RegisterArgs, Register } from "../../models/register";
import z, { ZodError } from 'zod'

export const getRegisters = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fecha_fin, fecha_inicio, ctrl_id, tipo_registro } = req.body as RegisterArgs;
    const registroData = await Register.getRegistroByNodoAndTypeAndDateTimeRange({fecha_fin, fecha_inicio, ctrl_id, tipo_registro});
    res.status(200).json(registroData);
  }
);

// Registros GET /register?type=""&ctrl_id=1&start_date=""&end_date=""&cursor=""&limit="" & ...others...
export const getRegistersFinal = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    console.log(req.query)
    // // Validar formulario
    try {
      await registerSchema.parseAsync(req.query); // Validate  requests
    } catch (error) {
      if (error instanceof ZodError) {

        return res.status(400).json( error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code})));
      }
      if(error instanceof SyntaxError){

        return res.status(400).json({status: 400,message: error.message,});
      }
      
      // If error is not from zod then return generic error message
      return res.status(500).send("Ocurrió un error al realizar la solicitud. Por favor, comunícate con el equipo de soporte.");
    }

    const {limit,ctrl_id,cursor,end_date,start_date,type} = req.query as {type: string,ctrl_id: string,start_date:string,end_date:string, cursor:string,limit:string} // Definir min-max limit : 0 - 100
    const registroData = await Register.getRegistros({limit: adjustLimitRange(Number(limit)),ctrl_id,cursor,end_date,start_date,type})
    // Validar fehcha dos años seguidos
    return res.status(200).json(registroData)

  }
);



function adjustLimitRange (limit: number){
  return Math.min(Math.max(limit, 0), 100)
}

interface IResponsePagination {
  data: Object[],
  meta: {
    next_id: number,
    prev_id: number | null,
    total_records: number,
    result_count: number,
  }
}

type RegisterType =  "acceso" | "energia" | "entrada" | "estadocamara" | "microsd" | "peticion" | "salida" | "seguridad" | "temperatura" | "ticket" 

const RegistersOptions: {[key in RegisterType]: { has_yearly_tables: boolean; base_table_name: string; }} = {
  acceso: {
    has_yearly_tables: false,
    base_table_name: "registroacceso",
  },
  energia: {
    has_yearly_tables: true,
    base_table_name: "registroenergia",
  },
  entrada: {
    has_yearly_tables: true,
    base_table_name: "registroentrada",
  },
  estadocamara: {
    has_yearly_tables: false,
    base_table_name: "registroestadocamara",
  },
  microsd: {
    has_yearly_tables: false,
    base_table_name: "registromicrosd",
  },
  peticion: {
    has_yearly_tables: false,
    base_table_name: "registropeticion",
  },
  salida: {
    has_yearly_tables: true,
    base_table_name: "registrosalida",
  },
  seguridad: {
    has_yearly_tables: false,
    base_table_name: "registroseguridad",
  },
  temperatura: {
    has_yearly_tables: true,
    base_table_name: "registrotemperatura",
  },
  ticket: {
    has_yearly_tables: false,
    base_table_name: "registroticket",
  },
};


// {type: string,ctrl_id: string,start_date:string,end_date:string, cursor:string,limit:string}
export const registerSchema = z.object({
  // type: z.string({required_error:"'type' es requerido",invalid_type_error:"'type' debe ser un string"}) ,
  type: z.enum(["acceso" ,"energia" ,"entrada" ,"estadocamara" ,"microsd" ,"peticion" ,"salida" ,"seguridad" ,"temperatura" ,"ticket"],{errorMap: (zIssue)=>{ return {message: `invalid register type`}}}),
  ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
  start_date: z.string({required_error:"'start_date' es requerido",invalid_type_error:"'start_date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/g,"'start_date' es incorrecto."), 
  end_date: z.string({required_error:"'end_date' es requerido",invalid_type_error:"'end_date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/g,"'end_date' es incorrecto."), 
  limit: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'limit' es requerido"}}}).pipe(z.coerce.number({required_error: "'limit' es requerido",invalid_type_error: "'limit' debe ser un numero"}).int("'limit' debe ser un numero entero").gte(0, "'limit' debe ser mayor o igual a 0").lte(100,"'limit' debe ser menor o igual a 100")),

},{required_error: "Se requiere incluir los campos 'rt_id' y 'ctrl_id' en los query params de la consulta"})
// registro_archivocamara ----
// registro_acceso
// registro_energia  *
// registro_entrada  *
// registro_estadocamara 
// registro_microsd 
// registro_peticion 
// registro_salida  *
// registro_seguridad
// registro_temperatura *
// registro_ticket
// registro_spi ----


// *******OFFSET Pagination********
// A medida que sube el offset aumenta el tiempo de consulta: 
// SELECT * FROM nodo27.registrotemperatura WHERE fecha BETWEEN '2024-02-01 05:05:00' AND '2024-12-01 05:05:00' LIMIT 10 OFFSET 2000000;

// *******Cursor Pagination********
// Cursor = NULL
// SELECT * FROM nodo27.registrotemperatura WHERE fecha BETWEEN '2024-02-01 05:05:00' AND '2024-12-01 05:05:00' ORDER BY rtmp_id DESC LIMIT 10;

// rtmp_id,st_id,valor,fecha,hora
// 5729977,16,"0",2024-03-26 17:44:01,17
// 5729976,15,"0",2024-03-26 17:44:01,17
// 5729975,14,"0",2024-03-26 17:44:01,17
// 5729974,13,"0",2024-03-26 17:44:01,17
// 5729973,12,"0",2024-03-26 17:44:01,17
// 5729972,11,"0",2024-03-26 17:44:01,17
// 5729971,10,"0",2024-03-26 17:44:01,17
// 5729970,9,"0",2024-03-26 17:44:01,17
// 5729969,8,"0",2024-03-26 17:44:01,17
// 5729968,7,"0",2024-03-26 17:44:01,17

// Cursor = 5729968

// SELECT * FROM nodo27.registrotemperatura WHERE rtmp_id < 5729968  ORDER BY rtmp_id DESC LIMIT 10;

// rtmp_id,st_id,valor,fecha,hora
// 5729967,6,"0",2024-03-26 17:44:01,17
// 5729966,5,"0",2024-03-26 17:44:01,17
// 5729965,4,"0",2024-03-26 17:44:01,17
// 5729964,3,"0",2024-03-26 17:44:01,17
// 5729963,2,"0",2024-03-26 17:44:01,17
// 5729962,1,27.5,2024-03-26 17:44:01,17
// 5729961,16,"0",2024-03-26 17:43:58,17
// 5729960,15,"0",2024-03-26 17:43:58,17
// 5729959,14,"0",2024-03-26 17:43:58,17
// 5729958,13,"0",2024-03-26 17:43:58,17