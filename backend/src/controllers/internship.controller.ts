import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Internship } from '../models/internship.model';
import { NotFoundError, AppError } from '../utils/errors';

export const createInternship = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const internship = await Internship.create({ ...req.body, userId: req.user!.userId });
    res.status(201).json({ success: true, internship });
  } catch (error) { next(error); }
};

export const getInternships = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status, search, sortBy = 'appliedDate', order = 'desc', page = '1', limit = '20' } = req.query as Record<string, string>;

    const filter: Record<string, unknown> = { userId: req.user!.userId };
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    const [internships, total] = await Promise.all([
      Internship.find(filter).sort({ [sortBy]: sortOrder }).skip(skip).limit(parseInt(limit)),
      Internship.countDocuments(filter),
    ]);

    res.json({
      success: true,
      internships,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) { next(error); }
};

export const getInternship = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const internship = await Internship.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!internship) throw new NotFoundError('Internship');
    res.json({ success: true, internship });
  } catch (error) { next(error); }
};

export const updateInternship = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const internship = await Internship.findOneAndUpdate(
      { _id: req.params.id, userId: req.user!.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!internship) throw new NotFoundError('Internship');
    res.json({ success: true, internship });
  } catch (error) { next(error); }
};

export const deleteInternship = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const internship = await Internship.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!internship) throw new NotFoundError('Internship');
    res.json({ success: true, message: 'Internship deleted' });
  } catch (error) { next(error); }
};

export const getInternshipStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const stats = await Internship.aggregate([
      { $match: { userId: req.user!.userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);
    const result = { total: 0, applied: 0, interview: 0, rejected: 0, selected: 0, offer: 0, withdrawn: 0 };
    stats.forEach((s: { _id: string; count: number }) => {
      result[s._id as keyof typeof result] = s.count;
      result.total += s.count;
    });
    res.json({ success: true, stats: result });
  } catch (error) { next(error); }
};
