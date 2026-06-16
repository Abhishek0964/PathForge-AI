import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import { env } from '../config/env';
import mongoose from 'mongoose';

export const errorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let code = 'INTERNAL_ERROR';
  let errors: unknown;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code = err.code ?? 'APP_ERROR';
  } else if (err instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    message = 'Validation failed';
    code = 'VALIDATION_ERROR';
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'CAST_ERROR';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'TOKEN_ERROR';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    code = 'TOKEN_EXPIRED';
  } else if ('code' in err && (err as NodeJS.ErrnoException).code === '11000') {
    statusCode = 409;
    message = 'Duplicate field value';
    code = 'DUPLICATE_ERROR';
  }

  if (statusCode >= 500) logger.error(`[${statusCode}] ${message}`, { stack: err.stack });
  else logger.warn(`[${statusCode}] ${message}`);

  const response: Record<string, unknown> = { success: false, message, code };
  if (errors) response['errors'] = errors;
  if (env.NODE_ENV === 'development') response['stack'] = err.stack;
  res.status(statusCode).json(response);
};
