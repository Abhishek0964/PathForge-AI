import { Router } from 'express';
import { getConversations, getConversation, createConversation, sendMessage, deleteConversation } from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';
import { aiLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.get('/', getConversations);
router.post('/', createConversation);
router.get('/:id', getConversation);
router.post('/message', aiLimiter, sendMessage);
router.delete('/:id', deleteConversation);
export default router;
