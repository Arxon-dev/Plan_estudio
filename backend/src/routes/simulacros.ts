import { Router } from 'express';
import { SimulacroController } from '../controllers/SimulacroController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Public (Authenticated Users)
router.get('/', authMiddleware, SimulacroController.getAll);
router.get('/:id', authMiddleware, SimulacroController.getById);
router.get('/:id/ranking', authMiddleware, SimulacroController.getRanking);

// Admin only
router.post('/generate-questions', authMiddleware, SimulacroController.generateQuestions);
router.post('/', authMiddleware, SimulacroController.create);
router.put('/:id', authMiddleware, SimulacroController.update);
router.delete('/:id', authMiddleware, SimulacroController.delete);

export default router;
