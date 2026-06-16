import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ProjectSuggestion } from '../models/project.model';
import { SkillGap } from '../models/skillGap.model';
import { User } from '../models/user.model';
import { callGeminiForJson } from '../services/ai.service';
import { projectSuggestionsPrompt } from '../prompts/index';
import { NotFoundError } from '../utils/errors';

export const generateProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetRole } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');

    const latestGap = await SkillGap.findOne({ userId: req.user!.userId }).sort({ createdAt: -1 });
    const missingSkills = latestGap?.missingSkills.map((s) => s.skill) ?? [];

    const prompt = projectSuggestionsPrompt(targetRole ?? user.careerGoal ?? 'Full Stack Developer', user.skills, missingSkills);
    const result = await callGeminiForJson<{ projects: unknown[] }>(prompt);

    const suggestion = await ProjectSuggestion.create({
      userId: req.user!.userId,
      targetRole: targetRole ?? user.careerGoal,
      projects: result.projects,
    });

    res.status(201).json({ success: true, suggestion });
  } catch (error) {
    next(error);
  }
};

export const getProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suggestions = await ProjectSuggestion.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, suggestions });
  } catch (error) {
    next(error);
  }
};

export const getLatestProjects = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const suggestion = await ProjectSuggestion.findOne({ userId: req.user!.userId }).sort({ createdAt: -1 });
    if (!suggestion) throw new NotFoundError('Project suggestions');
    res.json({ success: true, suggestion });
  } catch (error) {
    next(error);
  }
};
