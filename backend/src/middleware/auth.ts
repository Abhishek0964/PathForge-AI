import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';
import { User } from '../models/user.model';

export interface AuthRequest extends Request {
  user?: TokenPayload & { _id: string };
}

export const authenticate = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new AuthenticationError('No token provided');
    }

    const token = authHeader.split(' ')[1];
    if (!token) throw new AuthenticationError('No token provided');

    const payload = verifyAccessToken(token);

    // Verify user still exists
    const user = await User.findById(payload.userId).select('_id email');
    if (!user) throw new AuthenticationError('User not found');

    req.user = { ...payload, _id: user._id.toString() };
    next();
  } catch (error) {
    if (error instanceof AuthenticationError) {
      next(error);
    } else {
      next(new AuthenticationError('Invalid or expired token'));
    }
  }
};

export const optionalAuth = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const payload = verifyAccessToken(token);
        req.user = { ...payload, _id: payload.userId };
      }
    }
    next();
  } catch {
    next();
  }
};
