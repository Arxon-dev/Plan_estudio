import { Request, Response } from 'express';
import SystemLog from '@models/SystemLog';
import { Op } from 'sequelize';

export class SystemLogController {

    static async getLogs(req: Request, res: Response): Promise<void> {
        try {
            const { page = 1, limit = 20, adminId, action, startDate, endDate, search } = req.query;

            const offset = (Number(page) - 1) * Number(limit);
            const whereClause: any = {};

            if (adminId) {
                whereClause.adminId = adminId;
            }

            if (action) {
                whereClause.action = action;
            }

            if (startDate && endDate) {
                whereClause.createdAt = {
                    [Op.between]: [new Date(startDate as string), new Date(endDate as string)]
                };
            } else if (startDate) {
                whereClause.createdAt = { [Op.gte]: new Date(startDate as string) };
            } else if (endDate) {
                whereClause.createdAt = { [Op.lte]: new Date(endDate as string) };
            }

            if (search) {
                whereClause[Op.or] = [
                    { details: { [Op.like]: `%${search}%` } }, // Note: JSON search might vary by DB, this is basic string match
                    { resource: { [Op.like]: `%${search}%` } },
                    { adminName: { [Op.like]: `%${search}%` } }
                ];
            }

            const { count, rows } = await SystemLog.findAndCountAll({
                where: whereClause,
                limit: Number(limit),
                offset,
                order: [['createdAt', 'DESC']],
            });

            res.json({
                logs: rows,
                total: count,
                totalPages: Math.ceil(count / Number(limit)),
                currentPage: Number(page)
            });
        } catch (error) {
            console.error('Error fetching system logs:', error);
            res.status(500).json({ message: 'Error al obtener logs del sistema' });
        }
    }

    // Helper method to create logs (can be used by other controllers)
    static async logAction(
        adminId: number | undefined,
        adminName: string | undefined,
        action: string,
        resource: string,
        details: any,
        req?: Request
    ) {
        try {
            await SystemLog.create({
                adminId,
                adminName,
                action,
                resource,
                details,
                ipAddress: req?.ip,
                userAgent: req?.get('User-Agent')
            });
        } catch (error) {
            console.error('Error creating system log:', error);
            // Don't throw, logging shouldn't break the main flow
        }
    }
}
