import { Request, Response, NextFunction } from 'express';
import { getUsage } from '../services/usageService';

export const chatLimitsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.id;
        if (!userId) {
            return res.status(401).json({ error: 'No autorizado' });
        }

        const usage = await getUsage(userId);

        if (usage.queries_used >= usage.queries_limit) {
            return res.status(429).json({
                error: usage.plan_type === 'free' ? 'LIMIT_REACHED_FREE' : 'LIMIT_REACHED_PREMIUM',
                message: usage.plan_type === 'free'
                    ? `Has alcanzado el límite de ${usage.queries_limit} consultas mensuales`
                    : `Has superado tu cuota mensual de ${usage.queries_limit} consultas`,
                upgrade_required: usage.plan_type === 'free',
                reset_date: usage.reset_date,
                queries_used: usage.queries_used,
                queries_limit: usage.queries_limit
            });
        }

        next();
    } catch (error) {
        console.error('Error en chatLimitsMiddleware:', error);
        res.status(500).json({ error: 'Error interno verificando límites' });
    }
};
