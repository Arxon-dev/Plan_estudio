import { Router } from 'express';
import authRoutes from './auth';
import themeRoutes from './themes';
import studyPlanRoutes from './studyPlans';
import sessionRoutes from './sessions';

const router = Router();

// Rutas de autenticación
router.use('/auth', authRoutes);

// Rutas de temas
router.use('/themes', themeRoutes);

// Rutas de planes de estudio
router.use('/study-plans', studyPlanRoutes);

// Rutas de sesiones
router.use('/sessions', sessionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API funcionando correctamente' });
});

export default router;
