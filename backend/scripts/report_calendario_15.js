const axios = require('axios');
const fs = require('fs');

async function main() {
  try {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzMzUwOTIxLCJleHAiOjE3NjM5NTU3MjF9.RGHxloiQjDc1M8CTCz7hN7zUTSodhvjhDW7eVYM_7O8';
    const base = 'http://localhost:3000/api';
    const headers = { Authorization: `Bearer ${token}` };

    const active = (await axios.get(`${base}/study-plans/active`, { headers })).data;
    const plan = active.plan;
    if (!plan) {
      console.log('No hay plan activo');
      return;
    }

    const sessionsRes = (await axios.get(`${base}/study-plans/${plan.id}/sessions`, { headers })).data;
    const sessions = sessionsRes.sessions.map(s => ({ ...s, scheduledDate: new Date(s.scheduledDate) }));

    const startStr = plan.startDate.slice(0, 10);
    const endStr = plan.examDate.slice(0, 10);
    const start = new Date(`${startStr}T00:00:00Z`);
    const end = new Date(`${endStr}T00:00:00Z`);
    let totalDays = Math.floor((end - start) / 86400000) + 1;
    if (totalDays <= 0) totalDays = 1;

    const fmt = d => d.toISOString().slice(0, 10);
    const isStudy = s => {
      if (s.sessionType) return s.sessionType === 'STUDY';
      const n = (s.notes || '').toUpperCase();
      if (n.includes('REVIEW') || n.includes('REPASO') || n.includes('TEST') || n.includes('SIMULATION') || n.includes('SIMULACRO')) return false;
      return true;
    };

    const byDay = new Map();
    for (const s of sessions) {
      const k = fmt(s.scheduledDate);
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(s);
    }

    const lines = [];
    let ok = 0, fail = 0;
    lines.push('=== Informe del Plan de Estudio ===');
    lines.push(`Plan ID: ${plan.id}`);
    lines.push(`Fecha inicio: ${startStr}`);
    lines.push(`Fecha fin: ${endStr}`);
    lines.push(`Total de días: ${totalDays}`);
    lines.push('');
    lines.push('=== Detalle por día ===');

    for (let i = 0; i < totalDays; i++) {
      const day = new Date(start.getTime() + i * 86400000);
      const k = fmt(day);
      const progressPct = Math.round(((i + 1) / totalDays) * 10000) / 100;
      const limit = progressPct <= 50 ? 2 : progressPct <= 80 ? 4 : progressPct <= 90 ? 6 : 8;
      const study = (byDay.get(k) || []).filter(isStudy);
      const count = study.length;
      const okDay = count <= limit; if (okDay) ok++; else fail++;
      const topics = study.map(ss => ss.theme ? `Bloque ${ss.theme.block} · Tema ${ss.theme.themeNumber}: ${ss.theme.title}` : `Tema ${ss.themeId}`).join('; ');
      lines.push(`${k} | progreso: ${progressPct}% | estudio: ${count} | límite: ${limit} | cumple: ${okDay ? 'Sí' : 'No'} | Temas: ${topics || '-'}`);
    }

    lines.push('');
    lines.push('=== Resumen ===');
    lines.push(`Días que cumplen: ${ok}`);
    lines.push(`Días que NO cumplen: ${fail}`);
    lines.push(`Porcentaje de cumplimiento: ${Math.round((ok / totalDays) * 10000) / 100}%`);

    const outFile = `backend/report_calendario_${plan.id}.txt`;
    fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
    console.log('OK:', outFile);
  } catch (e) {
    console.log('Error', e.message);
  }
}

main();