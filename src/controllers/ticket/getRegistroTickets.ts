import { NextFunction, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Ticket } from "../../models/ticket";
import type { RequestWithUser } from "../../types/requests";

export const getRegistroTickets = asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction)=>{
    const {ctrl_id, offset , limit} = req.query as {ctrl_id:string, offset:string , limit:string}  // "/ticket/historial?ctrl_id=number&limit=number&offset=number" 
    const user = req.user!; // ! -> anteponer middleware auth
    const tickets = await Ticket.getRegistrosByCtrlIdAndLimitAndOffset({ctrl_id: Number(ctrl_id), limit: Number(limit ?? 0), offset: Number(offset  ?? 0) , user })
    const total = await Ticket.getTotalRegistroTicketByCtrlId({ctrl_id:Number(ctrl_id), user})

    res.json({
        limit: Number(limit ?? 0),
        offset: Number(offset ?? 0),
        total_size: total,
        data_size: tickets.length,
        data: tickets,
    })
})



