import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { deleteTemporalFiles, type GeneralMulterMiddlewareArgs } from "../../middlewares/multer.middleware";
import { ZodError } from "zod";
import { createTicketSchema } from "../../schemas/ticket/createTicketSchema";
import dayjs from 'dayjs'
import path from 'path'
import fs from 'fs'
import { getFormattedDate } from "../../utils/getFormattedDateTime";
import { v4 as uuidv4 } from 'uuid';
import { getExtesionFile } from "../../utils/getExtensionFile";
// import { TECHNICIAN_PORT, TECHNICIAN_SERVER_IP } from "../../configs/server.configs";

import { Ticket ,Personal,Solicitante } from "../../models/controllerapp/src/ticket";
import { onTicket } from "../../models/controllerapp/controller";

// ======================== Agregar esto
// import { LoadedFile } from "../../models/controllerapp/src/types";
// import { Main } from "../../models/controllerapp/src/main";
// import { onTicket } from "../../models/controllerapp/controller";

export const multerCreateTicketArgs: GeneralMulterMiddlewareArgs = {
  allowedMimeTypes: ["image/jpeg","image/jpg","image/png","application/pdf"],
  bodyFields: ["formvalues"],
  fields: [{ name: "archivos" }],
  limits: { files: 5, fileSize: 10 * 1024 * 1024, fieldSize: 5 * 1024 * 1024 },
};

export interface TicketForm {
    solicitante: Solicitante;
    personales:  Personal[];
}

// export interface Personal {
//     c_id:     number;
//     co_id:    number;
//     dni:      string;
//     foto:     null | string;
//     nombre:   string;
//     apellido: string;
//     telefono: string;
//     isNew:    boolean;
// }

// export interface Solicitante {
//     telefono:      string;
//     correo:        string;
//     descripcion:   string;
//     fechacomienzo: number;
//     fechatermino:  number;
//     prioridad:     number;
//     p_id:          number;
//     tt_id:         number;
//     sn_id:         number;
//     co_id:         number;
//     ctrl_id:       number;
// }


export const createTicket = asyncErrorHandler( async (req: Request, res: Response, next: NextFunction) => {

    // Validar formulario
    try {
      await createTicketSchema.parseAsync(JSON.parse(req.body.formvalues)); // Validate  requests
    } catch (error) {
      if (error instanceof ZodError) {
        if(req.files) deleteTemporalFiles(req.files) // limpiar
        return res.status(400).json( error.errors.map((errorDetail) => ({ message: errorDetail.message, status: errorDetail.code})));
      }
      if(error instanceof SyntaxError){
        if(req.files) deleteTemporalFiles(req.files) // limpiar   
        return res.status(400).json({status: 400,message: error.message,});
      }
      
      // If error is not from zod then return generic error message
      if(req.files) deleteTemporalFiles(req.files) // limpiar
      return res.status(500).send("Ocurrió un error al realizar la solicitud. Por favor, comunícate con el equipo de soporte.");
    }


    // Validar creación ticket pasados:
    const formValues = JSON.parse(req.body.formvalues) as TicketForm
    const {solicitante:{fechacomienzo, fechatermino,ctrl_id}} = formValues

    const currentDateUnix = dayjs().unix();

    const currentDate = dayjs.unix(currentDateUnix).format("YYYY-MM-DD HH:mm:ss")

    const fechacomienzoDate = dayjs.unix(fechacomienzo).format("YYYY-MM-DD HH:mm:ss")
    if(fechacomienzo < currentDateUnix){
      return res.status(400).json({error:"Fecha de comienzo incorrecta",message:`La fecha comienzo '${fechacomienzoDate}' debe ser mayor a la hora actual '${currentDate}'`})
    }

    const fechaterminoDate = dayjs.unix(fechatermino).format("YYYY-MM-DD HH:mm:ss")
    if(fechatermino < fechacomienzo){
      return res.status(400).json({error:"Fecha termino incorrecta",message:`La fecha termino '${fechaterminoDate}' debe ser mayor a la fecha comienzo '${fechacomienzoDate}'`})
    }

    //Cuando todo es correcto:
    const archivosCargados = req.files
    let archivosData : {ruta: string;nombreoriginal: string;tipo: string;}[] = []

    // =============== Usar esto
    // let archivosData:LoadedFile[] = []

    if(archivosCargados){
        if (Array.isArray(archivosCargados)) {
            for (const file of archivosCargados) {
                const dateFormat = getFormattedDate()
                const nameFileUuid = uuidv4()
                const extensionFile = getExtesionFile(file.originalname)

                const movePath = path.resolve(`./archivos/ticket/${"nodo" + ctrl_id}/${dateFormat}/${nameFileUuid}.${extensionFile}`)

                // Comprobar directorio de destino
                const directorioDestino = path.dirname(movePath);
                if (!fs.existsSync(directorioDestino)) {
                    fs.mkdirSync(directorioDestino, { recursive: true });
                }

                // Mover archivo de la carpeta temporal
                fs.renameSync(file.path,movePath)

                const relativePath = path.relative("./archivos/ticket", movePath); // nodoXX\27-02-2024\1709065263868-hombre.png
                const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // Prueba/27-02-2024/1709065364652-hombre.png
                const archItem = {ruta: finalRelativePath, nombreoriginal:file.originalname,tipo: file.mimetype}
                console.log(archItem)

                archivosData.push(archItem)

            }
        } else {
            for (const fieldname in archivosCargados) {
              for (const file of archivosCargados[fieldname]) {
                
                const dateFormat = getFormattedDate()
                const nameFileUuid = uuidv4()
                const extensionFile = getExtesionFile(file.originalname)

                const movePath = path.resolve(`./archivos/ticket/${"nodo" + ctrl_id}/${dateFormat}/${nameFileUuid}.${extensionFile}`)

                // Comprobar directorio de destino
                const directorioDestino = path.dirname(movePath);
                if (!fs.existsSync(directorioDestino)) {
                    fs.mkdirSync(directorioDestino, { recursive: true });
                }

                // Mover archivo de la carpeta temporal
                fs.renameSync(file.path,movePath)

                const relativePath = path.relative("./archivos/ticket", movePath); // nodoXX\27-02-2024\1709065263868-hombre.png
                const finalRelativePath = relativePath.split(path.sep).join(path.posix.sep); // Prueba/27-02-2024/1709065364652-hombre.png
                const archItem = {ruta: finalRelativePath, nombreoriginal:file.originalname,tipo: file.mimetype}
                console.log(archItem)

                archivosData.push(archItem)
              }
            }
        }
    }

    if(formValues){
        const finalDataRequest = {archivos_cargados: archivosData, ... formValues}
        
        // ================ Usar esto
        // Main.onTicket(new Ticket(archivos_cargados, formValues.solicitante, formValues.personales))
        try {
          const newTicket = new Ticket(archivosData, formValues.solicitante, formValues.personales)
          let response = await onTicket(newTicket)
          console.log( response)
          if(response){
            if(response.resultado){ // success
              return res.json({success: true,message: "Ticket creado correctamente.",});
            }else{
              return res.json({success: false,message: response.mensaje,});
            }
          }else{
            return res.status(500).json({ success: false, message: "Internal Server Error,Backend-Technician", });
          }
        } catch (error) {
          return res.status(500).json({ success: false, message: "Internal Server Error,Backend-Technician", });
        }
        

        // try {
        //   const response = await fetch( `http://${TECHNICIAN_SERVER_IP}:${TECHNICIAN_PORT}/servlets/ticket`, { method: "POST", body: JSON.stringify(finalDataRequest) } );
        //   const resJson = await response.json()

        //   if (response.ok) {
        //     console.log("Respuesta Backend-Technician:\n", resJson)
        //     return res.json({success: true,message: "Ticket creado correctamente.",});
        //   } else {
        //     console.log("Respuesta Backend-Technician:\n", resJson)
        //     const statusCode = response.status;
        //     return res.status(statusCode).json({ success: false, message: "Ocurrrio un error al intentar crear el ticket.", });
        //   }

        // } catch (error) {
        //   return res.status(500).json({ success: false, message: "Internal Server Error,Backend-Technician", });
        // }
    }

    res.status(500).json({ success: false, message: "Internal Server Error", });
  }
);