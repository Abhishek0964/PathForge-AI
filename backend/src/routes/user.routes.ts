import { Router } from 'express';
import { getProfile, updateProfile, updatePassword, uploadAvatar, deleteAccount, getStats } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth';
import { avatarUpload } from '../middleware/upload';

const router = Router();
router.use(authenticate);
router.get('/me', getProfile);
router.patch('/me', updateProfile);
router.patch('/me/password', updatePassword);
router.post('/me/avatar', avatarUpload.single('avatar'), uploadAvatar);
router.delete('/me', deleteAccount);
router.get('/me/stats', getStats);
export default router;
