import { Request, Response } from 'express';
import { Theme, ThemeBlock } from '@models/index';
import { AuthRequest } from '@middleware/auth';

export class ThemeController {
  // Obtener todos los temas
  static async getAllThemes(req: Request, res: Response): Promise<void> {
    try {
      const { block } = req.query;

      const where: any = {};
      if (block) {
        where.block = block;
      }

      const themes = await Theme.findAll({
        where,
        order: [
          ['block', 'ASC'],
          ['themeNumber', 'ASC'],
        ],
      });

      res.json({ themes });
    } catch (error) {
      console.error('Error al obtener temas:', error);
      res.status(500).json({ error: 'Error al obtener temas' });
    }
  }

  // Obtener un tema por ID
  static async getThemeById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const theme = await Theme.findByPk(id);

      if (!theme) {
        res.status(404).json({ error: 'Tema no encontrado' });
        return;
      }

      res.json({ theme });
    } catch (error) {
      console.error('Error al obtener tema:', error);
      res.status(500).json({ error: 'Error al obtener tema' });
    }
  }

  // Actualizar contenido de un tema
  static async updateTheme(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { title, content, estimatedHours } = req.body;

      const theme = await Theme.findByPk(id);

      if (!theme) {
        res.status(404).json({ error: 'Tema no encontrado' });
        return;
      }

      await theme.update({
        title: title || theme.title,
        content: content !== undefined ? content : theme.content,
        estimatedHours: estimatedHours || theme.estimatedHours,
      });

      res.json({
        message: 'Tema actualizado exitosamente',
        theme,
      });
    } catch (error) {
      console.error('Error al actualizar tema:', error);
      res.status(500).json({ error: 'Error al actualizar tema' });
    }
  }

  // Obtener temas agrupados por bloque
  static async getThemesByBlock(req: Request, res: Response): Promise<void> {
    try {
      const { Block } = await import('@models/index'); // Dynamic import to avoid circular deps if any

      const themes = await Theme.findAll({
        include: [{ model: Block, as: 'blockData' }],
        order: [
          ['blockData', 'order', 'ASC'],
          ['themeNumber', 'ASC'],
        ],
      });

      // Group by block code to maintain backward compatibility
      const themesByBlock: any = {};

      themes.forEach((theme: any) => {
        const blockCode = theme.blockData?.code || theme.block; // Fallback to legacy block column
        if (!themesByBlock[blockCode]) {
          themesByBlock[blockCode] = [];
        }
        themesByBlock[blockCode].push(theme);
      });

      res.json({ themesByBlock });
    } catch (error) {
      console.error('Error al obtener temas por bloque:', error);
      res.status(500).json({ error: 'Error al obtener temas por bloque' });
    }
  }

  // Método temporal para actualizar complejidad de temas
  static async updateThemesComplexity(req: Request, res: Response): Promise<void> {
    try {
      const { ThemeComplexity } = await import('../models/Theme');

      // Datos de complejidad por bloque y número de tema
      const complexityData = {
        [ThemeBlock.ORGANIZACION]: {
          1: ThemeComplexity.MEDIUM,
          2: ThemeComplexity.MEDIUM,
          3: ThemeComplexity.HIGH,
          4: ThemeComplexity.MEDIUM,
          5: ThemeComplexity.MEDIUM,
          6: ThemeComplexity.HIGH,
        },
        [ThemeBlock.JURIDICO_SOCIAL]: {
          1: ThemeComplexity.HIGH,
          2: ThemeComplexity.MEDIUM,
          3: ThemeComplexity.MEDIUM,
          4: ThemeComplexity.HIGH,
          5: ThemeComplexity.MEDIUM,
          6: ThemeComplexity.MEDIUM,
          7: ThemeComplexity.MEDIUM,
          8: ThemeComplexity.HIGH,
        },
        [ThemeBlock.SEGURIDAD_NACIONAL]: {
          1: ThemeComplexity.HIGH,
          2: ThemeComplexity.HIGH,
          3: ThemeComplexity.MEDIUM,
          4: ThemeComplexity.MEDIUM,
          5: ThemeComplexity.MEDIUM,
          6: ThemeComplexity.MEDIUM,
          7: ThemeComplexity.HIGH,
        },
      };

      let updatedCount = 0;

      // Actualizar cada tema
      for (const [block, themes] of Object.entries(complexityData)) {
        for (const [themeNumber, complexity] of Object.entries(themes)) {
          const [updatedRows] = await Theme.update(
            { complexity },
            {
              where: {
                block: block as ThemeBlock,
                themeNumber: parseInt(themeNumber),
              },
            }
          );

          if (updatedRows > 0) {
            updatedCount++;
            console.log(`✅ Tema ${block}-${themeNumber} actualizado a ${complexity}`);
          }
        }
      }

      res.json({
        message: 'Complejidad de temas actualizada exitosamente',
        updatedCount,
      });
    } catch (error) {
      console.error('Error al actualizar complejidad de temas:', error);
      res.status(500).json({ error: 'Error al actualizar complejidad de temas' });
    }
  }
}
