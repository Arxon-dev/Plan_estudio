import { Router } from 'express';
import { body } from 'express-validator';
import { StudyPlanController } from '@controllers/StudyPlanController';
import { authMiddleware } from '@middleware/auth';

const router = Router();

// Todas las rutas están protegidas
router.use(authMiddleware);

// Crear nuevo plan
router.post(
  '/',
  [
    body('startDate').isISO8601().withMessage('Fecha de inicio inválida'),
    body('examDate').isISO8601().withMessage('Fecha de examen inválida'),
    body('weeklySchedule').isObject().withMessage('Horario semanal requerido'),
    body('themes').isArray({ min: 1 }).withMessage('Debe proporcionar al menos un tema'),
  ],
  StudyPlanController.createPlan
);

// Obtener plan activo
router.get('/active', StudyPlanController.getActivePlan);

// Obtener sesiones del plan
router.get('/:planId/sessions', StudyPlanController.getPlanSessions);

// Obtener progreso del plan
router.get('/:planId/progress', StudyPlanController.getPlanProgress);

// Obtener estadísticas por tema (dominio)
router.get('/:planId/theme-stats', StudyPlanController.getThemeStats);

// Obtener distribución equitativa por complejidad de temas
router.get('/:planId/equitable-distribution', StudyPlanController.getEquitableDistribution);

// Obtener estadísticas desglosadas por partes de temas
router.get('/:planId/theme-parts-stats', StudyPlanController.getThemePartsStats);

// Estado ligero de generación del calendario
router.get('/:planId/status', StudyPlanController.getGenerationStatus);

// Actualizar estado del plan
router.put('/:planId/status', StudyPlanController.updatePlanStatus);

// TEMPORAL: Eliminar plan activo (para testing)
router.delete('/active', async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const { StudyPlan } = require('@models/index');
    
    const plan = await StudyPlan.findOne({
      where: { userId, status: 'ACTIVE' },
    });

    if (!plan) {
      return res.status(404).json({ error: 'No hay plan activo para eliminar' });
    }

    await plan.destroy();
    res.json({ message: 'Plan activo eliminado correctamente', deletedPlanId: plan.id });
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    res.status(500).json({ error: 'Error al eliminar plan' });
  }
});

// TEMPORAL: Probar sistema de rotación (para testing)
router.post('/test-rotation', async (req: any, res: any) => {
  try {
    const userId = req.user!.id;
    const { StudyPlan, WeeklySchedule, Theme } = require('@models/index');
    const { StudyPlanService } = require('@services/StudyPlanService');
    
    const { startDate, examDate, themes } = req.body;
    
    if (!startDate || !examDate) {
      return res.status(400).json({ error: 'Se requieren startDate y examDate' });
    }

    // Buscar plan activo
    const plan = await StudyPlan.findOne({
      where: { userId, status: 'ACTIVE' },
    });

    if (!plan) {
      return res.status(404).json({ error: 'No hay plan activo' });
    }

    // Obtener horario semanal a través del plan
    const weeklySchedule = await WeeklySchedule.findOne({
      where: { studyPlanId: plan.id },
    });

    if (!weeklySchedule) {
      return res.status(404).json({ error: 'No hay horario semanal configurado' });
    }

    // Obtener temas del request body o usar temas globales
    let themesToUse = themes;
    
    if (!themesToUse || themesToUse.length === 0) {
      // Si no hay temas en el body, buscar temas globales
      const globalThemes = await Theme.findAll({
        order: [['id', 'ASC']],
      });
      themesToUse = globalThemes;
    }

    if (!themesToUse || themesToUse.length === 0) {
      return res.status(404).json({ error: 'No hay temas configurados' });
    }

    console.log(`🔄 Probando sistema de rotación...`);
    console.log(`📅 Período: ${startDate} al ${examDate}`);
    console.log(`📊 Temas: ${themesToUse.length}`);
    
    // Calcular horas semanales de forma segura
    const scheduleValues = Object.values(weeklySchedule.dataValues);
    const weeklyHours = scheduleValues
      .filter((val): val is number => typeof val === 'number')
      .reduce((sum: number, val: number) => sum + val, 0);
    console.log(`⏰ Horas semanales: ${weeklyHours}`);

    // Probar el sistema de rotación
    const result = await StudyPlanService.generateSmartCalendar(
      plan.id,
      new Date(startDate),
      new Date(examDate),
      weeklySchedule,
      themesToUse
    );

    if (result.success) {
      console.log(`✅ Sistema de rotación exitoso: ${result.sessions!.length} sesiones generadas`);
      
      // Análisis de cobertura de fechas
      const sessions = result.sessions!;
      const firstDate = new Date(Math.min(...sessions.map((s: any) => new Date(s.lastStudied).getTime())));
      const lastDate = new Date(Math.max(...sessions.map((s: any) => new Date(s.lastStudied).getTime())));
      
      res.json({
        success: true,
        totalSessions: sessions.length,
        firstSession: firstDate,
        lastSession: lastDate,
        coverageDays: Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1,
        requestedStart: startDate,
        requestedEnd: examDate,
        sessions: sessions.slice(0, 10) // Primeras 10 sesiones para ejemplo
      });
    } else {
      console.error(`❌ Error en sistema de rotación: ${result.message}`);
      res.status(500).json({
        success: false,
        error: result.message
      });
    }
  } catch (error) {
    console.error('Error al probar rotación:', error);
    res.status(500).json({ error: 'Error al probar sistema de rotación' });
  }
});

export default router;
