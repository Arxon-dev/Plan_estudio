import { Request, Response } from 'express';
import { StudySession, Theme, SessionStatus, StudyPlan, PlanThemeStats, WeeklySchedule } from '@models/index';
import { StudyPlanService } from '@services/StudyPlanService';
import { addDays } from 'date-fns';
import { AuthRequest } from '@middleware/auth';
import { Op } from 'sequelize';
import UnlockService from '@services/UnlockService';

export class SessionController {
  // Agenda del día: prioriza repasos y respeta capacidad diaria
  static async getAgendaForDate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId, date } = req.query as { planId?: string; date?: string };
      if (!planId || !date) {
        res.status(400).json({ error: 'Se requieren planId y date (YYYY-MM-DD)' });
        return;
      }

      const userId = req.user!.id;
      const plan = await StudyPlan.findOne({
        where: { id: Number(planId), userId },
        include: [{ model: WeeklySchedule, as: 'weeklySchedule' }],
      } as any);

      if (!plan || !(plan as any).weeklySchedule) {
        res.status(404).json({ error: 'Plan no encontrado o sin horario semanal' });
        return;
      }

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const weekly = (plan as any).weeklySchedule as WeeklySchedule;
      const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
      const capacityHours = Number((weekly as any)[names[dayStart.getDay()]]) || 0;

      // Sesiones del día (pendientes y en progreso)
      const sessions = await StudySession.findAll({
        where: {
          studyPlanId: Number(planId),
          status: { [Op.in]: [SessionStatus.PENDING, SessionStatus.IN_PROGRESS] },
          scheduledDate: { [Op.gte]: dayStart, [Op.lt]: dayEnd },
        },
        include: [
          { model: Theme, as: 'theme', attributes: ['id', 'block', 'themeNumber', 'title'] },
        ],
        order: [['scheduledDate', 'ASC']],
      } as any);

      const usedHours = sessions.reduce((s: number, sess: any) => s + Number(sess.scheduledHours || 0), 0);
      const freeHours = Math.max(0, capacityHours - usedHours);

      // Priorizar repasos y simulacros en la presentación
      const isReview = (sess: any) => (sess.sessionType === 'REVIEW') || ((sess.notes || '').toUpperCase().includes('REPASO'));
      const isSimulation = (sess: any) => (sess.sessionType === 'SIMULATION') || ((sess.notes || '').toUpperCase().includes('SIMULACRO'));
      const prioritized = sessions.slice().sort((a: any, b: any) => {
        const ra = isReview(a) ? 0 : isSimulation(a) ? 1 : 2; // REVIEW < SIMULATION < STUDY
        const rb = isReview(b) ? 0 : isSimulation(b) ? 1 : 2;
        if (ra !== rb) return ra - rb;
        return new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime();
      });

      // Sugerencias para rellenar hueco: temas con menor EF o éxito
      let recommendations: any[] = [];
      if (freeHours > 0) {
        const stats = await PlanThemeStats.findAll({
          where: { studyPlanId: Number(planId) },
          include: [{ model: Theme, as: 'theme', attributes: ['id', 'title'] }],
        } as any);
        const sorted = stats
          .map((st: any) => ({
            themeId: st.themeId,
            title: st.theme?.title || `Tema ${st.themeId}`,
            easeFactor: Number(st.easeFactor || 2.5),
            successRate: Number(st.successRate || 1.0),
          }))
          .sort((a, b) => {
            // Menor EF y menor éxito primero
            if (a.easeFactor !== b.easeFactor) return a.easeFactor - b.easeFactor;
            return a.successRate - b.successRate;
          })
          .slice(0, 3);

        let remaining = freeHours;
        for (const t of sorted) {
          if (remaining <= 0) break;
          const chunk = Math.min(1, remaining);
          recommendations.push({
            type: 'REVIEW_SUGGESTION',
            themeId: t.themeId,
            title: t.title,
            recommendedHours: chunk,
            note: `Repaso sugerido (EF ${t.easeFactor.toFixed(2)}, éxito ${(t.successRate * 100).toFixed(0)}%)`,
          });
          remaining -= chunk;
        }
      }

      res.json({
        date,
        capacityHours,
        usedHours,
        freeHours,
        sessions: prioritized,
        recommendations,
      });
    } catch (error) {
      console.error('Error al obtener agenda del día:', error);
      res.status(500).json({ error: 'Error al obtener agenda' });
    }
  }
  // Marcar sesión como completada
  static async completeSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { completedHours, notes, difficulty, keyPoints } = req.body;

      const session = await StudySession.findByPk(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Sesión no encontrada' });
        return;
      }

      await session.update({
        status: SessionStatus.COMPLETED,
        completedHours: completedHours || session.scheduledHours,
        notes: notes || session.notes,
        difficulty: difficulty || session.difficulty,
        keyPoints: keyPoints || session.keyPoints,
        // Ensure actualDuration is at least the completedHours if not set
        actualDuration: session.actualDuration || Math.round((completedHours || session.scheduledHours) * 60)
      });

      // 🔓 Desbloquear tema para tests si es sesión de STUDY
      const userId = req.user!.id;
      if (session.sessionType === 'STUDY') {
        try {
          await UnlockService.unlockByStudySession(userId, session.themeId);
          console.log(`🔓 Tema ${session.themeId} desbloqueado para tests (usuario ${userId})`);
        } catch (unlockErr) {
          console.warn('⚠️ Error al desbloquear tema:', unlockErr);
        }
      }

      // Programar próximo repaso automático y actualizar estadísticas por tema (SM-2 simplificado)
      try {
        const plan = await StudyPlan.findByPk(session.studyPlanId);
        if (plan) {
          const examDay = new Date(plan.examDate);
          const today = new Date();

          // Obtener/crear stats por tema dentro del plan
          let stats = await PlanThemeStats.findOne({
            where: { studyPlanId: plan.id, themeId: session.themeId },
          });
          if (!stats) {
            stats = await PlanThemeStats.create({
              studyPlanId: plan.id,
              themeId: session.themeId,
              easeFactor: 2.5,
              intervalDays: 1,
              lastReviewedAt: today,
              successRate: 1.0,
              totalReviews: 0,
              totalHoursSpent: 0,
            });
          }

          const q = Math.max(0, Math.min(5, Number(difficulty || 3)));
          const prevEF = Number(stats.easeFactor);
          const prevInterval = Number(stats.intervalDays);
          const prevTotalReviews = Number(stats.totalReviews);
          const prevSuccess = Number(stats.successRate);
          const hoursSpent = Number(completedHours || session.scheduledHours || 0);

          // Ajuste EF (SM-2)
          const newEF = Math.max(
            1.3,
            prevEF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
          );

          // Cálculo de nuevo intervalo
          let newInterval: number;
          if (q < 3) {
            newInterval = 1;
          } else if (prevTotalReviews <= 0) {
            newInterval = 1;
          } else if (prevTotalReviews === 1) {
            newInterval = 6;
          } else {
            newInterval = Math.max(1, Math.round(prevInterval * newEF));
          }

          // Actualizar stats
          const newTotalReviews = prevTotalReviews + 1;
          const newSuccessRate = Number(
            ((prevSuccess * prevTotalReviews + q / 5) / newTotalReviews).toFixed(2)
          );

          await stats.update({
            easeFactor: newEF,
            intervalDays: newInterval,
            lastReviewedAt: today,
            successRate: newSuccessRate,
            totalReviews: newTotalReviews,
            totalHoursSpent: Number((Number(stats.totalHoursSpent) + hoursSpent).toFixed(2)),
          });

          // Calcular dueDate máximo (día previo al examen)
          const bufferEnd = addDays(new Date(examDay), -1);
          const dueDate = addDays(today, newInterval);
          const scheduledDate = dueDate > bufferEnd ? bufferEnd : dueDate;

          // Cargar tema para enriquecer notas
          const dbTheme = await Theme.findByPk(session.themeId);
          const themeTitle = dbTheme ? dbTheme.title : `Tema ${session.themeId}`;

          // Crear nueva sesión de repaso (campo sessionType omitido para compatibilidad)
          const created = await StudySession.create({
            studyPlanId: plan.id,
            themeId: session.themeId,
            scheduledDate: scheduledDate,
            scheduledHours: 0.5,
            status: SessionStatus.PENDING,
            notes: `[REVIEW auto] Próximo repaso (${newInterval} días, EF ${newEF.toFixed(2)}): ${themeTitle}`,
          });

          // REBALANCEO TEMPORALMENTE DESACTIVADO por problemas de rendimiento
          // El rebalanceo se hará manual cuando el usuario lo solicite
          // o se ejecutará como proceso en segundo plano
          // 
          // Solo rebalancear si la nueva sesión es significativa (más de 0.1 horas)
          // o si hay muchas sesiones en el plan (para evitar rebalanceos innecesarios)
          // const totalSessions = await StudySession.count({
          //   where: { studyPlanId: plan.id, status: SessionStatus.PENDING }
          // });
          // 
          // if (created.scheduledHours > 0.1 || totalSessions > 50) {
          //   // Rebalancear desde la fecha programada para respetar horas diarias
          //   await StudyPlanService.rebalanceFromDate(plan.id, created.scheduledDate as any);
          // }
        }
      } catch (autoErr) {
        console.warn('⚠️ No se pudo programar el próximo repaso automáticamente:', autoErr);
      }

      res.json({
        message: 'Sesión completada exitosamente',
        session,
      });
    } catch (error) {
      console.error('Error al completar sesión:', error);
      res.status(500).json({ error: 'Error al completar sesión' });
    }
  }

  // Actualizar notas de la sesión
  static async updateSessionNotes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { notes } = req.body;

      const session = await StudySession.findByPk(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Sesión no encontrada' });
        return;
      }

      await session.update({ notes });

      res.json({
        message: 'Notas actualizadas exitosamente',
        session,
      });
    } catch (error) {
      console.error('Error al actualizar notas:', error);
      res.status(500).json({ error: 'Error al actualizar notas' });
    }
  }

  // Obtener sesiones por fecha
  static async getSessionsByDate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId, startDate, endDate } = req.query;

      const where: any = { studyPlanId: planId };

      if (startDate && endDate) {
        where.scheduledDate = {
          [require('sequelize').Op.between]: [new Date(startDate as string), new Date(endDate as string)],
        };
      }

      const sessions = await StudySession.findAll({
        where,
        include: [
          {
            model: Theme,
            as: 'theme',
            attributes: ['id', 'block', 'themeNumber', 'title'],
          },
        ],
        order: [['scheduledDate', 'ASC']],
      });

      res.json({ sessions });
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      res.status(500).json({ error: 'Error al obtener sesiones' });
    }
  }

  // Saltar sesión
  static async skipSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { reason } = req.body;

      const session = await StudySession.findByPk(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Sesión no encontrada' });
        return;
      }

      // Guardar información original antes de actualizar
      const originalDate = new Date(session.scheduledDate);
      const originalHours = Number(session.scheduledHours);
      const originalThemeId = session.themeId;
      const originalNotes = session.notes || '';

      // Marcar sesión como saltada
      const skipReason = reason || 'Sesión omitida';
      await session.update({
        status: SessionStatus.SKIPPED,
        notes: `[SALTADA] ${skipReason} - ${originalDate.toLocaleDateString()}`,
      });

      console.log(`⏭️ Sesión ${sessionId} saltada. Buscando día para reprogramar...`);

      // Intentar reprogramar automáticamente
      try {
        const plan = await StudyPlan.findByPk(session.studyPlanId, {
          include: [{ model: WeeklySchedule, as: 'weeklySchedule' }],
        } as any);

        if (!plan || !(plan as any).weeklySchedule) {
          console.warn('⚠️ No se pudo reprogramar: plan sin horario semanal');
          res.json({
            message: 'Sesión saltada (no se pudo reprogramar automáticamente)',
            session,
            rescheduled: false,
          });
          return;
        }

        const weekly = (plan as any).weeklySchedule as WeeklySchedule;
        const examDay = new Date((plan as any).examDate);
        const bufferEnd = addDays(examDay, -1);

        // Buscar el siguiente día disponible con capacidad
        const nextDay = await this.findNextAvailableDay(
          session.studyPlanId,
          originalHours,
          new Date(),
          bufferEnd,
          weekly,
          originalThemeId
        );

        if (nextDay) {
          // Crear sesión reprogramada
          const rescheduledSession = await StudySession.create({
            studyPlanId: session.studyPlanId,
            themeId: originalThemeId,
            scheduledDate: nextDay,
            scheduledHours: originalHours,
            status: SessionStatus.PENDING,
            sessionType: session.sessionType,
            reviewStage: session.reviewStage,
            notes: `[REPROGRAMADA] ${originalNotes} (original: ${originalDate.toLocaleDateString()})`,
          } as any);

          console.log(`✅ Sesión reprogramada para ${nextDay.toLocaleDateString()}`);

          res.json({
            message: 'Sesión saltada y reprogramada automáticamente',
            session,
            rescheduledSession,
            rescheduled: true,
            newDate: nextDay.toISOString(),
          });
        } else {
          console.warn('⚠️ No hay días disponibles para reprogramar');
          res.json({
            message: 'Sesión saltada (no hay capacidad disponible para reprogramar)',
            session,
            rescheduled: false,
            warning: 'No se encontró espacio disponible en el calendario',
          });
        }
      } catch (rescheduleError) {
        console.error('⚠️ Error al reprogramar sesión:', rescheduleError);
        res.json({
          message: 'Sesión saltada (error al reprogramar)',
          session,
          rescheduled: false,
        });
      }
    } catch (error) {
      console.error('Error al saltar sesión:', error);
      res.status(500).json({ error: 'Error al saltar sesión' });
    }
  }

  /**
   * Encuentra el siguiente día disponible con capacidad suficiente
   * Aplica límite flexible: ignora límite de temas por día para sesiones reprogramadas
   */
  private static async findNextAvailableDay(
    planId: number,
    hoursNeeded: number,
    startFrom: Date,
    bufferEnd: Date,
    weeklySchedule: WeeklySchedule,
    themeId: number
  ): Promise<Date | null> {
    let currentDate = addDays(startFrom, 1);
    currentDate.setHours(0, 0, 0, 0);
    const bufferEndDay = new Date(bufferEnd);
    bufferEndDay.setHours(0, 0, 0, 0);

    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

    while (currentDate <= bufferEndDay) {
      const dayOfWeek = currentDate.getDay();
      const dayName = dayNames[dayOfWeek];
      const dayCapacity = Number((weeklySchedule as any)[dayName]) || 0;

      // Si el día no tiene horas configuradas, saltar
      if (dayCapacity <= 0) {
        currentDate = addDays(currentDate, 1);
        continue;
      }

      // Calcular horas usadas en este día
      const dayStart = new Date(currentDate);
      const dayEnd = addDays(dayStart, 1);

      const sessionsInDay = await StudySession.findAll({
        where: {
          studyPlanId: planId,
          status: { [Op.in]: [SessionStatus.PENDING, SessionStatus.IN_PROGRESS] },
          scheduledDate: { [Op.between]: [dayStart, dayEnd] },
        },
      } as any);

      const usedHours = sessionsInDay.reduce(
        (sum: number, sess: any) => sum + Number(sess.scheduledHours || 0),
        0
      );
      const freeHours = dayCapacity - usedHours;

      // ✅ LÍMITE FLEXIBLE: Si hay capacidad de horas, permitir (ignorar límite de temas)
      if (freeHours >= hoursNeeded) {
        // Verificar límite de repasos del mismo tema por día (máximo 2)
        const sameThemeSessions = sessionsInDay.filter(
          (sess: any) => sess.themeId === themeId
        );

        if (sameThemeSessions.length < 2) {
          // Día válido encontrado
          return new Date(currentDate);
        } else {
          console.log(
            `⚠️ Día ${currentDate.toLocaleDateString()} ya tiene ${sameThemeSessions.length} sesiones del tema ${themeId}, buscando otro día...`
          );
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    // No se encontró día disponible
    return null;
  }

  // Marcar sesión en progreso (parcialmente completada)
  static async markInProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { completedHours, notes } = req.body;

      const session = await StudySession.findByPk(sessionId);

      if (!session) {
        res.status(404).json({ error: 'Sesión no encontrada' });
        return;
      }

      await session.update({
        status: SessionStatus.IN_PROGRESS,
        completedHours: completedHours || 0,
        notes: notes || session.notes,
      });

      res.json({
        message: 'Sesión marcada como en progreso',
        session,
      });
    } catch (error) {
      console.error('Error al actualizar sesión:', error);
      res.status(500).json({ error: 'Error al actualizar sesión' });
    }
  }

  // Guardar planificación manual
  static async saveManualPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const { sessions } = req.body;
      const userId = req.user!.id;

      // Verificar que el plan pertenece al usuario
      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
      });

      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      // Eliminar sesiones pendientes existentes
      await StudySession.destroy({
        where: {
          studyPlanId: planId,
          status: SessionStatus.PENDING,
        },
      });

      // Crear nuevas sesiones
      const createdSessions = await StudySession.bulkCreate(
        sessions.map((session: any) => ({
          studyPlanId: planId,
          themeId: session.themeId,
          scheduledDate: new Date(session.scheduledDate),
          scheduledHours: session.scheduledHours,
          status: SessionStatus.PENDING,
          sessionType: session.sessionType || 'STUDY'
        }))
      );

      res.json({
        message: 'Plan manual guardado exitosamente',
        sessions: createdSessions,
      });
    } catch (error) {
      console.error('Error al guardar plan manual:', error);
      res.status(500).json({ error: 'Error al guardar plan manual' });
    }
  }

  // Rebalancear manualmente el calendario (endpoint para optimización manual)
  static async rebalanceCalendar(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = req.user!.id;

      // Verificar que el plan pertenece al usuario
      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
        include: [{ model: WeeklySchedule, as: 'weeklySchedule' }],
      } as any);

      if (!plan || !(plan as any).weeklySchedule) {
        res.status(404).json({ error: 'Plan no encontrado o sin horario semanal' });
        return;
      }

      // Ejecutar rebalanceo desde hoy
      const today = new Date();
      await StudyPlanService.rebalanceFromDate(Number(planId), today);

      res.json({
        message: 'Calendario rebalanceado exitosamente',
        messageDetail: 'Las sesiones se han redistribuido para optimizar el uso del tiempo'
      });
    } catch (error) {
      console.error('Error al rebalancear calendario:', error);
      res.status(500).json({ error: 'Error al rebalancear calendario' });
    }
  }

  // Materializar recomendación en sesión del día
  static async addAgendaRecommendation(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId, date, themeId, hours } = req.body as { planId: number; date: string; themeId: number; hours: number };
      if (!planId || !date || !themeId || !hours) {
        res.status(400).json({ error: 'Se requieren planId, date, themeId y hours' });
        return;
      }

      const userId = req.user!.id;
      const plan = await StudyPlan.findOne({
        where: { id: Number(planId), userId },
        include: [{ model: WeeklySchedule, as: 'weeklySchedule' }],
      } as any);

      if (!plan || !(plan as any).weeklySchedule) {
        res.status(404).json({ error: 'Plan no encontrado o sin horario semanal' });
        return;
      }

      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const weekly = (plan as any).weeklySchedule as WeeklySchedule;
      const names = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
      const capacityHours = Number((weekly as any)[names[dayStart.getDay()]]) || 0;

      const sessions = await StudySession.findAll({
        where: {
          studyPlanId: Number(planId),
          status: { [Op.in]: [SessionStatus.PENDING, SessionStatus.IN_PROGRESS] },
          scheduledDate: { [Op.between]: [dayStart, dayEnd] },
        },
      } as any);

      const usedHours = sessions.reduce((s: number, sess: any) => s + Number(sess.scheduledHours || 0), 0);
      if (usedHours + Number(hours) > capacityHours) {
        res.status(400).json({ error: 'No hay capacidad suficiente en ese día para añadir la sesión' });
        return;
      }

      const created = await StudySession.create({
        studyPlanId: Number(planId),
        themeId: Number(themeId),
        scheduledDate: dayStart,
        scheduledHours: Number(hours),
        status: SessionStatus.PENDING,
        notes: `[REVIEW sugerencia] Repaso añadido manualmente`,
      } as any);

      // Opcional: reequilibrar desde ese día
      await StudyPlanService.rebalanceFromDate(Number(planId), dayStart);

      res.json({ message: 'Sesión añadida a la agenda', session: created });
    } catch (error) {
      console.error('Error al añadir recomendación a agenda:', error);
      res.status(500).json({ error: 'Error al añadir recomendación' });
    }
  }

  // Actualizar estado del Pomodoro (Heartbeat)
  static async updatePomodoro(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const { pomodorosCompleted, actualDuration, interruptions, status } = req.body;

      const session = await StudySession.findByPk(sessionId);
      if (!session) {
        res.status(404).json({ error: 'Sesión no encontrada' });
        return;
      }

      // Calcular concentration score
      // Score = (Tiempo Total - Tiempo Interrupciones) / Tiempo Total * 100
      // Simplificado: asumimos que cada interrupción resta un porcentaje o usamos el tiempo real vs tiempo esperado
      // Mejor aproximación con los datos que tenemos:
      // Si tenemos interruptions (contador), podemos penalizar el score.
      // Score base 100. Cada interrupción resta 5 puntos (ejemplo), min 0.
      // O si el frontend manda el tiempo de pausa, sería mejor.
      // Por ahora, usaremos una heurística simple basada en interrupciones si no se envía score explícito.

      let concentrationScore = session.concentrationScore;
      if (actualDuration > 0) {
        // Si el frontend envía interrupciones, recalculamos
        // Asumimos 1 min de pérdida por interrupción para el cálculo
        const penaltyMinutes = (interruptions || 0) * 2;
        const effectiveMinutes = Math.max(0, actualDuration - penaltyMinutes);
        concentrationScore = Math.min(100, Math.max(0, (effectiveMinutes / actualDuration) * 100));
      }

      await session.update({
        pomodorosCompleted: pomodorosCompleted !== undefined ? pomodorosCompleted : session.pomodorosCompleted,
        actualDuration: actualDuration !== undefined ? actualDuration : session.actualDuration,
        interruptions: interruptions !== undefined ? interruptions : session.interruptions,
        concentrationScore: concentrationScore,
        lastHeartbeat: new Date(),
        status: status || session.status
      });

      res.json({ message: 'Pomodoro actualizado', session });
    } catch (error) {
      console.error('Error al actualizar pomodoro:', error);
      res.status(500).json({ error: 'Error al actualizar pomodoro' });
    }
  }

  // Actualizar configuración de Pomodoro del usuario
  static async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { settings } = req.body;

      const user = await import('@models/User').then(m => m.default.findByPk(userId));
      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      await user.update({ pomodoroSettings: settings });

      res.json({ message: 'Configuración actualizada', settings: user.pomodoroSettings });
    } catch (error) {
      console.error('Error al actualizar configuración:', error);
      res.status(500).json({ error: 'Error al actualizar configuración' });
    }
  }
}
