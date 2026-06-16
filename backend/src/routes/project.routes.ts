import { Router } from 'express';
import { generateProjects, getProjects, getLatestProjects } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.post('/generate', aiLimiter, generateProjects);
router.get('/', getProjects);
router.get('/latest', getLatestProjects);
export default router;
