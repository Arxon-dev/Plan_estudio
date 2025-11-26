import { Router } from 'express';
import { SessionController } from '@controllers/SessionController';
import { authMiddleware } from '@middleware/auth';

const router = Router();

// Todas las rutas están protegidas
router.use(authMiddleware);

// Obtener sesiones por fecha
router.get('/', SessionController.getSessionsByDate);

// Obtener agenda del día
router.get('/agenda', SessionController.getAgendaForDate);

// Añadir recomendación a la agenda del día
router.post('/agenda/add', SessionController.addAgendaRecommendation);

// Guardar planificación manual
router.post('/manual-plan/:planId', SessionController.saveManualPlan);

// Completar sesión
router.put('/:sessionId/complete', SessionController.completeSession);

// Marcar sesión en progreso
router.put('/:sessionId/in-progress', SessionController.markInProgress);

// Saltar sesión
router.put('/:sessionId/skip', SessionController.skipSession);

// Actualizar notas de sesión
router.put('/:sessionId/notes', SessionController.updateSessionNotes);

// Rebalancear calendario manualmente
router.post('/rebalance/:planId', SessionController.rebalanceCalendar);

// Actualizar estado del Pomodoro (Heartbeat)
router.post('/:sessionId/pomodoro', SessionController.updatePomodoro);

// Actualizar configuración de Pomodoro
router.put('/settings', SessionController.updateSettings);

export default router;
