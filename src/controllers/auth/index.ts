import { login } from "./login";
import { logout } from "./logout";
import { verifyToken } from "./verifyToken";
import {forgotPassword} from './forgotPassword'

export const authController = {
  login,
  logout,
  verifyToken,
  forgotPassword
};
