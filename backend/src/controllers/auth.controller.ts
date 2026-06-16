import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/user.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, revokeRefreshToken, revokeAllUserTokens } from '../utils/jwt';
import { AppError, ConflictError, AuthenticationError, NotFoundError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import { AuthRequest } from '../middleware/auth';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearRefreshCookie = (res: Response) => res.clearCookie('refreshToken', { httpOnly: true, secure: env.NODE_ENV === 'production', sameSite: 'strict' });

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) throw new ConflictError('Email already registered');

    const user = await User.create({ name, email, password });
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = await generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(201).json({ success: true, user, accessToken });
  } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) throw new AuthenticationError('Invalid email or password');
    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new AuthenticationError('Invalid email or password');
    const accessToken = generateAccessToken({ userId: user._id.toString(), email: user.email });
    const refreshToken = await generateRefreshToken(user._id);
    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    const userObj = user.toJSON();
    res.json({ success: true, user: userObj, accessToken });
  } catch (error) { next(error); }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies['refreshToken'] as string | undefined;
    if (token) await revokeRefreshToken(token);
    clearRefreshCookie(res);
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) { next(error); }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies['refreshToken'] as string | undefined;
    if (!token) throw new AuthenticationError('No refresh token');
    const stored = await verifyRefreshToken(token);
    const userId = stored.userId.toString();
    const user = await User.findById(userId).select('email');
    if (!user) throw new AuthenticationError('User not found');
    const accessToken = generateAccessToken({ userId, email: user.email });
    res.json({ success: true, accessToken });
  } catch (error) {
    clearRefreshCookie(res);
    next(error);
  }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email } = req.body as { email: string };
    const user = await User.findOne({ email: email?.toLowerCase() }).select('+passwordResetToken +passwordResetExpires');
    if (!user) { res.json({ success: true, message: 'If the email exists, a reset link has been sent' }); return; }
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    logger.info(`Password reset token for ${email}: ${resetToken}`);
    res.json({ success: true, message: 'Password reset token generated', resetToken });
  } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { token } = req.params as { token: string };
    const { password } = req.body as { password: string };
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires');
    if (!user) throw new AppError('Invalid or expired reset token', 400);
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await revokeAllUserTokens(user._id);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (error) { next(error); }
};

export const getMe = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');
    res.json({ success: true, user });
  } catch (error) { next(error); }
};
