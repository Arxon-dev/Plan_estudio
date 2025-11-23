import { Request, Response } from 'express';
import GuideSection from '@models/GuideSection';

export class GuideController {
    // Public: Get all visible sections
    static async getPublicSections(req: Request, res: Response): Promise<void> {
        try {
            const sections = await GuideSection.findAll({
                where: { isVisible: true },
                order: [['order', 'ASC']],
            });
            res.json(sections);
        } catch (error) {
            console.error('Error al obtener guía:', error);
            res.status(500).json({ message: 'Error al obtener la guía de estudio' });
        }
    }

    // Admin: Get all sections (including hidden)
    static async getAllSections(req: Request, res: Response): Promise<void> {
        try {
            const sections = await GuideSection.findAll({
                order: [['order', 'ASC']],
            });
            res.json(sections);
        } catch (error) {
            console.error('Error al obtener secciones de guía:', error);
            res.status(500).json({ message: 'Error al obtener secciones' });
        }
    }

    // Admin: Update a section
    static async updateSection(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { title, content, isVisible, order } = req.body;

            const section = await GuideSection.findByPk(id);
            if (!section) {
                res.status(404).json({ message: 'Sección no encontrada' });
                return;
            }

            await section.update({ title, content, isVisible, order });
            res.json(section);
        } catch (error) {
            console.error('Error al actualizar sección:', error);
            res.status(500).json({ message: 'Error al actualizar la sección' });
        }
    }

    // Admin: Create a new section
    static async createSection(req: Request, res: Response): Promise<void> {
        try {
            const { sectionId, title, content, order, isVisible } = req.body;

            const section = await GuideSection.create({
                sectionId,
                title,
                content,
                order: order || 0,
                isVisible: isVisible ?? true,
            });

            res.status(201).json(section);
        } catch (error) {
            console.error('Error al crear sección:', error);
            res.status(500).json({ message: 'Error al crear la sección' });
        }
    }

    // Admin: Toggle visibility
    static async toggleVisibility(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const section = await GuideSection.findByPk(id);

            if (!section) {
                res.status(404).json({ message: 'Sección no encontrada' });
                return;
            }

            await section.update({ isVisible: !section.isVisible });
            res.json(section);
        } catch (error) {
            console.error('Error al cambiar visibilidad:', error);
            res.status(500).json({ message: 'Error al cambiar visibilidad' });
        }
    }
}
