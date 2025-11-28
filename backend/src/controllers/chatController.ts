import { Request, Response } from 'express';
import { processChat } from '../services/chatService';
import { getUsage } from '../services/usageService';

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message } = req.body;
        const userId = (req as any).user?.id;

        if (!message) {
            return res.status(400).json({ error: 'El mensaje es requerido' });
        }

        const result = await processChat(userId, message);
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
