import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { LearningResource } from '../models/learningResource.model';
import { callGeminiForJson } from '../services/ai.service';
import { learningResourcesPrompt } from '../prompts/index';
import { NotFoundError } from '../utils/errors';

export const generateResources = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic, role } = req.body;

    // Check cache (24h)
    const existing = await LearningResource.findOne({
      userId: req.user!.userId,
      topic,
      createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (existing) { res.json({ success: true, resource: existing, cached: true }); return; }

    const prompt = learningResourcesPrompt(topic, role);
    const result = await callGeminiForJson<{ resources: unknown[] }>(prompt);

    const resource = await LearningResource.create({
      userId: req.user!.userId,
      topic,
      role,
      resources: result.resources,
    });

    res.status(201).json({ success: true, resource });
  } catch (error) { next(error); }
};

export const getResources = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resources = await LearningResource.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, resources });
  } catch (error) { next(error); }
};

export const getResourceByTopic = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { topic } = req.params;
    const resource = await LearningResource.findOne({ userId: req.user!.userId, topic }).sort({ createdAt: -1 });
    if (!resource) throw new NotFoundError('Resources for this topic');
    res.json({ success: true, resource });
  } catch (error) { next(error); }
};
