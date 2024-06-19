import { pdfDownload } from "./pdfDownload";
import { excelDownload } from "./excelDownload";
import { csvDownload } from "./csvDownload";
import { getRegisters , getRegistersFinal } from "./getRegisters";

export const registerController = {
  pdfDownload,
  excelDownload,
  csvDownload,
  getRegisters,
  getRegistersFinal

};
