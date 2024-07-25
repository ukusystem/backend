import { Request,Response, NextFunction } from "express";
import { Auth, UserInfo } from "../models/auth";
// import {CustomRequest} from '../controllers/init/init'
import { asyncErrorHandler } from "../utils/asynErrorHandler";
import { CustomError } from "../utils/CustomError";
import { RequestWithUser } from "../types/requests";

export interface CustomRequest extends Request {
  user?: UserInfo; // Agrega la propiedad 'user' a la interfaz
}
type permittedRoles = "Invitado" | "Usuario" | "Administrador"

export const auth = asyncErrorHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const { token } = req.cookies as { token?: string };
  // Verificar si el token no está presente en la solicitud
  if (!token) {
    const errTokenNotProvided = new CustomError( `No se proporcionó un token de autenticación.`, 401, "Unauthorized" );
    return next(errTokenNotProvided);
  }

  // Verificar la validez del token usando la clave secreta
  const tokenPayload = await Auth.verifyAccessToken(token);
  if (!tokenPayload) {
    const errTokenNotValid = new CustomError( `Token no válido. La autenticación ha fallado.`, 401, "Unauthorized" );
    return next(errTokenNotValid);
  }

  const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
  if (!userFound) {
    const errUserNotFound = new CustomError(`Usuario no encontrado.`,404,"Not Found");
    return next(errUserNotFound);
  }
  req.user = userFound;
  next();
})


export const rolCheck = (allowedRoles:permittedRoles[]) => asyncErrorHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  // Verificar si el usuario tiene un rol válido
  const user = req.user;
  if(user){
    if (!allowedRoles.includes(user.rol as permittedRoles)) {
      const accessDeniedError = new CustomError(`Acceso denegado: No tienes los permisos necesarios.`,403,"Forbidden");
       return next(accessDeniedError)
    }
  }
  next();
})


export const userRolCheck = (allowedRoles:permittedRoles[]) => asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {

  const user = req.user!; // ! usuario auntentificado

  if(!allowedRoles.some((rol)=> rol === user.rol)){
    const accessDeniedError = new CustomError(`No tienes los permisos necesarios para acceder al recurso.`,403,"Acceso denegado");
    throw accessDeniedError
  }
  
  next();
})


