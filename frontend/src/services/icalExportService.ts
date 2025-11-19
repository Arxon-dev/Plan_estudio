import { format } from 'date-fns';

/**
 * Servicio para exportar calendario de estudio a formato iCal (.ics)
 * Compatible con Apple Calendar, Google Calendar, Outlook, etc.
 */

interface Session {
  id: number;
  scheduledDate: string;
  scheduledHours: number;
  status: string;
  sessionType?: string;
  notes?: string;
  theme?: {
    id: number;
    themeNumber: number;
    title: string;
    block: number | string;
  };
}

export interface ICalExportOptions {
  userName: string;
  planName: string;
  examDate: string;
  sessions: Session[];
}

export class ICalExportService {
  /**
   * Exporta el calendario completo a formato iCal (.ics)
   */
  static exportToICal(options: ICalExportOptions): void {
    const { userName, planName, examDate, sessions } = options;

    // Filtrar solo sesiones pendientes y en progreso (no completadas ni saltadas)
    const futureSessions = sessions.filter(
      (s) => s.status === 'PENDING' || s.status === 'IN_PROGRESS'
    );

    // Generar contenido iCal
    const icalContent = this.generateICalContent(userName, planName, examDate, futureSessions);

    // Descargar archivo
    this.downloadICalFile(icalContent, planName);
  }

  /**
   * Genera el contenido del archivo iCal
   */
  private static generateICalContent(
    userName: string,
    planName: string,
    examDate: string,
    sessions: Session[]
  ): string {
    const now = new Date();
    const timestamp = this.formatDateToICal(now);

    // Header del archivo iCal
    let ical = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//OpoMelilla//Plan de Estudio//ES',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      `X-WR-CALNAME:${this.escapeText(planName)}`,
      'X-WR-TIMEZONE:Europe/Madrid',
      `X-WR-CALDESC:Plan de estudio para ${this.escapeText(userName)} - Examen: ${format(new Date(examDate), 'dd/MM/yyyy')}`,
      'BEGIN:VTIMEZONE',
      'TZID:Europe/Madrid',
      'BEGIN:STANDARD',
      'DTSTART:19701025T030000',
      'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
      'TZOFFSETFROM:+0200',
      'TZOFFSETTO:+0100',
      'END:STANDARD',
      'BEGIN:DAYLIGHT',
      'DTSTART:19700329T020000',
      'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
      'TZOFFSETFROM:+0100',
      'TZOFFSETTO:+0200',
      'END:DAYLIGHT',
      'END:VTIMEZONE',
    ].join('\r\n');

    // Añadir cada sesión como evento
    sessions.forEach((session) => {
      ical += '\r\n' + this.generateEventForSession(session, timestamp);
    });

    // Añadir evento del examen
    ical += '\r\n' + this.generateExamEvent(examDate, timestamp);

    // Footer
    ical += '\r\nEND:VCALENDAR';

    return ical;
  }

  /**
   * Genera un evento iCal para una sesión de estudio
   */
  private static generateEventForSession(session: Session, timestamp: string): string {
    const sessionDate = new Date(session.scheduledDate);
    const startTime = new Date(sessionDate);
    startTime.setHours(9, 0, 0, 0); // Por defecto, sesiones a las 9:00 AM

    const endTime = new Date(startTime);
    const durationMinutes = Math.round(session.scheduledHours * 60);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);

    const title = this.getSessionTitle(session);
    const description = this.getSessionDescription(session);
    const sessionType = this.getSessionTypeLabel(session.sessionType || 'STUDY');

    return [
      'BEGIN:VEVENT',
      `UID:session-${session.id}@opomelilla.com`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;TZID=Europe/Madrid:${this.formatDateToICal(startTime)}`,
      `DTEND;TZID=Europe/Madrid:${this.formatDateToICal(endTime)}`,
      `SUMMARY:${this.escapeText(title)}`,
      `DESCRIPTION:${this.escapeText(description)}`,
      `LOCATION:OpoMelilla - Plan de Estudio`,
      `CATEGORIES:${sessionType}`,
      'STATUS:TENTATIVE',
      'TRANSP:OPAQUE',
      `URL:https://planestudiofrontend-production.up.railway.app/sessions`,
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Recordatorio de sesión de estudio',
      'TRIGGER:-PT30M', // Alarma 30 minutos antes
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  }

  /**
   * Genera evento para el día del examen
   */
  private static generateExamEvent(examDate: string, timestamp: string): string {
    const examDay = new Date(examDate);
    examDay.setHours(9, 0, 0, 0);

    const examEnd = new Date(examDay);
    examEnd.setHours(14, 0, 0, 0); // Examen de 5 horas (ejemplo)

    return [
      'BEGIN:VEVENT',
      `UID:exam-day@opomelilla.com`,
      `DTSTAMP:${timestamp}`,
      `DTSTART;TZID=Europe/Madrid:${this.formatDateToICal(examDay)}`,
      `DTEND;TZID=Europe/Madrid:${this.formatDateToICal(examEnd)}`,
      `SUMMARY:🎯 DÍA DEL EXAMEN - Permanencia FAS 2026`,
      `DESCRIPTION:¡Día del examen oficial! Has trabajado duro para llegar aquí. ¡Mucha suerte!\n\nConsejos:\n- Llega con 30 minutos de antelación\n- Lleva DNI y material necesario\n- Descansa bien la noche anterior\n- Confía en tu preparación`,
      `LOCATION:Por determinar`,
      'CATEGORIES:EXAMEN',
      'STATUS:CONFIRMED',
      'TRANSP:OPAQUE',
      'PRIORITY:9',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:¡Mañana es el examen! Prepara tu material',
      'TRIGGER:-P1D', // Alarma 1 día antes
      'END:VALARM',
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      'DESCRIPTION:Día del examen - Sal con tiempo',
      'TRIGGER:-PT1H', // Alarma 1 hora antes
      'END:VALARM',
      'END:VEVENT',
    ].join('\r\n');
  }

  /**
   * Obtiene el título de la sesión
   */
  private static getSessionTitle(session: Session): string {
    const sessionType = this.getSessionTypeLabel(session.sessionType || 'STUDY');
    const themeName = session.theme?.title || `Tema ${session.theme?.themeNumber || '?'}`;
    
    return `${sessionType}: ${themeName}`;
  }

  /**
   * Obtiene la descripción detallada de la sesión
   */
  private static getSessionDescription(session: Session): string {
    const sessionType = this.getSessionTypeLabel(session.sessionType || 'STUDY');
    const themeName = session.theme?.title || `Tema ${session.theme?.themeNumber || '?'}`;
    const duration = session.scheduledHours >= 1 
      ? `${session.scheduledHours}h` 
      : `${Math.round(session.scheduledHours * 60)} min`;
    
    let description = `📚 ${sessionType}\\n`;
    description += `📖 Tema: ${themeName}\\n`;
    description += `⏰ Duración: ${duration}\\n`;
    
    if (session.theme?.block) {
      description += `📂 Bloque: ${session.theme.block}\\n`;
    }
    
    if (session.notes) {
      description += `\\n📝 Notas: ${session.notes}\\n`;
    }
    
    description += `\\n✨ Preparado con OpoMelilla.com`;
    
    return description;
  }

  /**
   * Obtiene la etiqueta del tipo de sesión
   */
  private static getSessionTypeLabel(sessionType: string): string {
    const labels: Record<string, string> = {
      STUDY: '📖 Estudio',
      REVIEW: '🔄 Repaso',
      TEST: '📝 Test',
      SIMULATION: '🎯 Simulacro',
    };
    return labels[sessionType] || '📖 Estudio';
  }

  /**
   * Formatea una fecha al formato iCal (YYYYMMDDTHHmmss)
   */
  private static formatDateToICal(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    return `${year}${month}${day}T${hours}${minutes}${seconds}`;
  }

  /**
   * Escapa caracteres especiales para iCal
   */
  private static escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  /**
   * Descarga el archivo .ics
   */
  private static downloadICalFile(content: string, planName: string): void {
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `${planName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.ics`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    window.URL.revokeObjectURL(url);
  }
}
