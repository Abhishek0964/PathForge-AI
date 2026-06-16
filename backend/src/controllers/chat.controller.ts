import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { ChatHistory } from '../models/chatHistory.model';
import { User } from '../models/user.model';
import { callGemini } from '../services/ai.service';
import { careerChatPrompt } from '../prompts/index';
import { NotFoundError, AppError } from '../utils/errors';

export const getConversations = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversations = await ChatHistory.find({ userId: req.user!.userId })
      .select('title lastMessageAt createdAt')
      .sort({ lastMessageAt: -1 })
      .limit(20);
    res.json({ success: true, conversations });
  } catch (error) { next(error); }
};

export const getConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversation = await ChatHistory.findOne({ _id: req.params.id, userId: req.user!.userId });
    if (!conversation) throw new NotFoundError('Conversation');
    res.json({ success: true, conversation });
  } catch (error) { next(error); }
};

export const createConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversation = await ChatHistory.create({ userId: req.user!.userId, messages: [] });
    res.status(201).json({ success: true, conversation });
  } catch (error) { next(error); }
};

export const sendMessage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { conversationId, message } = req.body;
    if (!message?.trim()) throw new AppError('Message cannot be empty', 400);

    let conversation = await ChatHistory.findOne({ _id: conversationId, userId: req.user!.userId });
    if (!conversation) throw new NotFoundError('Conversation');

    const user = await User.findById(req.user!.userId);
    if (!user) throw new NotFoundError('User');

    // Add user message
    conversation.messages.push({ role: 'user', content: message, timestamp: new Date() } as never);

    // Build conversation history for context
    const history = conversation.messages.slice(-20).map((m) => ({ role: m.role, content: m.content }));

    const prompt = careerChatPrompt(
      { name: user.name, skills: user.skills, careerGoal: user.careerGoal, targetRole: user.careerGoal },
      history.slice(0, -1),
      message
    );

    const aiResponse = await callGemini(prompt, true);

    // Add AI response
    conversation.messages.push({ role: 'assistant', content: aiResponse, timestamp: new Date() } as never);
    conversation.lastMessageAt = new Date();

    // Auto-set title from first message
    if (conversation.messages.length === 2) {
      conversation.title = message.substring(0, 50) + (message.length > 50 ? '...' : '');
    }

    await conversation.save();

    res.json({
      success: true,
      message: { role: 'assistant', content: aiResponse, timestamp: new Date() },
      conversationId: conversation._id,
    });
  } catch (error) { next(error); }
};

export const deleteConversation = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const conversation = await ChatHistory.findOneAndDelete({ _id: req.params.id, userId: req.user!.userId });
    if (!conversation) throw new NotFoundError('Conversation');
    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) { next(error); }
};
