import { Request, Response } from 'express';
import { StudyPlan, WeeklySchedule, StudySession, Theme, PlanStatus, PlanThemeStats } from '@models/index';
import { AuthRequest } from '@middleware/auth';
import { StudyPlanService } from '@services/StudyPlanService';
import { CustomBlocksService } from '@services/CustomBlocksService';
import { SimpleCalendarGenerator } from '@services/SimpleCalendarGenerator';
import { differenceInDays, addDays, startOfDay } from 'date-fns';
import { Op } from 'sequelize';

export class StudyPlanController {
  // Crear un nuevo plan de estudio
  static async createPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        startDate,
        examDate,
        weeklySchedule,
        themes, // Array de { id, name, hours, priority }
        methodology = 'rotation', // NUEVO: por defecto rotación
        topicsPerDay = 3 // NUEVO: por defecto 3
      } = req.body;

      // Validaciones
      if (new Date(startDate) >= new Date(examDate)) {
        res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha del examen' });
        return;
      }

      // Validar topicsPerDay
      if (topicsPerDay < 1 || topicsPerDay > 6) {
        res.status(400).json({ error: 'topicsPerDay debe estar entre 1 y 6' });
        return;
      }

      // Calcular horas totales semanales
      const totalWeeklyHours =
        weeklySchedule.monday +
        weeklySchedule.tuesday +
        weeklySchedule.wednesday +
        weeklySchedule.thursday +
        weeklySchedule.friday +
        weeklySchedule.saturday +
        weeklySchedule.sunday;

      if (totalWeeklyHours === 0) {
        res.status(400).json({ error: 'Debe asignar al menos 1 hora de estudio semanal' });
        return;
      }

      if (!themes || themes.length === 0) {
        res.status(400).json({ error: 'Debe agregar al menos un tema de estudio' });
        return;
      }

      const start = startOfDay(new Date(startDate));
      const examDay = startOfDay(new Date(examDate));
      const bufferEnd = addDays(examDay, -30); // Usar buffer de 30 días en lugar de 1 día
      const daysWithHours: { date: Date; hours: number; dayOfWeek: number }[] = [];
      let currentDate = start;
      while (currentDate <= bufferEnd) {
        const dayOfWeek = currentDate.getDay();
        const hours = Number([
          weeklySchedule.sunday,
          weeklySchedule.monday,
          weeklySchedule.tuesday,
          weeklySchedule.wednesday,
          weeklySchedule.thursday,
          weeklySchedule.friday,
          weeklySchedule.saturday,
        ][dayOfWeek] ?? 0);
        if (hours > 0) {
          daysWithHours.push({ date: new Date(currentDate), hours, dayOfWeek });
        }
        currentDate = addDays(currentDate, 1);
      }
      const totalAvailableHours = daysWithHours.reduce((sum, d) => sum + Number(d.hours || 0), 0);
      const sessionTypesForCalc = [
        { factor: 1.0, minHours: 0 },
        { factor: 0.25, minHours: 0.5 },
        { factor: 0.15, minHours: 0.5 },
        { factor: 0.10, minHours: 0.5 },
        { factor: 0.10, minHours: 0.5 },
      ];
      const totals: number[] = themes.map((theme: any) => {
        return sessionTypesForCalc.reduce((sum: number, st: { factor: number; minHours: number }) => sum + Math.max(theme.hours * st.factor, st.minHours || 0), 0);
      });
      const totalRequiredHours = totals.reduce((sum: number, val: number) => sum + val, 0);
      if (totalRequiredHours > totalAvailableHours) {
        const deficit = totalRequiredHours - totalAvailableHours;
        res.status(400).json({
          error:
            `❌ Plan Imposible: No tienes suficientes horas disponibles. Necesitas ${totalRequiredHours.toFixed(2)}h pero solo tienes ${totalAvailableHours.toFixed(2)}h disponibles. Déficit: ${deficit.toFixed(2)}h. Solución: Añade más horas semanales o ajusta las fechas.`,
        });
        return;
      }

      // CRÍTICO: Desactivar todos los planes anteriores del usuario
      await StudyPlan.update(
        { status: PlanStatus.CANCELLED },
        { where: { userId, status: PlanStatus.ACTIVE } }
      );
      console.log('✅ Planes anteriores desactivados');

      // Crear el plan
      const plan = await StudyPlan.create({
        userId,
        startDate,
        examDate,
        totalHours: totalWeeklyHours,
        status: PlanStatus.ACTIVE,
        methodology, // NUEVO: guardar metodología elegida
      });

      // Crear horario semanal
      await WeeklySchedule.create({
        studyPlanId: plan.id,
        ...weeklySchedule,
      });

      // Calcular información del buffer para mostrar al usuario
      const bufferDays = 30;
      const bufferStartDate = addDays(new Date(examDate), -bufferDays);

      // Generación asíncrona del calendario inteligente para no bloquear la respuesta
      setImmediate(async () => {
        console.log(`🔄 Iniciando generación asíncrona para plan ${plan.id}...`);
        try {
          // Validación y mapeo de temas dentro del proceso asíncrono
          type ThemeInputLocal = { id: number | string; name: string; hours: number; priority: number; complexity?: 'LOW' | 'MEDIUM' | 'HIGH' };

          // Extraer IDs base para la consulta a BD (ej: '6-1' -> 6)
          const baseIds = new Set<number>();
          themes.forEach((t: any) => {
            const idStr = String(t.id);
            const baseId = idStr.includes('-') ? parseInt(idStr.split('-')[0]) : parseInt(idStr);
            if (!isNaN(baseId)) {
              baseIds.add(baseId);
            }
          });

          const inputIds = Array.from(baseIds);
          console.log(`🔍 Verificando temas en lote (IDs base): [${inputIds.join(', ')}]`);
          console.log(`📋 Temas recibidos:`, themes.map((t: any) => ({ id: t.id, name: t.name })));

          const dbThemes = await Theme.findAll({
            where: { id: inputIds as any },
            attributes: ['id', 'title', 'estimatedHours', 'complexity'],
          } as any);

          console.log(`✅ Temas encontrados en BD: [${dbThemes.map((t: any) => t.id).join(', ')}]`);

          const themeMap = new Map<number, any>(dbThemes.map((t: any) => [t.id, t]));
          const themesWithRealIds: ThemeInputLocal[] = [];
          const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

          for (const themeInput of themes) {
            const idStr = String(themeInput.id);
            const baseId = idStr.includes('-') ? parseInt(idStr.split('-')[0]) : parseInt(idStr);
            const dbTheme = themeMap.get(baseId);

            if (dbTheme) {
              console.log(`✅ Tema encontrado para ${themeInput.id}: ${dbTheme.id} - ${dbTheme.title}`);
              themesWithRealIds.push({
                id: themeInput.id, // Mantener ID original (puede ser compuesto)
                name: themeInput.name || dbTheme.title,
                hours: themeInput.hours || parseFloat(dbTheme.estimatedHours.toString()),
                priority: themeInput.priority,
                complexity: (themeInput as any).complexity || (dbTheme as any).complexity,
              });
            } else {
              console.warn(`⚠️ Tema NO encontrado en BD con ID: ${themeInput.id}`);
              let fallback = await Theme.findOne({
                where: { title: themeInput.name }
              } as any);
              if (!fallback) {
                const allThemes = await Theme.findAll({ attributes: ['id', 'title', 'estimatedHours', 'complexity'] } as any);
                const nIn = normalize(themeInput.name || '');
                fallback = (allThemes.find((t: any) => normalize(t.title) === nIn)
                  || allThemes.find((t: any) => normalize(t.title).includes(nIn))
                  || allThemes.find((t: any) => nIn.includes(normalize(t.title)))) as any;
              }
              if (fallback) {
                console.log(`🔄 Usando coincidencia por título: ${fallback.id} - ${fallback.title}`);
                themesWithRealIds.push({
                  id: (fallback as any).id,
                  name: themeInput.name || (fallback as any).title,
                  hours: themeInput.hours || parseFloat((fallback as any).estimatedHours.toString()),
                  priority: themeInput.priority,
                  complexity: (themeInput as any).complexity || (fallback as any).complexity,
                });
              }
            }
          }

          // Garantizar inclusión de ONU/OTAN si se seleccionaron por nombre
          const selectedNames = themes.map((t: any) => normalize(t.name || ''));
          const hasONUName = selectedNames.some((n: string) => n.includes('naciones unidas') || n.includes('onu'));
          const hasOTANName = selectedNames.some((n: string) => n.includes('tratado del atlantico norte') || n.includes('otan'));
          const currentIds = new Set(themesWithRealIds.map(t => t.id));
          if (hasONUName && !currentIds.has(17)) {
            const onu = await Theme.findByPk(17);
            if (onu) {
              themesWithRealIds.push({
                id: onu.id,
                name: (onu as any).title,
                hours: parseFloat((onu as any).estimatedHours.toString()),
                priority: 1,
                complexity: (onu as any).complexity
              });
            }
          }
          if (hasOTANName && !currentIds.has(18)) {
            const otan = await Theme.findByPk(18);
            if (otan) {
              themesWithRealIds.push({
                id: otan.id,
                name: (otan as any).title,
                hours: parseFloat((otan as any).estimatedHours.toString()),
                priority: 1,
                complexity: (otan as any).complexity
              });
            }
          }

          if (themesWithRealIds.length === 0) {
            console.error('❌ Generación fallida: ningún tema válido encontrado');
            console.error('📋 Temas solicitados:', inputIds);
            console.error('✅ Temas encontrados en BD:', dbThemes.map((t: any) => t.id));
            await plan.update({ status: PlanStatus.CANCELLED });
            await plan.destroy();
            return;
          }

          console.log(`✅ Temas encontrados: ${themesWithRealIds.length}`);

          // Usar StudyPlanService como generador principal (repetición espaciada)
          console.log(`🔄 Generando calendario inteligente con repetición espaciada...`);
          console.log(`📊 Sistema de distribución: ROTACIÓN DE TEMAS`);

          const result = await StudyPlanService.generateSmartCalendar(
            plan.id,
            new Date(startDate),
            bufferEnd, // Usar fecha con buffer (30 días antes del examen)
            weeklySchedule,
            themesWithRealIds,
            methodology, // NUEVO: pasar metodología
            topicsPerDay // NUEVO: pasar topicsPerDay
          );

          if (!result.success) {
            console.error('❌ Generación inteligente fallida:', result.message);
            // Fallback al generador simplificado
            console.log(`🔄 Intentando con SimpleCalendarGenerator (fallback)...`);
            const simpleResult = await SimpleCalendarGenerator.generateCalendar(
              plan.id,
              new Date(startDate),
              bufferEnd, // Usar fecha con buffer (30 días antes del examen)
              weeklySchedule,
              themesWithRealIds
            );

            if (simpleResult.success) {
              console.log(`✅ Fallback exitoso: ${simpleResult.sessions!.length} sesiones generadas`);
            } else {
              console.error('❌ Ambos generadores fallaron');
              await plan.update({ status: PlanStatus.PAUSED });
            }
          } else {
            console.log(`✅ Calendario inteligente generado: ${result.sessions!.length} sesiones con repetición espaciada`);

            // Mostrar información del buffer en los logs
            if (result.bufferWarning) {
              console.log(`⚠️ ${result.bufferWarning.message}`);
            }
          }
        } catch (e) {
          console.error('❌ Error en generación asíncrona:', e);
          try {
            // Marcar el plan como fallido pero no destruirlo
            await plan.update({ status: PlanStatus.PAUSED });
          } catch (updateError) {
            console.error('❌ Error al actualizar estado del plan:', updateError);
          }
        }
      });

      // Responder inmediatamente para mejorar UX
      res.status(202).json({
        message: 'Generación del calendario iniciada. Puedes consultar el progreso en el Dashboard.',
        plan,
        bufferWarning: {
          type: 'info',
          title: '📅 Tiempo para preparación final',
          message: `Las sesiones de estudio terminan el ${bufferStartDate.toLocaleDateString()} (30 días antes del examen) para que puedas preparar los temas que necesites, hacer simulacros y repasar lo más importante.`,
          bufferStartDate: bufferStartDate.toISOString().split('T')[0],
          examDate: examDate,
          bufferDays: 30
        }
      });
    } catch (error) {
      console.error('Error al crear plan:', error);
      res.status(500).json({ error: 'Error al crear plan de estudio' });
    }
  }

  // Obtener plan activo del usuario
  static async getActivePlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;

      const plan = await StudyPlan.findOne({
        where: { userId, status: PlanStatus.ACTIVE },
        include: [
          {
            model: WeeklySchedule,
            as: 'weeklySchedule',
          },
        ],
      });

      if (!plan) {
        res.status(404).json({ error: 'No tienes un plan activo' });
        return;
      }

      res.json({ plan });
    } catch (error) {
      console.error('Error al obtener plan:', error);
      res.status(500).json({ error: 'Error al obtener plan' });
    }
  }

  // Obtener sesiones del plan
  static async getPlanSessions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = req.user!.id;

      // Verificar que el plan pertenece al usuario
      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
      });

      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      const sessions = await StudySession.findAll({
        where: { studyPlanId: planId },
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

  // Obtener progreso del plan
  static async getPlanProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = req.user!.id;

      // Verificar que el plan pertenece al usuario
      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
      });

      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      // Obtener todas las sesiones del plan
      const sessions = await StudySession.findAll({
        where: { studyPlanId: planId }
      });

      // Calcular estadísticas
      const totalSessions = sessions.length;
      const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
      const pendingSessions = sessions.filter(s => s.status === 'PENDING').length;
      const skippedSessions = sessions.filter(s => s.status === 'SKIPPED').length;

      const totalHoursScheduled = sessions.reduce((sum, session) => sum + parseFloat(session.scheduledHours.toString()), 0);
      const totalHoursCompleted = sessions
        .filter(s => s.status === 'COMPLETED')
        .reduce((sum, session) => sum + (session.completedHours ? parseFloat(session.completedHours.toString()) : 0), 0);

      const progressPercentage = totalSessions > 0
        ? Math.round((completedSessions / totalSessions) * 100)
        : 0;

      const daysRemaining = Math.max(0, differenceInDays(new Date(plan.examDate), new Date()));

      res.json({
        plan,
        totalSessions,
        completedSessions,
        pendingSessions,
        skippedSessions,
        totalHoursScheduled,
        totalHoursCompleted,
        progressPercentage,
        daysRemaining
      });
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      res.status(500).json({ error: 'Error al obtener progreso' });
    }
  }

  // Actualizar estado del plan
  static async updatePlanStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const { status } = req.body;
      const userId = req.user!.id;

      const plan = await StudyPlan.findOne({
        where: { id: planId, userId },
      });

      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      await plan.update({ status });

      res.json({
        message: 'Estado del plan actualizado',
        plan,
      });
    } catch (error) {
      console.error('Error al actualizar estado:', error);
      res.status(500).json({ error: 'Error al actualizar estado del plan' });
    }
  }

  // Replanificar con nueva fecha y horario
  static async replan(req: AuthRequest, res: Response): Promise<void> {
    try {
      res.status(501).json({ error: 'Funcionalidad de replanificación eliminada. Cree un nuevo plan.' });
    } catch (error) {
      console.error('Error al replanificar:', error);
      res.status(500).json({ error: 'Error al replanificar el plan' });
    }
  }

  // Obtener estadísticas de dominio por tema para un plan
  static async getThemeStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = req.user!.id;

      const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      const stats = await PlanThemeStats.findAll({
        where: { studyPlanId: planId },
        include: [{ model: Theme, as: 'theme', attributes: ['id', 'title', 'block', 'themeNumber'] }],
        order: [['themeId', 'ASC']],
      } as any);

      res.json({ stats });
    } catch (error) {
      console.error('Error al obtener estadísticas de temas:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas de temas' });
    }
  }

  // Estado de generación del calendario (ligero)
  static async getGenerationStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = req.user!.id;

      const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      const totalSessions = await StudySession.count({ where: { studyPlanId: planId } });
      let firstSessionDate: Date | null = null;
      let lastSessionDate: Date | null = null;

      if (totalSessions > 0) {
        const first = await StudySession.findOne({
          where: { studyPlanId: planId },
          order: [['scheduledDate', 'ASC']],
          attributes: ['scheduledDate'],
        });
        const last = await StudySession.findOne({
          where: { studyPlanId: planId },
          order: [['scheduledDate', 'DESC']],
          attributes: ['scheduledDate'],
        });
        firstSessionDate = first ? first.scheduledDate : null;
        lastSessionDate = last ? last.scheduledDate : null;
      }

      res.json({
        plan: {
          id: plan.id,
          status: plan.status,
          createdAt: plan.createdAt,
          examDate: plan.examDate,
        },
        totalSessions,
        generationCompleted: totalSessions > 0,
        firstSessionDate,
        lastSessionDate,
      });
    } catch (error) {
      console.error('Error al obtener estado de generación:', error);
      res.status(500).json({ error: 'Error al obtener estado de generación' });
    }
  }

  // Obtener distribución equitativa por complejidad de temas
  static async getEquitableDistribution(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { planId } = req.params;
      const userId = req.user!.id;

      const plan = await StudyPlan.findOne({ where: { id: planId, userId } });
      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      // Obtener todas las sesiones del plan
      const sessions = await StudySession.findAll({
        where: { studyPlanId: planId },
        order: [['scheduledDate', 'ASC']]
      });

      // Obtener todos los IDs de temas únicos de las sesiones
      const themeIds = [...new Set(sessions.map(session => session.themeId))];

      // Obtener los temas completos
      const themes = await Theme.findAll({
        where: { id: themeIds },
        order: [['block', 'ASC'], ['themeNumber', 'ASC']]
      });

      // Calcular distribución por tema
      const themeDistribution = themes.map(theme => {
        const themeSessions = sessions.filter(session => session.themeId === theme.id);

        return {
          theme: {
            id: theme.id,
            title: theme.title,
            block: theme.block,
            themeNumber: theme.themeNumber,
            complexity: theme.complexity
          },
          totalSessions: themeSessions.length,
          studySessions: themeSessions.filter(s => s.sessionType === 'STUDY').length,
          reviewSessions: themeSessions.filter(s => s.sessionType === 'REVIEW').length,
          testSessions: themeSessions.filter(s => s.sessionType === 'TEST').length,
          simulationSessions: themeSessions.filter(s => s.sessionType === 'SIMULATION').length,
          totalHours: Math.round(themeSessions.reduce((sum: number, session: any) => {
            const hours = session.scheduledHours;
            if (typeof hours === 'number') {
              return sum + hours;
            } else if (typeof hours === 'string') {
              const parsed = parseFloat(hours);
              return sum + (isNaN(parsed) ? 0 : parsed);
            }
            return sum;
          }, 0) * 10) / 10 // Redondear a 1 decimal
        };
      });

      // Agrupar por complejidad
      const distributionByComplexity = {
        LOW: themeDistribution.filter(td => td.theme.complexity === 'LOW'),
        MEDIUM: themeDistribution.filter(td => td.theme.complexity === 'MEDIUM'),
        HIGH: themeDistribution.filter(td => td.theme.complexity === 'HIGH')
      };

      // Calcular estadísticas por complejidad
      const stats = {
        LOW: {
          themes: distributionByComplexity.LOW.length,
          totalSessions: distributionByComplexity.LOW.reduce((sum, td) => sum + (td.totalSessions || 0), 0),
          avgSessions: distributionByComplexity.LOW.length > 0 ? distributionByComplexity.LOW.reduce((sum, td) => sum + (td.totalSessions || 0), 0) / distributionByComplexity.LOW.length : 0,
          totalHours: distributionByComplexity.LOW.reduce((sum, td) => sum + (td.totalHours || 0), 0),
          reviewLimits: { min: 3, max: 8 }
        },
        MEDIUM: {
          themes: distributionByComplexity.MEDIUM.length,
          totalSessions: distributionByComplexity.MEDIUM.reduce((sum, td) => sum + (td.totalSessions || 0), 0),
          avgSessions: distributionByComplexity.MEDIUM.length > 0 ? distributionByComplexity.MEDIUM.reduce((sum, td) => sum + (td.totalSessions || 0), 0) / distributionByComplexity.MEDIUM.length : 0,
          totalHours: distributionByComplexity.MEDIUM.reduce((sum, td) => sum + (td.totalHours || 0), 0),
          reviewLimits: { min: 3, max: 12 }
        },
        HIGH: {
          themes: distributionByComplexity.HIGH.length,
          totalSessions: distributionByComplexity.HIGH.reduce((sum, td) => sum + (td.totalSessions || 0), 0),
          avgSessions: distributionByComplexity.HIGH.length > 0 ? distributionByComplexity.HIGH.reduce((sum, td) => sum + (td.totalSessions || 0), 0) / distributionByComplexity.HIGH.length : 0,
          totalHours: distributionByComplexity.HIGH.reduce((sum, td) => sum + (td.totalHours || 0), 0),
          reviewLimits: { min: 4, max: 16 }
        }
      };

      res.json({
        themes: themeDistribution,
        sessions: sessions.map(s => ({
          id: s.id,
          themeId: s.themeId,
          sessionType: s.sessionType,
          scheduledDate: s.scheduledDate,
          scheduledHours: s.scheduledHours
        })),
        distributionByComplexity,
        stats
      });

    } catch (error) {
      console.error('Error al obtener distribución equitativa:', error);
      res.status(500).json({ error: 'Error al obtener distribución equitativa' });
    }
  }

  // Obtener estadísticas desglosadas por partes de temas
  static async getThemePartsStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { planId } = req.params;

      // Verificar que el plan pertenece al usuario
      const plan = await StudyPlan.findOne({
        where: { id: planId, userId }
      });

      if (!plan) {
        res.status(404).json({ error: 'Plan no encontrado' });
        return;
      }

      // Obtener todas las sesiones del plan con información de temas
      const sessions = await StudySession.findAll({
        where: { studyPlanId: planId },
        order: [['scheduledDate', 'ASC']]
      });

      // Obtener información de temas
      const themeIds = [...new Set(sessions.map(s => s.themeId))];

      const themes = await Theme.findAll({
        where: { id: themeIds },
        attributes: ['id', 'title', 'complexity', 'parts']
      });
      const themeMap = new Map(themes.map(t => [t.id, t]));

      const partsStats: { [key: string]: any } = {};

      sessions.forEach(session => {
        const themeId = session.themeId;
        const theme = themeMap.get(themeId);
        const partInfo = StudyPlanController.extractPartInfo(session.notes || '', theme?.id, theme?.title);

        // Solo procesar si hay información válida de parte o si es una parte real
        if (partInfo.partIndex > 0 || partInfo.partLabel) {
          const partKey = `${themeId}-${partInfo.partIndex}`;

          if (!partsStats[partKey]) {
            partsStats[partKey] = {
              themeId: themeId,
              themeName: theme?.title || 'Tema desconocido',
              partIndex: partInfo.partIndex,
              partLabel: partInfo.partLabel || `Parte ${partInfo.partIndex}`,
              totalSessions: 0,
              studySessions: 0,
              reviewSessions: 0,
              testSessions: 0,
              totalHours: 0,
              completedSessions: 0,
              complexity: theme?.complexity || 'MEDIUM'
            };
          }

          const stats = partsStats[partKey];
          stats.totalSessions++;

          if (session.sessionType === 'STUDY') {
            stats.studySessions++;
          } else if (session.sessionType === 'REVIEW') {
            stats.reviewSessions++;
          } else if (session.sessionType === 'TEST') {
            stats.testSessions++;
          }

          stats.totalHours += Number(session.scheduledHours) || 0;

          if (session.status === 'COMPLETED') {
            stats.completedSessions++;
          }
        }
      });

      // Calcular completion rate para cada parte
      Object.values(partsStats).forEach((stats: any) => {
        stats.completionRate = stats.totalSessions > 0 ? Math.round((stats.completedSessions / stats.totalSessions) * 100) : 0;
      });

      // Convertir a array y ordenar
      const result = Object.values(partsStats).sort((a: any, b: any) => {
        if (a.themeId !== b.themeId) {
          return a.themeId - b.themeId;
        }
        return a.partIndex - b.partIndex;
      });

      // Para temas sin partes específicas, asegurar que tengan al menos una entrada
      const themesWithoutParts = themeIds.filter(themeId =>
        !result.some((part: any) => part.themeId === themeId)
      );

      themesWithoutParts.forEach(themeId => {
        const theme = themeMap.get(themeId);
        result.push({
          themeId: themeId,
          themeName: theme?.title || 'Tema desconocido',
          partIndex: 0,
          partLabel: 'Parte única',
          totalSessions: 0,
          studySessions: 0,
          reviewSessions: 0,
          testSessions: 0,
          totalHours: 0,
          completedSessions: 0,
          completionRate: 0,
          complexity: theme?.complexity || 'MEDIUM'
        });
      });

      // Agrupar por tema para mejor visualización
      const groupedByTheme: { [key: number]: any } = {};

      // Primero, agrupar todas las partes por tema
      result.forEach((part: any) => {
        if (!groupedByTheme[part.themeId]) {
          groupedByTheme[part.themeId] = {
            themeId: part.themeId,
            themeName: part.themeName,
            complexity: part.complexity,
            parts: []
          };
        }
        groupedByTheme[part.themeId].parts.push(part);
      });

      // Filtrar partes: si un tema tiene partes con partIndex > 0, eliminar la parte 0
      Object.values(groupedByTheme).forEach((theme: any) => {
        const hasRealParts = theme.parts.some((part: any) => part.partIndex > 0);
        if (hasRealParts) {
          theme.parts = theme.parts.filter((part: any) => part.partIndex > 0);
        }

        // Ordenar las partes por partIndex
        theme.parts.sort((a: any, b: any) => a.partIndex - b.partIndex);

        // Transformar al formato final
        theme.parts = theme.parts.map((part: any) => ({
          partIndex: part.partIndex,
          partLabel: part.partLabel,
          totalSessions: part.totalSessions,
          studySessions: part.studySessions,
          reviewSessions: part.reviewSessions,
          testSessions: part.testSessions,
          totalHours: Math.round(part.totalHours * 10) / 10,
          completedSessions: part.completedSessions,
          completionRate: Math.round((part.completedSessions / part.totalSessions) * 100) || 0
        }));
      });

      res.json({
        themePartsStats: Object.values(groupedByTheme),
        totalThemes: Object.keys(groupedByTheme).length,
        totalParts: result.length
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de partes:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas de partes' });
    }
  }

  // Generar plan de bloques personalizados
  static async generateCustomBlocksPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        startDate,
        examDate,
        blocksConfig, // Array de BlockConfig
        totalHours, // Horas semanales promedio o total
        themes, // Array de temas con info de partes
      } = req.body;

      // Validaciones básicas
      if (!blocksConfig || blocksConfig.length === 0) {
        res.status(400).json({ error: 'Configuración de bloques requerida' });
        return;
      }

      // Validar cada bloque
      const availableDailyMinutes = totalHours ? (totalHours / 7) * 60 : 240; // Default 4h/day
      for (const block of blocksConfig) {
        const validation = CustomBlocksService.validateBlockConfig(block, availableDailyMinutes);
        if (!validation.valid) {
          res.status(400).json({
            error: `Error en bloque ${block.blockNumber}: ${validation.errors.join(', ')}`
          });
          return;
        }
      }

      // Desactivar planes anteriores
      await StudyPlan.update(
        { status: PlanStatus.CANCELLED },
        { where: { userId, status: PlanStatus.ACTIVE } }
      );

      // Crear plan
      const plan = await StudyPlan.create({
        userId,
        startDate,
        examDate,
        totalHours: totalHours || 0,
        status: PlanStatus.ACTIVE,
        methodology: 'custom-blocks',
        configuration: { blocksConfig }
      });

      // Generar sesiones
      const sessions = await CustomBlocksService.generateSessionsFromBlocks(plan.id, blocksConfig, themes);

      // Guardar sesiones en lotes
      const CHUNK_SIZE = 500;
      for (let i = 0; i < sessions.length; i += CHUNK_SIZE) {
        await StudySession.bulkCreate(sessions.slice(i, i + CHUNK_SIZE));
      }

      // Eliminar draft si existe
      await StudyPlan.destroy({
        where: { userId, status: PlanStatus.DRAFT }
      });

      res.status(201).json({
        message: 'Plan personalizado creado exitosamente',
        plan,
        sessionsCount: sessions.length
      });

    } catch (error) {
      console.error('Error al generar plan personalizado:', error);
      res.status(500).json({ error: 'Error al generar plan personalizado' });
    }
  }

  // Guardar progreso parcial (Draft)
  static async saveCustomBlocksProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        startDate,
        examDate,
        blocksConfig,
        currentBlock,
        weeklyPattern,
        totalBlocks,
        availableDailyMinutes,
        allThemes
      } = req.body;

      // Buscar si ya existe un draft
      let draft = await StudyPlan.findOne({
        where: { userId, status: PlanStatus.DRAFT }
      });

      const config = {
        blocksConfig,
        currentBlock,
        weeklyPattern,
        totalBlocks,
        availableDailyMinutes,
        allThemes
      };

      if (draft) {
        await draft.update({
          startDate,
          examDate,
          configuration: config
        });
      } else {
        draft = await StudyPlan.create({
          userId,
          startDate,
          examDate,
          totalHours: 0, // Se calculará al finalizar
          status: PlanStatus.DRAFT,
          methodology: 'custom-blocks',
          configuration: config
        });
      }

      res.json({ message: 'Progreso guardado', draftId: draft.id });

    } catch (error) {
      console.error('Error al guardar progreso:', error);
      res.status(500).json({ error: 'Error al guardar progreso' });
    }
  }

  // Obtener draft existente
  static async getDraftPlan(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const draft = await StudyPlan.findOne({
        where: { userId, status: PlanStatus.DRAFT }
      });

      if (!draft) {
        res.status(404).json({ message: 'No hay borrador pendiente' });
        return;
      }

      res.json({ draft });
    } catch (error) {
      console.error('Error al obtener borrador:', error);
      res.status(500).json({ error: 'Error al obtener borrador' });
    }
  }



  // Método auxiliar para extraer información de partes
  private static extractPartInfo(notes: string, themeId?: number, themeTitle?: string): { partIndex: number; partLabel: string } {
    const normalized = (notes || '').replace(/\n/g, ' ');
    const directMatch = normalized.match(/Parte\s+(\d+):\s*(.+)/i);
    if (directMatch) {
      return {
        partIndex: parseInt(directMatch[1]),
        partLabel: directMatch[2].trim()
      };
    }
    const temaMatch = normalized.match(/Tema\s+\d+\.\s*Parte\s+(\d+):\s*(.+)/i);
    if (temaMatch) {
      return {
        partIndex: parseInt(temaMatch[1]),
        partLabel: temaMatch[2].trim()
      };
    }

    if (themeId && themeTitle) {
      if (themeId === 7) {
        if (/Ley\s*39\s*\/\s*2007|Carrera\s+Militar/i.test(normalized)) {
          return { partIndex: 2, partLabel: 'Ley 39/2007, de la Carrera Militar' };
        }
        if (/Ley\s*8\s*\/\s*2006|Tropa\s+y\s+Marinería/i.test(normalized)) {
          return { partIndex: 1, partLabel: 'Ley 8/2006, Tropa y Marinería' };
        }
      }

      if (themeId === 15) {
        if (/1150\s*\/\s*2021|Estrategia\s+de\s+Seguridad/i.test(normalized)) {
          return { partIndex: 2, partLabel: 'RD 1150/2021, Estrategia de Seguridad Nacional 2021' };
        }
        if (/Ley\s*36\s*\/\s*2015|Seguridad\s+Nacional/i.test(normalized)) {
          return { partIndex: 1, partLabel: 'Ley 36/2015, de Seguridad Nacional' };
        }
      }
    }

    return { partIndex: 0, partLabel: 'Parte única' };
  }
}
