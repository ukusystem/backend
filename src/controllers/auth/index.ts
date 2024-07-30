import { login } from "./login";
import { logout } from "./logout";
import { verifyToken } from "./verifyToken";
import {forgotPassword} from './forgotPassword'
import { refreshToken } from "./refreshToken";

export const authController = {
  login,
  logout,
  verifyToken,
  forgotPassword,
  refreshToken
};
