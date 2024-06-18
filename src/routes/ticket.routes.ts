import {Router} from 'express'
import {createTicket, downloadArchivo, downloadArchivoRespaldo, downloadFotoActividadPersonal, downloadPdfDetalles, getCargos, getFotoActividadPersonal, getNodos, getPersonalContrata, getRegistroTicket, getRegistroTickets, getSingleRegistroTicket, getTicketDetalles, getTipoTrabajo ,multerCreateTicketArgs,multerUpdAchRespArgs,upadateTicket, updateArchivoRespaldo } from '../controllers/ticket';
import { validateRequestData, validateRequestDataFinal} from '../middlewares/validator.middleware';
import { downloadArchivoRespaldoSchema, downloadArchivoSchema, downloadFotoActividadPersonalSchema, downloadPdfDetallesSchema, getFotoActividadPersonalSchema, getPersonalContrataSchema, getRegistroTicketSchema, getRegistroTicketsSchema, getSingleRegTickParam, getSingleRegTickQuery, getTicketDetallesSchema, updateTicketSchema } from '../schemas/ticket';
import { auth } from '../middlewares/auth.middleware';
import { GeneralMulterMiddleware } from '../middlewares/multer.middleware';

export const ticketRoutes = Router();

// Create POST /ticket/formdata
ticketRoutes.post("/ticket/create", GeneralMulterMiddleware(multerCreateTicketArgs), createTicket)  // validado 

// TipoTrabajo GET "/ticket/tipotrabajo"
ticketRoutes.get("/ticket/tipotrabajo", getTipoTrabajo) // no necesita validar

// PersonalContrata GET "/ticket/personal/:xco_id"
ticketRoutes.get("/ticket/personalescontrata/:xco_id",validateRequestData(getPersonalContrataSchema,{hasParam: true}), getPersonalContrata)

// UpadateTicket PATCH "/ticket/action"
ticketRoutes.patch("/ticket/update",auth,validateRequestData(updateTicketSchema,{hasBody:true}) ,upadateTicket)

// RegionNodos GET "/ticket/nodos"
ticketRoutes.get("/ticket/nodos", getNodos); // no necesita validar

// RegistroTicketNodo GET "/ticket/registro/:xctrl_id"
ticketRoutes.get("/ticket/registro/:xctrl_id",validateRequestData(getRegistroTicketSchema,{hasParam: true}), getRegistroTicket)

// Cargos GET "/ticket/cargos"
ticketRoutes.get("/ticket/cargos" , getCargos); // no necesita validar


// ======================= Nuevos
// Registro Tickets GET "/ticket/registros?ctrl_id=number&limit=number&offset=number"
ticketRoutes.get("/ticket/registros",auth,validateRequestDataFinal({querySchema:getRegistroTicketsSchema},{hasQuery:true}),getRegistroTickets)

// SingleRegistroTicket GET "/ticket/registros/:rt_id?ctrl_id=number"
ticketRoutes.get("/ticket/registros/:rt_id",auth,validateRequestDataFinal({paramSchema:getSingleRegTickParam, querySchema:getSingleRegTickQuery},{hasParam:true, hasQuery:true}),getSingleRegistroTicket)


// ================= Detalles ===============

// Ticket Detalles GET "/ticket/detalles?rt_id=number&ctrl_id=number"
ticketRoutes.get("/ticket/detalles",auth,validateRequestDataFinal({ querySchema:getTicketDetallesSchema},{hasQuery:true}),getTicketDetalles)

// FotoActividadPersonal GET "/ticket/fotoactividadpersonal?path:encodeURIComponennt"
ticketRoutes.get("/ticket/fotoactividadpersonal",validateRequestDataFinal({ querySchema: getFotoActividadPersonalSchema},{hasQuery:true}),getFotoActividadPersonal)

// DownloadArchivo POST "/ticket/download/archivo"
ticketRoutes.post("/ticket/download/archivo",validateRequestData(downloadArchivoSchema,{hasBody:true}), downloadArchivo)

// UpdateArchivosRespaldo POST "/ticket/update/archivorespaldo"
// ticketRoutes.post("/ticket/update/archivorespaldo",archivoRespMiddleware,updateArchivoRespaldo)
ticketRoutes.post("/ticket/update/archivorespaldo",GeneralMulterMiddleware(multerUpdAchRespArgs),updateArchivoRespaldo)

// DownloadPdfDetalles GET "/ticket/download?rt_id=number&ctrl_id=number"
ticketRoutes.get("/ticket/download",auth,validateRequestDataFinal({ querySchema: downloadPdfDetallesSchema},{hasQuery:true}), downloadPdfDetalles)

// Download ArchivoRespaldo GET "/ticket/download/archivorespaldo?filePath=encodeURIComponennt"
ticketRoutes.get("/ticket/download/archivorespaldo",validateRequestDataFinal({ querySchema: downloadArchivoRespaldoSchema},{hasQuery:true}), downloadArchivoRespaldo)
// Download ArchivoRespaldo GET "/ticket/download/fotoactividadpersonal?filePath=encodeURIComponennt"
ticketRoutes.get("/ticket/download/fotoactividadpersonal",validateRequestDataFinal({ querySchema: downloadFotoActividadPersonalSchema},{hasQuery:true}), downloadFotoActividadPersonal)


