import { Request, Response } from 'express';
import { processChat, generateSummary, generateDiagram, compareLaws, generateFlashcards, generateMnemonic, getAvailableDocuments } from '../services/chatService';
import { getUsage, incrementUsage } from '../services/usageService';

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message, simplifiedMode, context } = req.body;
        const userId = (req as any).user?.id;

        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        const result = await processChat(userId, message, simplifiedMode, context);
        const usage = await getUsage(userId);

        res.json({
            ...result,
            usage: {
                queries_used: usage.queries_used,
                queries_limit: usage.queries_limit,
                queries_remaining: usage.queries_remaining,
                reset_date: usage.reset_date
            }
        });

    } catch (error: any) {
        console.error('Error en sendMessage controller:', error);
        res.status(500).json({
            error: 'Error procesando la consulta',
            details: error.message
        });
    }
};

export const handleGetDocuments = async (req: Request, res: Response) => {
    try {
        const documents = await getAvailableDocuments();
        res.json(documents);
    } catch (error: any) {
        console.error('Error obteniendo documentos:', error);
        res.status(500).json({ error: 'Error obteniendo documentos', details: error.message });
    }
};

export const getUsageStats = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user?.id;
        const usage = await getUsage(userId);
        res.json(usage);
    } catch (error) {
        console.error('Error obteniendo estadísticas de uso:', error);
        res.status(500).json({ error: 'Error obteniendo estadísticas' });
    }
};

export const handleGenerateSummary = async (req: Request, res: Response) => {
    try {
        const { tema, format, context } = req.body;
        const userId = (req as any).user?.id;

        if (!tema || !format) {
            return res.status(400).json({ error: 'Tema y formato son requeridos' });
        }

        const result = await generateSummary(tema, format, context);
        await incrementUsage(userId); // Consumes quota

        if (format === 'pdf') {
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(result.filename)}"`);
            res.send(Buffer.from(result.content as Uint8Array));
        } else {
            res.json(result);
        }
    } catch (error: any) {
        console.error('Error generando resumen:', error);
        if (error.status === 429) {
            return res.status(429).json({ error: error.message, retryAfter: error.retryAfter });
        }
        res.status(500).json({ error: 'Error generando resumen', details: error.message });
    }
};

export const handleGenerateDiagram = async (req: Request, res: Response) => {
    try {
        const { query, type } = req.body;
        const userId = (req as any).user?.id;

        if (!query || !type) {
            return res.status(400).json({ error: 'Query y tipo son requeridos' });
        }

        const mermaidCode = await generateDiagram(query, type);
        await incrementUsage(userId); // Consumes quota

        res.json({ mermaidCode });
    } catch (error: any) {
        console.error('Error generando diagrama:', error);
        res.status(500).json({ error: 'Error generando diagrama', details: error.message });
    }
};

export const handleCompareLaws = async (req: Request, res: Response) => {
    try {
        const { documents, aspect } = req.body;
        const userId = (req as any).user?.id;

        if (!documents || !aspect || !Array.isArray(documents)) {
            return res.status(400).json({ error: 'Documentos (array) y aspecto son requeridos' });
        }

        const result = await compareLaws(documents, aspect);
        await incrementUsage(userId); // Consumes quota

        res.json(result);
    } catch (error: any) {
        console.error('Error comparando leyes:', error);
        res.status(500).json({ error: 'Error comparando leyes', details: error.message });
    }
};

export const handleGenerateFlashcards = async (req: Request, res: Response) => {
    try {
        const { tema, quantity, difficulty } = req.body;
        const userId = (req as any).user?.id;

        if (!tema) {
            return res.status(400).json({ error: 'Tema es requerido' });
        }

        const flashcards = await generateFlashcards(tema, quantity, difficulty);
        await incrementUsage(userId); // Consumes quota

        res.json({ flashcards });
    } catch (error: any) {
        console.error('Error generando flashcards:', error);
        res.status(500).json({ error: 'Error generando flashcards', details: error.message });
    }
};

export const handleGenerateMnemonic = async (req: Request, res: Response) => {
    try {
        const { content, type } = req.body;
        // Mnemotecnias NO consumen cuota (según plan)

        if (!content || !type) {
            return res.status(400).json({ error: 'Contenido y tipo son requeridos' });
        }

        const result = await generateMnemonic(content, type);

        res.json(result);
    } catch (error: any) {
        console.error('Error generando mnemotecnia:', error);
        res.status(500).json({ error: 'Error generando mnemotecnia', details: error.message });
    }
};


