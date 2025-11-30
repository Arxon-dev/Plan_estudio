import { Request, Response } from 'express';
import User from '../models/User';
import Recompensa from '../models/Recompensa';
import Titulacion from '../models/Titulacion';
import Idioma from '../models/Idioma';
import CursoMilitar from '../models/CursoMilitar';
import { BaremoService } from '../services/BaremoService';

export class AdminBaremoController {

    // Get Baremo Data for specific User (Admin only)
    static async getUserBaremo(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
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
            console.error('Error fetching user baremo:', error);
            res.status(500).json({ message: 'Error al obtener baremo del usuario' });
        }
    }

    // Update Baremo Data for specific User (Admin only)
    static async updateUserBaremo(req: Request, res: Response): Promise<void> {
        try {
            const userId = req.params.userId;
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

                // Profile settings (optional updates via baremo)
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

            // Update Related Tables (Replace strategy)
            
            // Recompensas
            await Recompensa.destroy({ where: { userId } });
            if (recompensas && Array.isArray(recompensas)) {
                await Recompensa.bulkCreate(recompensas.map((r: any) => ({ 
                    ...r, 
                    id: undefined, // Ensure new IDs are generated
                    userId 
                })));
            }

            // Titulacion (One per user)
            await Titulacion.destroy({ where: { userId } });
            if (titulacion) {
                await Titulacion.create({ 
                    ...titulacion, 
                    id: undefined,
                    userId 
                });
            }

            // Idiomas
            await Idioma.destroy({ where: { userId } });
            if (idiomas && Array.isArray(idiomas)) {
                await Idioma.bulkCreate(idiomas.map((i: any) => ({ 
                    ...i, 
                    id: undefined,
                    userId 
                })));
            }

            // Cursos Militares
            await CursoMilitar.destroy({ where: { userId } });
            if (cursosMilitares && Array.isArray(cursosMilitares)) {
                await CursoMilitar.bulkCreate(cursosMilitares.map((c: any) => ({ 
                    ...c, 
                    id: undefined,
                    userId 
                })));
            }

            // Recalculate Scores
            // Ensure ID is parsed as number for Service
            const updatedUser = await BaremoService.calculateAll(Number(userId));

            res.json(updatedUser);
        } catch (error) {
            console.error('Error updating user baremo:', error);
            res.status(500).json({ message: 'Error al actualizar baremo del usuario' });
        }
    }
}
