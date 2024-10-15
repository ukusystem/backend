import {Router} from 'express'
import { registerController } from '../controllers/register';
import { requestDataValidator } from '../middlewares/validator.middleware';
import { downloadRegistersSchema, getRegistersSchema } from '../schemas/register';
import { authenticate } from '../middlewares/auth.middleware';

export const registerRoutes = Router();


// Registros GET /register?type=""&ctrl_id=1&start_date=""&end_date=""&cursor=""&limit="" & ...others...
registerRoutes.get("/register",authenticate,requestDataValidator({querySchema: getRegistersSchema},{hasQuery:true}),registerController.getRegistersFinal)

// DownloadExcel GET /register/download/excel
registerRoutes.get("/register/download/excel",authenticate,registerController.excelDownload)

// DownloadCSV GET /register/download/csv
registerRoutes.get("/register/download/csv",authenticate,requestDataValidator({querySchema: downloadRegistersSchema},{hasQuery:true}),registerController.csvDownload)

// DownloadPDF POST /register/download/pdf
// registerRoutes.post("/register/download/pdf",registerController.pdfDownload)
