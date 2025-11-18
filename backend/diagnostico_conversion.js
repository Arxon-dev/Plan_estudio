// Diagnóstico detallado del problema de conversión
const { addDays } = require('date-fns');

// Simular el problema real
const startDate = new Date('2025-11-18');
const examDate = new Date('2026-09-22');

// Crear días disponibles (solo lunes a viernes, 2h cada día)
const daysWithHours = [];
let currentDate = new Date(startDate);

while (currentDate <= examDate) {
  const dayOfWeek = currentDate.getDay();
  if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Lunes a viernes
    daysWithHours.push({
      date: new Date(currentDate),
      hours: 2,
      dayOfWeek: dayOfWeek
    });
  }
  currentDate = addDays(currentDate, 1);
}

console.log('📅 DÍAS DISPONIBLES:');
console.log(`   Total días: ${daysWithHours.length}`);
console.log(`   Primer día: ${daysWithHours[0].date.toLocaleDateString()}`);
console.log(`   Último día: ${daysWithHours[daysWithHours.length - 1].date.toLocaleDateString()}`);

// Crear mapa de días disponibles (como en el método)
const daysMap = new Map();
daysWithHours.forEach(dayInfo => {
  const dayKey = dayInfo.date.toISOString().split('T')[0];
  daysMap.set(dayKey, dayInfo);
});

console.log(`\n📅 MAPA DE DÍAS: ${daysMap.size} entradas`);

// Simular sesiones de rotación (como las que genera RotationStudyService)
// Cada semana debería tener sesiones para los días disponibles
const rotationPlan = [];
const totalWeeks = 44;

for (let week = 0; week < totalWeeks; week++) {
  const weekStart = addDays(startDate, week * 7);
  const weekSessions = [];
  
  // Para cada día disponible en la semana
  for (let day = 0; day < 7; day++) {
    const dayDate = addDays(weekStart, day);
    const dayOfWeek = dayDate.getDay();
    
    // Solo crear sesiones para lunes a viernes
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      weekSessions.push({
        themeId: 1,
        themeName: 'Tema de prueba',
        hours: 1,
        sessionType: 'STUDY',
        lastStudied: dayDate // ESTA ES LA CLAVE: la fecha de lastStudied
      });
    }
  }
  
  rotationPlan.push(weekSessions);
}

console.log(`\n🔄 PLAN DE ROTACIÓN SIMULADO: ${rotationPlan.length} semanas`);
console.log(`   Sesiones por semana: ${rotationPlan[0].length}`);

// Ahora simular el método convertRotationPlanToSessions
console.log('\n🔄 PROCESANDO CONVERSIÓN...');
const sessions = [];

rotationPlan.forEach((weekSessions, weekIndex) => {
  console.log(`\n📅 Semana ${weekIndex + 1}: ${weekSessions.length} sesiones`);
  
  // Agrupar por día
  const sessionsByDay = new Map();
  weekSessions.forEach(session => {
    if (session.lastStudied) {
      const dayKey = session.lastStudied.toISOString().split('T')[0];
      if (!sessionsByDay.has(dayKey)) {
        sessionsByDay.set(dayKey, []);
      }
      sessionsByDay.get(dayKey).push(session);
    }
  });
  
  console.log(`   Días únicos en semana: ${sessionsByDay.size}`);
  
  // Procesar cada día
  let sessionsConvertedThisWeek = 0;
  sessionsByDay.forEach((daySessions, dayKey) => {
    const dayInfo = daysMap.get(dayKey);
    
    if (!dayInfo) {
      console.log(`   ⚠️  Día ${dayKey} NO encontrado en mapa`);
      return;
    }
    
    console.log(`   ✓ Día ${dayKey}: ${daySessions.length} sesiones`);
    
    daySessions.forEach(session => {
      sessions.push({
        scheduledDate: dayInfo.date,
        scheduledHours: session.hours
      });
      sessionsConvertedThisWeek++;
    });
  });
  
  console.log(`   → Sesiones convertidas esta semana: ${sessionsConvertedThisWeek}`);
});

console.log(`\n✅ TOTAL SESIONES CONVERTIDAS: ${sessions.length}`);

// Verificar cobertura
if (sessions.length > 0) {
  const firstDate = sessions[0].scheduledDate;
  const lastDate = sessions[sessions.length - 1].scheduledDate;
  console.log(`📊 COBERTURA: ${firstDate.toLocaleDateString()} → ${lastDate.toLocaleDateString()}`);
  
  const coverageDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`📅 Días de cobertura: ${coverageDays}`);
  console.log(`📅 Semanas de cobertura: ${(coverageDays / 7).toFixed(1)}`);
}