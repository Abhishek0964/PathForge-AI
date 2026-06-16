import pdfParse from 'pdf-parse';
import { logger } from './logger';

export const extractTextFromPDF = async (buffer: Buffer): Promise<string> => {
  try {
    const data = await pdfParse(buffer);
    return data.text.replace(/\s+/g, ' ').trim();
  } catch (error) {
    logger.error('PDF text extraction failed:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const extractTextFromBuffer = async (
  buffer: Buffer,
  mimeType: string
): Promise<string> => {
  if (mimeType === 'application/pdf') {
    return extractTextFromPDF(buffer);
  }
  // For DOCX, return empty string (Cloudinary stores it; extraction requires mammoth)
  return '';
};

export const calculateResumeScore = (analysis: {
  technicalSkills: string[];
  softSkills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  missingInfo: string[];
}): number => {
  let score = 0;
  score += Math.min(analysis.technicalSkills.length * 3, 25);
  score += Math.min(analysis.softSkills.length * 2, 10);
  score += Math.min(analysis.experience.length * 5, 20);
  score += analysis.education.length > 0 ? 10 : 0;
  score += Math.min(analysis.projects.length * 5, 20);
  score += Math.min(analysis.certifications.length * 3, 10);
  score -= Math.min(analysis.missingInfo.length * 2, 20);
  return Math.max(0, Math.min(100, score));
};
