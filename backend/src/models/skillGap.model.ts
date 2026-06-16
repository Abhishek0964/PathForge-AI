import mongoose, { Document, Schema } from 'mongoose';

export interface ISkillItem {
  skill: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  difficultyScore: number;
  estimatedWeeks: number;
  reason: string;
  resources: string[];
  hasSkill: boolean;
}

export interface ISkillGap extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  currentSkills: string[];
  requiredSkills: ISkillItem[];
  missingSkills: ISkillItem[];
  strengthAreas: string[];
  overallReadiness: number;
  recommendedPath: string;
  summary: string;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const skillItemSchema = new Schema<ISkillItem>(
  {
    skill: { type: String, required: true },
    category: String,
    priority: { type: String, enum: ['critical', 'high', 'medium', 'low'] },
    difficultyScore: { type: Number, min: 1, max: 10 },
    estimatedWeeks: Number,
    reason: String,
    resources: [String],
    hasSkill: { type: Boolean, default: false },
  },
  { _id: false }
);

const skillGapSchema = new Schema<ISkillGap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    currentSkills: [String],
    requiredSkills: [skillItemSchema],
    missingSkills: [skillItemSchema],
    strengthAreas: [String],
    overallReadiness: { type: Number, min: 0, max: 100 },
    recommendedPath: String,
    summary: String,
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

skillGapSchema.index({ userId: 1 });

export const SkillGap = mongoose.model<ISkillGap>('SkillGap', skillGapSchema);
