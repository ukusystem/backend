import {Router} from 'express'
import { registerController } from '../controllers/register';
import { validateRequestDataFinal } from '../middlewares/validator.middleware';
import { downloadRegistersSchema, getRegistersSchema } from '../schemas/register';

export const registerRoutes = Router();


// Registros GET /register?type=""&ctrl_id=1&start_date=""&end_date=""&cursor=""&limit="" & ...others...
registerRoutes.get("/register",validateRequestDataFinal({querySchema: getRegistersSchema},{hasQuery:true}),registerController.getRegistersFinal)

// DownloadExcel GET /register/download/excel
registerRoutes.get("/register/download/excel",registerController.excelDownload)

// DownloadCSV GET /register/download/csv
registerRoutes.get("/register/download/csv",validateRequestDataFinal({querySchema: downloadRegistersSchema},{hasQuery:true}),registerController.csvDownload)

// DownloadPDF POST /register/download/pdf
// registerRoutes.post("/register/download/pdf",registerController.pdfDownload)
