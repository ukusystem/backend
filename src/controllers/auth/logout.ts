import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { appConfig } from "../../configs";

export const logout = asyncErrorHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // Limpiar cookies y almacenamiento
    // res.setHeader("Clear-Site-Data", '"cookies", "storage"');
    // Invalidar token
    res.clearCookie(appConfig.cookie.access_token.name);
    res.clearCookie(appConfig.cookie.refresh_token.name);
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  }
);
