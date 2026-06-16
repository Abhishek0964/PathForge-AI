import { Router } from 'express';
import { generateRoadmap, getRoadmaps, getActiveRoadmap, updateTaskCompletion, deleteRoadmap } from '../controllers/roadmap.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.post('/generate', aiLimiter, generateRoadmap);
router.get('/', getRoadmaps);
router.get('/active', getActiveRoadmap);
router.patch('/task-completion', updateTaskCompletion);
router.delete('/:id', deleteRoadmap);
export default router;
