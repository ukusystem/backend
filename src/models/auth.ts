import { MySQL2 } from "../database/mysql";
import jwt from "jsonwebtoken";
import { RowDataPacket } from "mysql2";
import { simpleErrorHandler } from "../utils/simpleErrorHandler";

import {Contrata, Personal, Rol, Rubro, Usuario} from '../types/db'
import { appConfig } from "../configs";

interface JwtPayload {
  sub: string;
  exp: number;
  id: number;
  rol: string;
}

export type UserInfo = Pick<Usuario,"u_id"|"usuario"|"contraseña"|"rl_id"|"fecha"|"p_id"> & Pick<Personal,"nombre"|"apellido"|"dni"|"telefono"|"correo"|"c_id"> & Pick<Contrata,"contrata"|"co_id"> & Pick<Rubro,"rubro"> & Pick<Rol,"rl_id"|"rol"|"descripcion">

interface UserFound extends RowDataPacket,UserInfo  {}

export class Auth {

  static findUser = simpleErrorHandler<UserInfo | null,Pick<Usuario, "usuario"> >(async ({ usuario }) => {
    const userFound = await MySQL2.executeQuery<UserFound[]>({sql:`SELECT u.u_id, u.usuario, u.contraseña, u.rl_id, u.fecha, u.p_id, p.nombre, p.apellido, p.dni, p.telefono, p.correo, p.c_id, c.contrata , c.co_id, c.r_id, ru.rubro, r.rol, r.descripcion FROM general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id INNER JOIN general.contrata c ON p.co_id = c.co_id INNER JOIN general.rubro ru ON c.r_id = ru.r_id  WHERE u.usuario = ? `,values:[usuario]})

    if (userFound.length > 0) {
      return userFound[0];
    }

    return null;
  }, "Auth.findUser");

  static findUserById = simpleErrorHandler<UserInfo | null, Pick<Usuario, "u_id">>( async ({ u_id }) => {
    
    const userFound = await MySQL2.executeQuery<UserFound[]>({sql:`SELECT u.u_id, u.usuario, u.contraseña, u.rl_id, u.fecha, u.p_id, p.nombre, p.apellido, p.dni, p.telefono, p.correo, p.c_id, c.contrata , c.co_id, c.r_id, r.rol, r.descripcion FROM general.usuario u INNER JOIN general.rol r ON u.rl_id = r.rl_id INNER JOIN general.personal p ON u.p_id = p.p_id INNER JOIN general.contrata c ON p.co_id = c.co_id WHERE u.u_id = ?`,values:[u_id]})

    if (userFound.length > 0) {
      return userFound[0];
    }

    return null;
    
    },
    "Auth.findUserById"
  );

  static generateAccessToken = simpleErrorHandler<string | undefined,string | object | Buffer>((payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        appConfig.jwt.access_token.secret,
        { expiresIn: appConfig.jwt.access_token.expire },
        (err, token) => {
          if (err) reject(err);
          resolve(token);
        }
      );
    });
  }, "Auth.generateAccessToken");
  
  static generateRefreshToken = simpleErrorHandler<string | undefined,string | object | Buffer>((payload) => {
    return new Promise((resolve, reject) => {
      jwt.sign(
        payload,
        appConfig.jwt.refresh_token.secret,
        { expiresIn: appConfig.jwt.refresh_token.expire },
        (err, token) => {
          if (err) reject(err);
          resolve(token);
        }
      );
    });
  }, "Auth.generateRefreshToken");

  static verifyAccessToken = simpleErrorHandler<JwtPayload | null, string>((token) => {
      return new Promise((resolve, _reject) => {
        jwt.verify(token, appConfig.jwt.access_token.secret, (err, user) => {
          if (err) {
            resolve(null);
          }
          resolve(user as JwtPayload);
        });
      });
    },
    "Auth.verifyAccessToken"
  );
  static verifyRefreshToken = simpleErrorHandler<JwtPayload | null, string>((token) => {
      return new Promise((resolve, _reject) => {
        jwt.verify(token, appConfig.jwt.refresh_token.secret, (err, user) => {
          if (err) {
            resolve(null);
          }
          resolve(user as JwtPayload);
        });
      });
    },
    "Auth.verifyAccessToken"
  );
}
