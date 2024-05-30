import { Request, Response, NextFunction } from "express";
import path from 'path'
import { asyncErrorHandler } from "../../../utils/asynErrorHandler";
import { ZodError } from "zod";
import { MySQL2 } from "../../../database/mysql";
import { CustomError } from "../../../utils/CustomError";
import { Ticket } from "../../../models/ticket";
import { GeneralMulterMiddlewareArgs, deleteTemporalFiles } from "../../../middlewares/multer.middleware";
import { updateArchivosRespaldoSchema } from "../../../schemas/ticket";
import { getFormattedDate } from "../../../utils/getFormattedDateTime";
import { v4 as uuidv4 } from 'uuid';
import { getExtesionFile } from "../../../utils/getExtensionFile";
import fs from 'fs'

export const multerUpdAchRespArgs: GeneralMulterMiddlewareArgs = {
  allowedMimeTypes: ["image/jpeg", "image/jpg", "image/png", "application/pdf", "video/mp4"],
  bodyFields: ["formvalues"],
  fields: [{ name: "archivos" }],
  limits: { files: 5, fileSize: 10 * 1024 * 1024, fieldSize: 5 * 1024 * 1024 },
};

export const updateArchivoRespaldo = asyncErrorHandler( async (req: Request, res: Response, next: NextFunction) => {
  // Validar formulario
  try {
    await updateArchivosRespaldoSchema.parseAsync(JSON.parse(req.body.formvalues)); // Validate  requests
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

  //Cuando todo es correcto:
  const formValues = JSON.parse(req.body.formvalues) as { ctrl_id:number, rt_id: number}
  const {ctrl_id,rt_id} = formValues 

  const archivosCargados = req.files
  let archivosData : {ruta: string;nombreoriginal: string;tipo: string;}[] = []

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

  // let archivosRespaldo: ArchivoTicket[] | null = null

  let errorInsertRows: Error | CustomError | null = null;
  if (formValues) {
    const mysqlconn = await MySQL2.getConnection()

    for (let i = 0; i < archivosData.length; i++) {
      try {
        // Código que puede lanzar una excepción
        const {nombreoriginal,ruta,tipo} = archivosData[i]
        await mysqlconn.query(`INSERT INTO ${ "nodo" + ctrl_id }.archivoticket (ruta,nombreoriginal,tipo,rt_id) VALUES ( ? , ? , ? , ? )`, [ruta, nombreoriginal, tipo, rt_id]);
      } catch (error) {
        // Manejo de la excepción
        if (error instanceof Error) {
          if ("code" in error) {
            if (error.code == "ER_NO_REFERENCED_ROW_2") { 
              const errTicketId = new CustomError( "El id del registro de ticket no existe", 400, "Numero de ticket invalido" );
              errorInsertRows = errTicketId;
            }else if(error.code == "ER_BAD_DB_ERROR"){
              const errCtrlId = new CustomError( "El id del controlador no existe", 400, "Controlador incorrecto." );
              errorInsertRows = errCtrlId;
            }else{
              const errInsert = new CustomError( "Ocurrio un error inesperado al intentar insertar registros a la DB.", 400, "Error no contemplado" );
              errorInsertRows = errInsert
            }
          }
        }else{
          const errInsert = new CustomError( "Ocurrio un error inesperado al intentar insertar registros a la DB.", 400, "Error no contemplado" );
          errorInsertRows = errInsert
        }
        
        break; // Salir del bucle
      }
    }

    MySQL2.releaseConnection(mysqlconn)
  }

  if (errorInsertRows) {
    if(req.files) deleteTemporalFiles(req.files) // limpiar
    return next(errorInsertRows);
  }

  const nuevosArchivoResp = await Ticket.getArchivosCargados({ctrl_id, rt_id})
  return res.json({ message: "Se agregaron correctamente los nuevos archivos de respaldo.", data: nuevosArchivoResp});
  }
);
