import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyTaskItem {
  type: 'learning' | 'coding' | 'revision' | 'interview' | 'challenge';
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: Date;
  resources?: string[];
}

export interface IDailyTask extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string;
  tasks: IDailyTaskItem[];
  totalCompleted: number;
  totalTasks: number;
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const dailyTaskItemSchema = new Schema<IDailyTaskItem>(
  {
    type: { type: String, enum: ['learning', 'coding', 'revision', 'interview', 'challenge'] },
    title: String,
    description: String,
    estimatedMinutes: { type: Number, default: 30 },
    completed: { type: Boolean, default: false },
    completedAt: Date,
    resources: [String],
  },
  {}
);

const dailyTaskSchema = new Schema<IDailyTask>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    tasks: [dailyTaskItemSchema],
    totalCompleted: { type: Number, default: 0 },
    totalTasks: { type: Number, default: 0 },
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

dailyTaskSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DailyTask = mongoose.model<IDailyTask>('DailyTask', dailyTaskSchema);
