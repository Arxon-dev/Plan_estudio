import { Router } from 'express';
import AdminController from '@controllers/AdminController';
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

export default router;
