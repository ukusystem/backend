import { NextFunction, Request, Response } from "express";
import { Auth } from "../../models/auth";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { CustomError } from "../../utils/CustomError";
import { appConfig } from "../../configs";

export const refreshToken = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    
    const refreshTokenCookie: string | undefined = req.cookies[appConfig.cookie.refresh_token.name];
    const refreshTokenHeader: string | undefined = req.headers.authorization;
    
    const refreshToken = refreshTokenCookie ?? ( refreshTokenHeader !== undefined ? refreshTokenHeader.split(" ")[1] : undefined);

    if (refreshToken === undefined ) {
      const errTokenNotProvided = new CustomError(`No se proporcionó un refresh token`,401,"Unauthorized");
      return next(errTokenNotProvided);
    }

    const tokenPayload = await Auth.verifyRefreshToken(refreshToken);
    if (!tokenPayload) {
      const errTokenNotValid = new CustomError( ` Refresk token no válido`, 401, "Unauthorized" );
      return next(errTokenNotValid);
    }

    const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
    if (!userFound) {
      const errUserNotFound = new CustomError(`Usuario no encontrado.`,404,"Not Found");
      return next(errUserNotFound);
    }
    
    const newAccessToken = await Auth.generateAccessToken({ id: userFound.u_id, rol: userFound.rol, });
    const newRefreshToken = await Auth.generateRefreshToken({ id: userFound.u_id, rol: userFound.rol, });
    
    res.cookie(appConfig.cookie.access_token.name, newAccessToken, {
      httpOnly: true, // acceso solo del servidor
      secure: process.env.NODE_ENV === "production", // acceso solo con https
      sameSite: "strict", // acceso del mismo dominio
      // maxAge: 1000*60*60 // expiracion 1h
      maxAge: appConfig.cookie.access_token.max_age, // expiracion 1m
    });
  
    res.cookie(appConfig.cookie.refresh_token.name, newRefreshToken, {
      httpOnly: true, // acceso solo del servidor
      secure: process.env.NODE_ENV === "production", // acceso solo con https
      sameSite: "strict", // acceso del mismo dominio
      maxAge: appConfig.cookie.refresh_token.max_age, // expiracion 1d
    });

    const response = {
      status: 200,
      message: "Refresh token successful",
      data: {
        token_type: "Bearer",
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
      }
    }
    
    res.status(200).json(response);
  }
);
