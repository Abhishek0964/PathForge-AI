import mongoose, { Document, Schema } from 'mongoose';

export interface IChatMessage {
  _id: mongoose.Types.ObjectId;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

export interface IChatHistory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  title: string;
  messages: IChatMessage[];
  lastMessageAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const chatMessageSchema = new Schema<IChatMessage>(
  {
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    tokens: Number,
  }
);

const chatHistorySchema = new Schema<IChatHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: 'New Conversation' },
    messages: [chatMessageSchema],
    lastMessageAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

chatHistorySchema.index({ userId: 1 });
chatHistorySchema.index({ userId: 1, lastMessageAt: -1 });

export const ChatHistory = mongoose.model<IChatHistory>('ChatHistory', chatHistorySchema);
