import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, errors, json, colorize, simple } = winston.format;

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp(),
    json()
  ),
  defaultMeta: { service: 'ai-career-coach' },
  transports: [
    new winston.transports.Console({
      format: env.NODE_ENV === 'development'
        ? combine(colorize(), simple())
        : combine(timestamp(), json()),
    }),
  ],
});

if (env.NODE_ENV === 'production') {
  logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}
