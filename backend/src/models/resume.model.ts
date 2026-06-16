import mongoose, { Document, Schema } from 'mongoose';

export interface IResumeAnalysis {
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
  analyzedAt: Date;
}

export interface IResume extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  originalName: string;
  fileUrl: string;
  publicId: string;
  fileType: 'pdf' | 'docx';
  fileSize: number;
  extractedText: string;
  analysis?: IResumeAnalysis;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const resumeAnalysisSchema = new Schema<IResumeAnalysis>(
  {
    technicalSkills: [String],
    softSkills: [String],
    experience: [String],
    education: [String],
    projects: [String],
    certifications: [String],
    missingInfo: [String],
    score: { type: Number, min: 0, max: 100 },
    summary: String,
    improvements: [String],
    atsSuggestions: [String],
    betterWording: [{ original: String, improved: String }],
    missingKeywords: [String],
    analyzedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const resumeSchema = new Schema<IResume>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    originalName: { type: String, required: true },
    fileUrl: { type: String, required: true },
    publicId: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'docx'], required: true },
    fileSize: { type: Number, required: true },
    extractedText: { type: String, default: '' },
    analysis: resumeAnalysisSchema,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

resumeSchema.index({ userId: 1 });
resumeSchema.index({ userId: 1, isActive: 1 });

export const Resume = mongoose.model<IResume>('Resume', resumeSchema);
