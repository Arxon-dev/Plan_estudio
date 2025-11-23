import { Router } from 'express';
import AITestController from '../controllers/AITestController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Todas las rutas de IA requieren autenticación
router.use(authMiddleware);

// Rutas para tests adaptativos y análisis
router.post('/adaptive/start', AITestController.startAdaptiveTest);
router.get('/analysis', AITestController.getAIAnalysis);
router.get('/recommendations', AITestController.getRecommendations);
router.post('/weakness-test', AITestController.createWeaknessTest);

// Rutas administrativas (deberían tener middleware de admin idealmente, pero por ahora auth)
router.post('/generate', AITestController.generateQuestions);

export default router;
