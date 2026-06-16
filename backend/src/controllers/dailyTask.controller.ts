import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { DailyTask } from '../models/dailyTask.model';
import { User } from '../models/user.model';
import { callGeminiForJson } from '../services/ai.service';
import { dailyTasksPrompt } from '../prompts/index';
import { NotFoundError, AppError } from '../utils/errors';

export const getTodayTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    let dailyTask = await DailyTask.findOne({ userId: req.user!.userId, date: today });
    if (!dailyTask) {
      const user = await User.findById(req.user!.userId);
      if (!user) throw new NotFoundError('User');
      const prompt = dailyTasksPrompt(user.skills, user.careerGoal ?? 'Software Engineer', today as string);
      const result = await callGeminiForJson<{ tasks: unknown[] }>(prompt);
      dailyTask = await DailyTask.create({ userId: req.user!.userId, date: today, tasks: result.tasks, totalTasks: result.tasks.length, totalCompleted: 0 });
    }
    res.json({ success: true, dailyTask });
  } catch (error) { next(error); }
};

export const completeTask = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { taskId } = req.params as { taskId: string };
    const { completed } = req.body as { completed: boolean };
    const today = new Date().toISOString().split('T')[0];
    const dailyTask = await DailyTask.findOne({ userId: req.user!.userId, date: today });
    if (!dailyTask) throw new NotFoundError('Daily tasks');
    const taskIndex = dailyTask.tasks.findIndex((t) => (t as unknown as { _id: { toString: () => string } })._id.toString() === taskId);
    if (taskIndex === -1) throw new AppError('Task not found', 404);
    dailyTask.tasks[taskIndex].completed = completed;
    if (completed) dailyTask.tasks[taskIndex].completedAt = new Date();
    dailyTask.totalCompleted = dailyTask.tasks.filter((t) => t.completed).length;
    await dailyTask.save();
    if (dailyTask.totalCompleted === dailyTask.totalTasks) {
      await User.findByIdAndUpdate(req.user!.userId, { $inc: { streak: 1 }, lastActiveDate: new Date() });
    }
    res.json({ success: true, dailyTask });
  } catch (error) { next(error); }
};

export const getTaskHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const tasks = await DailyTask.find({ userId: req.user!.userId }).sort({ date: -1 }).limit(30);
    res.json({ success: true, tasks });
  } catch (error) { next(error); }
};

export const regenerateTasks = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');
    const prompt = dailyTasksPrompt(user.skills, user.careerGoal ?? 'Software Engineer', today as string);
    const result = await callGeminiForJson<{ tasks: unknown[] }>(prompt);
    const dailyTask = await DailyTask.findOneAndUpdate(
      { userId: req.user!.userId, date: today },
      { tasks: result.tasks, totalTasks: result.tasks.length, totalCompleted: 0, generatedAt: new Date() },
      { new: true, upsert: true }
    );
    res.json({ success: true, dailyTask });
  } catch (error) { next(error); }
};
