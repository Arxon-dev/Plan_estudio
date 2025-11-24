import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { BaremoController } from '../controllers/BaremoController';

const router = Router();

router.use(authMiddleware);

router.get('/', BaremoController.getBaremo);
router.put('/', BaremoController.updateBaremo);

export default router;
