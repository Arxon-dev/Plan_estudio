import { StudyPlan, StudySession, Theme, WeeklySchedule, SessionStatus, SessionType } from '@models/index';
import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { Op } from 'sequelize';

interface ThemeInput {
  id: number;
  name: string;
  hours: number;
  priority: number;
}

interface WeeklyScheduleData {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

/**
 * Servicio simplificado de generación de calendario
 * Versión robusta que maneja errores y proporciona logging detallado
 */
export class SimpleCalendarGenerator {
  
  static async generateCalendar(
    planId: number,
    startDate: Date,
    examDate: Date,
    weeklySchedule: WeeklyScheduleData,
    themes: ThemeInput[]
  ): Promise<{ success: boolean; message?: string; sessions?: any[] }> {
    
    console.log(`\n🎯 ===== GENERACIÓN SIMPLIFICADA INICIADA =====`);
    console.log(`📅 Plan ID: ${planId}`);
    console.log(`📅 Fecha Inicio: ${startDate.toLocaleDateString()}`);
    console.log(`📅 Fecha Examen: ${examDate.toLocaleDateString()}`);
    console.log(`📚 Temas: ${themes.length}`);
    
    try {
      // 1. Calcular días disponibles
      const daysAvailable = this.calculateStudyDays(startDate, examDate, weeklySchedule);
      console.log(`📅 Días disponibles encontrados: ${daysAvailable.length}`);
      
      if (daysAvailable.length === 0) {
        return { success: false, message: 'No hay días disponibles para estudiar' };
      }
      
      // 2. Crear sesiones simples
      const sessions = this.createSimpleSessions(planId, themes, daysAvailable);
      console.log(`📚 Sesiones creadas: ${sessions.length}`);
      
      if (sessions.length === 0) {
        return { success: false, message: 'No se pudieron crear sesiones' };
      }
      
      // 3. Guardar sesiones en BD
      console.log(`💾 Guardando ${sessions.length} sesiones en BD...`);
      await StudySession.bulkCreate(sessions, { 
        validate: false, 
        logging: false 
      } as any);
      
      console.log(`✅ Calendario generado exitosamente: ${sessions.length} sesiones`);
      console.log(`🎯 ========================================\n`);
      
      return { success: true, sessions };
      
    } catch (error) {
      console.error('❌ Error en generación simplificada:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      return { success: false, message: 'Error al generar calendario: ' + errorMessage };
    }
  }
  
  private static calculateStudyDays(
    startDate: Date,
    examDate: Date,
    weeklySchedule: WeeklyScheduleData
  ): { date: Date; hours: number }[] {
    
    const studyDays: { date: Date; hours: number }[] = [];
    const start = startOfDay(startDate);
    const exam = startOfDay(examDate);
    const endDate = addDays(exam, -1); // Buffer de 1 día antes del examen
    
    let currentDate = start;
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      const hours = [
        weeklySchedule.sunday,
        weeklySchedule.monday,
        weeklySchedule.tuesday,
        weeklySchedule.wednesday,
        weeklySchedule.thursday,
        weeklySchedule.friday,
        weeklySchedule.saturday,
      ][dayOfWeek] || 0;
      
      if (hours > 0) {
        studyDays.push({ date: new Date(currentDate), hours });
      }
      
      currentDate = addDays(currentDate, 1);
    }
    
    return studyDays;
  }
  
  private static createSimpleSessions(
    planId: number,
    themes: ThemeInput[],
    studyDays: { date: Date; hours: number }[]
  ): any[] {
    
    const sessions: any[] = [];
    let dayIndex = 0;
    
    // Para cada tema, crear sesiones distribuidas
    for (const theme of themes) {
      const totalHours = theme.hours;
      let remainingHours = totalHours;
      
      // Crear múltiples sesiones para cada tema (estudio + repasos)
      const sessionTypes = [
        { type: 'study', factor: 1.0, label: 'Estudio' },
        { type: 'review1', factor: 0.25, label: 'Repaso 1' },
        { type: 'review2', factor: 0.15, label: 'Repaso 2' },
        { type: 'review3', factor: 0.10, label: 'Repaso 3' }
      ];
      
      for (const sessionType of sessionTypes) {
        const sessionHours = Math.max(totalHours * sessionType.factor, 0.5);
        
        if (remainingHours > 0 && dayIndex < studyDays.length) {
          const studyDay = studyDays[dayIndex];
          
          sessions.push({
            studyPlanId: planId,
            themeId: theme.id,
            scheduledDate: studyDay.date,
            scheduledHours: Math.min(sessionHours, studyDay.hours),
            completedHours: 0,
            status: 'PENDING',
            sessionType: sessionType.type,
            reviewStage: sessionType.type === 'study' ? 0 : 1,
            dueDate: studyDay.date,
            notes: `${sessionType.label} - ${theme.name}`,
            createdAt: new Date(),
            updatedAt: new Date()
          });
          
          remainingHours -= sessionHours;
          dayIndex++;
        }
      }
    }
    
    return sessions;
  }
}