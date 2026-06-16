import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { SkillGap } from '../models/skillGap.model';
import { Resume } from '../models/resume.model';
import { User } from '../models/user.model';
import { callGeminiForJson } from '../services/ai.service';
import { skillGapPrompt } from '../prompts/index';
import { NotFoundError } from '../utils/errors';

export const generateSkillGap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetRole } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');

    const resume = await Resume.findOne({ userId: req.user!.userId, isActive: true });

    const prompt = skillGapPrompt(
      targetRole,
      user.skills,
      resume?.extractedText
    );

    type SkillGapResult = {
      requiredSkills: Array<{
        skill: string; category: string; priority: 'critical'|'high'|'medium'|'low';
        difficultyScore: number; estimatedWeeks: number; reason: string;
        resources: string[]; hasSkill: boolean;
      }>;
      missingSkills: Array<{
        skill: string; category: string; priority: 'critical'|'high'|'medium'|'low';
        difficultyScore: number; estimatedWeeks: number; reason: string;
        resources: string[]; hasSkill: boolean;
      }>;
      strengthAreas: string[];
      overallReadiness: number;
      recommendedPath: string;
      summary: string;
    };

    const result = await callGeminiForJson<SkillGapResult>(prompt);

    const skillGap = await SkillGap.create({
      userId: req.user!.userId,
      targetRole,
      currentSkills: user.skills,
      ...result,
    });

    res.status(201).json({ success: true, skillGap });
  } catch (error) {
    next(error);
  }
};

export const getSkillGaps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skillGaps = await SkillGap.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, skillGaps });
  } catch (error) {
    next(error);
  }
};

export const getLatestSkillGap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const skillGap = await SkillGap.findOne({ userId: req.user!.userId }).sort({ createdAt: -1 });
    if (!skillGap) throw new NotFoundError('Skill gap analysis');
    res.json({ success: true, skillGap });
  } catch (error) {
    next(error);
  }
};

export const deleteSkillGap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const skillGap = await SkillGap.findOneAndDelete({ _id: id, userId: req.user!.userId });
    if (!skillGap) throw new NotFoundError('Skill gap analysis');
    res.json({ success: true, message: 'Skill gap analysis deleted' });
  } catch (error) {
    next(error);
  }
};
