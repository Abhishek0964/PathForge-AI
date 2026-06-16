import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/user.model';
import { Resume } from '../models/resume.model';
import { Roadmap } from '../models/roadmap.model';
import { SkillGap } from '../models/skillGap.model';
import { Internship } from '../models/internship.model';
import { DailyTask } from '../models/dailyTask.model';
import { cloudinary } from '../config/cloudinary';
import { NotFoundError, AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import streamifier from 'streamifier';
import mongoose from 'mongoose';

const uploadImageToCloudinary = (buffer: Buffer, options: Record<string, unknown>): Promise<{ secure_url: string; public_id: string }> =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else if (result) resolve({ secure_url: result.secure_url, public_id: result.public_id });
      else reject(new Error('Upload failed'));
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const allowed = ['name', 'college', 'degree', 'branch', 'year', 'cgpa', 'skills', 'interests', 'careerGoal', 'linkedin', 'github', 'bio'];
    const updates: Record<string, unknown> = {};
    allowed.forEach((key) => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    if (typeof updates.skills === 'string') updates.skills = (updates.skills as string).split(',').map((s) => s.trim()).filter(Boolean);
    if (typeof updates.interests === 'string') updates.interests = (updates.interests as string).split(',').map((s) => s.trim()).filter(Boolean);

    const user = await User.findByIdAndUpdate(req.user!.userId, updates, { new: true, runValidators: true });
    if (!user) throw new NotFoundError('User');
    res.json({ success: true, user });
  } catch (error) { next(error); }
};

export const updatePassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user!.userId).select('+password');
    if (!user) throw new NotFoundError('User');

    const isMatch = await user.comparePassword(currentPassword as string);
    if (!isMatch) throw new AppError('Current password is incorrect', 400);

    user.password = newPassword as string;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) { next(error); }
};

export const uploadAvatar = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const result = await uploadImageToCloudinary(req.file.buffer, {
      folder: 'ai-career-coach/avatars',
      transformation: [{ width: 400, height: 400, crop: 'fill' }],
    });

    const user = await User.findByIdAndUpdate(
      req.user!.userId,
      { avatar: result.secure_url },
      { new: true }
    );
    if (!user) throw new NotFoundError('User');

    res.json({ success: true, avatar: result.secure_url, user });
  } catch (error) { next(error); }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const objectId = new mongoose.Types.ObjectId(userId);

    await Promise.all([
      Roadmap.deleteMany({ userId: objectId }),
      SkillGap.deleteMany({ userId: objectId }),
      Resume.deleteMany({ userId: objectId }),
      Internship.deleteMany({ userId: objectId }),
      DailyTask.deleteMany({ userId: objectId }),
    ]);

    await User.findByIdAndDelete(userId);
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Account deleted successfully' });
  } catch (error) { next(error); }
};

export const getStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [user, resume, roadmap, skillGap, internshipCount] = await Promise.all([
      User.findById(userId).select('streak skills'),
      Resume.findOne({ userId, isActive: true }),
      Roadmap.findOne({ userId, isActive: true }),
      SkillGap.findOne({ userId }).sort({ createdAt: -1 }),
      Internship.countDocuments({ userId }),
    ]);

    res.json({
      success: true,
      stats: {
        resumeScore: resume?.analysis?.score ?? null,
        roadmapCompletion: roadmap?.overallCompletion ?? 0,
        internshipCount,
        dailyStreak: user?.streak ?? 0,
        totalSkills: user?.skills?.length ?? 0,
        skillGapReadiness: skillGap?.overallReadiness ?? null,
      },
    });
  } catch (error) { next(error); }
};
