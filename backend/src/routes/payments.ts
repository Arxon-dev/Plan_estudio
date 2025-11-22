import { Router } from 'express';
import { PaymentController } from '../controllers/PaymentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All routes here are prefixed with /api/payments

// Create checkout session
router.post('/checkout', authMiddleware, PaymentController.createCheckoutSession);

// Create portal session
router.post('/portal', authMiddleware, PaymentController.createPortalSession);

// Webhook is handled in index.ts to support raw body

export default router;
