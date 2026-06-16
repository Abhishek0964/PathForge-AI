import mongoose, { Document, Schema } from 'mongoose';

export type InternshipStatus = 'applied' | 'interview' | 'rejected' | 'selected' | 'offer' | 'withdrawn';

export interface IInternship extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  company: string;
  role: string;
  status: InternshipStatus;
  appliedDate: Date;
  interviewDate?: Date;
  notes: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  isRemote: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const internshipSchema = new Schema<IInternship>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['applied', 'interview', 'rejected', 'selected', 'offer', 'withdrawn'],
      default: 'applied',
    },
    appliedDate: { type: Date, default: Date.now },
    interviewDate: Date,
    notes: { type: String, default: '' },
    jobUrl: String,
    salary: String,
    location: String,
    isRemote: { type: Boolean, default: false },
    tags: [String],
  },
  { timestamps: true }
);

internshipSchema.index({ userId: 1 });
internshipSchema.index({ userId: 1, status: 1 });
internshipSchema.index({ userId: 1, company: 'text', role: 'text' });

export const Internship = mongoose.model<IInternship>('Internship', internshipSchema);
