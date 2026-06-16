import { Router } from 'express';
import { uploadResume, getResume, getAllResumes, analyzeResume, deleteResume } from '../controllers/resume.controller';
import { authenticate } from '../middleware/auth';
import { resumeUpload } from '../middleware/upload';
import { aiLimiter, uploadLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(authenticate);
router.post('/upload', uploadLimiter, resumeUpload.single('resume'), uploadResume);
router.get('/', getAllResumes);
router.get('/active', getResume);
router.post('/analyze', aiLimiter, analyzeResume);
router.delete('/active', deleteResume);
export default router;
