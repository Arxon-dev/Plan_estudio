import { Router } from 'express';
import AdminController from '@controllers/AdminController';
import AITestController from '@controllers/AITestController';
import TestController from '@controllers/TestController';
import { authMiddleware } from '@middleware/auth';

const router = Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Obtiene estadísticas generales (solo admin)
 * @access  Private (Admin only)
 */
router.get('/stats', authMiddleware, AdminController.getStatistics);

/**
 * @route   GET /api/admin/check
 * @desc    Verifica si el usuario actual es admin
 * @access  Private
 */
router.get('/check', authMiddleware, AdminController.checkAdminStatus);

/**
 * @route   POST /api/admin/tests/generate
 * @desc    Generar preguntas con IA (solo admin)
 * @access  Private (Admin only)
 */
router.post('/tests/generate', authMiddleware, AITestController.generateQuestions);

/**
 * @route   POST /api/admin/questions/import-gift
 * @desc    Importar preguntas desde formato GIFT (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/import-gift', authMiddleware, TestController.importGiftQuestions);

/**
 * @route   POST /api/admin/questions/import-gift-mixed
 * @desc    Importar preguntas mixtas (simulacros) desde GIFT (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/import-gift-mixed', authMiddleware, TestController.importMixedGiftQuestions);

/**
 * @route   POST /api/admin/questions/preview-gift
 * @desc    Vista previa de importación GIFT sin guardar (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/preview-gift', authMiddleware, TestController.previewGiftImport);

/**
 * @route   GET /api/admin/questions/:themeId
 * @desc    Listar todas las preguntas de un tema (solo admin)
 * @access  Private (Admin only)
 */
router.get('/questions/:themeId', authMiddleware, TestController.getQuestionsByTheme);

/**
 * @route   DELETE /api/admin/questions/:questionId
 * @desc    Eliminar una pregunta específica (solo admin)
 * @access  Private (Admin only)
 */
router.delete('/questions/:questionId', authMiddleware, TestController.deleteQuestion);

/**
 * @route   POST /api/admin/questions/delete-bulk
 * @desc    Eliminar múltiples preguntas (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/delete-bulk', authMiddleware, TestController.deleteBulkQuestions);

/**
 * @route   DELETE /api/admin/questions/theme/:themeId
 * @desc    Eliminar todas las preguntas de un tema (solo admin)
 * @access  Private (Admin only)
 */
router.delete('/questions/theme/:themeId', authMiddleware, TestController.deleteQuestionsByTheme);

export default router;
