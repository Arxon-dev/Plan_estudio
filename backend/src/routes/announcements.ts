import { Router } from 'express';
import { AnnouncementController } from '../controllers/AnnouncementController';

const router = Router();

/**
 * @route   GET /api/announcements/active
 * @desc    Obtener el aviso activo actual
 * @access  Public
 */
router.get('/active', AnnouncementController.getActiveAnnouncement);

export default router;
