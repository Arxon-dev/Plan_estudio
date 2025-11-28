import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/chatApi';
import type { ChatResponse, ChatUsage } from '../types/chat';
import { toast } from 'react-hot-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatResponse['sources'];
    timestamp: Date;
}

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [usage, setUsage] = useState<ChatUsage | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    const fetchUsage = useCallback(async () => {
        try {
            const data = await chatApi.getUsage();
            setUsage(data);
            if (data.queries_used >= data.queries_limit) {
                setLimitReached(true);
            }
        } catch (error) {
            console.error('Error fetching usage:', error);
        }
    }, []);

    useEffect(() => {
        fetchUsage();
    }, [fetchUsage]);

    const sendMessage = async (content: string) => {
        if (!content.trim()) return;

        // Optimistic update
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage(content);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                sources: response.sources,
                timestamp: new Date(),
            };

            setMessages(prev => [...prev, botMessage]);

            if (response.usage) {
                setUsage({ ...usage!, ...response.usage } as ChatUsage);
                if (response.usage.queries_used >= response.usage.queries_limit) {
                    setLimitReached(true);
                }
            }

        } catch (error: any) {
            console.error('Error sending message:', error);

            // Manejo específico de límite alcanzado
            if (error.response?.status === 429) {
                setLimitReached(true);
                toast.error(error.response.data.message || 'Límite de consultas alcanzado');
                // Actualizar uso con los datos del error si están disponibles
                if (error.response.data.queries_used) {
                    setUsage(prev => prev ? ({ ...prev, ...error.response.data }) : null);
                }
            } else {
                toast.error('Error al enviar el mensaje. Inténtalo de nuevo.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return {
        messages,
        isLoading,
        usage,
        limitReached,
        sendMessage,
        refreshUsage: fetchUsage,
    };
};
