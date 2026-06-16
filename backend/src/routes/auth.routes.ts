import { Router } from 'express';
import { register, login, logout, refreshToken, forgotPassword, resetPassword, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/logout', logout);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me', authenticate, getMe);
export default router;
