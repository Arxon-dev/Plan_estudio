import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { BaremoData } from '../services/baremoService';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const generateBaremoPDF = (data: BaremoData) => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(40, 40, 40);
    doc.text('Informe de Baremo - OpoMelilla', 14, 22);

    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Fecha: ${format(new Date(), "d 'de' MMMM 'de' yyyy", { locale: es })}`, 14, 30);

    let yPos = 40;

    // --- Resumen de Puntuación ---
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Resumen de Puntuación', 14, yPos);
    yPos += 5;

    const formatNumber = (num: any, decimals: number = 2): string => {
        const n = Number(num);
        return isNaN(n) ? '0.00' : n.toFixed(decimals);
    };

    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Puntos']],
        body: [
            ['Méritos Profesionales', formatNumber(data.puntosMeritosProfesionales)],
            ['Méritos Académicos', formatNumber(data.puntosMeritosAcademicos)],
            ['Informes (IPEC)', formatNumber(data.puntosInformesCalificacion)],
            ['Pruebas Físicas', formatNumber(data.puntosPruebasFisicas)],
            ['Fase de Concurso (Total)', formatNumber(data.puntosConcurso)],
            ['Fase de Oposición', formatNumber(data.puntosOposicion)],
            ['PUNTUACIÓN TOTAL', formatNumber(data.puntosTotal, 3)],
        ],
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] }, // Indigo-600
        styles: { fontSize: 10 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Datos Militares ---
    doc.setFontSize(14);
    doc.text('Datos Militares', 14, yPos);
    yPos += 5;

    autoTable(doc, {
        startY: yPos,
        body: [
            ['Ejército', data.ejercito || '-'],
            ['Empleo', data.empleo || '-'],
            ['Agrupación', data.agrupacionEspecialidad || '-'],
            ['Especialidad', data.especialidadFundamental || '-'],
            ['Fecha Ingreso', data.fechaIngreso ? format(new Date(data.fechaIngreso), 'dd/MM/yyyy') : '-'],
            ['Antigüedad', data.fechaAntiguedad ? format(new Date(data.fechaAntiguedad), 'dd/MM/yyyy') : '-'],
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
    });

    yPos = (doc as any).lastAutoTable.finalY + 10;

    // Tiempos de Servicio
    autoTable(doc, {
        startY: yPos,
        head: [['Concepto', 'Valor', 'Puntos']],
        body: [
            ['Unidades Preferentes (meses)', data.tiempoServiciosUnidadesPreferentes || 0, ((data.tiempoServiciosUnidadesPreferentes || 0) * 0.08).toFixed(2)],
            ['Otras Unidades (meses)', data.tiempoServiciosOtrasUnidades || 0, ((data.tiempoServiciosOtrasUnidades || 0) * 0.04).toFixed(2)],
            ['Operaciones Extranjero (meses)', data.tiempoOperacionesExtranjero || 0, ((data.tiempoOperacionesExtranjero || 0) * 0.1).toFixed(2)],
        ],
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100] },
        styles: { fontSize: 9 },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Méritos Profesionales (Recompensas) ---
    doc.setFontSize(14);
    doc.text('Méritos Profesionales', 14, yPos);
    yPos += 5;

    const recompensasRows = (data.recompensas || []).map((r: any) => [r.tipo, r.puntos]);
    if (recompensasRows.length === 0) {
        recompensasRows.push(['Sin recompensas registradas', '-']);
    }

    autoTable(doc, {
        startY: yPos,
        head: [['Recompensa', 'Puntos']],
        body: recompensasRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Méritos Académicos ---
    doc.setFontSize(14);
    doc.text('Méritos Académicos', 14, yPos);
    yPos += 5;

    const academicRows = [];
    // Titulacion
    if (data.titulacion) {
        academicRows.push(['Titulación', data.titulacion.nivel, data.titulacion.puntos]);
    }
    // Idiomas
    (data.idiomas || []).forEach((i: any) => {
        academicRows.push(['Idioma', `${i.idioma} - ${i.nivel}`, i.puntos]);
    });
    // Cursos
    (data.cursosMilitares || []).forEach((c: any) => {
        academicRows.push(['Curso Militar', `${c.nombreCurso} (${c.tipo})`, c.puntos]);
    });

    if (academicRows.length === 0) {
        academicRows.push(['Sin méritos académicos', '-', '-']);
    }

    autoTable(doc, {
        startY: yPos,
        head: [['Tipo', 'Descripción', 'Puntos']],
        body: academicRows,
        theme: 'striped',
        headStyles: { fillColor: [79, 70, 229] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 15;

    // --- Pruebas Físicas ---
    // Check if we need a new page
    if (yPos > 250) {
        doc.addPage();
        yPos = 20;
    }

    doc.setFontSize(14);
    doc.text('Pruebas Físicas', 14, yPos);
    yPos += 5;

    autoTable(doc, {
        startY: yPos,
        head: [['Prueba', 'Marca']],
        body: [
            ['Flexiones Tronco', data.flexionesTronco || 0],
            ['Flexiones Brazos', data.flexionesBrazos || 0],
            ['Carrera 2000m (seg)', data.tiempoCarrera || 0],
            ['Circuito Agilidad (seg)', data.circuitoAgilidad || 0],
        ],
        theme: 'grid',
        headStyles: { fillColor: [100, 100, 100] },
    });

    // Save
    doc.save('baremo_opomelilla.pdf');
};
