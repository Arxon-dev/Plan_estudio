import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
});

// Interceptor para añadir el token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

import type { ChatResponse, ChatUsage } from '../types/chat';

export const chatApi = {
    sendMessage: async (message: string): Promise<ChatResponse> => {
        const response = await api.post('/chat', { message });
        return response.data;
    },

    getUsage: async (): Promise<ChatUsage> => {
        const response = await api.get('/chat/usage');
        return response.data;
    },
};
