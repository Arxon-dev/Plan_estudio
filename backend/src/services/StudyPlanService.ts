import { StudyPlan, StudySession, Theme, WeeklySchedule, SessionStatus, SessionType } from '@models/index';
import { addDays, differenceInDays, startOfDay, format } from 'date-fns';
import { Op } from 'sequelize';
import { RotationStudyService, RotationConfig, RotationSession } from './RotationStudyService';

export interface WeeklyScheduleData {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// Interfaz para temas con prioridad
interface ThemeInput {
  id: number;
  name: string;
  hours: number;
  priority: number; // 1 = más importante
  complexity?: 'LOW' | 'MEDIUM' | 'HIGH';
}

interface GenerateSmartCalendarResponse {
  success: boolean;
  message?: string;
  sessions?: any[];
  bufferWarning?: {
    type: 'info' | 'warning' | 'error';
    title: string;
    message: string;
    bufferStartDate: string;
    examDate: string;
    bufferDays: number;
  };
}

export class StudyPlanService {
  /**
   * Calcula los límites óptimos de repasos por tema según su complejidad
   * para mantener equilibrio en la distribución (más equitativo)
   */
  private static calculateReviewLimits(themes: ThemeInput[]): Record<number, { base: number; max: number; extra: number }> {
    const limits: Record<number, { base: number; max: number; extra: number }> = {};
    
    themes.forEach(theme => {
      const complexity = theme.complexity || 'MEDIUM';
      
      // Repasos base más equitativos (reducir diferencias)
      const baseReviews = complexity === 'LOW' ? 3 : complexity === 'MEDIUM' ? 3 : 4;
      
      // Máximo total más equilibrado
      const maxReviews = complexity === 'LOW' ? 8 : complexity === 'MEDIUM' ? 12 : 16;
      
      // Máximo de repasos extras en fase de refuerzo
      const maxExtraReviews = maxReviews - baseReviews;
      
      limits[theme.id] = {
        base: baseReviews,
        max: maxReviews,
        extra: maxExtraReviews
      };
    });
    
    return limits;
  }

  /**
   * Método principal para generar calendario de estudio inteligente
   * Basado en: Curva del olvido + Distribución óptima + Buffer de seguridad
   * Ahora usa únicamente el sistema de rotación para mantener múltiples temas activos simultáneamente
   */
  static async generateSmartCalendar(
    planId: number,
    startDate: Date,
    examDate: Date,
    weeklySchedule: WeeklyScheduleData,
    themes: ThemeInput[]
  ): Promise<GenerateSmartCalendarResponse> {
    
    console.log('\n🎯 ====== GENERANDO CALENDARIO INTELIGENTE ======');
    console.log(`📅 Fecha Inicio: ${startDate.toLocaleDateString()}`);
    console.log(`📅 Fecha Examen: ${examDate.toLocaleDateString()}`);
    console.log(`📚 Total Temas: ${themes.length}`);

    try {
      // **FASE 1: VALIDACIÓN** 
      const validation = this.validatePlan(startDate, examDate, weeklySchedule, themes);
      
      if (!validation.isViable) {
        console.error(`❌ ${validation.message}`);
        return { success: false, message: validation.message };
      }

      console.log(`✅ Plan viable: ${validation.totalAvailableHours.toFixed(2)}h disponibles vs ${validation.totalRequiredHours.toFixed(2)}h requeridas`);
      console.log(`📊 Margen de seguridad: ${(validation.totalAvailableHours - validation.totalRequiredHours).toFixed(2)}h`);

      let sessions: any[] = [];

      // **FASE 2: DISTRIBUCIÓN - SISTEMA DE ROTACIÓN ÚNICAMENTE**
      console.log('🔄 ====== USANDO SISTEMA DE ROTACIÓN DE TEMAS ======');
      
      // Obtener temas reales desde ThemeInput
      const realThemes = await Theme.findAll({
        where: { id: themes.map(t => t.id) }
      });
      
      // Calcular configuración óptima según horas disponibles
      const weeklyHours = this.calculateWeeklyHours(weeklySchedule);
      const rotationConfig = RotationStudyService.calculateOptimalConfig(weeklyHours);
      
      // Generar plan de rotación
      const rotationPlan = RotationStudyService.createRotationGroups(
        realThemes,
        weeklySchedule,
        startDate,
        examDate,
        rotationConfig
      );
      
      // Convertir plan de rotación a sesiones de base de datos
      sessions = this.convertRotationPlanToSessions(planId, rotationPlan, validation.daysWithHours);

      if (!sessions || sessions.length === 0) {
        console.error('❌ Error crítico: No se generaron sesiones');
        return { success: false, message: 'No se pudieron generar sesiones de estudio' };
      }

      // **FASE 3: GUARDAR EN BASE DE DATOS** (inserción en chunks para evitar bloqueos)
      const CHUNK_SIZE = parseInt(process.env.SESSION_INSERT_CHUNK || '500'); // Reducir a 500 para optimizar
      console.log(`💾 Guardando ${sessions.length} sesiones en base de datos...`);
      
      try {
        if (sessions.length > CHUNK_SIZE) {
          console.log(`⚙️ Insertando ${sessions.length} sesiones en chunks de ${CHUNK_SIZE}...`);
          for (let i = 0; i < sessions.length; i += CHUNK_SIZE) {
            const batch = sessions.slice(i, i + CHUNK_SIZE);
            await StudySession.bulkCreate(batch, { 
              validate: false, 
              logging: false,
              returning: false // No devolver los registros insertados para mejorar rendimiento
            } as any);
            console.log(`   ✓ Chunk ${Math.floor(i / CHUNK_SIZE) + 1} insertado (${batch.length} sesiones)`);
          }
        } else {
          console.log(`⚙️ Insertando ${sessions.length} sesiones directamente...`);
          await StudySession.bulkCreate(sessions, { 
            validate: false, 
            logging: false,
            returning: false // No devolver los registros insertados para mejorar rendimiento
          } as any);
          console.log(`   ✓ Sesiones insertadas exitosamente`);
        }
        console.log(`✅ Todas las sesiones guardadas correctamente`);
      } catch (error) {
        console.error(`❌ Error al guardar sesiones:`, error);
        throw error;
      }

      console.log(`\n✅ Calendario generado exitosamente: ${sessions.length} sesiones creadas`);
      console.log('🎯 ========================================\n');

      // Calcular información del buffer para el usuario
      const bufferDays = 30;
      const bufferStartDate = addDays(new Date(examDate), -bufferDays);
      const lastSessionDate = sessions.length > 0 ? sessions[sessions.length - 1].scheduledDate : null;
      
      return { 
        success: true, 
        sessions,
        bufferWarning: {
          type: 'info',
          title: '📅 Tiempo para preparación final',
          message: `Las sesiones de estudio terminan el ${bufferStartDate.toLocaleDateString()} (${bufferDays} días antes del examen) para que puedas preparar los temas que necesites, hacer simulacros y repasar lo más importante.`,
          bufferStartDate: bufferStartDate.toISOString().split('T')[0],
          examDate: examDate.toString(),
          bufferDays: bufferDays
        }
      };
    } catch (error) {
      console.error('❌ Error crítico en generateSmartCalendar:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido en la generación del calendario';
      return { success: false, message: errorMessage };
    }
  }

  /**
   * FASE 1: VALIDACIÓN
   * Verifica si el plan es matemáticamente posible
   */
  private static validatePlan(
    startDate: Date,
    examDate: Date,
    weeklySchedule: WeeklyScheduleData,
    themes: ThemeInput[]
  ): {
    isViable: boolean;
    message?: string;
    totalAvailableHours: number;
    totalRequiredHours: number;
    daysWithHours: { date: Date; hours: number; dayOfWeek: number }[];
  } {
    
    // Calcular días disponibles (HASTA LA FECHA DEL EXAMEN, sin buffer restrictivo)
    const start = startOfDay(new Date(startDate));
    const examDay = startOfDay(new Date(examDate));
    
    const daysWithHours: { date: Date; hours: number; dayOfWeek: number }[] = [];
    let currentDate = start;
    
    // **USAR TODOS LOS DÍAS HASTA EL EXAMEN** (sin buffer de 30 días)
    while (currentDate <= examDay) {
      const dayOfWeek = currentDate.getDay();
      const hours = this.getHoursForDay(dayOfWeek, weeklySchedule);
      
      if (hours > 0) {
        daysWithHours.push({ date: new Date(currentDate), hours, dayOfWeek });
      }
      
      currentDate = addDays(currentDate, 1);
    }

    // Calcular horas totales disponibles
    const totalAvailableHours = daysWithHours.reduce((sum, day) => sum + Number(day.hours || 0), 0);

    const totals = themes.map(theme => {
      const c = theme.complexity || 'MEDIUM';
      const studySteps = c === 'LOW' ? 1 : c === 'MEDIUM' ? 2 : 3;
      // Repasos base más equitativos (antes: LOW=3, MEDIUM/HIGH=4)
      const reviewCount = c === 'LOW' ? 3 : c === 'MEDIUM' ? 3 : 4;
      const testCount = 3;
      const perReview = 0.75;
      const perTest = 2.0;
      return theme.hours + reviewCount * perReview + testCount * perTest;
    });
    const totalRequiredHours = totals.reduce((s, x) => s + x, 0);
    const studyHours = themes.reduce((sum, theme) => sum + theme.hours, 0);
    const reviewHoursEstimated = totalRequiredHours - studyHours;

    console.log(`\n📊 VALIDACIÓN:`);
    console.log(`   - Días disponibles (HASTA EL EXAMEN): ${daysWithHours.length}`);
    console.log(`   - Fecha inicio: ${start.toLocaleDateString()}`);
    console.log(`   - Fecha examen: ${examDay.toLocaleDateString()}`);
    console.log(`   - Horas disponibles totales: ${Number(totalAvailableHours).toFixed(2)}h`);
    console.log(`   - Horas de estudio: ${studyHours.toFixed(2)}h`);
    console.log(`   - Horas de repasos estimadas: ${reviewHoursEstimated.toFixed(2)}h`);
    console.log(`   - Total requerido: ${totalRequiredHours.toFixed(2)}h`);

    // Validar viabilidad
    if (totalRequiredHours > totalAvailableHours) {
      const deficit = totalRequiredHours - totalAvailableHours;
      return {
        isViable: false,
        message: `❌ Plan Imposible: No tienes suficientes horas disponibles. Necesitas ${totalRequiredHours.toFixed(2)}h pero solo tienes ${totalAvailableHours.toFixed(2)}h disponibles. Déficit: ${deficit.toFixed(2)}h. Solución: Añade más horas semanales o ajusta las fechas.`,
        totalAvailableHours,
        totalRequiredHours,
        daysWithHours
      };
    }

    return {
      isViable: true,
      totalAvailableHours,
      totalRequiredHours,
      daysWithHours
    };
  }

  /**
   * Convierte el plan de rotación a sesiones de base de datos
   * CORREGIDO: Ahora procesa TODAS las sesiones de rotación sin limitaciones
   */
  private static convertRotationPlanToSessions(
    planId: number,
    rotationPlan: RotationSession[][],
    daysWithHours: Array<{ date: Date; hours: number; dayOfWeek: number }>
  ): any[] {
    
    const sessions: any[] = [];
    
    // Crear mapa de días disponibles por fecha para búsqueda rápida
    const daysMap = new Map<string, { date: Date; hours: number; dayOfWeek: number }>();
    daysWithHours.forEach(dayInfo => {
      const dayKey = format(dayInfo.date, 'yyyy-MM-dd');
      daysMap.set(dayKey, dayInfo);
    });
    
    console.log(`📅 Procesando ${rotationPlan.length} semanas de rotación`);
    console.log(`📊 Días disponibles: ${daysWithHours.length} días`);
    
    // Procesar TODAS las sesiones de rotación sin limitaciones
    rotationPlan.forEach((weekSessions, weekIndex) => {
      console.log(`📅 Semana ${weekIndex + 1}: ${weekSessions.length} sesiones`);
      
      // Agrupar sesiones por día usando las fechas REALES de lastStudied
      const sessionsByDay = new Map<string, RotationSession[]>();
      
      weekSessions.forEach(session => {
        if (session.lastStudied) {
          const dayKey = format(session.lastStudied, 'yyyy-MM-dd');
          if (!sessionsByDay.has(dayKey)) {
            sessionsByDay.set(dayKey, []);
          }
          sessionsByDay.get(dayKey)!.push(session);
        }
      });
      
      // Procesar cada día que tiene sesiones
      sessionsByDay.forEach((daySessions, dayKey) => {
        const dayInfo = daysMap.get(dayKey);
        
        if (!dayInfo) {
          console.log(`⚠️  Día ${dayKey} no encontrado en días disponibles`);
          return;
        }
        
        if (dayInfo.hours === 0) {
          console.log(`⚠️  Día ${dayKey} tiene 0 horas disponibles`);
          return;
        }
        
        console.log(`   ${dayInfo.date.toLocaleDateString()}: ${daySessions.length} sesiones, ${dayInfo.hours}h disponibles`);
        
        // Calcular tiempo por sesión
        let remainingHours = dayInfo.hours;
        
        daySessions.forEach((session, index) => {
          if (remainingHours <= 0) return;
          
          // Ajustar tiempo según disponibilidad
          const sessionTime = Math.min(session.hours, remainingHours);
          
          // Determinar tipo de sesión y etiqueta
          const sessionType = session.sessionType;
          const label = this.getRotationSessionLabel(sessionType, session.themeName, (session as any).subThemeIndex, (session as any).subThemeLabel);
          
          sessions.push({
            studyPlanId: planId,
            themeId: session.themeId,
            scheduledDate: dayInfo.date, // Usar la fecha REAL del día disponible
            scheduledHours: sessionTime,
            status: SessionStatus.PENDING,
            notes: label,
            sessionType: sessionType === 'STUDY' ? SessionType.STUDY :
                         sessionType === 'REVIEW' ? SessionType.REVIEW : SessionType.TEST,
            reviewStage: sessionType === 'REVIEW' ? (index % 4) + 1 : 0,
            subThemeIndex: (session as any).subThemeIndex,
            subThemeLabel: (session as any).subThemeLabel
          });
          
          remainingHours -= sessionTime;
        });
      });
    });
    
    console.log(`✅ Convertidas ${sessions.length} sesiones de rotación`);
    
    // Verificar cobertura de fechas
    if (sessions.length > 0) {
      const firstDate = sessions[0].scheduledDate;
      const lastDate = sessions[sessions.length - 1].scheduledDate;
      console.log(`📊 Cobertura: ${firstDate.toLocaleDateString()} → ${lastDate.toLocaleDateString()}`);
    }
    
    return sessions;
  }

  /**
   * Obtiene etiqueta para sesión de rotación
   */
  private static getRotationSessionLabel(sessionType: 'STUDY' | 'REVIEW' | 'TEST', themeName: string, subThemeIndex?: number, subThemeLabel?: string): string {
    const partSuffix = subThemeIndex && subThemeIndex > 0 ? ` — Parte ${subThemeIndex}: ${subThemeLabel || ''}` : '';
    switch (sessionType) {
      case 'STUDY':
        return `📚 Estudio: ${themeName}${partSuffix}`;
      case 'REVIEW':
        return `📖 Repaso: ${themeName}${partSuffix}`;
      case 'TEST':
        return `🧪 Test: ${themeName}${partSuffix}`;
      default:
        return `📚 Sesión: ${themeName}${partSuffix}`;
    }
  }

  /**
   * Calcula las horas semanales totales del usuario
   */
  private static calculateWeeklyHours(weeklySchedule: WeeklyScheduleData): number {
    return weeklySchedule.monday + weeklySchedule.tuesday + weeklySchedule.wednesday + 
           weeklySchedule.thursday + weeklySchedule.friday + weeklySchedule.saturday + 
           weeklySchedule.sunday;
  }

  /**
   * Helper: Obtener horas para un día específico
   */
  private static getHoursForDay(dayOfWeek: number, weeklySchedule: WeeklyScheduleData): number {
    const days = [
      weeklySchedule.sunday,
      weeklySchedule.monday,
      weeklySchedule.tuesday,
      weeklySchedule.wednesday,
      weeklySchedule.thursday,
      weeklySchedule.friday,
      weeklySchedule.saturday
    ];
    return days[dayOfWeek] || 0;
  }

  /**
   * Rebalancear calendario desde una fecha específica
   * Redistribuye las sesiones pendientes desde la fecha dada
   * Ahora usa únicamente el sistema de rotación
   */
  static async rebalanceFromDate(planId: number, fromDate: Date): Promise<void> {
    console.log(`🔄 Rebalanceando calendario desde ${fromDate.toLocaleDateString()} para plan ${planId}`);
    
    try {
      // Obtener plan con sus relaciones
      const { StudyPlan, WeeklySchedule, Theme, StudySession } = await import('@models/index');
      
      const plan = await StudyPlan.findByPk(planId);
      if (!plan) {
        throw new Error('Plan de estudio no encontrado');
      }

      // Obtener horario semanal
      const weeklySchedule = await WeeklySchedule.findOne({
        where: { studyPlanId: planId }
      });
      
      if (!weeklySchedule) {
        throw new Error('Horario semanal no encontrado');
      }

      // Obtener temas asignados al plan
      const planThemes = await StudySession.findAll({
        where: { studyPlanId: planId },
        attributes: ['themeId'],
        group: ['themeId']
      });
      
      const themeIds = planThemes.map(st => st.themeId);
      const dbThemes = await Theme.findAll({
        where: { id: themeIds }
      });

      // Convertir a formato ThemeInput
      const themes: ThemeInput[] = dbThemes.map(theme => ({
        id: theme.id,
        name: theme.title,
        hours: parseFloat(theme.estimatedHours.toString()),
        priority: 1, // Prioridad por defecto
        complexity: (theme as any).complexity
      }));

      // Obtener sesiones pendientes para contar
      const pendingSessions = await StudySession.findAll({
        where: {
          studyPlanId: planId,
          scheduledDate: { [Op.gte]: fromDate },
          status: SessionStatus.PENDING
        }
      });

      if (pendingSessions.length === 0) {
        console.log('ℹ️ No hay sesiones pendientes para rebalancear');
        return;
      }

      // Eliminar sesiones pendientes desde la fecha
      await StudySession.destroy({
        where: {
          studyPlanId: planId,
          scheduledDate: { [Op.gte]: fromDate },
          status: SessionStatus.PENDING
        }
      });

      console.log(`🗑️ Eliminadas ${pendingSessions.length} sesiones pendientes`);

      // Convertir horario semanal a formato esperado
      const weeklyScheduleData: WeeklyScheduleData = {
        monday: weeklySchedule.monday,
        tuesday: weeklySchedule.tuesday,
        wednesday: weeklySchedule.wednesday,
        thursday: weeklySchedule.thursday,
        friday: weeklySchedule.friday,
        saturday: weeklySchedule.saturday,
        sunday: weeklySchedule.sunday
      };

      // Regenerar calendario desde la fecha (ahora solo con sistema de rotación)
      const result = await this.generateSmartCalendar(
        planId,
        fromDate,
        plan.examDate,
        weeklyScheduleData,
        themes
      );

      if (!result.success) {
        throw new Error(result.message || 'Error al regenerar calendario');
      }

      console.log(`✅ Calendario rebalanceado exitosamente: ${result.sessions?.length} nuevas sesiones creadas`);
    } catch (error) {
      console.error('❌ Error al rebalancear calendario:', error);
      throw error;
    }
  }
}