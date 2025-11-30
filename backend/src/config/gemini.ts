import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY no está definida en las variables de entorno');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY || '');

// Modelo para chat (Factory function para configuración dinámica)
export const getChatModel = (config?: any) => {
    const defaultConfig = {
        temperature: 0.3,
        topK: 20,
        topP: 0.8,
        maxOutputTokens: 8192,
        stopSequences: [],
    };

    return genAI.getGenerativeModel({
        model: 'gemini-2.5-pro',
        generationConfig: { ...defaultConfig, ...config }
    });
};

// Mantener exportación estática por compatibilidad (opcional, pero mejor migrar)
export const chatModel = getChatModel();

// Modelo para embeddings
export const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const result = await embeddingModel.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('❌ Error generando embedding:', error);
        throw error;
    }
};
