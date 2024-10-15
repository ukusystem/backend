import bcrypt from 'bcrypt'
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Usuario } from "../../types/usuario";
import { Auth } from "../../models/auth";
import { CustomError } from "../../utils/CustomError";
import { appConfig } from '../../configs';

interface IResponseLogin {
  status: number;
  message: string;
  data: IData;
}

interface IData {
  token_type: string;
  access_token: string;
  refresh_token: string;
  user: IUserLoginData;
}

interface IUserLoginData {
  usuario: string;
  fecha: string;
  u_id: number;
  rl_id: number;
  p_id: number;
  nombre: string;
  dni: string;
  telefono: string;
  correo: string;
  apellido: string;
  c_id: number;
  contrata: string;
  co_id: number;
  rubro: string;
  rol: string;
  descripcion: string;
  foto: string;
}

export const login = asyncErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { usuario, contraseña } = req.body as Pick< Usuario, "contraseña" | "usuario" >;

    //Verificar usuario
    const userFound = await Auth.findUser({ usuario });
    if (!userFound) {
      const errUserNotFound = new CustomError( `La cuenta de usuario o contraseña es incorrecta`, 401, "Unauthorized" );
      return next(errUserNotFound);
    }

    //Verificar contraseña
    const isMatch = await bcrypt.compare(contraseña, userFound.contraseña);
    
    if (!isMatch) {
      const errPasswordNotMatch = new CustomError( `La cuenta de usuario o contraseña es incorrecta`, 401, "Unauthorized" );
      return next(errPasswordNotMatch);
    }

    //Crear token de acceso
    const accessToken = await Auth.generateAccessToken({ id: userFound.u_id, rol: userFound.rol, });
    const refreshToken = await Auth.generateRefreshToken({ id: userFound.u_id, rol: userFound.rol, });


    res.cookie(appConfig.cookie.access_token.name, accessToken,{
      httpOnly: true , // acceso solo del servidor
      secure: appConfig.node_env === "production", // acceso solo con https
      sameSite: "strict", // acceso del mismo dominio
      // maxAge: 1000*60*60 // expiracion 1h
      maxAge: appConfig.cookie.access_token.max_age // expiracion 1m
    });

    res.cookie(appConfig.cookie.refresh_token.name, refreshToken,{
      httpOnly: true , // acceso solo del servidor
      secure: appConfig.node_env === "production", // acceso solo con https
      sameSite: "strict", // acceso del mismo dominio
      maxAge: appConfig.cookie.refresh_token.max_age// expiracion 1d,
    });

    const { contraseña: contraseñaFound, ...userWithoutPassword } = userFound;

    const response: IResponseLogin = {
      status: 200,
      message: "Login successful",
      data: {
        token_type: "Bearer",
        access_token: accessToken,
        refresh_token: refreshToken,
        user: userWithoutPassword
      }
    }

    res.status(200).json(response);
  }
);
