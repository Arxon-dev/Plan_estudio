import apiClient from './api';

export interface Theme {
  id: number;
  block: 'ORGANIZACION' | 'JURIDICO_SOCIAL' | 'SEGURIDAD_NACIONAL';
  themeNumber: number;
  title: string;
  content: string;
  parts: number;
  estimatedHours: number;
}

export const themeService = {
  async getAllThemes(): Promise<Theme[]> {
    const response = await apiClient.get('/themes');
    return response.data.themes;
  },

  async getThemesByBlock(): Promise<{ [key: string]: Theme[] }> {
    const response = await apiClient.get('/themes/by-block');
    return response.data.themesByBlock;
  },

  async getThemeById(id: number): Promise<Theme> {
    const response = await apiClient.get(`/themes/${id}`);
    return response.data.theme;
  },
};
