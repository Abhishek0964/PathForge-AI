import api from './api';
import {
  ROLE_TEMPLATES,
  generateMockResumeAnalysis,
  getMockAICoachReply,
  loadRecruiterDemoData,
  normalizeRoleName
} from '../utils/mockTemplates';

const mockId = () => Math.random().toString(36).substring(2, 9);

// Auto preload recruiter data if guest mode is detected
if (localStorage.getItem('isGuest') === 'true' || !localStorage.getItem('demo_data_preloaded')) {
  loadRecruiterDemoData();
}

const shouldUseMock = (): boolean => {
  return localStorage.getItem('isGuest') === 'true' || (window as any).isBackendOffline === true;
};

const mockResponse = <T>(data: T) => {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {} as any,
  });
};

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
  register: (data: RegisterData) => {
    if (shouldUseMock()) {
      localStorage.setItem('isGuest', 'false'); // Sign up creates a real session
      const newUser: User = {
        _id: 'real-user-id',
        name: data.name,
        email: data.email,
        skills: [],
        interests: [],
        streak: 1,
        createdAt: new Date().toISOString()
      };
      return mockResponse({ user: newUser, accessToken: 'mock-access-token' });
    }
    return api.post<{ user: User; accessToken: string }>('/auth/register', data);
  },
  login: (data: LoginData) => {
    if (shouldUseMock()) {
      localStorage.setItem('isGuest', 'false'); // Login creates a real session
      const loggedUser: User = {
        _id: 'real-user-id',
        name: 'John Doe',
        email: data.email,
        skills: ['React', 'JavaScript'],
        interests: ['Development'],
        streak: 3,
        createdAt: new Date().toISOString()
      };
      return mockResponse({ user: loggedUser, accessToken: 'mock-access-token' });
    }
    return api.post<{ user: User; accessToken: string }>('/auth/login', data);
  },
  logout: () => {
    if (shouldUseMock()) {
      localStorage.removeItem('isGuest');
      localStorage.removeItem('demo_data_preloaded');
      return mockResponse({ success: true });
    }
    return api.post('/auth/logout');
  },
  refreshToken: () => {
    if (shouldUseMock()) {
      return mockResponse({ accessToken: 'mock-access-token' });
    }
    return api.post<{ accessToken: string }>('/auth/refresh-token');
  },
  getMe: () => {
    if (shouldUseMock()) {
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      return mockResponse({ user: profile });
    }
    return api.get<{ user: User }>('/auth/me');
  },
  forgotPassword: (email: string) => {
    if (shouldUseMock()) {
      return mockResponse({ message: 'Reset token: mocktoken123' });
    }
    return api.post('/auth/forgot-password', { email });
  },
  resetPassword: (token: string, password: string) => {
    if (shouldUseMock()) {
      return mockResponse({ success: true });
    }
    return api.post(`/auth/reset-password/${token}`, { password });
  },
};

export const userService = {
  getProfile: () => {
    if (shouldUseMock()) {
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      return mockResponse({ user: profile });
    }
    return api.get<{ user: User }>('/users/me');
  },
  updateProfile: (data: Partial<User>) => {
    if (shouldUseMock()) {
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      const updated = { ...profile, ...data };
      localStorage.setItem('guest_profile', JSON.stringify(updated));
      
      // Also sync user info in dashboard mock data
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      if (dashboard.user) {
        dashboard.user = { ...dashboard.user, ...data };
        localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));
      }
      return mockResponse({ user: updated });
    }
    return api.patch<{ user: User }>('/users/me', data);
  },
  updatePassword: (currentPassword: string, newPassword: string) => {
    if (shouldUseMock()) {
      return mockResponse({ success: true });
    }
    return api.patch('/users/me/password', { currentPassword, newPassword });
  },
  uploadAvatar: (file: File) => {
    if (shouldUseMock()) {
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      profile.avatar = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150';
      localStorage.setItem('guest_profile', JSON.stringify(profile));
      return mockResponse({ user: profile, avatar: profile.avatar });
    }
    const form = new FormData();
    form.append('avatar', file);
    return api.post<{ user: User; avatar: string }>('/users/me/avatar', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteAccount: () => {
    if (shouldUseMock()) {
      localStorage.clear();
      return mockResponse({ success: true });
    }
    return api.delete('/users/me');
  },
  getStats: () => {
    if (shouldUseMock()) {
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      const stats: UserStats = {
        resumeScore: dashboard.resume?.score || null,
        roadmapCompletion: dashboard.roadmap?.completion || 0,
        internshipCount: dashboard.internships?.total || 0,
        dailyStreak: dashboard.user?.streak || 0,
        totalSkills: dashboard.totalSkills || 0,
        skillGapReadiness: dashboard.skillGap?.readiness || null
      };
      return mockResponse({ stats });
    }
    return api.get<{ stats: UserStats }>('/users/me/stats');
  },
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
    if (shouldUseMock()) {
      const newResume = {
        _id: 'guest-resume-' + mockId(),
        originalName: file.name,
        fileUrl: '#',
        fileType: 'application/pdf',
        fileSize: file.size,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('guest_active_resume', JSON.stringify(newResume));
      
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.resume = { hasResume: true, score: null, uploadedAt: newResume.createdAt };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      return mockResponse({ resume: newResume });
    }
    const form = new FormData();
    form.append('resume', file);
    return api.post<{ resume: Resume }>('/resumes/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getActive: () => {
    if (shouldUseMock()) {
      const resume = JSON.parse(localStorage.getItem('guest_active_resume') || 'null');
      if (!resume) return Promise.reject(new Error('No resume uploaded'));
      return mockResponse({ resume });
    }
    return api.get<{ resume: Resume }>('/resumes/active');
  },
  getAll: () => {
    if (shouldUseMock()) {
      const resume = JSON.parse(localStorage.getItem('guest_active_resume') || 'null');
      return mockResponse({ resumes: resume ? [resume] : [] });
    }
    return api.get<{ resumes: Resume[] }>('/resumes');
  },
  analyze: () => {
    if (shouldUseMock()) {
      const resume = JSON.parse(localStorage.getItem('guest_active_resume') || '{}');
      const analysis = generateMockResumeAnalysis(resume.originalName || 'resume.pdf');
      resume.analysis = analysis;
      localStorage.setItem('guest_active_resume', JSON.stringify(resume));

      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.resume = { hasResume: true, score: analysis.score, uploadedAt: resume.createdAt };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      return mockResponse({ analysis });
    }
    return api.post<{ analysis: ResumeAnalysis }>('/resumes/analyze');
  },
  delete: () => {
    if (shouldUseMock()) {
      localStorage.removeItem('guest_active_resume');
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.resume = { hasResume: false, score: null, uploadedAt: null };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));
      return mockResponse({ success: true });
    }
    return api.delete('/resumes/active');
  },
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
  generate: (targetRole: string, duration = 3) => {
    if (shouldUseMock()) {
      const normalized = normalizeRoleName(targetRole);
      const generated = ROLE_TEMPLATES[normalized].roadmap(duration);
      generated.targetRole = targetRole;
      localStorage.setItem('guest_active_roadmap', JSON.stringify(generated));

      // Synchronize in dashboard
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.roadmap = { hasRoadmap: true, targetRole, completion: 0, duration };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      // Auto generate daily tasks
      const tasks = [
        { _id: 'mock-t-' + mockId(), type: 'learning' as const, title: `Learn ${targetRole} roadmap Day 1`, description: `Understand environment setups and base requirements.`, estimatedMinutes: 30, completed: false },
        { _id: 'mock-t-' + mockId(), type: 'coding' as const, title: `Coding fundamentals exercise`, description: `Solve a core design logic problem.`, estimatedMinutes: 20, completed: false }
      ];
      const dailyTasksObj = {
        _id: 'guest-tasks-id',
        date: new Date().toISOString().split('T')[0],
        tasks,
        totalCompleted: 0,
        totalTasks: 2
      };
      localStorage.setItem('guest_daily_tasks', JSON.stringify(dailyTasksObj));

      return mockResponse({ roadmap: generated });
    }
    return api.post<{ roadmap: Roadmap }>('/roadmaps/generate', { targetRole, duration });
  },
  getAll: () => {
    if (shouldUseMock()) {
      const rm = JSON.parse(localStorage.getItem('guest_active_roadmap') || 'null');
      return mockResponse({ roadmaps: rm ? [rm] : [] });
    }
    return api.get<{ roadmaps: Roadmap[] }>('/roadmaps');
  },
  getActive: () => {
    if (shouldUseMock()) {
      const rm = JSON.parse(localStorage.getItem('guest_active_roadmap') || 'null');
      if (!rm) return Promise.reject(new Error('No active roadmap'));
      return mockResponse({ roadmap: rm });
    }
    return api.get<{ roadmap: Roadmap }>('/roadmaps/active');
  },
  updateTask: (data: { roadmapId: string; monthIndex: number; weekIndex: number; dayIndex: number; completed: boolean }) => {
    if (shouldUseMock()) {
      const rm = JSON.parse(localStorage.getItem('guest_active_roadmap') || '{}') as Roadmap;
      const month = rm.months?.[data.monthIndex];
      const week = month?.weeks?.[data.weekIndex];
      const goal = week?.goals?.[data.dayIndex];
      if (goal) {
        goal.completed = data.completed;
        goal.completedAt = data.completed ? new Date().toISOString() : undefined;
      }

      // Recalculate percentages
      let totalGoals = 0;
      let completedGoals = 0;
      rm.months?.forEach((m) => {
        let monthTotal = 0;
        let monthCompleted = 0;
        m.weeks?.forEach((w) => {
          w.goals?.forEach((g) => {
            totalGoals++;
            monthTotal++;
            if (g.completed) {
              completedGoals++;
              monthCompleted++;
            }
          });
        });
        m.completionPercentage = monthTotal > 0 ? Math.round((monthCompleted / monthTotal) * 100) : 0;
      });
      rm.overallCompletion = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

      localStorage.setItem('guest_active_roadmap', JSON.stringify(rm));

      // Sync dashboard
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.roadmap.completion = rm.overallCompletion;
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      return mockResponse({ roadmap: rm });
    }
    return api.patch<{ roadmap: Roadmap }>('/roadmaps/task-completion', data);
  },
  delete: (id: string) => {
    if (shouldUseMock()) {
      localStorage.removeItem('guest_active_roadmap');
      localStorage.removeItem('guest_daily_tasks');
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.roadmap = { hasRoadmap: false, targetRole: null, completion: 0, duration: null };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));
      return mockResponse({ success: true });
    }
    return api.delete(`/roadmaps/${id}`);
  },
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
  generate: (targetRole: string) => {
    if (shouldUseMock()) {
      const normalized = normalizeRoleName(targetRole);
      const generated = ROLE_TEMPLATES[normalized].skillGap;
      generated.targetRole = targetRole;
      localStorage.setItem('guest_latest_skillgap', JSON.stringify(generated));

      // Sync dashboard
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.skillGap = { hasAnalysis: true, targetRole, readiness: generated.overallReadiness, missingCount: generated.missingSkills.length };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      return mockResponse({ skillGap: generated });
    }
    return api.post<{ skillGap: SkillGap }>('/skill-gaps/generate', { targetRole });
  },
  getAll: () => {
    if (shouldUseMock()) {
      const sg = JSON.parse(localStorage.getItem('guest_latest_skillgap') || 'null');
      return mockResponse({ skillGaps: sg ? [sg] : [] });
    }
    return api.get<{ skillGaps: SkillGap[] }>('/skill-gaps');
  },
  getLatest: () => {
    if (shouldUseMock()) {
      const sg = JSON.parse(localStorage.getItem('guest_latest_skillgap') || 'null');
      if (!sg) return Promise.reject(new Error('No skill gap analyzed yet'));
      return mockResponse({ skillGap: sg });
    }
    return api.get<{ skillGap: SkillGap }>('/skill-gaps/latest');
  },
  delete: (id: string) => {
    if (shouldUseMock()) {
      localStorage.removeItem('guest_latest_skillgap');
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.skillGap = { hasAnalysis: false, targetRole: null, readiness: null, missingCount: 0 };
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));
      return mockResponse({ success: true });
    }
    return api.delete(`/skill-gaps/${id}`);
  },
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
  generate: (targetRole?: string) => {
    if (shouldUseMock()) {
      const role = targetRole || JSON.parse(localStorage.getItem('guest_profile') || '{}').careerGoal || 'Full Stack Developer';
      const normalized = normalizeRoleName(role);
      const generated = ROLE_TEMPLATES[normalized].projects;
      generated.targetRole = role;
      localStorage.setItem('guest_latest_projects', JSON.stringify(generated));
      return mockResponse({ suggestion: generated });
    }
    return api.post<{ suggestion: ProjectSuggestion }>('/projects/generate', { targetRole });
  },
  getAll: () => {
    if (shouldUseMock()) {
      const proj = JSON.parse(localStorage.getItem('guest_latest_projects') || 'null');
      return mockResponse({ suggestions: proj ? [proj] : [] });
    }
    return api.get<{ suggestions: ProjectSuggestion[] }>('/projects');
  },
  getLatest: () => {
    if (shouldUseMock()) {
      const proj = JSON.parse(localStorage.getItem('guest_latest_projects') || 'null');
      if (!proj) return Promise.reject(new Error('No projects generated yet'));
      return mockResponse({ suggestion: proj });
    }
    return api.get<{ suggestion: ProjectSuggestion }>('/projects/latest');
  },
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
  create: (data: Partial<Internship>) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_internships') || '[]');
      const newItem = {
        ...data,
        _id: 'guest-int-' + mockId(),
        createdAt: new Date().toISOString(),
        tags: data.tags || []
      } as Internship;
      list.push(newItem);
      localStorage.setItem('guest_internships', JSON.stringify(list));

      // Sync dashboard stats
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      dashboard.internships.total++;
      if (newItem.status === 'applied') dashboard.internships.applied++;
      if (newItem.status === 'interview') dashboard.internships.interview++;
      if (newItem.status === 'offer') dashboard.internships.offer++;
      if (newItem.status === 'rejected') dashboard.internships.rejected++;
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      return mockResponse({ internship: newItem });
    }
    return api.post<{ internship: Internship }>('/internships', data);
  },
  getAll: (params?: Record<string, string>) => {
    if (shouldUseMock()) {
      let list = JSON.parse(localStorage.getItem('guest_internships') || '[]') as Internship[];
      if (params?.status) {
        list = list.filter((item) => item.status === params.status);
      }
      return mockResponse({
        internships: list,
        pagination: { total: list.length, page: 1, limit: 20, pages: 1 }
      });
    }
    return api.get<{ internships: Internship[]; pagination: Pagination }>('/internships', { params });
  },
  getById: (id: string) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_internships') || '[]') as Internship[];
      const item = list.find((i) => i._id === id);
      if (!item) return Promise.reject(new Error('Internship not found'));
      return mockResponse({ internship: item });
    }
    return api.get<{ internship: Internship }>(`/internships/${id}`);
  },
  update: (id: string, data: Partial<Internship>) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_internships') || '[]') as Internship[];
      const idx = list.findIndex((i) => i._id === id);
      if (idx === -1) return Promise.reject(new Error('Internship not found'));
      
      const oldStatus = list[idx].status;
      list[idx] = { ...list[idx], ...data } as Internship;
      localStorage.setItem('guest_internships', JSON.stringify(list));

      // Recalculate dashboard stats
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      if (data.status && data.status !== oldStatus) {
        dashboard.internships[oldStatus] = Math.max(0, dashboard.internships[oldStatus] - 1);
        dashboard.internships[data.status]++;
      }
      localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));

      return mockResponse({ internship: list[idx] });
    }
    return api.patch<{ internship: Internship }>(`/internships/${id}`, data);
  },
  delete: (id: string) => {
    if (shouldUseMock()) {
      let list = JSON.parse(localStorage.getItem('guest_internships') || '[]') as Internship[];
      const item = list.find((i) => i._id === id);
      if (item) {
        list = list.filter((i) => i._id !== id);
        localStorage.setItem('guest_internships', JSON.stringify(list));

        // Sync dashboard
        const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
        dashboard.internships.total = Math.max(0, dashboard.internships.total - 1);
        dashboard.internships[item.status] = Math.max(0, dashboard.internships[item.status] - 1);
        localStorage.setItem('guest_dashboard_data', JSON.stringify(dashboard));
      }
      return mockResponse({ success: true });
    }
    return api.delete(`/internships/${id}`);
  },
  getStats: () => {
    if (shouldUseMock()) {
      const dashboard = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      return mockResponse({ stats: dashboard.internships });
    }
    return api.get<{ stats: InternshipStats }>('/internships/stats');
  },
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
  getToday: () => {
    if (shouldUseMock()) {
      const tasksObj = JSON.parse(localStorage.getItem('guest_daily_tasks') || 'null');
      if (!tasksObj) return Promise.reject(new Error('No tasks logged'));
      return mockResponse({ dailyTask: tasksObj });
    }
    return api.get<{ dailyTask: DailyTask }>('/daily-tasks/today');
  },
  complete: (taskId: string, completed: boolean) => {
    if (shouldUseMock()) {
      const tasksObj = JSON.parse(localStorage.getItem('guest_daily_tasks') || '{}') as DailyTask;
      const t = tasksObj.tasks?.find((i) => i._id === taskId);
      if (t) {
        t.completed = completed;
        t.completedAt = completed ? new Date().toISOString() : undefined;
      }
      // Re-sum
      tasksObj.totalCompleted = tasksObj.tasks?.filter((i) => i.completed).length || 0;
      localStorage.setItem('guest_daily_tasks', JSON.stringify(tasksObj));
      return mockResponse({ dailyTask: tasksObj });
    }
    return api.patch<{ dailyTask: DailyTask }>(`/daily-tasks/${taskId}/complete`, { completed });
  },
  getHistory: () => {
    if (shouldUseMock()) {
      const todayTask = JSON.parse(localStorage.getItem('guest_daily_tasks') || '{}');
      return mockResponse({ tasks: todayTask._id ? [todayTask] : [] });
    }
    return api.get<{ tasks: DailyTask[] }>('/daily-tasks/history');
  },
  regenerate: () => {
    if (shouldUseMock()) {
      const user = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      const targetRole = user.careerGoal || 'Full Stack Developer';
      const tasks = [
        { _id: 'mock-t-' + mockId(), type: 'coding' as const, title: `Leetcode problem: Binary search matrix`, description: 'Verify worst case time complexity is logarithmic.', estimatedMinutes: 25, completed: false },
        { _id: 'mock-t-' + mockId(), type: 'challenge' as const, title: `Audit ATS formatting of new project`, description: 'Copy system design notes into Github readme template.', estimatedMinutes: 20, completed: false }
      ];
      const dailyTasksObj = {
        _id: 'guest-tasks-id',
        date: new Date().toISOString().split('T')[0],
        tasks,
        totalCompleted: 0,
        totalTasks: 2
      };
      localStorage.setItem('guest_daily_tasks', JSON.stringify(dailyTasksObj));
      return mockResponse({ dailyTask: dailyTasksObj });
    }
    return api.post<{ dailyTask: DailyTask }>('/daily-tasks/regenerate');
  },
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
  getConversations: () => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_conversations') || '[]');
      return mockResponse({ conversations: list });
    }
    return api.get<{ conversations: Conversation[] }>('/chat');
  },
  getConversation: (id: string) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_conversations') || '[]') as Conversation[];
      const c = list.find((item) => item._id === id);
      if (!c) return Promise.reject(new Error('Conversation not found'));
      return mockResponse({ conversation: c });
    }
    return api.get<{ conversation: Conversation }>(`/chat/${id}`);
  },
  create: () => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_conversations') || '[]');
      const newConv = {
        _id: 'guest-chat-' + mockId(),
        title: 'New Conversation',
        messages: [],
        lastMessageAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      list.unshift(newConv);
      localStorage.setItem('guest_conversations', JSON.stringify(list));
      localStorage.setItem('guest_active_chat', JSON.stringify(newConv));
      return mockResponse({ conversation: newConv });
    }
    return api.post<{ conversation: Conversation }>('/chat');
  },
  sendMessage: (conversationId: string, message: string) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_conversations') || '[]') as Conversation[];
      const idx = list.findIndex((item) => item._id === conversationId);
      if (idx === -1) return Promise.reject(new Error('Conversation not found'));
      
      const conv = list[idx];
      // User message
      conv.messages.push({
        _id: 'msg-u-' + mockId(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      });

      // AI Response Mock based on coach persona
      // Detect if user has a selected coach persona, defaults to tech
      const persona = 'tech'; 
      const responseContent = getMockAICoachReply(persona, conv.messages, message);
      
      const assistantMsg = {
        _id: 'msg-a-' + mockId(),
        role: 'assistant' as const,
        content: responseContent,
        timestamp: new Date().toISOString()
      };
      conv.messages.push(assistantMsg);
      conv.lastMessageAt = new Date().toISOString();

      if (conv.messages.length === 2) {
        conv.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
      }

      list[idx] = conv;
      localStorage.setItem('guest_conversations', JSON.stringify(list));
      
      return mockResponse({
        message: assistantMsg,
        conversationId
      });
    }
    return api.post<{ message: ChatMessage; conversationId: string }>('/chat/message', { conversationId, message });
  },
  delete: (id: string) => {
    if (shouldUseMock()) {
      let list = JSON.parse(localStorage.getItem('guest_conversations') || '[]') as Conversation[];
      list = list.filter((c) => c._id !== id);
      localStorage.setItem('guest_conversations', JSON.stringify(list));
      return mockResponse({ success: true });
    }
    return api.delete(`/chat/${id}`);
  },
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
  generate: (topic: string, role?: string) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_resources') || '[]');
      const normalized = normalizeRoleName(topic);
      const generated = ROLE_TEMPLATES[normalized].resources;
      generated.topic = topic;
      generated._id = 'mock-re-' + mockId();
      list.unshift(generated);
      localStorage.setItem('guest_resources', JSON.stringify(list));
      return mockResponse({ resource: generated });
    }
    return api.post<{ resource: LearningResourceDoc }>('/resources/generate', { topic, role });
  },
  getAll: () => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_resources') || '[]');
      return mockResponse({ resources: list });
    }
    return api.get<{ resources: LearningResourceDoc[] }>('/resources');
  },
  getByTopic: (topic: string) => {
    if (shouldUseMock()) {
      const list = JSON.parse(localStorage.getItem('guest_resources') || '[]') as LearningResourceDoc[];
      const res = list.find((item) => item.topic.toLowerCase() === topic.toLowerCase());
      if (!res) return Promise.reject(new Error('Resource not found'));
      return mockResponse({ resource: res });
    }
    return api.get<{ resource: LearningResourceDoc }>(`/resources/${topic}`);
  },
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
  get: () => {
    if (shouldUseMock()) {
      const data = JSON.parse(localStorage.getItem('guest_dashboard_data') || '{}');
      
      // Update streak and profile details dynamically from local stats
      const profile = JSON.parse(localStorage.getItem('guest_profile') || '{}');
      if (profile.name) {
        data.user.name = profile.name;
        data.user.streak = profile.streak;
        data.user.skills = profile.skills;
        data.user.careerGoal = profile.careerGoal;
      }
      
      return mockResponse({ dashboard: data });
    }
    return api.get<{ dashboard: DashboardData }>('/dashboard');
  },
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
  search: (q: string) => {
    if (shouldUseMock()) {
      return mockResponse({
        results: { internships: [], projects: [], roadmaps: [], resources: [] }
      });
    }
    return api.get<{ results: SearchResults }>('/search', { params: { q } });
  },
};

export interface SearchResults {
  internships: Partial<Internship>[];
  projects: Partial<Project>[];
  roadmaps: Partial<Roadmap>[];
  resources: Partial<LearningResourceDoc>[];
}
