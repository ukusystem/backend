import { Request,Response, NextFunction } from "express";
import { Auth, UserInfo } from "../models/auth";
import { asyncErrorHandler } from "../utils/asynErrorHandler";
import { CustomError } from "../utils/CustomError";
import { RequestWithUser } from "../types/requests";
import { appConfig } from "../configs";

export interface CustomRequest extends Request {
  user?: UserInfo;
}

type permittedRoles = "Invitado" | "Usuario" | "Administrador"


export const authenticate = asyncErrorHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {

  const accessToken: string | undefined = req.cookies[appConfig.cookie.access_token.name];
  const refreshToken: string | undefined = req.cookies[appConfig.cookie.refresh_token.name];

  if (accessToken === undefined && refreshToken === undefined) {
    const errTokenNotProvided = new CustomError( `Token no proporcionado`, 401, "Unauthorized" );
    return next(errTokenNotProvided);
  }

  const tokenPayload = await Auth.verifyAccessToken(accessToken);

  if (tokenPayload !== null) {

    const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
    if (!userFound) {
      const errUserNotFound = new CustomError(`Usuario no encontrado.`,404,"Not Found");
      return next(errUserNotFound);
    }
    req.user = userFound;
    next();

  }else{ // tokenPayload === null

    if(refreshToken === null){
      const errRefresTokenNotProvided = new CustomError( `Refresh token no proporcionado`, 401, "Unauthorized" );
      return next(errRefresTokenNotProvided);
    }

    const tokenPayload = await Auth.verifyRefreshToken(refreshToken);

    if( tokenPayload !== null){
      const userFound = await Auth.findUserById({ u_id: tokenPayload.id });

      if (userFound === null) {
        const errUserNotFound = new CustomError(`Usuario no encontrado.`,404,"Not Found");
        return next(errUserNotFound);
      }

      req.user = userFound;

      const newAccessToken = await Auth.generateAccessToken({ id: userFound.u_id, rol: userFound.rol, });
      // console.log("generando nuevo acceso token",newAccessToken )

      res.cookie(appConfig.cookie.access_token.name, newAccessToken, {
        httpOnly: true, // acceso solo del servidor
        secure: process.env.NODE_ENV === "production", // acceso solo con https
        sameSite: "strict", // acceso del mismo dominio
        // maxAge: 1000*60*60 // expiracion 1h
        maxAge: appConfig.cookie.access_token.max_age, // expiracion 1m
      });

      next();
    }else{
      const errTokenNotProvided = new CustomError( `Token no proporcionado`, 401, "Unauthorized" );
      return next(errTokenNotProvided);
    }

  }

})


export const userRolCheck = (allowedRoles:permittedRoles[]) => asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {

  const user = req.user;
  
  if(user === undefined){
    const userNotAuthenticaded = new CustomError(`Usuario no autentificado`,401,"Unauthorized");
    throw userNotAuthenticaded
  }

  if(!allowedRoles.some((rol)=> rol === user.rol)){
    const accessDeniedError = new CustomError(`No tienes los permisos necesarios para acceder al recurso.`,403,"Acceso denegado");
    throw accessDeniedError
  }
  
  next();
})


