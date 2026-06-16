import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyGoal {
  day: number;
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
  completedAt?: Date;
}

export interface IWeeklyPlan {
  week: number;
  title: string;
  goals: IDailyGoal[];
  project?: string;
  interviewPrep?: string;
  leetcode?: string;
}

export interface IMonthPlan {
  month: number;
  title: string;
  description: string;
  weeks: IWeeklyPlan[];
  milestones: string[];
  concepts: string[];
  completionPercentage: number;
}

export interface IRoadmap extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  currentLevel: string;
  duration: number;
  months: IMonthPlan[];
  overallCompletion: number;
  isActive: boolean;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dailyGoalSchema = new Schema<IDailyGoal>(
  {
    day: Number,
    title: String,
    description: String,
    resources: [String],
    completed: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: false }
);

const weeklyPlanSchema = new Schema<IWeeklyPlan>(
  {
    week: Number,
    title: String,
    goals: [dailyGoalSchema],
    project: String,
    interviewPrep: String,
    leetcode: String,
  },
  { _id: false }
);

const monthPlanSchema = new Schema<IMonthPlan>(
  {
    month: Number,
    title: String,
    description: String,
    weeks: [weeklyPlanSchema],
    milestones: [String],
    concepts: [String],
    completionPercentage: { type: Number, default: 0 },
  },
  { _id: false }
);

const roadmapSchema = new Schema<IRoadmap>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: { type: String, required: true },
    currentLevel: { type: String, required: true },
    duration: { type: Number, required: true },
    months: [monthPlanSchema],
    overallCompletion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

roadmapSchema.index({ userId: 1 });
roadmapSchema.index({ userId: 1, isActive: 1 });

export const Roadmap = mongoose.model<IRoadmap>('Roadmap', roadmapSchema);
