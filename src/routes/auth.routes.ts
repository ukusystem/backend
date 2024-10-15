import { Router } from "express";
import { requestDataValidator} from "../middlewares/validator.middleware";
import { authController } from "../controllers/auth";
import { loginSchema } from "../schemas/auth";

export const authRoutes = Router();

// Login	POST /api/v1/auth/login
authRoutes.post("/auth/login", requestDataValidator({bodySchema:loginSchema},{hasBody:true}), authController.login);

// Logout	DELETE /api/v1/auth/logout
authRoutes.post("/auth/logout", authController.logout )

// VerifyToken GET /api/v1/auth/verify
authRoutes.get("/auth/verify", authController.verify)
authRoutes.get("/auth/refresh", authController.refreshToken)

// ResetPassword POST "/auth/resetpassword"
authRoutes.post("/auth/resetpassword", authController.forgotPassword)

// Sign Up	POST /api/v1/auth/sign-up




