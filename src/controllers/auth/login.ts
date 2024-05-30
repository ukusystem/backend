import crypto from "crypto";
import bcrypt from 'bcrypt'
import { Request, Response, NextFunction } from "express";
import { asyncErrorHandler } from "../../utils/asynErrorHandler";
import { Usuario } from "../../types/usuario";
import { Auth } from "../../models/auth";
import { CustomError } from "../../utils/CustomError";

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
    const token = await Auth.generateAccessJWT({ id: userFound.u_id, rol: userFound.rol, });
    res.cookie("token", token );
    const { contraseña: contraseñaFound, ...userWithoutPassword } = userFound;
    
    console.log(userWithoutPassword)
    
    res.json(userWithoutPassword);
  }
);
