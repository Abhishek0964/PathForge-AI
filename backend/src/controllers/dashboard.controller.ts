import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Resume } from '../models/resume.model';
import { Roadmap } from '../models/roadmap.model';
import { SkillGap } from '../models/skillGap.model';
import { Internship } from '../models/internship.model';
import { DailyTask } from '../models/dailyTask.model';
import { User } from '../models/user.model';

export const getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user!.userId;

    const [user, resume, roadmap, skillGap, internshipStats, recentTasks] = await Promise.all([
      User.findById(userId).select('-password'),
      Resume.findOne({ userId, isActive: true }),
      Roadmap.findOne({ userId, isActive: true }),
      SkillGap.findOne({ userId }).sort({ createdAt: -1 }),
      Internship.aggregate([
        { $match: { userId: new (require('mongoose').Types.ObjectId)(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      DailyTask.find({ userId }).sort({ date: -1 }).limit(7),
    ]);

    // Process internship stats
    const internStats = { total: 0, applied: 0, interview: 0, selected: 0, rejected: 0, offer: 0 };
    internshipStats.forEach((s: { _id: string; count: number }) => {
      internStats[s._id as keyof typeof internStats] = s.count;
      internStats.total += s.count;
    });

    // Streak calendar data (last 7 days)
    const streakData = recentTasks.map((t) => ({
      date: t.date,
      completed: t.totalCompleted,
      total: t.totalTasks,
      percentage: t.totalTasks > 0 ? Math.round((t.totalCompleted / t.totalTasks) * 100) : 0,
    }));

    res.json({
      success: true,
      dashboard: {
        user: {
          name: user?.name,
          email: user?.email,
          avatar: user?.avatar,
          careerGoal: user?.careerGoal,
          skills: user?.skills ?? [],
          streak: user?.streak ?? 0,
        },
        resume: {
          hasResume: !!resume,
          score: resume?.analysis?.score ?? null,
          uploadedAt: resume?.createdAt ?? null,
        },
        roadmap: {
          hasRoadmap: !!roadmap,
          targetRole: roadmap?.targetRole ?? null,
          completion: roadmap?.overallCompletion ?? 0,
          duration: roadmap?.duration ?? null,
        },
        skillGap: {
          hasAnalysis: !!skillGap,
          targetRole: skillGap?.targetRole ?? null,
          readiness: skillGap?.overallReadiness ?? null,
          missingCount: skillGap?.missingSkills?.length ?? 0,
        },
        internships: internStats,
        streakData,
        totalSkills: user?.skills?.length ?? 0,
      },
    });
  } catch (error) {
    next(error);
  }
};
