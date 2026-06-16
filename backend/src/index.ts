import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { connectDB } from './config/database';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import { createRateLimiter } from './middleware/rateLimiter';
import { logger } from './utils/logger';

// Routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import resumeRoutes from './routes/resume.routes';
import roadmapRoutes from './routes/roadmap.routes';
import skillGapRoutes from './routes/skillGap.routes';
import projectRoutes from './routes/project.routes';
import internshipRoutes from './routes/internship.routes';
import dailyTaskRoutes from './routes/dailyTask.routes';
import chatRoutes from './routes/chat.routes';
import resourceRoutes from './routes/resource.routes';
import dashboardRoutes from './routes/dashboard.routes';
import searchRoutes from './routes/search.routes';

const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

// CORS
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Logging
if (env.NODE_ENV !== 'test') {
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.http(msg.trim()) },
  }));
}

// Global rate limiter
app.use('/api', createRateLimiter(100, 15));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resumes', resumeRoutes);
app.use('/api/roadmaps', roadmapRoutes);
app.use('/api/skill-gaps', skillGapRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/daily-tasks', dailyTaskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/search', searchRoutes);

// Error handlers
app.use(notFound);
app.use(errorHandler);

const start = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
  });
};

start().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

export default app;
