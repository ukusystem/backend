import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { RegisterArgs, Register, PaginationAction } from "../../models/register";
import { RowDataPacket } from "mysql2";
import dayjs from "dayjs";

export const getRegisters = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { fecha_fin, fecha_inicio, ctrl_id, tipo_registro } = req.body as RegisterArgs;
    const registroData = await Register.getRegistroByNodoAndTypeAndDateTimeRange({fecha_fin, fecha_inicio, ctrl_id, tipo_registro});
    res.status(200).json(registroData);
  }
);


export const getRegistersFinal = asyncErrorHandler(
  async (req: Request, res: Response, _next: NextFunction) => {

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

    const finalResponse :IResponsePagination = {
      data : registroData.data,
      meta: {
        next_id:next_id_cursor,
        prev_id: prev_id_cursor,
        result_count: registroData.data.length,
        order_by:registroData.order_by,

      }
    }

    return res.status(200).json(finalResponse)

  }
);


interface IResponsePagination {
  data: RowDataPacket[],
  meta: {
    next_id: number | null,
    prev_id: number | null,
    order_by: string,
    result_count: number,
  }
}


