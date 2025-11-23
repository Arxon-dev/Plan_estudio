import { Router } from 'express';
import { GuideController } from '../controllers/GuideController';

const router = Router();

/**
 * @route   GET /api/guide
 * @desc    Obtener guía de estudio pública
 * @access  Public
 */
router.get('/', GuideController.getPublicSections);

export default router;
