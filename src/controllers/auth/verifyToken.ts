import { NextFunction, Request, Response } from "express";
import { Auth } from "../../models/auth";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { CustomError } from "../../utils/CustomError";

export const verifyToken = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const { token: tokenCookie } = req.cookies as { token?: string };

    const authorizationHeader = req.headers.authorization;


    if (!tokenCookie && !authorizationHeader) {
      const errTokenNotProvided = new CustomError(`No se proporcionó un token de autenticación.`,401,"Unauthorized");
      return next(errTokenNotProvided);
    }

    const [, tokenBearerSplited] = authorizationHeader?.split(" ") ?? [];
    const tokenClient: string = tokenBearerSplited ?? tokenCookie!;

    const tokenPayload = await Auth.verifyAccessToken(tokenClient);
    if (!tokenPayload) {
      const errTokenNotValid = new CustomError( `Token no válido. La autenticación ha fallado.`, 401, "Unauthorized" );
      return next(errTokenNotValid);
    }

    const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
    if (!userFound) {
      const errUserNotFound = new CustomError(`Usuario no encontrado.`,404,"Not Found");
      return next(errUserNotFound);
    }

    const { contraseña: contraseñaFound, ...userWithoutPassword } = userFound;
    
    res.json(userWithoutPassword);
  }
);
