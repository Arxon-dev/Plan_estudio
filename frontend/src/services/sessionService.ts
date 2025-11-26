import apiClient from './api';

export interface CompleteSessionData {
  completedHours?: number;
  notes?: string;
  difficulty?: number; // 1-5 estrellas
  keyPoints?: string; // Puntos clave aprendidos
}

export const sessionService = {
  async completeSession(sessionId: number, data: CompleteSessionData): Promise<any> {
    const response = await apiClient.put(`/sessions/${sessionId}/complete`, data);
    return response.data;
  },

  async skipSession(sessionId: number, reason?: string): Promise<any> {
    const response = await apiClient.put(`/sessions/${sessionId}/skip`, { reason });
    return response.data;
  },

  async markInProgress(sessionId: number, completedHours: number, notes?: string): Promise<any> {
    const response = await apiClient.put(`/sessions/${sessionId}/in-progress`, { completedHours, notes });
    return response.data;
  },

  async updateNotes(sessionId: number, notes: string): Promise<any> {
    const response = await apiClient.put(`/sessions/${sessionId}/notes`, { notes });
    return response.data;
  },

  async getSessionsByDate(planId: number, startDate: string, endDate: string): Promise<any> {
    const response = await apiClient.get('/sessions', {
      params: { planId, startDate, endDate },
    });
    return response.data.sessions;
  },

  async getAgenda(planId: number, date: string): Promise<{
    date: string;
    capacityHours: number;
    usedHours: number;
    freeHours: number;
    sessions: any[];
    recommendations: any[];
  }> {
    const response = await apiClient.get('/sessions/agenda', { params: { planId, date } });
    return response.data;
  },

  async addAgendaRecommendation(planId: number, date: string, themeId: number, hours: number): Promise<any> {
    const response = await apiClient.post('/sessions/agenda/add', { planId, date, themeId, hours });
    return response.data;
  },

  async updatePomodoro(sessionId: number, data: { pomodorosCompleted?: number; actualDuration?: number; interruptions?: number; status?: string }): Promise<any> {
    const response = await apiClient.post(`/sessions/${sessionId}/pomodoro`, data);
    return response.data;
  },

  async saveSettings(settings: any): Promise<any> {
    const response = await apiClient.put('/sessions/settings', { settings });
    return response.data;
  },
};
