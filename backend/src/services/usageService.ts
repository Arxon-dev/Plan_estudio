import sequelize from '../config/database';
import { QueryTypes } from 'sequelize';
import User from '../models/User';

interface ChatUsage {
    queries_used: number;
    queries_limit: number;
    queries_remaining: number;
    reset_date: string;
    plan_type: 'free' | 'premium';
}

export const LIMITS = {
    FREE: Number(process.env.CHAT_LIMIT_FREE) || 8,
    PREMIUM: Number(process.env.CHAT_LIMIT_PREMIUM) || 80,
};

export const getUsage = async (userId: number): Promise<ChatUsage> => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error('Usuario no encontrado');

    // Determinar plan (asumiendo que existe el campo o lógica de premium)
    // Si no existe el campo plan_type, usamos isPremium
    const planType = (user as any).plan_type || (user.isPremium ? 'premium' : 'free');
    const limit = planType === 'premium' ? LIMITS.PREMIUM : LIMITS.FREE;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    const [results] = await sequelize.query(
        `SELECT queries_count FROM chat_usage WHERE user_id = :userId AND month = :month`,
        {
            replacements: { userId, month: currentMonth },
            type: QueryTypes.SELECT,
        }
    ) as any[];

    const queriesUsed = results ? results.queries_count : 0;

    // Calcular fecha de renovación (1er día del próximo mes)
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const resetDate = nextMonth.toISOString().split('T')[0];

    return {
        queries_used: queriesUsed,
        queries_limit: limit,
        queries_remaining: Math.max(0, limit - queriesUsed),
        reset_date: resetDate,
        plan_type: planType,
    };
};

export const incrementUsage = async (userId: number): Promise<void> => {
    const currentMonth = new Date().toISOString().slice(0, 7);

    await sequelize.query(
        `INSERT INTO chat_usage (user_id, month, queries_count)
     VALUES (:userId, :month, 1)
     ON DUPLICATE KEY UPDATE queries_count = queries_count + 1, last_query_at = NOW()`,
        {
            replacements: { userId, month: currentMonth },
            type: QueryTypes.INSERT,
        }
    );
};

export const checkLimit = async (userId: number): Promise<boolean> => {
    const usage = await getUsage(userId);
    return usage.queries_used < usage.queries_limit;
};
