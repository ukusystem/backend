import { login } from "./login";
import { logout } from "./logout";
import {forgotPassword} from './forgotPassword'
import { refreshToken } from "./refreshToken";

export const authController = {
  login,
  logout,
  forgotPassword,
  refreshToken
};
