import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Roadmap } from '../models/roadmap.model';
import { SkillGap } from '../models/skillGap.model';
import { User } from '../models/user.model';
import { callGeminiForJson } from '../services/ai.service';
import { roadmapPrompt } from '../prompts/index';
import { NotFoundError, AppError } from '../utils/errors';
import mongoose from 'mongoose';

interface MonthData {
  month: number;
  title: string;
  description: string;
  concepts: string[];
  milestones: string[];
  completionPercentage: number;
  weeks: Array<{
    week: number;
    title: string;
    project: string;
    interviewPrep: string;
    leetcode: string;
    goals: Array<{
      day: number;
      title: string;
      description: string;
      resources: string[];
      completed: boolean;
    }>;
  }>;
}

export const generateRoadmap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { targetRole, duration = 6 } = req.body;
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');

    const latestGap = await SkillGap.findOne({ userId: req.user!.userId, targetRole }).sort({ createdAt: -1 });
    const missingSkills = latestGap?.missingSkills.map((s) => s.skill) ?? [];

    const prompt = roadmapPrompt(targetRole, user.skills, duration, missingSkills);
    const result = await callGeminiForJson<{ months: MonthData[] }>(prompt);

    // Deactivate old roadmaps for same role
    await Roadmap.updateMany({ userId: req.user!.userId, targetRole }, { isActive: false });

    const roadmap = await Roadmap.create({
      userId: req.user!.userId,
      targetRole,
      currentLevel: user.skills.length > 5 ? 'intermediate' : 'beginner',
      duration,
      months: result.months,
      overallCompletion: 0,
      isActive: true,
    });

    res.status(201).json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

export const getRoadmaps = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roadmaps = await Roadmap.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, roadmaps });
  } catch (error) {
    next(error);
  }
};

export const getActiveRoadmap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const roadmap = await Roadmap.findOne({ userId: req.user!.userId, isActive: true }).sort({ createdAt: -1 });
    if (!roadmap) throw new NotFoundError('Active roadmap');
    res.json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

export const updateTaskCompletion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { roadmapId, monthIndex, weekIndex, dayIndex, completed } = req.body;

    const roadmap = await Roadmap.findOne({ _id: roadmapId, userId: req.user!.userId });
    if (!roadmap) throw new NotFoundError('Roadmap');

    const goal = roadmap.months[monthIndex]?.weeks[weekIndex]?.goals[dayIndex];
    if (!goal) throw new AppError('Task not found in roadmap', 404);

    goal.completed = completed;
    if (completed) goal.completedAt = new Date();

    // Recalculate month completion
    const month = roadmap.months[monthIndex];
    const allGoals = month.weeks.flatMap((w) => w.goals);
    const completedGoals = allGoals.filter((g) => g.completed).length;
    month.completionPercentage = Math.round((completedGoals / allGoals.length) * 100);

    // Recalculate overall completion
    const allMonthGoals = roadmap.months.flatMap((m) => m.weeks.flatMap((w) => w.goals));
    const totalCompleted = allMonthGoals.filter((g) => g.completed).length;
    roadmap.overallCompletion = Math.round((totalCompleted / allMonthGoals.length) * 100);

    await roadmap.save();
    res.json({ success: true, roadmap });
  } catch (error) {
    next(error);
  }
};

export const deleteRoadmap = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const roadmap = await Roadmap.findOneAndDelete({
      _id: id,
      userId: req.user!.userId,
    });
    if (!roadmap) throw new NotFoundError('Roadmap');
    res.json({ success: true, message: 'Roadmap deleted' });
  } catch (error) {
    next(error);
  }
};
