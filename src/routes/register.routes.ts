import {Router} from 'express'
import { registerController } from '../controllers/register';

export const registerRoutes = Router();

// Registros POST /register
registerRoutes.post("/register",registerController.getRegisters)  // Cambiar de metodo
// Registros GET /register?type=""&ctrl_id=1&start_date=""&end_date=""&cursor=""&limit="" & ...others...
registerRoutes.get("/register",registerController.getRegistersFinal)

// DownloadExcel POST /register/download/excel
registerRoutes.post("/register/download/excel",registerController.excelDownload)

// DownloadCSV POST /register/download/csv
registerRoutes.post("/register/download/csv",registerController.csvDownload)

// DownloadPDF POST /register/download/pdf
registerRoutes.post("/register/download/pdf",registerController.pdfDownload)
