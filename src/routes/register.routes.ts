import {Router} from 'express'
import { registerController } from '../controllers/register';

export const registerRoutes = Router();

// Registros POST /register
registerRoutes.post("/register",registerController.getRegisters)  // Cambiar de metodo
// Registros GET /register/:TipoRegistro?ctrlId=1&startDate=""&endDate="" & ...others...
registerRoutes.get("/register/:tiporegistro",registerController.getRegisters)

// DownloadExcel POST /register/download/excel
registerRoutes.post("/register/download/excel",registerController.excelDownload)

// DownloadCSV POST /register/download/csv
registerRoutes.post("/register/download/csv",registerController.csvDownload)

// DownloadPDF POST /register/download/pdf
registerRoutes.post("/register/download/pdf",registerController.pdfDownload)
