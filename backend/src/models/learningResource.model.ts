import mongoose, { Document, Schema } from 'mongoose';

export interface ILearningResource extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  topic: string;
  role?: string;
  resources: IResourceItem[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResourceItem {
  type: 'youtube' | 'course' | 'documentation' | 'blog' | 'github' | 'book' | 'practice';
  title: string;
  url: string;
  description: string;
  isFree: boolean;
  rating: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedHours: number;
  tags: string[];
}

const resourceItemSchema = new Schema<IResourceItem>(
  {
    type: { type: String, enum: ['youtube', 'course', 'documentation', 'blog', 'github', 'book', 'practice'] },
    title: String,
    url: String,
    description: String,
    isFree: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5, default: 4 },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    estimatedHours: Number,
    tags: [String],
  },
  { _id: false }
);

const learningResourceSchema = new Schema<ILearningResource>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    role: String,
    resources: [resourceItemSchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

learningResourceSchema.index({ userId: 1 });
learningResourceSchema.index({ userId: 1, topic: 1 });

export const LearningResource = mongoose.model<ILearningResource>('LearningResource', learningResourceSchema);
