import apiClient from './api';

export interface WeeklySchedule {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

export interface ThemeInput {
  id: number | string;
  name: string;
  hours: number;
  priority: number; // 1 = más importante
}

export interface CreateSmartPlanData {
  startDate: Date;
  examDate: Date;
  weeklySchedule: WeeklySchedule;
  themes: ThemeInput[];
  methodology?: 'rotation' | 'monthly-blocks';
  topicsPerDay?: number;
}

export interface SmartPlanResponse {
  success: boolean;
  message?: string;
  plan?: StudyPlan;
  sessions?: StudySession[];
  bufferWarning?: {
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    bufferStartDate: string;
    examDate: string;
    bufferDays: number;
  };
}

export interface StudyPlan {
  id: number;
  userId: number;
  startDate: string;
  examDate: string;
  totalHours: number;
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED' | 'CANCELLED' | 'DRAFT';
  weeklySchedule?: WeeklySchedule;
  configuration?: any;
}

export interface StudySession {
  id: number;
  studyPlanId: number;
  themeId: number;
  subThemeLabel?: string;
  subThemeIndex?: number;
  scheduledDate: string;
  scheduledHours: number;
  completedHours?: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  difficulty?: number; // 1-5 estrellas
  keyPoints?: string; // Puntos clave aprendidos
  notes?: string;
  sessionType?: 'STUDY' | 'REVIEW' | 'TEST' | 'SIMULATION';
  theme?: {
    id: number;
    block: string;
    themeNumber: number;
    title: string;
  };
}

export interface PlanProgress {
  plan: StudyPlan;
  totalSessions: number;
  completedSessions: number;
  pendingSessions: number;
  skippedSessions: number;
  totalHoursScheduled: number;
  totalHoursCompleted: number;
  progressPercentage: number;
  daysRemaining: number;
}

export const studyPlanService = {
  async createSmartPlan(data: CreateSmartPlanData): Promise<SmartPlanResponse> {
    const formattedData = {
      startDate: data.startDate.toISOString().split('T')[0],
      examDate: data.examDate.toISOString().split('T')[0],
      weeklySchedule: data.weeklySchedule,
      themes: data.themes,
      methodology: data.methodology,
      topicsPerDay: data.topicsPerDay
    };

    const response = await apiClient.post('/study-plans', formattedData);
    return response.data;
  },

  async getActivePlan(): Promise<StudyPlan> {
    const response = await apiClient.get('/study-plans/active');
    return response.data.plan;
  },

  async getPlanSessions(planId: number): Promise<StudySession[]> {
    const response = await apiClient.get(`/study-plans/${planId}/sessions`);
    return response.data.sessions;
  },

  async getPlanProgress(planId: number): Promise<PlanProgress> {
    const response = await apiClient.get(`/study-plans/${planId}/progress`);
    return response.data;
  },

  async deleteActivePlan(): Promise<void> {
    await apiClient.delete('/study-plans/active');
  },

  async getThemeStats(planId: number): Promise<any[]> {
    const response = await apiClient.get(`/study-plans/${planId}/theme-stats`);
    return response.data.stats;
  },

  async getEquitableDistribution(planId: number): Promise<{
    themes: any[];
    sessions: any[];
    distributionByComplexity: {
      LOW: any[];
      MEDIUM: any[];
      HIGH: any[];
    };
    stats: {
      LOW: { themes: number; totalSessions: number; avgSessions: number; totalHours: number; reviewLimits: { min: number; max: number } };
      MEDIUM: { themes: number; totalSessions: number; avgSessions: number; totalHours: number; reviewLimits: { min: number; max: number } };
      HIGH: { themes: number; totalSessions: number; avgSessions: number; totalHours: number; reviewLimits: { min: number; max: number } };
    };
  }> {
    const response = await apiClient.get(`/study-plans/${planId}/equitable-distribution`);
    return response.data;
  },

  async getThemePartsStats(planId: number): Promise<{
    themePartsStats: Array<{
      themeId: number;
      themeName: string;
      complexity: string;
      parts: Array<{
        partIndex: number;
        partLabel: string;
        totalSessions: number;
        studySessions: number;
        reviewSessions: number;
        testSessions: number;
        totalHours: number;
        completedSessions: number;
        completionRate: number;
      }>;
    }>;
    totalThemes: number;
    totalParts: number;
  }> {
    const response = await apiClient.get(`/study-plans/${planId}/theme-parts-stats`);
    return response.data;
  },

  async getGenerationStatus(planId: number): Promise<{
    plan: { id: number; status: string; createdAt: string; examDate: string };
    totalSessions: number;
    generationCompleted: boolean;
    firstSessionDate: string | null;
    lastSessionDate: string | null;
  }> {
    const response = await apiClient.get(`/study-plans/${planId}/status`);
    return response.data;
  },

  // Custom Blocks Methods
  async generateCustomBlocksPlan(data: any): Promise<SmartPlanResponse> {
    const response = await apiClient.post('/study-plans/custom-blocks/generate', data);
    return response.data;
  },

  async saveCustomBlocksProgress(data: any): Promise<{ message: string; draftId: number }> {
    const response = await apiClient.post('/study-plans/custom-blocks/save-progress', data);
    return response.data;
  },

  async getDraftPlan(): Promise<{ draft: StudyPlan | null }> {
    try {
      const response = await apiClient.get('/study-plans/custom-blocks/draft');
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return { draft: null };
      }
      throw error;
    }
  },

};
