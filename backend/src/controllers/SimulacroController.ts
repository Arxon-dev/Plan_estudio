import { Request, Response } from 'express';
import Simulacro from '../models/Simulacro';
import TestQuestion from '../models/TestQuestion';
import TestAttempt from '../models/TestAttempt';
import User from '../models/User';
import { Op } from 'sequelize';
import testService from '../services/TestService';

export class SimulacroController {
    
    // Admin: Generate Question IDs
    static async generateQuestions(req: Request, res: Response): Promise<void> {
        try {
            if (!(req as any).user?.isAdmin) {
                res.status(403).json({ message: 'Acceso denegado' });
                return;
            }

            const { themeIds, count } = req.body;
            
            if (!count || count < 1) {
                res.status(400).json({ message: 'Cantidad de preguntas inválida' });
                return;
            }

            const questionIds = await testService.getQuestionsForSimulacro(themeIds, count);
            res.json({ questionIds, count: questionIds.length });

        } catch (error) {
            console.error('Error generating questions:', error);
            res.status(500).json({ message: 'Error al generar preguntas' });
        }
    }

    // Admin: Create
    static async create(req: Request, res: Response): Promise<void> {
        try {
            if (!(req as any).user?.isAdmin) {
                 res.status(403).json({ message: 'Acceso denegado' });
                 return;
            }

            const { title, description, questionIds, timeLimit, active } = req.body;
            
            const simulacro = await Simulacro.create({
                title,
                description,
                questionIds,
                timeLimit,
                active: active ?? true
            });

            res.status(201).json(simulacro);
        } catch (error) {
            console.error('Error creating simulacro:', error);
            res.status(500).json({ message: 'Error al crear simulacro' });
        }
    }

    // Public/Admin: List
    static async getAll(req: Request, res: Response): Promise<void> {
        try {
            const isAdmin = (req as any).user?.isAdmin;
            const where = isAdmin ? {} : { active: true };

            const simulacros = await Simulacro.findAll({
                where,
                order: [['createdAt', 'DESC']]
            });

            res.json(simulacros);
        } catch (error) {
            console.error('Error fetching simulacros:', error);
            res.status(500).json({ message: 'Error al obtener simulacros' });
        }
    }

    // Get One (with full questions for starting test)
    static async getById(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const simulacro = await Simulacro.findByPk(id);

            if (!simulacro) {
                res.status(404).json({ message: 'Simulacro no encontrado' });
                return;
            }

            // Fetch questions
            const questions = await TestQuestion.findAll({
                where: {
                    id: simulacro.questionIds
                }
            });

            // Create a map for quick lookup
            const questionMap = new Map(questions.map(q => [q.id, q]));
            
            // Order questions as per questionIds array
            const isAdmin = (req as any).user?.isAdmin;
            const orderedQuestions = simulacro.questionIds
                .map(qid => questionMap.get(qid))
                .filter(q => q !== undefined)
                .map(q => {
                    if (isAdmin) return q;
                    const qJson = q.toJSON();
                    const { correctAnswer, explanation, ...rest } = qJson;
                    return rest;
                });

            res.json({
                ...simulacro.toJSON(),
                questions: orderedQuestions
            });
        } catch (error) {
            console.error('Error fetching simulacro:', error);
            res.status(500).json({ message: 'Error al obtener simulacro' });
        }
    }

    // Admin: Update
    static async update(req: Request, res: Response): Promise<void> {
        try {
            if (!(req as any).user?.isAdmin) {
                 res.status(403).json({ message: 'Acceso denegado' });
                 return;
            }

            const { id } = req.params;
            const { title, description, questionIds, timeLimit, active } = req.body;

            const simulacro = await Simulacro.findByPk(id);
            if (!simulacro) {
                res.status(404).json({ message: 'Simulacro no encontrado' });
                return;
            }

            await simulacro.update({
                title,
                description,
                questionIds,
                timeLimit,
                active
            });

            res.json(simulacro);
        } catch (error) {
            console.error('Error updating simulacro:', error);
            res.status(500).json({ message: 'Error al actualizar simulacro' });
        }
    }

    // Admin: Delete
    static async delete(req: Request, res: Response): Promise<void> {
        try {
            if (!(req as any).user?.isAdmin) {
                 res.status(403).json({ message: 'Acceso denegado' });
                 return;
            }

            const { id } = req.params;
            const simulacro = await Simulacro.findByPk(id);
            
            if (!simulacro) {
                res.status(404).json({ message: 'Simulacro no encontrado' });
                return;
            }

            await simulacro.destroy();
            res.json({ message: 'Simulacro eliminado' });
        } catch (error) {
            console.error('Error deleting simulacro:', error);
            res.status(500).json({ message: 'Error al eliminar simulacro' });
        }
    }

    // Get Global Scores / Ranking
    static async getRanking(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params; // simulacroId

            // Find all attempts for this simulacro that passed (or all)
            // We want to show the best attempt per user.
            // Sequelize doesn't support DISTINCT ON easily.
            
            const attempts = await TestAttempt.findAll({
                where: {
                    simulacroId: id,
                    passed: true // Only passed? Or maybe just completed?
                },
                include: [{
                    model: User,
                    as: 'user',
                    attributes: ['id', 'firstName', 'lastName', 'email']
                }],
                order: [['score', 'DESC'], ['timeSpent', 'ASC']],
                // limit: 100 // Fetch enough to filter in memory
            });

            // Filter best attempt per user
            const userBestAttempts = new Map();
            
            for (const attempt of attempts) {
                const userId = attempt.userId;
                if (!userBestAttempts.has(userId)) {
                    userBestAttempts.set(userId, attempt);
                }
            }

            const ranking = Array.from(userBestAttempts.values());

            res.json(ranking);
        } catch (error) {
            console.error('Error fetching ranking:', error);
            res.status(500).json({ message: 'Error al obtener ranking' });
        }
    }
}
