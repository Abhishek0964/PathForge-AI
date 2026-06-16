import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { env } from './env';

export const gemini = new GoogleGenerativeAI(env.GEMINI_API_KEY);
export const geminiModel = gemini.getGenerativeModel({ model: 'gemini-1.5-pro' });
export const geminiFlash = gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });

export let openai: OpenAI | null = null;
if (env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
}
