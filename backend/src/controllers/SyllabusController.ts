import { Request, Response } from 'express';
import Block from '@models/Block';
import Theme from '@models/Theme';

export class SyllabusController {
    // --- BLOCKS ---

    static async getSyllabus(req: Request, res: Response): Promise<void> {
        try {
            const blocks = await Block.findAll({
                order: [['order', 'ASC']],
                include: [{
                    model: Theme,
                    as: 'themes',
                    attributes: ['id', 'title', 'themeNumber', 'estimatedHours', 'parts', 'complexity'],
                    order: [['themeNumber', 'ASC']]
                }]
            });
            res.json(blocks);
        } catch (error) {
            console.error('Error al obtener temario:', error);
            res.status(500).json({ message: 'Error al obtener el temario' });
        }
    }

    static async createBlock(req: Request, res: Response): Promise<void> {
        try {
            const { code, name, description, order } = req.body;
            const block = await Block.create({ code, name, description, order });
            res.status(201).json(block);
        } catch (error) {
            console.error('Error al crear bloque:', error);
            res.status(500).json({ message: 'Error al crear el bloque' });
        }
    }

    static async updateBlock(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { name, description, order } = req.body;

            const block = await Block.findByPk(id);
            if (!block) {
                res.status(404).json({ message: 'Bloque no encontrado' });
                return;
            }

            await block.update({ name, description, order });
            res.json(block);
        } catch (error) {
            console.error('Error al actualizar bloque:', error);
            res.status(500).json({ message: 'Error al actualizar el bloque' });
        }
    }

    static async deleteBlock(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const block = await Block.findByPk(id);

            if (!block) {
                res.status(404).json({ message: 'Bloque no encontrado' });
                return;
            }

            // Optional: Check for themes before delete or rely on CASCADE (if configured) or SET NULL
            // Our migration set SET NULL, so themes will become orphaned (blockId=null)
            await block.destroy();
            res.json({ message: 'Bloque eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar bloque:', error);
            res.status(500).json({ message: 'Error al eliminar el bloque' });
        }
    }

    static async reorderBlocks(req: Request, res: Response): Promise<void> {
        try {
            const { blocks } = req.body; // Array of { id, order }

            await Promise.all(blocks.map((b: any) =>
                Block.update({ order: b.order }, { where: { id: b.id } })
            ));

            res.json({ message: 'Orden actualizado correctamente' });
        } catch (error) {
            console.error('Error al reordenar bloques:', error);
            res.status(500).json({ message: 'Error al reordenar bloques' });
        }
    }

    // --- THEMES ---

    static async createTheme(req: Request, res: Response): Promise<void> {
        try {
            const { blockId, themeNumber, title, content, estimatedHours, parts, complexity } = req.body;

            // Fetch block to get code for legacy support
            const block = await Block.findByPk(blockId);
            if (!block) {
                res.status(404).json({ message: 'Bloque no encontrado' });
                return;
            }

            const theme = await Theme.create({
                blockId,
                block: block.code as any, // Legacy support
                themeNumber,
                title,
                content,
                estimatedHours,
                parts,
                complexity
            });

            res.status(201).json(theme);
        } catch (error) {
            console.error('Error al crear tema:', error);
            res.status(500).json({ message: 'Error al crear el tema' });
        }
    }

    static async updateTheme(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const { blockId, themeNumber, title, content, estimatedHours, parts, complexity } = req.body;

            const theme = await Theme.findByPk(id);
            if (!theme) {
                res.status(404).json({ message: 'Tema no encontrado' });
                return;
            }

            const updates: any = { themeNumber, title, content, estimatedHours, parts, complexity };

            if (blockId && blockId !== theme.blockId) {
                const block = await Block.findByPk(blockId);
                if (block) {
                    updates.blockId = blockId;
                    updates.block = block.code; // Legacy support
                }
            }

            await theme.update(updates);
            res.json(theme);
        } catch (error) {
            console.error('Error al actualizar tema:', error);
            res.status(500).json({ message: 'Error al actualizar el tema' });
        }
    }

    static async deleteTheme(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const theme = await Theme.findByPk(id);

            if (!theme) {
                res.status(404).json({ message: 'Tema no encontrado' });
                return;
            }

            await theme.destroy();
            res.json({ message: 'Tema eliminado correctamente' });
        } catch (error) {
            console.error('Error al eliminar tema:', error);
            res.status(500).json({ message: 'Error al eliminar el tema' });
        }
    }
}
