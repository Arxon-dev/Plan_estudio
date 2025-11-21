import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { checkPremium } from '../middleware/checkPremium';
import TestController from '../controllers/TestController';
import AITestController from '../controllers/AITestController';

const router = Router();

// Todas las rutas requieren autenticación
router.use(authMiddleware);

/**
 * Dashboard y listados
 */
router.get('/dashboard', TestController.getDashboard);
router.get('/themes', TestController.getThemesWithProgress);
router.get('/history', TestController.getHistory);
router.get('/stats', TestController.getStats);
router.get('/ranking', TestController.getUserRanking);
router.get('/weaknesses', TestController.getUserWeaknesses);
router.get('/question/:questionId', TestController.getQuestion);

/**
 * Gestión de tests
 */
router.post('/start', TestController.startTest);
router.post('/:attemptId/complete', TestController.completeTest);
router.get('/results/:attemptId', TestController.getTestResults);
router.post('/weakness-focused', checkPremium, TestController.createWeaknessFocusedTest);

/**
 * Funcionalidades de IA (Premium)
 */
router.post('/adaptive/start', checkPremium, AITestController.startAdaptiveTest);
router.get('/analysis', checkPremium, AITestController.getAIAnalysis);
router.get('/recommendations', checkPremium, AITestController.getRecommendations);
router.post('/weakness-test', checkPremium, AITestController.createWeaknessTest);

export default router;