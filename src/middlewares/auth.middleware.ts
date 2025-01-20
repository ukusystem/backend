import { Request, Response, NextFunction } from 'express';
import { Auth, UserInfo } from '../models/auth';
import { asyncErrorHandler } from '../utils/asynErrorHandler';
import { CustomError } from '../utils/CustomError';
import { RequestWithUser } from '../types/requests';
import { appConfig } from '../configs';
import { UserRol } from '../types/rol';

export interface CustomRequest extends Request {
  user?: UserInfo;
}

export const authenticate = asyncErrorHandler(async (req: CustomRequest, res: Response, next: NextFunction) => {
  const accessTokenCookie: string | undefined = req.cookies[appConfig.cookie.access_token.name];
  const accessTokenHeader: string | undefined = req.headers.authorization !== undefined ? req.headers.authorization.split(' ')[1] : undefined;

  if (accessTokenCookie === undefined && accessTokenHeader === undefined) {
    return res.status(401).json({ message: 'Token de acceso no proporcionado' });
  }

  const accesssToken = accessTokenCookie ?? accessTokenHeader;

  const tokenPayload = await Auth.verifyAccessToken(accesssToken);

  if (tokenPayload === null) {
    return res.status(401).json({ message: 'Token de acceso inválido o expirado' });
  }

  const userFound = await Auth.findUserById({ u_id: tokenPayload.id });
  if (userFound === null) {
    return res.status(404).json({ message: 'Usuario no disponible' });
  }

  req.user = userFound;

  next();
});

export const rolChecker = (allowedRoles: UserRol[]) =>
  asyncErrorHandler(async (req: RequestWithUser, res: Response, next: NextFunction) => {
    const user = req.user;

    if (user === undefined) {
      const userNotAuthenticaded = new CustomError(`Usuario no autentificado`, 401, 'Unauthorized');
      throw userNotAuthenticaded;
    }

    if (!allowedRoles.some((rol) => rol === user.rl_id)) {
      const accessDeniedError = new CustomError(`No tienes los permisos necesarios para acceder al recurso.`, 403, 'Acceso denegado');
      throw accessDeniedError;
    }

    next();
  });
