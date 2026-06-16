import { Router } from 'express';
import { generateResources, getResources, getResourceByTopic } from '../controllers/resource.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.post('/generate', aiLimiter, generateResources);
router.get('/', getResources);
router.get('/:topic', getResourceByTopic);
export default router;
