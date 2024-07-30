import { NextFunction, Request, Response } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { authConfigs } from "../../configs/auth.configs";

export const logout = asyncErrorHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    // Limpiar cookies y almacenamiento
    // res.setHeader("Clear-Site-Data", '"cookies", "storage"');
    // Invalidar token
    res.clearCookie(authConfigs.ACCESS_TOKEN_COOKIE_NAME);
    res.clearCookie(authConfigs.REFRESH_TOKEN_COOKIE_NAME);
    res.status(200).json({ message: "Sesión cerrada correctamente." });
  }
);
