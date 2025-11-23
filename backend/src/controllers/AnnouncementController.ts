import { Request, Response } from 'express';
import Announcement from '@models/Announcement';
import { Op } from 'sequelize';

export class AnnouncementController {
    // --- Public Methods ---

    static async getActiveAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const now = new Date();

            const announcement = await Announcement.findOne({
                where: {
                    isActive: true,
                    [Op.and]: [
                        {
                            [Op.or]: [
                                { startDate: null as any },
                                { startDate: { [Op.lte]: now } }
                            ]
                        },
                        {
                            [Op.or]: [
                                { endDate: null as any },
                                { endDate: { [Op.gte]: now } }
                            ]
                        }
                    ]
                },
                order: [['createdAt', 'DESC']], // Get the most recent one if multiple match
            });

            res.json(announcement);
        } catch (error) {
            console.error('Error fetching active announcement:', error);
            res.status(500).json({ message: 'Error al obtener aviso activo' });
        }
    }

    // --- Admin Methods ---

    static async getAllAnnouncements(req: Request, res: Response): Promise<void> {
        try {
            const announcements = await Announcement.findAll({
                order: [['createdAt', 'DESC']],
            });
            res.json(announcements);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            res.status(500).json({ message: 'Error al obtener avisos' });
        }
    }

    static async createAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const announcement = await Announcement.create(req.body);
            res.status(201).json(announcement);
        } catch (error) {
            console.error('Error creating announcement:', error);
            res.status(500).json({ message: 'Error al crear aviso' });
        }
    }

    static async updateAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const announcement = await Announcement.findByPk(id);

            if (!announcement) {
                res.status(404).json({ message: 'Aviso no encontrado' });
                return;
            }

            await announcement.update(req.body);
            res.json(announcement);
        } catch (error) {
            console.error('Error updating announcement:', error);
            res.status(500).json({ message: 'Error al actualizar aviso' });
        }
    }

    static async deleteAnnouncement(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const announcement = await Announcement.findByPk(id);

            if (!announcement) {
                res.status(404).json({ message: 'Aviso no encontrado' });
                return;
            }

            await announcement.destroy();
            res.json({ message: 'Aviso eliminado' });
        } catch (error) {
            console.error('Error deleting announcement:', error);
            res.status(500).json({ message: 'Error al eliminar aviso' });
        }
    }
}
