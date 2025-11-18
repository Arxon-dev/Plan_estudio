const axios = require('axios');
const { addDays } = require('date-fns');

// Simular datos del problema real
const startDate = new Date('2025-11-18');
const examDate = new Date('2026-09-22'); // Con buffer de 30 días

const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeks = Math.ceil(totalDays / 7);

console.log('🔍 DIAGNÓSTICO DEL PROBLEMA:');
console.log(`📅 Período: ${startDate.toLocaleDateString()} → ${examDate.toLocaleDateString()}`);
console.log(`📅 Total semanas que debería generar: ${totalWeeks}`);

// Simular días disponibles (solo lunes a viernes, 2h cada día)
const daysWithHours = [];
let currentDate = new Date(startDate);

while (currentDate <= examDate) {
  const dayOfWeek = currentDate.getDay(); // 0=domingo, 1=lunes, ..., 6=sábado
  
  // Lunes a viernes (1-5) con 2 horas
  if (dayOfWeek >= 1 && dayOfWeek <= 5) {
    daysWithHours.push({
      date: new Date(currentDate),
      hours: 2,
      dayOfWeek: dayOfWeek
    });
  }
  
  currentDate = addDays(currentDate, 1);
}

console.log(`📅 Total días disponibles: ${daysWithHours.length}`);

async function checkThemesAndSessions() {
  try {
    const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzNDcyMTQ3LCJleHAiOjE3NjQwNzY5NDd9.zUoaqhq9GRb2awNH7n-_gPRRB5C5TEgbJhM01XnT0hE';
    const api = 'http://localhost:3000/api';
    const themesResp = await axios.get(`${api}/themes`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const titles = themesResp.data.themes.map(t => t.title.toLowerCase());
    console.log('\n📚 Temas disponibles:', themesResp.data.themes.length);
    console.log('   ONU:', titles.some(t => t.includes('naciones unidas')));
    console.log('   OTAN:', titles.some(t => t.includes('atlántico norte')) || titles.some(t => t.includes('otan')));

    const activePlanResp = await axios.get(`${api}/study-plans/active`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const planId = activePlanResp.data.plan.id;
    console.log('📊 Plan activo:', planId);
    const sessionsResp = await axios.get(`${api}/study-plans/${planId}/sessions`, { headers: { Authorization: `Bearer ${TOKEN}` } });
    const themeTitles = [...new Set((sessionsResp.data.sessions||[]).map(s => (s.theme?.title||'').toLowerCase()))];
    console.log('   ONU en sesiones:', themeTitles.some(t => t.includes('naciones unidas')));
    console.log('   OTAN en sesiones:', themeTitles.some(t => t.includes('atlántico norte')) || themeTitles.some(t => t.includes('otan')));
    if (!themeTitles.some(t => t.includes('naciones unidas')) || !themeTitles.some(t => t.includes('atlántico norte'))){
      console.log('⚠️ Falta al menos uno de ONU/OTAN en sesiones. Revisando bloque y IDs...');
      const missing = themesResp.data.themes.filter(t => /naciones unidas|atlántico norte|otan/i.test(t.title));
      console.log('   Encontrados en catálogo:', missing.map(m => ({id:m.id,title:m.title,block:m.block})));
    }
  } catch (e) {
    console.log('❌ Error al consultar temas:', e.response?.data || e.message);
  }
}

checkThemesAndSessions();

// Verificar distribución por meses
const months = {};
daysWithHours.forEach(day => {
  const monthKey = `${day.date.getFullYear()}-${String(day.date.getMonth() + 1).padStart(2, '0')}`;
  if (!months[monthKey]) months[monthKey] = 0;
  months[monthKey]++;
});

console.log('\n📅 DISTRIBUCIÓN POR MESES:');
Object.entries(months).forEach(([month, days]) => {
  console.log(`   ${month}: ${days} días`);
});

// Verificar cuántas semanas cubre hasta diciembre
const dec31 = new Date('2025-12-28');
const daysUntilDec = daysWithHours.filter(day => day.date <= dec31).length;
const weeksUntilDec = Math.ceil(daysUntilDec / 7);

console.log(`\n📅 Días hasta 28/12/2025: ${daysUntilDec}`);
console.log(`📅 Semanas hasta 28/12/2025: ${weeksUntilDec}`);

// El problema: si solo hay 54 sesiones, es porque solo se procesaron 6-7 semanas
console.log(`\n🚨 HIPÓTESIS: El sistema solo procesó ${weeksUntilDec} semanas en lugar de ${totalWeeks}`);