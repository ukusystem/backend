import { NextFunction, Response } from 'express';
import { asyncErrorHandler } from '../../utils/asynErrorHandler';
import { deleteTemporalFiles, type GeneralMulterMiddlewareArgs } from '../../middlewares/multer.middleware';
import { ZodError } from 'zod';
import { createTicketSchema } from '../../schemas/ticket/createTicketSchema';
import dayjs from 'dayjs';
import path from 'path';
import fs from 'fs';
import { getFormattedDate } from '../../utils/getFormattedDateTime';
import { v4 as uuidv4 } from 'uuid';
import { getExtesionFile } from '../../utils/getExtensionFile';

import { Ticket, Personal, Solicitante } from '../../models/controllerapp/src/ticket';
import { onFinishTicket, onTicket } from '../../models/controllerapp/controller';
import { genericLogger } from '../../services/loggers';
import { RequestWithUser } from '../../types/requests';
// import { UserRol } from '../../types/rol';
import { TicketScheduleManager } from '../socket/ticket.schedule/ticket.schedule.manager';
import { RegistroTicketObj } from '../socket/ticket.schedule/ticket.schedule.types';
import { TicketState } from '../../types/ticket.state';
import { UserRol } from '../../types/rol';
import { FinishTicket } from '../../models/controllerapp/src/finishTicket';
import { mqqtSerrvice } from '../../services/mqtt/MqttService';

export const multerCreateTicketArgs: GeneralMulterMiddlewareArgs = {
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'],
  bodyFields: ['formvalues'],
  fields: [{ name: 'archivos' }],
  limits: { files: 5, fileSize: 10 * 1024 * 1024, fieldSize: 5 * 1024 * 1024 },
};

export interface TicketForm {
  solicitante: Solicitante;
  personales: Personal[];
}

export const createTicket = asyncErrorHandler(async (req: RequestWithUser, res: Response, _next: NextFunction) => {
  // Validar formulario
  const user = req.user;

  if (user !== undefined) {
    // const isAdmin = user.rl_id === UserRol.Administrador;

    try {
      await createTicketSchema.parseAsync(JSON.parse(req.body.formvalues)); // Validate  requests
    } catch (error) {
      if (error instanceof ZodError) {
        if (req.files) deleteTemporalFiles(req.files); // limpiar
        return res.status(400).json(error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code })));
      }
      if (error instanceof SyntaxError) {
        if (req.files) deleteTemporalFiles(req.files); // limpiar
        return res.status(400).json({ status: 400, message: error.message });
      }

      // If error is not from zod then return generic error message
      if (req.files) deleteTemporalFiles(req.files); // limpiar
      return res.status(500).send('Ocurrió un error al realizar la solicitud. Por favor, comunícate con el equipo de soporte.');
    }

    // Validar creación ticket pasados:
    const formValues = JSON.parse(req.body.formvalues) as TicketForm;
    const {
      solicitante: { fechacomienzo, fechatermino, ctrl_id },
    } = formValues;

    const currentDateUnix = dayjs().unix();

    const currentDate = dayjs.unix(currentDateUnix).format('YYYY-MM-DD HH:mm:ss');

    const fechacomienzoDate = dayjs.unix(fechacomienzo).format('YYYY-MM-DD HH:mm:ss');
    if (fechacomienzo < currentDateUnix) {
      return res.status(400).json({ error: 'Fecha de comienzo incorrecta', message: `La fecha comienzo '${fechacomienzoDate}' debe ser mayor a la hora actual '${currentDate}'` });
    }

    const fechaterminoDate = dayjs.unix(fechatermino).format('YYYY-MM-DD HH:mm:ss');
    if (fechatermino < fechacomienzo) {
      return res.status(400).json({ error: 'Fecha termino incorrecta', message: `La fecha termino '${fechaterminoDate}' debe ser mayor a la fecha comienzo '${fechacomienzoDate}'` });
    }

    //Cuando todo es correcto:
    const archivosCargados = req.files;
    const archivosData: { ruta: string; nombreoriginal: string; tipo: string }[] = [];

    if (archivosCargados) {
      if (Array.isArray(archivosCargados)) {
        for (const file of archivosCargados) {
          const dateFormat = getFormattedDate();
          const nameFileUuid = uuidv4();
          const extensionFile = getExtesionFile(file.originalname);

          const movePath = path.resolve(`./archivos/ticket/nodo${ctrl_id}/${dateFormat}/${nameFileUuid}.${extensionFile}`);

          // Comprobar directorio de destino
          const directorioDestino = path.dirname(movePath);
          if (!fs.existsSync(directorioDestino)) {
            fs.mkdirSync(directorioDestino, { recursive: true });
          }

          // Mover archivo de la carpeta temporal
          fs.renameSync(file.path, movePath);

          const relativePath = path.relative('./archivos/ticket', movePath); // nodoXX\27-02-2024\1709065263868-hombre.png
          const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // Prueba/27-02-2024/1709065364652-hombre.png
          const archItem = { ruta: finalRelativePath, nombreoriginal: file.originalname, tipo: file.mimetype };

          archivosData.push(archItem);
        }
      } else {
        for (const fieldname in archivosCargados) {
          for (const file of archivosCargados[fieldname]) {
            const dateFormat = getFormattedDate();
            const nameFileUuid = uuidv4();
            const extensionFile = getExtesionFile(file.originalname);

            const movePath = path.resolve(`./archivos/ticket/nodo${ctrl_id}/${dateFormat}/${nameFileUuid}.${extensionFile}`);

            // Comprobar directorio de destino
            const directorioDestino = path.dirname(movePath);
            if (!fs.existsSync(directorioDestino)) {
              fs.mkdirSync(directorioDestino, { recursive: true });
            }

            // Mover archivo de la carpeta temporal
            fs.renameSync(file.path, movePath);

            const relativePath = path.relative('./archivos/ticket', movePath); // nodoXX\27-02-2024\1709065263868-hombre.png
            const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // Prueba/27-02-2024/1709065364652-hombre.png
            const archItem = { ruta: finalRelativePath, nombreoriginal: file.originalname, tipo: file.mimetype };

            archivosData.push(archItem);
          }
        }
      }
    }

    if (formValues) {
      try {
        const newTicket = new Ticket(archivosData, { ...formValues.solicitante }, formValues.personales);
        const response = await onTicket(newTicket);
        if (response !== undefined) {
          if (response.resultado) {
            // success
            const stateTicket = user.rl_id === UserRol.Administrador || user.rl_id === UserRol.Gestor ? TicketState.Aceptado : TicketState.Esperando;

            await onFinishTicket(new FinishTicket(stateTicket, ctrl_id, response.id)); // update ticket

            const newTicketObj: RegistroTicketObj = { ...formValues.solicitante, rt_id: response.id, estd_id: stateTicket }; // estado esperando (cambiar)
            TicketScheduleManager.add(ctrl_id, newTicketObj);
            if (user.rl_id === UserRol.Invitado) {
              mqqtSerrvice.publisAdminNotification({
                evento: 'ticket.requested',
                titulo: 'Nueva Solicitud de Ticket',
                mensaje: `Se ha solicitado un nuevo ticket (#${response.id}) por la contrata "${user.contrata}".`,
              });
            }
            return res.json({ success: true, message: 'Ticket creado correctamente.' });
          } else {
            console.log(response);
            return res.status(500).json({ success: false, message: response.mensaje });
          }
        } else {
          return res.status(500).json({ success: false, message: 'Internal Server Error,Backend-Technician' });
        }
      } catch (error) {
        genericLogger.error('Create Ticket Backend-Technician', error);
        return res.status(500).json({ success: false, message: 'Internal Server Error,Backend-Technician' });
      }
    }

    res.status(500).json({ success: false, message: 'Internal Server Error' });
  } else {
    return res.status(401).json({ message: 'UNAUTHORIZED' });
  }
});
