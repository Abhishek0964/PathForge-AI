import { Router } from 'express';
import { generateSkillGap, getSkillGaps, getLatestSkillGap, deleteSkillGap } from '../controllers/skillGap.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.post('/generate', aiLimiter, generateSkillGap);
router.get('/', getSkillGaps);
router.get('/latest', getLatestSkillGap);
router.delete('/:id', deleteSkillGap);
export default router;
