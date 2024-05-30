import { sendMail } from "../../services/sendEmail";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Request, Response, NextFunction } from "express";
export const forgotPassword = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { correo } = req.body;
      await sendMail({ toEmail: correo });
      res.json({message: "Se ha enviado una solicitud de restablecimiento de contraseña al administrador.",});
    } catch (error) {
      console.log("Error en resetPassword :", error);
      res.status(500).json({ message: "Error al enviar solicitud de restablecimiento de contraseña.", });
    }
  }
);
