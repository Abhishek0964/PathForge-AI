import mongoose from 'mongoose';
import { env } from './env';
import { logger } from '../utils/logger';

export const connectDB = async (): Promise<void> => {
  const maxRetries = 3;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      logger.info('MongoDB connected successfully');
      return;
    } catch (error) {
      attempt++;
      logger.error(`MongoDB connection attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        logger.error('Max retries reached. Exiting.');
        process.exit(1);
      }
      await new Promise((r) => setTimeout(r, 2000 * attempt));
    }
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB error:', err);
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed due to app termination');
  process.exit(0);
});
