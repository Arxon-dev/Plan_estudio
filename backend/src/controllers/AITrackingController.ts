import { Request, Response } from 'express';
import ChatUsage from '../models/ChatUsage';
import User from '../models/User';
import { Op } from 'sequelize';

export class AITrackingController {
    static async getStats(req: Request, res: Response): Promise<void> {
        try {
            const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

            // Total queries this month
            const totalQueries = await ChatUsage.sum('queriesCount', {
                where: { month: currentMonth }
            });

            // Unique users this month
            const activeUsers = await ChatUsage.count({
                where: { month: currentMonth }
            });

            // Top users
            const topUsers = await ChatUsage.findAll({
                where: { month: currentMonth },
                include: [{ 
                    model: User, 
                    as: 'user', 
                    attributes: ['id', 'firstName', 'lastName', 'email'] 
                }],
                order: [['queriesCount', 'DESC']],
                limit: 20
            });

            // Previous month comparison
            const now = new Date();
            const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            const prevMonth = prevDate.toISOString().slice(0, 7);

            const prevTotalQueries = await ChatUsage.sum('queriesCount', {
                where: { month: prevMonth }
            });

            res.json({
                month: currentMonth,
                stats: {
                    totalQueries: totalQueries || 0,
                    activeUsers: activeUsers || 0,
                    prevTotalQueries: prevTotalQueries || 0,
                    // Estimated cost: Assuming $0.005 per query average (blend of input/output)
                    estimatedCost: (totalQueries || 0) * 0.005
                },
                topUsers
            });
        } catch (error) {
            console.error('Error fetching AI stats:', error);
            res.status(500).json({ message: 'Error obteniendo estadísticas de IA' });
        }
    }
}
