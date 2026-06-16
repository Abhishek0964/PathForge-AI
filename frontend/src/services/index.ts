import api from './api';

export interface User {
  _id: string;
  name: string;
  email: string;
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
  streak: number;
  createdAt: string;
}

export interface LoginData { email: string; password: string; }
export interface RegisterData { name: string; email: string; password: string; }

export const authService = {
  register: (data: RegisterData) => api.post<{ user: User; accessToken: string }>('/auth/register', data),
  login: (data: LoginData) => api.post<{ user: User; accessToken: string }>('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post<{ accessToken: string }>('/auth/refresh-token'),
  getMe: () => api.get<{ user: User }>('/auth/me'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token: string, password: string) => api.post(`/auth/reset-password/${token}`, { password }),
};

export const userService = {
  getProfile: () => api.get<{ user: User }>('/users/me'),
  updateProfile: (data: Partial<User>) => api.patch<{ user: User }>('/users/me', data),
  updatePassword: (currentPassword: string, newPassword: string) =>
    api.patch('/users/me/password', { currentPassword, newPassword }),
  uploadAvatar: (file: File) => {
    const form = new FormData();
    form.append('avatar', file);
    return api.post<{ user: User; avatar: string }>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAccount: () => api.delete('/users/me'),
  getStats: () => api.get<{ stats: UserStats }>('/users/me/stats'),
};

export interface UserStats {
  resumeScore: number | null;
  roadmapCompletion: number;
  internshipCount: number;
  dailyStreak: number;
  totalSkills: number;
  skillGapReadiness: number | null;
}

export const resumeService = {
  upload: (file: File) => {
    const form = new FormData();
    form.append('resume', file);
    return api.post<{ resume: Resume }>('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getActive: () => api.get<{ resume: Resume }>('/resumes/active'),
  getAll: () => api.get<{ resumes: Resume[] }>('/resumes'),
  analyze: () => api.post<{ analysis: ResumeAnalysis }>('/resumes/analyze'),
  delete: () => api.delete('/resumes/active'),
};

export interface Resume {
  _id: string;
  originalName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  analysis?: ResumeAnalysis;
  createdAt: string;
}

export interface ResumeAnalysis {
  technicalSkills: string[];
  softSkills: string[];
  experience: string[];
  education: string[];
  projects: string[];
  certifications: string[];
  missingInfo: string[];
  score: number;
  summary: string;
  improvements: string[];
  atsSuggestions: string[];
  betterWording: Array<{ original: string; improved: string }>;
  missingKeywords: string[];
  analyzedAt: string;
}

export const roadmapService = {
  generate: (targetRole: string, duration?: number) => api.post<{ roadmap: Roadmap }>('/roadmaps/generate', { targetRole, duration }),
  getAll: () => api.get<{ roadmaps: Roadmap[] }>('/roadmaps'),
  getActive: () => api.get<{ roadmap: Roadmap }>('/roadmaps/active'),
  updateTask: (data: { roadmapId: string; monthIndex: number; weekIndex: number; dayIndex: number; completed: boolean }) =>
    api.patch<{ roadmap: Roadmap }>('/roadmaps/task-completion', data),
  delete: (id: string) => api.delete(`/roadmaps/${id}`),
};

export interface Roadmap {
  _id: string;
  targetRole: string;
  duration: number;
  overallCompletion: number;
  months: Month[];
  isActive: boolean;
  createdAt: string;
}

export interface Month {
  month: number;
  title: string;
  description: string;
  concepts: string[];
  milestones: string[];
  completionPercentage: number;
  weeks: Week[];
}

export interface Week {
  week: number;
  title: string;
  project: string;
  interviewPrep: string;
  leetcode: string;
  goals: Goal[];
}

export interface Goal {
  _id?: string;
  day: number;
  title: string;
  description: string;
  resources: string[];
  completed: boolean;
  completedAt?: string;
}

export const skillGapService = {
  generate: (targetRole: string) => api.post<{ skillGap: SkillGap }>('/skill-gaps/generate', { targetRole }),
  getAll: () => api.get<{ skillGaps: SkillGap[] }>('/skill-gaps'),
  getLatest: () => api.get<{ skillGap: SkillGap }>('/skill-gaps/latest'),
  delete: (id: string) => api.delete(`/skill-gaps/${id}`),
};

export interface SkillGap {
  _id: string;
  targetRole: string;
  currentSkills: string[];
  requiredSkills: SkillItem[];
  missingSkills: SkillItem[];
  strengthAreas: string[];
  overallReadiness: number;
  recommendedPath: string;
  summary: string;
  createdAt: string;
}

export interface SkillItem {
  skill: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  difficultyScore: number;
  estimatedWeeks: number;
  reason: string;
  resources: string[];
  hasSkill: boolean;
}

export const projectService = {
  generate: (targetRole?: string) => api.post<{ suggestion: ProjectSuggestion }>('/projects/generate', { targetRole }),
  getAll: () => api.get<{ suggestions: ProjectSuggestion[] }>('/projects'),
  getLatest: () => api.get<{ suggestion: ProjectSuggestion }>('/projects/latest'),
};

export interface ProjectSuggestion {
  _id: string;
  targetRole: string;
  projects: Project[];
  createdAt: string;
}

export interface Project {
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
  resources: Resource[];
}

export interface Resource {
  type: string;
  title: string;
  url: string;
  description: string;
  isFree: boolean;
  rating: number;
}

export const internshipService = {
  create: (data: Partial<Internship>) => api.post<{ internship: Internship }>('/internships', data),
  getAll: (params?: Record<string, string>) => api.get<{ internships: Internship[]; pagination: Pagination }>('/internships', { params }),
  getById: (id: string) => api.get<{ internship: Internship }>(`/internships/${id}`),
  update: (id: string, data: Partial<Internship>) => api.patch<{ internship: Internship }>(`/internships/${id}`, data),
  delete: (id: string) => api.delete(`/internships/${id}`),
  getStats: () => api.get<{ stats: InternshipStats }>('/internships/stats'),
};

export interface Internship {
  _id: string;
  company: string;
  role: string;
  status: 'applied' | 'interview' | 'rejected' | 'selected' | 'offer' | 'withdrawn';
  appliedDate: string;
  interviewDate?: string;
  notes: string;
  jobUrl?: string;
  salary?: string;
  location?: string;
  isRemote: boolean;
  tags: string[];
  createdAt: string;
}

export interface InternshipStats {
  total: number;
  applied: number;
  interview: number;
  rejected: number;
  selected: number;
  offer: number;
  withdrawn: number;
}

export interface Pagination { total: number; page: number; limit: number; pages: number; }

export const dailyTaskService = {
  getToday: () => api.get<{ dailyTask: DailyTask }>('/daily-tasks/today'),
  complete: (taskId: string, completed: boolean) => api.patch<{ dailyTask: DailyTask }>(`/daily-tasks/${taskId}/complete`, { completed }),
  getHistory: () => api.get<{ tasks: DailyTask[] }>('/daily-tasks/history'),
  regenerate: () => api.post<{ dailyTask: DailyTask }>('/daily-tasks/regenerate'),
};

export interface DailyTask {
  _id: string;
  date: string;
  tasks: TaskItem[];
  totalCompleted: number;
  totalTasks: number;
}

export interface TaskItem {
  _id: string;
  type: 'learning' | 'coding' | 'revision' | 'interview' | 'challenge';
  title: string;
  description: string;
  estimatedMinutes: number;
  completed: boolean;
  completedAt?: string;
  resources?: string[];
}

export const chatService = {
  getConversations: () => api.get<{ conversations: Conversation[] }>('/chat'),
  getConversation: (id: string) => api.get<{ conversation: Conversation }>(`/chat/${id}`),
  create: () => api.post<{ conversation: Conversation }>('/chat'),
  sendMessage: (conversationId: string, message: string) =>
    api.post<{ message: ChatMessage; conversationId: string }>('/chat/message', { conversationId, message }),
  delete: (id: string) => api.delete(`/chat/${id}`),
};

export interface Conversation {
  _id: string;
  title: string;
  messages: ChatMessage[];
  lastMessageAt: string;
  createdAt: string;
}

export interface ChatMessage {
  _id?: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export const resourceService = {
  generate: (topic: string, role?: string) => api.post<{ resource: LearningResourceDoc }>('/resources/generate', { topic, role }),
  getAll: () => api.get<{ resources: LearningResourceDoc[] }>('/resources'),
  getByTopic: (topic: string) => api.get<{ resource: LearningResourceDoc }>(`/resources/${topic}`),
};

export interface LearningResourceDoc {
  _id: string;
  topic: string;
  role?: string;
  resources: ResourceItem[];
  createdAt: string;
}

export interface ResourceItem {
  type: string;
  title: string;
  url: string;
  description: string;
  isFree: boolean;
  rating: number;
  difficulty: string;
  estimatedHours: number;
  tags: string[];
}

export const dashboardService = {
  get: () => api.get<{ dashboard: DashboardData }>('/dashboard'),
};

export interface DashboardData {
  user: { name: string; email: string; avatar?: string; careerGoal?: string; skills: string[]; streak: number };
  resume: { hasResume: boolean; score: number | null; uploadedAt: string | null };
  roadmap: { hasRoadmap: boolean; targetRole: string | null; completion: number; duration: number | null };
  skillGap: { hasAnalysis: boolean; targetRole: string | null; readiness: number | null; missingCount: number };
  internships: InternshipStats;
  streakData: Array<{ date: string; completed: number; total: number; percentage: number }>;
  totalSkills: number;
}

export const searchService = {
  search: (q: string) => api.get<{ results: SearchResults }>('/search', { params: { q } }),
};

export interface SearchResults {
  internships: Partial<Internship>[];
  projects: Partial<Project>[];
  roadmaps: Partial<Roadmap>[];
  resources: Partial<LearningResourceDoc>[];
}
