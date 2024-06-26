import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { RegisterArgs, Register, RegisterType, RegisterConfigOptions, PaginationAction } from "../../models/register";
import z, { ZodError } from 'zod'
import { RowDataPacket } from "mysql2";
import dayjs from "dayjs";

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


    // Validar Registers params
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

    const {limit,ctrl_id,cursor,is_next,end_date,start_date,type,p_action,...rest} = req.query as {type: string,ctrl_id: string,start_date:string,end_date:string,is_next: string,cursor: string | undefined,limit:string | undefined,p_action: string } // Definir min-max limit : 0 - 100

    // validar fechas:
    const startDate = dayjs(start_date,"YYYY-MM-DD HH:mm:ss")
    const endDate = dayjs(end_date,"YYYY-MM-DD HH:mm:ss");
    if(endDate.unix() < startDate.unix()){
      return res.status(400).json({status: 400,message: "'end_date' must be greater than 'start_date'"});
    }
    if(endDate.year() - startDate.year() > 1){
      return res.status(400).json({status: 400,message: "The maximum date range allowed is two continuous years."});
    }

    const registroData = await Register.getRegistros({limit,ctrl_id,cursor,end_date,start_date,type,is_next,p_action: p_action as PaginationAction,...rest});
    const lastElement = registroData.data[registroData.data.length -1]
    const next_id_cursor = lastElement ? Number(lastElement[registroData.order_by]) : null
    const firtsElement = registroData.data[0]
    const prev_id_cursor = firtsElement ? Number(firtsElement[registroData.order_by]) : null
    // console.log(registroData.data[registroData.data.length -1][registroData.order_by]
    const finalResponse :IResponsePagination = {
      data : registroData.data,
      meta: {
        next_id:next_id_cursor,
        prev_id: prev_id_cursor,
        result_count: registroData.data.length,
        order_by:registroData.order_by,
        // prev_id_cursor: prev_cursor,
      }
    }
    // Validar fehcha dos años seguidos
    return res.status(200).json(finalResponse)

  }
);


interface IResponsePagination {
  data: RowDataPacket[],
  meta: {
    next_id: number | null,
    prev_id: number | null,
    // prev_id_cursor: string | undefined,
    order_by: string,
    // total_records: number,
    result_count: number,
  }
}


export const registerSchema = z.object({
  // type: z.string({required_error:"'type' es requerido",invalid_type_error:"'type' debe ser un string"}) ,
  type: z.enum(["acceso" ,"energia" ,"entrada" ,"estadocamara" ,"microsd" ,"peticion" ,"salida" ,"seguridad" ,"temperatura" ,"ticket"],{errorMap: (_,ctx)=>{ return {message: ctx.defaultError}}}),
  ctrl_id: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'ctrl_id' es requerido"}}}).pipe(z.coerce.number({required_error: "'ctrl_id' es requerido",invalid_type_error: "'ctrl_id' debe ser un numero"}).int("'ctrl_id' debe ser un numero entero").gte(0, "'ctrl_id' debe ser mayor o igual a 0")),
  start_date: z.string({required_error:"'start_date' es requerido",invalid_type_error:"'start_date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/g,"'start_date' es incorrecto."), 
  end_date: z.string({required_error:"'end_date' es requerido",invalid_type_error:"'end_date' debe ser un string"}).regex(/^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]$/g,"'end_date' es incorrecto."), 
  // limit: z.union([z.string(), z.number()],{errorMap: ()=>{return {message: "'limit' es requerido"}}}).pipe(z.coerce.number({required_error: "'limit' es requerido",invalid_type_error: "'limit' debe ser un numero"}).int("'limit' debe ser un numero entero").gte(0, "'limit' debe ser mayor o igual a 0").lte(100,"'limit' debe ser menor o igual a 100")),
  limit: z.optional(z.coerce.number({required_error: "'limit' es requerido",invalid_type_error: "'limit' debe ser un numero",}).int("'limit' debe ser un numero entero").gte(1, "'limit' debe ser mayor o igual a 1").lte(100,"'limit' debe ser menor o igual a 100")),
  cursor: z.optional(z.coerce.number({required_error: "'cursor' es requerido",invalid_type_error: "'cursor' debe ser un numero",}).int("'cursor' debe ser un numero entero")),
  // is_next: z.enum(["true" ,"false"],{errorMap: (_,ctx)=>{ return {message: "is_next : " + ctx.defaultError}}}),
  p_action: z.enum(["next" ,"prev","lim","init"],{errorMap: (_,ctx)=>{ return {message: "p_action : " + ctx.defaultError}}})
},{required_error: "Se requiere incluir los campos 'rt_id' y 'ctrl_id' en los query params de la consulta"})

// use actions q_action : next , prev , lim , init

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

