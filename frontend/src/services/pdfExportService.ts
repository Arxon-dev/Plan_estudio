import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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
  completedHours?: number;
}

interface ExportOptions {
  userName: string;
  planName: string;
  examDate: string;
  sessions: Session[];
}

export class PDFExportService {
  /**
   * Exporta el calendario de sesiones a PDF con marca de agua de OpoMelilla.com
   */
  static async exportCalendarToPDF(options: ExportOptions): Promise<void> {
    const { userName, planName, examDate, sessions } = options;

    // Crear documento PDF en formato A4
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Header del documento
    this.addHeader(doc, userName, planName, examDate, sessions.length);

    // Calcular totales
    const totalHours = sessions.reduce((sum, s) => sum + Number(s.scheduledHours || 0), 0);
    const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
    const pendingSessions = sessions.filter(s => s.status === 'PENDING').length;

    // Agrupar sesiones por semana
    const sessionsByWeek = this.groupSessionsByWeek(sessions);

    let startY = 71; // Posición inicial después del header (ajustado para nuevo texto)

    // Generar tabla por cada semana
    Object.entries(sessionsByWeek).forEach(([weekLabel, weekSessions], index) => {
      // Título de la semana
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(37, 99, 235); // blue-600
      doc.text(weekLabel, 14, startY);
      startY += 5;

      // Preparar datos para la tabla
      const tableData = weekSessions.map(session => [
        format(new Date(session.scheduledDate), 'EEE dd/MM', { locale: es }),
        this.getThemeTitle(session),
        this.getSessionTypeLabel(session.sessionType || 'STUDY'),
        `${session.scheduledHours}h`,
        `Bloque ${session.theme?.block || '-'}`,
        this.getStatusLabel(session.status),
      ]);

      // Generar tabla
      autoTable(doc, {
        startY: startY,
        head: [['Día', 'Tema', 'Tipo', 'Horas', 'Bloque', 'Estado']],
        body: tableData,
        theme: 'striped',
        headStyles: {
          fillColor: [59, 130, 246], // blue-500
          textColor: 255,
          fontSize: 9,
          fontStyle: 'bold',
        },
        bodyStyles: {
          fontSize: 8,
          textColor: 60,
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252], // slate-50
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Día
          1: { cellWidth: 70 }, // Tema
          2: { cellWidth: 20 }, // Tipo
          3: { cellWidth: 15 }, // Horas
          4: { cellWidth: 22 }, // Bloque
          5: { cellWidth: 28 }, // Estado
        },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          // Añadir footer en cada página
          this.addFooter(doc, pageWidth, pageHeight);
        },
      });

      // Actualizar posición Y para la siguiente semana
      startY = (doc as any).lastAutoTable.finalY + 10;

      // Si no hay espacio suficiente, nueva página
      if (startY > pageHeight - 40 && index < Object.keys(sessionsByWeek).length - 1) {
        doc.addPage();
        startY = 20;
      }
    });

    // Añadir página de resumen
    this.addSummaryPage(doc, {
      totalSessions: sessions.length,
      totalHours,
      completedSessions,
      pendingSessions,
      sessionsByBlock: this.groupSessionsByBlock(sessions),
    });

    // Descargar el PDF
    const fileName = `Plan_Estudio_${planName.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`;
    doc.save(fileName);
  }

  /**
   * Añade header del documento
   */
  private static addHeader(
    doc: jsPDF,
    userName: string,
    planName: string,
    examDate: string,
    totalSessions: number
  ): void {
    // Título principal
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138); // blue-900
    doc.text('PLAN DE ESTUDIO - PERMANENCIA FAS 2026', 14, 20);

    // Línea separadora
    doc.setDrawColor(59, 130, 246); // blue-500
    doc.setLineWidth(0.5);
    doc.line(14, 23, doc.internal.pageSize.getWidth() - 14, 23);

    // Información del usuario
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Usuario: ${userName}`, 14, 30);
    doc.text(`Plan: ${planName}`, 14, 36);
    doc.text(`Fecha Examen: ${format(new Date(examDate), 'dd/MM/yyyy')}`, 14, 42);
    doc.text(`Total Sesiones: ${totalSessions}`, 14, 48);

    // Mensaje de OpoMelilla.com
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235); // blue-600
    doc.text('Prepárate con OpoMelilla.com', 14, 54);

    // Fecha de generación
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(
      `Generado el ${format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}`,
      doc.internal.pageSize.getWidth() - 14,
      54,
      { align: 'right' }
    );

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.3);
    doc.line(14, 59, doc.internal.pageSize.getWidth() - 14, 59);
  }

  /**
   * Añade footer en cada página
   */
  private static addFooter(doc: jsPDF, pageWidth: number, pageHeight: number): void {
    const pageNumber = (doc as any).internal.getCurrentPageInfo().pageNumber;
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(120, 120, 120);
    
    // Número de página
    doc.text(
      `Página ${pageNumber}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    
    // Texto "Generado por OpoMelilla.com"
    doc.text(
      'Generado por OpoMelilla.com',
      pageWidth - 14,
      pageHeight - 10,
      { align: 'right' }
    );
  }

  /**
   * Añade página de resumen
   */
  private static addSummaryPage(doc: jsPDF, summary: any): void {
    doc.addPage();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('RESUMEN DEL PLAN DE ESTUDIO', 14, 20);

    // Línea
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(14, 23, pageWidth - 14, 23);

    let y = 35;

    // Estadísticas generales
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('📊 Estadísticas Generales', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`• Total de sesiones: ${summary.totalSessions}`, 20, y);
    y += 6;
    doc.text(`• Total de horas: ${summary.totalHours.toFixed(1)}h`, 20, y);
    y += 6;
    doc.text(`• Sesiones completadas: ${summary.completedSessions}`, 20, y);
    y += 6;
    doc.text(`• Sesiones pendientes: ${summary.pendingSessions}`, 20, y);
    y += 6;
    doc.text(
      `• Progreso: ${((summary.completedSessions / summary.totalSessions) * 100).toFixed(1)}%`,
      20,
      y
    );
    y += 15;

    // Distribución por bloque
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text('📚 Distribución por Bloque Temático', 14, y);
    y += 8;

    const blockData = Object.entries(summary.sessionsByBlock).map(([block, data]: [string, any]) => [
      `Bloque ${block}`,
      data.sessions.toString(),
      `${data.hours.toFixed(1)}h`,
      `${((data.sessions / summary.totalSessions) * 100).toFixed(1)}%`,
    ]);

    autoTable(doc, {
      startY: y,
      head: [['Bloque', 'Sesiones', 'Horas', '% Total']],
      body: blockData,
      theme: 'grid',
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: 255,
        fontSize: 10,
        fontStyle: 'bold',
      },
      bodyStyles: {
        fontSize: 9,
        textColor: 60,
      },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40 },
        2: { cellWidth: 40 },
        3: { cellWidth: 40 },
      },
      margin: { left: 20, right: 14 },
    });

    // Footer
    this.addFooter(doc, pageWidth, pageHeight);
  }

  /**
   * Agrupa sesiones por semana
   */
  private static groupSessionsByWeek(sessions: Session[]): Record<string, Session[]> {
    const grouped: Record<string, Session[]> = {};

    sessions
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .forEach(session => {
        const date = new Date(session.scheduledDate);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1); // Lunes

        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6); // Domingo

        const weekLabel = `SEMANA ${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`;

        if (!grouped[weekLabel]) {
          grouped[weekLabel] = [];
        }
        grouped[weekLabel].push(session);
      });

    return grouped;
  }

  /**
   * Agrupa sesiones por bloque
   */
  private static groupSessionsByBlock(sessions: Session[]): Record<string, { sessions: number; hours: number }> {
    const grouped: Record<string, { sessions: number; hours: number }> = {};

    sessions.forEach(session => {
      const block = String(session.theme?.block || 0);
      if (!grouped[block]) {
        grouped[block] = { sessions: 0, hours: 0 };
      }
      grouped[block].sessions++;
      grouped[block].hours += Number(session.scheduledHours || 0);
    });

    return grouped;
  }

  /**
   * Obtiene el título completo del tema
   */
  private static getThemeTitle(session: Session): string {
    if (!session.theme) return 'Sin tema';
    
    const baseTitle = `Tema ${session.theme.themeNumber} - ${session.theme.title}`;
    
    // Si tiene nota de parte, añadirla
    if (session.notes && session.notes.includes('— Parte')) {
      const match = session.notes.match(/— Parte \d+/);
      if (match) {
        return `${baseTitle} ${match[0]}`;
      }
    }
    
    return baseTitle;
  }

  /**
   * Obtiene la etiqueta del tipo de sesión
   */
  private static getSessionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      STUDY: 'EST',
      REVIEW: 'REP',
      TEST: 'TEST',
      DEEP_REVIEW: 'PROF',
    };
    return labels[type] || type;
  }

  /**
   * Obtiene la etiqueta del estado
   */
  private static getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Pendiente',
      IN_PROGRESS: 'En progreso',
      COMPLETED: '✓ Completada',
      SKIPPED: 'Saltada',
    };
    return labels[status] || status;
  }
}
