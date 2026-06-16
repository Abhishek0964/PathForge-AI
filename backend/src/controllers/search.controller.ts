import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Internship } from '../models/internship.model';
import { LearningResource } from '../models/learningResource.model';
import { ProjectSuggestion } from '../models/project.model';
import { Roadmap } from '../models/roadmap.model';

export const globalSearch = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { q } = req.query as { q: string };
    if (!q || q.trim().length < 2) {
      res.json({ success: true, results: { internships: [], projects: [], roadmaps: [], resources: [] } });
      return;
    }

    const regex = { $regex: q, $options: 'i' };
    const userId = req.user!.userId;

    const [internships, roadmaps] = await Promise.all([
      Internship.find({ userId, $or: [{ company: regex }, { role: regex }] }).limit(5).select('company role status'),
      Roadmap.find({ userId, targetRole: regex }).limit(5).select('targetRole overallCompletion duration'),
    ]);

    const projectDocs = await ProjectSuggestion.find({ userId }).limit(3);
    const projects = projectDocs.flatMap((d) =>
      d.projects.filter((p) => p.title.toLowerCase().includes(q.toLowerCase()) ||
        p.description.toLowerCase().includes(q.toLowerCase())).slice(0, 3)
    );

    const resourceDocs = await LearningResource.find({ userId, topic: regex }).limit(5).select('topic');

    res.json({
      success: true,
      results: {
        internships,
        projects,
        roadmaps,
        resources: resourceDocs,
      },
    });
  } catch (error) {
    next(error);
  }
};
