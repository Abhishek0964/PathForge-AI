import { Router } from 'express';
import { createInternship, getInternships, getInternship, updateInternship, deleteInternship, getInternshipStats } from '../controllers/internship.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.post('/', createInternship);
router.get('/', getInternships);
router.get('/stats', getInternshipStats);
router.get('/:id', getInternship);
router.patch('/:id', updateInternship);
router.delete('/:id', deleteInternship);
export default router;
