import express from 'express'
import { resetPassword, sendResetOtp, isAuthenticated, login, logout, register, sendVerifyOtp, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.post('/send-verify-otp', protect, sendVerifyOtp);
authRouter.post('/verify-account', protect, verifyEmail);
authRouter.get('/is-auth', protect, isAuthenticated);
authRouter.post('/send-reset-otp', sendResetOtp);
authRouter.post('/reset-password', resetPassword);




export default authRouter;
