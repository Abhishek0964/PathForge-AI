import { geminiModel, geminiFlash } from '../config/ai';
import { logger } from '../utils/logger';
import { AppError } from '../utils/errors';

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const callGemini = async (
  prompt: string,
  useFlash = false,
  retries = 0
): Promise<string> => {
  try {
    const model = useFlash ? geminiFlash : geminiModel;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    if (retries < MAX_RETRIES) {
      logger.warn(`Gemini call failed, retry ${retries + 1}/${MAX_RETRIES}`);
      await sleep(RETRY_DELAY * (retries + 1));
      return callGemini(prompt, useFlash, retries + 1);
    }
    logger.error('Gemini API failed after retries:', error);
    throw new AppError('AI service unavailable. Please try again.', 503);
  }
};

export const parseJsonResponse = <T>(text: string): T => {
  // Strip markdown code blocks if present
  const cleaned = text
    .replace(/```json\n?/gi, '')
    .replace(/```\n?/gi, '')
    .trim();

  try {
    return JSON.parse(cleaned) as T;
  } catch {
    // Try to find JSON within the text
    const jsonMatch = cleaned.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]) as T;
    }
    logger.error('Failed to parse JSON from AI response:', cleaned.substring(0, 200));
    throw new AppError('AI returned invalid response format', 500);
  }
};

export const callGeminiForJson = async <T>(
  prompt: string,
  useFlash = false
): Promise<T> => {
  const text = await callGemini(prompt, useFlash);
  return parseJsonResponse<T>(text);
};
