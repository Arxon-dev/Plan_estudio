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
    sendMessage: async (message: string, simplifiedMode: boolean = false, context?: { bloque?: string, tema?: string }[]): Promise<ChatResponse> => {
        const response = await api.post('/chat', { message, simplifiedMode, context });
        return response.data;
    },

    getDocuments: async (): Promise<{ bloque: string; temas: { id: string; title: string }[] }[]> => {
        const response = await api.get('/chat/documents');
        return response.data;
    },

    getUsage: async (): Promise<ChatUsage> => {
        const response = await api.get('/chat/usage');
        return response.data;
    },

    generateSummary: async (tema: string, format: 'pdf' | 'markdown', context?: { bloque?: string, tema?: string }[]): Promise<any> => {
        const response = await api.post('/chat/generate-summary',
            { tema, format, context },
            { responseType: format === 'pdf' ? 'blob' : 'json' }
        );
        return response.data;
    },

    generateDiagram: async (query: string, type: 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy'): Promise<{ mermaidCode: string }> => {
        const response = await api.post('/chat/generate-diagram', { query, type });
        return response.data;
    },

    compareLaws: async (documents: string[], aspect: string): Promise<any> => {
        const response = await api.post('/chat/compare-laws', { documents, aspect });
        return response.data;
    },

    generateFlashcards: async (tema: string, quantity: number, difficulty: 'easy' | 'medium' | 'hard'): Promise<{ flashcards: any[] }> => {
        const response = await api.post('/chat/generate-flashcards', { tema, quantity, difficulty });
        return response.data;
    },

    generateMnemonic: async (content: string, type: 'acronym' | 'story' | 'rhyme' | 'method-of-loci'): Promise<any> => {
        const response = await api.post('/chat/generate-mnemonic', { content, type });
        return response.data;
    },
};
