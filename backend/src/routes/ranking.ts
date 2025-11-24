import { Router } from 'express';
import { authMiddleware } from '../middleware/auth';
import { RankingController } from '../controllers/RankingController';

const router = Router();

router.use(authMiddleware);

router.get('/', RankingController.getRanking);

export default router;
