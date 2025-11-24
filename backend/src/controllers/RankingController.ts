import { Request, Response } from 'express';
import User from '../models/User';
import { Op } from 'sequelize';

export class RankingController {

    static async getRanking(req: Request, res: Response): Promise<void> {
        try {
            const { cuerpo, especialidad } = req.query;

            const whereClause: any = {
                perfilPublico: true,
                isBanned: false // Don't show banned users
            };

            if (cuerpo) {
                whereClause.ejercito = cuerpo;
            }

            if (especialidad) {
                whereClause.especialidadFundamental = especialidad;
            }

            const users = await User.findAll({
                where: whereClause,
                attributes: [
                    'id', 'firstName', 'lastName',
                    'puntosConcurso', 'puntosOposicion', 'puntosTotal',
                    'ejercito', 'especialidadFundamental', 'empleo'
                ],
                order: [['puntosTotal', 'DESC']],
                limit: 100 // Limit for performance
            });

            // Mask names if no alias? Or just show First Name + Initial?
            // For now, return as is, frontend can format.

            const ranking = users.map((u, index) => ({
                position: index + 1,
                id: u.id,
                name: u.firstName + ' ' + (u.lastName ? u.lastName[0] + '.' : ''),
                puntosConcurso: u.puntosConcurso,
                puntosOposicion: u.puntosOposicion,
                puntosTotal: u.puntosTotal,
                ejercito: u.ejercito,
                especialidad: u.especialidadFundamental,
                empleo: u.empleo
            }));

            res.json(ranking);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error al obtener ranking' });
        }
    }
}
