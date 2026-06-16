import rateLimit from 'express-rate-limit';
import { RateLimitError } from '../utils/errors';

export const createRateLimiter = (max: number, windowMinutes: number) =>
  rateLimit({
    windowMs: windowMinutes * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, _res, next) => {
      next(new RateLimitError());
    },
  });

export const authLimiter = createRateLimiter(10, 15);
export const aiLimiter = createRateLimiter(20, 60);
export const uploadLimiter = createRateLimiter(10, 60);
