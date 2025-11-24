import { Request, Response } from 'express';
import User from '../models/User';
import Recompensa from '../models/Recompensa';
import Titulacion from '../models/Titulacion';
import Idioma from '../models/Idioma';
import CursoMilitar from '../models/CursoMilitar';
import { BaremoService } from '../services/BaremoService';

export class BaremoController {

    // Get Baremo Data for User
    static async getBaremo(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const user = await User.findByPk(userId, {
                include: [
                    { model: Recompensa, as: 'recompensas' },
                    { model: Titulacion, as: 'titulacion' },
                    { model: Idioma, as: 'idiomas' },
                    { model: CursoMilitar, as: 'cursosMilitares' }
                ]
            });

            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            res.json(user);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener baremo' });
        }
    }

    // Update Baremo Data
    static async updateBaremo(req: Request, res: Response): Promise<void> {
        try {
            const userId = (req as any).user.id;
            const {
                // Military Data
                ejercito, empleo, agrupacionEspecialidad, especialidadFundamental,
                fechaIngreso, fechaAntiguedad,
                tiempoServiciosUnidadesPreferentes, tiempoServiciosOtrasUnidades, tiempoOperacionesExtranjero,

                // Reports
                notaMediaInformes,

                // Physical Tests
                flexionesTronco, flexionesBrazos, tiempoCarrera, circuitoAgilidad, reconocimientoMedico,

                // Opposition
                pruebaAcertadas, pruebaErroneas,

                // Related Tables Data (Arrays/Objects)
                recompensas, titulacion, idiomas, cursosMilitares,

                // Profile settings
                perfilPublico, sexo
            } = req.body;

            const user = await User.findByPk(userId);
            if (!user) {
                res.status(404).json({ message: 'Usuario no encontrado' });
                return;
            }

            // Update User Fields
            await user.update({
                ejercito, empleo, agrupacionEspecialidad, especialidadFundamental,
                fechaIngreso, fechaAntiguedad,
                tiempoServiciosUnidadesPreferentes, tiempoServiciosOtrasUnidades, tiempoOperacionesExtranjero,
                notaMediaInformes,
                flexionesTronco, flexionesBrazos, tiempoCarrera, circuitoAgilidad, reconocimientoMedico,
                pruebaAcertadas, pruebaErroneas,
                perfilPublico, sexo
            });

            // Update Related Tables (Delete all and recreate approach for simplicity, or smart update)
            // For simplicity in this phase, we'll replace them.

            // Recompensas
            await Recompensa.destroy({ where: { userId } });
            if (recompensas && Array.isArray(recompensas)) {
                await Recompensa.bulkCreate(recompensas.map((r: any) => ({ ...r, userId })));
            }

            // Titulacion (One per user)
            await Titulacion.destroy({ where: { userId } });
            if (titulacion) {
                await Titulacion.create({ ...titulacion, userId });
            }

            // Idiomas
            await Idioma.destroy({ where: { userId } });
            if (idiomas && Array.isArray(idiomas)) {
                await Idioma.bulkCreate(idiomas.map((i: any) => ({ ...i, userId })));
            }

            // Cursos Militares
            await CursoMilitar.destroy({ where: { userId } });
            if (cursosMilitares && Array.isArray(cursosMilitares)) {
                await CursoMilitar.bulkCreate(cursosMilitares.map((c: any) => ({ ...c, userId })));
            }

            // Recalculate Scores
            const updatedUser = await BaremoService.calculateAll(userId);

            res.json(updatedUser);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al actualizar baremo' });
        }
    }
}
