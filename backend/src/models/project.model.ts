import mongoose, { Document, Schema } from 'mongoose';

export interface IProjectSuggestion extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  targetRole: string;
  projects: IProjectItem[];
  generatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProjectItem {
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  techStack: string[];
  architecture: string;
  learningOutcome: string[];
  resumeValue: string;
  githubStructure: string[];
  estimatedDays: number;
  features: string[];
  resources: IResource[];
}

export interface IResource {
  type: 'youtube' | 'course' | 'documentation' | 'blog' | 'github' | 'book' | 'practice';
  title: string;
  url: string;
  description?: string;
  isFree: boolean;
  rating?: number;
}

const resourceSchema = new Schema<IResource>(
  {
    type: { type: String, enum: ['youtube', 'course', 'documentation', 'blog', 'github', 'book', 'practice'] },
    title: String,
    url: String,
    description: String,
    isFree: { type: Boolean, default: true },
    rating: { type: Number, min: 0, max: 5 },
  },
  { _id: false }
);

const projectItemSchema = new Schema<IProjectItem>(
  {
    title: String,
    description: String,
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'] },
    techStack: [String],
    architecture: String,
    learningOutcome: [String],
    resumeValue: String,
    githubStructure: [String],
    estimatedDays: Number,
    features: [String],
    resources: [resourceSchema],
  },
  { _id: false }
);

const projectSuggestionSchema = new Schema<IProjectSuggestion>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    targetRole: String,
    projects: [projectItemSchema],
    generatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

projectSuggestionSchema.index({ userId: 1 });

export const ProjectSuggestion = mongoose.model<IProjectSuggestion>('ProjectSuggestion', projectSuggestionSchema);
