import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  college?: string;
  degree?: string;
  branch?: string;
  year?: number;
  cgpa?: number;
  skills: string[];
  interests: string[];
  careerGoal?: string;
  linkedin?: string;
  github?: string;
  bio?: string;
  isEmailVerified: boolean;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  streak: number;
  lastActiveDate?: Date;
  totalLearningMinutes: number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Invalid email'] },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: { type: String },
    college: { type: String, trim: true },
    degree: { type: String, trim: true },
    branch: { type: String, trim: true },
    year: { type: Number, min: 1, max: 6 },
    cgpa: { type: Number, min: 0, max: 10 },
    skills: [{ type: String, trim: true }],
    interests: [{ type: String, trim: true }],
    careerGoal: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    bio: { type: String, maxlength: 500 },
    isEmailVerified: { type: Boolean, default: false },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    totalLearningMinutes: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const r = ret as Record<string, unknown>;
        r['password'] = undefined;
        r['passwordResetToken'] = undefined;
        r['passwordResetExpires'] = undefined;
        return r;
      },
    },
  }
);

userSchema.index({ email: 1 });
userSchema.index({ skills: 1 });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, env.BCRYPT_ROUNDS);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password as string);
};

export const User = mongoose.model<IUser>('User', userSchema);
