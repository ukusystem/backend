import { Response, NextFunction } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { Ticket } from '../../models/ticket';
import type { RequestWithUser } from '../../types/requests';
import { onFinishTicket } from '../../models/controllerapp/controller';
import { FinishTicket } from '../../models/controllerapp/src/finishTicket';
import { genericLogger } from '../../services/loggers';
import { RegTicketState } from '../socket/ticket.schedule/ticket.schedule.types';
import { TicketScheduleManager } from '../socket/ticket.schedule/ticket.schedule.manager';

interface TicketUpdateBody {
  action: number;
  ctrl_id: number;
  rt_id: number;
}

export const upadateTicket = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  const user = req.user;

  if (user !== undefined) {
    const data: TicketUpdateBody = req.body;
    const { action, ctrl_id, rt_id } = data;
    genericLogger.info(` Update Ticket | ctrl_id : ${ctrl_id} | rt_id : ${rt_id} | action : ${data.action}`, data);

    const ticket = await Ticket.getTicketByCrtlIdAndTicketId({ ctrl_id: ctrl_id, rt_id: rt_id });

    if (ticket) {
      if (ticket.estd_id === RegTicketState.Rechazado || ticket.estd_id === RegTicketState.Cancelado || ticket.estd_id === RegTicketState.Finalizado || ticket.estd_id === RegTicketState.Anulado) {
        return res.status(403).json({ success: false, message: 'Acción no permitida.' });
      } else {
        const estdPendiente = ticket.estd_id === RegTicketState.Esperando && (action === RegTicketState.Aceptado || action === RegTicketState.Cancelado || action === RegTicketState.Rechazado);
        const estdAceptBefore = ticket.estd_id === RegTicketState.Aceptado && (action === RegTicketState.Rechazado || action === RegTicketState.Cancelado);
        const estdAceptDuring = ticket.estd_id === RegTicketState.Aceptado && (action === RegTicketState.Finalizado || action === RegTicketState.Anulado); // 2 -> Aceptado

        const startDate = new Date(ticket.fechacomienzo);
        const endDate = new Date(ticket.fechatermino);
        const currentDate = new Date();
        const isBeforeEvent = currentDate < startDate;
        const isDuringEvent = currentDate >= startDate && currentDate < endDate;

        const beforeEventAction = isBeforeEvent && (estdPendiente || estdAceptBefore);
        const duringEventAction = isDuringEvent && estdAceptDuring;

        if (beforeEventAction || duringEventAction) {
          if (user.rol === 'Administrador' || user.rol === 'Usuario') {
            try {
              const response = await onFinishTicket(new FinishTicket(action, ctrl_id, rt_id));
              if (response) {
                if (response.resultado) {
                  // success
                  TicketScheduleManager.update(ctrl_id, rt_id, { estd_id: action });
                  genericLogger.info(`Update Ticket successfully | ctrl_id = ${ctrl_id} | rt_id = ${rt_id} | action = ${action}`);
                  return res.json({ success: true, message: 'Accion realizada con éxito' });
                } else {
                  return res.json({ success: false, message: response.mensaje });
                }
              } else {
                return res.status(500).json({ success: false, message: 'Internal Server Error Update Ticket, Backend-Technician' });
              }
            } catch (error) {
              genericLogger.error(`Error update ticket | ctrl_id = ${ctrl_id} | rt_id = ${rt_id} | action = ${action}`, error);
              return res.status(500).json({ success: false, message: 'Internal Server Error, Backend-Technician' });
            }
          }
        }

        if (isBeforeEvent && (ticket.estd_id === RegTicketState.Esperando || ticket.estd_id === RegTicketState.Aceptado)) {
          if (user.rol === 'Invitado') {
            if (action === RegTicketState.Cancelado) {
              try {
                const response = await onFinishTicket(new FinishTicket(action, ctrl_id, rt_id));
                if (response) {
                  if (response.resultado) {
                    // success
                    TicketScheduleManager.update(ctrl_id, rt_id, { estd_id: action });

                    return res.json({ success: true, message: 'Accion realizada con éxito' });
                  } else {
                    return res.json({ success: false, message: response.mensaje });
                  }
                } else {
                  return res.status(500).json({ success: false, message: 'Internal Server Error Update Ticket, Backend-Technician' });
                }
              } catch (error) {
                genericLogger.error(`Error update ticket | ctrl_id = ${ctrl_id} | rt_id = ${rt_id} | action = ${action}`, error);
                return res.status(500).json({ success: false, message: 'Internal Server Error, Backend-Technician' });
              }
            }
          }
        }
      }
    }

    res.status(400).json({
      success: false,
      message: 'Acción no permitida.',
    });
  } else {
    return res.status(401).json({ message: 'UNAUTHORIZED' });
  }
});
