import crypto from "crypto";
import bcrypt from 'bcrypt'
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Usuario } from "../../types/usuario";
import { Auth } from "../../models/auth";
import { CustomError } from "../../utils/CustomError";
import { authConfigs } from "../../configs/auth.configs";

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


    res.cookie(authConfigs.ACCESS_TOKEN_COOKIE_NAME, accessToken,{
      httpOnly: true , // acceso solo del servidor
      secure: process.env.NODE_ENV === "production", // acceso solo con https
      sameSite: "strict", // acceso del mismo dominio
      // maxAge: 1000*60*60 // expiracion 1h
      maxAge: 1000*60 // expiracion 1m
    });

    res.cookie(authConfigs.REFRESH_TOKEN_COOKIE_NAME, refreshToken,{
      httpOnly: true , // acceso solo del servidor
      secure: process.env.NODE_ENV === "production", // acceso solo con https
      sameSite: "strict", // acceso del mismo dominio
      maxAge: 1000*60*60*24 // expiracion 1d
    });

    const { contraseña: contraseñaFound, ...userWithoutPassword } = userFound;
    
    res.json(userWithoutPassword);
  }
);
