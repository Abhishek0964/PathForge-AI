import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { Resume } from '../models/resume.model';
import { User } from '../models/user.model';
import { cloudinary } from '../config/cloudinary';
import { callGeminiForJson } from '../services/ai.service';
import { resumeAnalysisPrompt } from '../prompts/index';
import { extractTextFromPDF } from '../utils/pdfParser';
import { NotFoundError, AppError } from '../utils/errors';
import { logger } from '../utils/logger';
import streamifier from 'streamifier';

// Helper to upload buffer to cloudinary
const uploadToCloudinary = (buffer: Buffer, options: Record<string, unknown>): Promise<{ secure_url: string; public_id: string }> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) reject(error);
      else if (result) resolve({ secure_url: result.secure_url, public_id: result.public_id });
      else reject(new Error('Upload failed'));
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

export const uploadResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) throw new AppError('No file uploaded', 400);

    const { mimetype, originalname, buffer, size } = req.file;
    const allowed = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowed.includes(mimetype)) throw new AppError('Only PDF and DOCX files are allowed', 400);

    const fileType = mimetype === 'application/pdf' ? 'pdf' : 'docx';

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, {
      folder: 'ai-career-coach/resumes',
      resource_type: 'raw',
      public_id: `resume_${req.user!.userId}_${Date.now()}`,
      format: fileType,
    });

    // Extract text from PDF
    let extractedText = '';
    if (fileType === 'pdf') {
      try {
        extractedText = await extractTextFromPDF(buffer);
      } catch {
        logger.warn('PDF text extraction failed, continuing without text');
      }
    }

    // Deactivate old resumes
    await Resume.updateMany({ userId: req.user!.userId }, { isActive: false });

    const resume = await Resume.create({
      userId: req.user!.userId,
      originalName: originalname,
      fileUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      fileType,
      fileSize: size,
      extractedText,
      isActive: true,
    });

    res.status(201).json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const getResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await Resume.findOne({ userId: req.user!.userId, isActive: true });
    if (!resume) throw new NotFoundError('Resume');
    res.json({ success: true, resume });
  } catch (error) {
    next(error);
  }
};

export const getAllResumes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resumes = await Resume.find({ userId: req.user!.userId }).sort({ createdAt: -1 });
    res.json({ success: true, resumes });
  } catch (error) {
    next(error);
  }
};

export const analyzeResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await Resume.findOne({ userId: req.user!.userId, isActive: true });
    if (!resume) throw new NotFoundError('Resume');
    if (!resume.extractedText) throw new AppError('Resume text not extractable. Please upload a text-based PDF.', 400);

    const user = await User.findById(req.user!.userId);

    const prompt = resumeAnalysisPrompt(resume.extractedText, {
      targetRole: user?.careerGoal,
      skills: user?.skills,
    });

    const analysis = await callGeminiForJson<{
      technicalSkills: string[];
      softSkills: string[];
      experience: string[];
      education: string[];
      projects: string[];
      certifications: string[];
      missingInfo: string[];
      score: number;
      summary: string;
      improvements: string[];
      atsSuggestions: string[];
      betterWording: Array<{ original: string; improved: string }>;
      missingKeywords: string[];
    }>(prompt);

    resume.analysis = { ...analysis, analyzedAt: new Date() };
    await resume.save();

    res.json({ success: true, analysis: resume.analysis, resumeId: resume._id });
  } catch (error) {
    next(error);
  }
};

export const deleteResume = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await Resume.findOne({ userId: req.user!.userId, isActive: true });
    if (!resume) throw new NotFoundError('Resume');

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(resume.publicId, { resource_type: 'raw' });
    } catch {
      logger.warn('Failed to delete from Cloudinary:', resume.publicId);
    }

    await Resume.findByIdAndDelete(resume._id);
    res.json({ success: true, message: 'Resume deleted' });
  } catch (error) {
    next(error);
  }
};
