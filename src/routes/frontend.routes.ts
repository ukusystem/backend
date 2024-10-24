import { Router } from "express";
import { resolve } from "path";
import { CustomError } from "../utils/CustomError";
export const frontEndRoutes = Router();

const allFrontEndPaths = [
"/",
"/auth/login",
"/auth/forgot-password",
"/dashboard",
"/vms",
"/tickets",
"/tickets/historial",
"/smartmap",
"/logs",
"/invitado/tickets",
"/invitado/tickets/historial",
"/site/:ctrl_id",
"/alarmas"
];

frontEndRoutes.get(allFrontEndPaths, (req, res,next) => {
  res.sendFile(resolve(__dirname, "../../public/index.html"), (err) => {
    if (err) {
      const errFileNotFound = new CustomError(
        `index.html no disponible`,
        404,
        "Not Found"
      );
      next(errFileNotFound);
    }
  });
});
