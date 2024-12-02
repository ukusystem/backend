import { Router } from 'express';
import { requestValidator } from '../middlewares/validator.middleware';
import { authController } from '../controllers/auth';
import { loginSchema } from '../schemas/auth';
import { refreshTokenFinal } from '../controllers/auth/refresh.token';

export const authRoutes = Router();

// Login	POST /api/v1/auth/login
authRoutes.post('/auth/login', requestValidator({ body: loginSchema }), authController.login);

// Logout POST /api/v1/auth/logout
authRoutes.post('/auth/logout', authController.logout);

// VerifyToken GET /api/v1/auth/verify
authRoutes.get('/auth/verify', authController.verify);
authRoutes.get('/auth/refresh', authController.refreshToken);
authRoutes.post('/auth/refresh-test', refreshTokenFinal);

// ResetPassword POST "/auth/resetpassword"
authRoutes.post('/auth/resetpassword', authController.forgotPassword);

// Sign Up	POST /api/v1/auth/sign-up
