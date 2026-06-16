import { Router } from 'express';
import { getTodayTasks, completeTask, getTaskHistory, regenerateTasks } from '../controllers/dailyTask.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.get('/today', getTodayTasks);
router.patch('/:taskId/complete', completeTask);
router.get('/history', getTaskHistory);
router.post('/regenerate', aiLimiter, regenerateTasks);
export default router;
