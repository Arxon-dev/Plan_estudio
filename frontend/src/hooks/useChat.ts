import { useState, useEffect, useCallback } from 'react';
import { chatApi } from '../services/chatApi';
import type { ChatResponse, ChatUsage } from '../types/chat';
import { toast } from 'react-hot-toast';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: ChatResponse['sources'];
    type?: string;
    timestamp: Date;
}

export const useChat = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [usage, setUsage] = useState<ChatUsage | null>(null);
    const [limitReached, setLimitReached] = useState(false);

    const [simplifiedMode, setSimplifiedMode] = useState<'normal' | 'simplified'>('normal');

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

    const sendMessage = async (content: string, context?: { bloque?: string, tema?: string }[]) => {
        if (!content.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);
        setIsLoading(true);

        try {
            const response = await chatApi.sendMessage(content, simplifiedMode === 'simplified', context);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.response,
                sources: response.sources,
                type: response.type,
                timestamp: new Date(),
            };

            console.log('[useChat] Mensaje recibido:', {
                type: response.type,
                textLength: response.response.length,
                sourcesCount: response.sources?.length || 0
            });

            setMessages(prev => [...prev, botMessage]);

            if (response.usage) {
                setUsage({ ...usage!, ...response.usage } as ChatUsage);
                if (response.usage.queries_used >= response.usage.queries_limit) {
                    setLimitReached(true);
                }
            }

        } catch (error: any) {
            console.error('Error sending message:', error);
            if (error.response?.status === 429) {
                setLimitReached(true);
                toast.error(error.response.data.message || 'Límite de consultas alcanzado');
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

    const generateSummary = async (tema: string, format: 'pdf' | 'markdown', context?: { bloque?: string, tema?: string }[]) => {
        try {
            setIsLoading(true);
            const result = await chatApi.generateSummary(tema, format, context);

            if (format === 'pdf') {
                const url = window.URL.createObjectURL(new Blob([result]));
                const link = document.createElement('a');
                link.href = url;
                link.download = `resumen_${tema.replace(/\s+/g, '_')}.pdf`;
                link.click();
                toast.success('Resumen PDF descargado');
            } else {
                const botMessage: Message = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    content: `**Resumen generado:**\n\n${result.content}`,
                    timestamp: new Date(),
                };
                setMessages(prev => [...prev, botMessage]);
            }
            fetchUsage();
        } catch (error: any) {
            console.error('Error generating summary:', error);
            const errorMessage = error.response?.data?.error || 'Error al generar el resumen';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const generateDiagram = async (query: string, type: 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy') => {
        const typeMap: Record<string, string> = {
            mindmap: 'mapa mental',
            flowchart: 'diagrama de flujo',
            timeline: 'línea temporal',
            hierarchy: 'jerarquía'
        };

        const typeLabel = typeMap[type] || 'diagrama';
        const prompt = `Genera un ${typeLabel} sobre: ${query}`;

        await sendMessage(prompt);
    };

    const compareLaws = async (documents: string[], aspect: string) => {
        try {
            setIsLoading(true);
            const result = await chatApi.compareLaws(documents, aspect);

            const botMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `**Comparativa de Leyes:**\n\n${result.comparison}`,
                timestamp: new Date(),
                type: 'comparison'
            };
            setMessages(prev => [...prev, botMessage]);
            fetchUsage();
        } catch (error: any) {
            console.error('Error comparing laws:', error);
            toast.error('Error al comparar leyes');
        } finally {
            setIsLoading(false);
        }
    };

    const generateFlashcards = async (tema: string, quantity: number, difficulty: 'easy' | 'medium' | 'hard') => {
        try {
            setIsLoading(true);
            const { flashcards } = await chatApi.generateFlashcards(tema, quantity, difficulty);

            const botMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `**Flashcards Generadas:**\n\n\`\`\`flashcards\n${JSON.stringify(flashcards)}\n\`\`\``,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, botMessage]);
            fetchUsage();
        } catch (error: any) {
            console.error('Error generating flashcards:', error);
            toast.error('Error al generar flashcards');
        } finally {
            setIsLoading(false);
        }
    };

    const generateMnemonic = async (content: string, type: 'acronym' | 'story' | 'rhyme' | 'method-of-loci') => {
        try {
            setIsLoading(true);
            const result = await chatApi.generateMnemonic(content, type);

            const botMessage: Message = {
                id: Date.now().toString(),
                role: 'assistant',
                content: `**Mnemotecnia Generada:**\n\n> **${result.mnemonic}**\n\n${result.explanation}\n\n*Tip: ${result.usage_tip}*`,
                timestamp: new Date(),
                type: 'general'
            };
            setMessages(prev => [...prev, botMessage]);
            fetchUsage();
        } catch (error: any) {
            console.error('Error generating mnemonic:', error);
            toast.error('Error al generar mnemotecnia');
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
        simplifiedMode,
        setSimplifiedMode,
        generateSummary,
        generateDiagram,
        compareLaws,
        generateFlashcards,
        generateMnemonic
    };
};
