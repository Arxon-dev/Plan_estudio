import { Router } from 'express';
import { MarketingController } from '../controllers/MarketingController';

const router = Router();

/**
 * @route   GET /api/marketing/pricing
 * @desc    Obtener datos de la página de precios (planes y contenido)
 * @access  Public
 */
router.get('/pricing', MarketingController.getPricingPageData);

export default router;
