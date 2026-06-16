import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { RefreshToken } from '../models/refreshToken.model';
import { v4 as uuidv4 } from 'uuid';
import mongoose from 'mongoose';

export interface TokenPayload {
  userId: string;
  email: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES as jwt.SignOptions['expiresIn'],
  });
};

export const generateRefreshToken = async (userId: mongoose.Types.ObjectId): Promise<string> => {
  const token = uuidv4();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await RefreshToken.create({ userId, token, expiresAt });
  return token;
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as TokenPayload;
};

export const verifyRefreshToken = async (token: string) => {
  const stored = await RefreshToken.findOne({ token, isRevoked: false }).populate('userId');
  if (!stored) throw new Error('Invalid refresh token');
  if (stored.expiresAt < new Date()) {
    await RefreshToken.deleteOne({ _id: stored._id });
    throw new Error('Refresh token expired');
  }
  return stored;
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
  await RefreshToken.updateOne({ token }, { isRevoked: true });
};

export const revokeAllUserTokens = async (userId: mongoose.Types.ObjectId): Promise<void> => {
  await RefreshToken.updateMany({ userId }, { isRevoked: true });
};
