import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";

export const logout = asyncErrorHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // Limpiar cookies y almacenamiento
    // res.setHeader("Clear-Site-Data", '"cookies", "storage"');
    // Invalidar token
    res.clearCookie("token");
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  }
);
