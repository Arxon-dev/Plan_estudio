// Diagnóstico del método convertRotationPlanToSessions con logs detallados
const { addDays } = require('date-fns');

// Simular datos reales
const startDate = new Date('2025-11-18');
const bufferEnd = new Date('2026-09-22');

// Crear días disponibles (solo lunes a viernes, 2h cada día)
const daysWithHours = [];
let currentDate = new Date(startDate);

while (currentDate <= bufferEnd) {
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

console.log('📅 DÍAS DISPONIBLES CREADOS:');
console.log(`   Total: ${daysWithHours.length} días`);
console.log(`   Primer día: ${daysWithHours[0].date.toLocaleDateString()}`);
console.log(`   Último día: ${daysWithHours[daysWithHours.length - 1].date.toLocaleDateString()}`);

// Crear mapa de días disponibles
const daysMap = new Map();
daysWithHours.forEach(dayInfo => {
  const dayKey = dayInfo.date.toISOString().split('T')[0];
  daysMap.set(dayKey, dayInfo);
});

console.log(`📅 MAPA DE DÍAS: ${daysMap.size} entradas`);

// Simular rotationPlan con solo 6 semanas (como el usuario reporta)
const rotationPlan = [];
const problemWeeks = 6; // El usuario reporta solo 6 semanas

for (let week = 0; week < problemWeeks; week++) {
  const weekStart = addDays(startDate, week * 7);
  const weekSessions = [];
  
  // Crear 9 sesiones por semana (como el usuario reporta: 54 sesiones / 6 semanas = 9 sesiones/semana)
  for (let day = 0; day < 5; day++) { // Lunes a viernes
    const dayDate = addDays(weekStart, day);
    
    // Crear 1-2 sesiones por día
    const sessionsPerDay = Math.random() > 0.5 ? 2 : 1;
    for (let s = 0; s < sessionsPerDay; s++) {
      weekSessions.push({
        themeId: 1,
        themeName: 'Tema de prueba',
        hours: 1,
        sessionType: 'STUDY',
        lastStudied: dayDate
      });
    }
  }
  
  rotationPlan.push(weekSessions);
}

console.log(`\n🔄 ROTATION PLAN SIMULADO (PROBLEMA):`);
console.log(`   Semanas: ${rotationPlan.length}`);
console.log(`   Sesiones primera semana: ${rotationPlan[0].length}`);
console.log(`   Sesiones última semana: ${rotationPlan[rotationPlan.length - 1].length}`);

// Ahora simular el método convertRotationPlanToSessions con logs detallados
console.log('\n🔄 PROCESANDO CONVERSIÓN (SIMULACIÓN DEL PROBLEMA):');
console.log(`📅 Procesando ${rotationPlan.length} semanas de rotación`);
console.log(`📊 Días disponibles: ${daysWithHours.length} días`);

const sessions = [];
let totalProcessedWeeks = 0;

rotationPlan.forEach((weekSessions, weekIndex) => {
  console.log(`📅 Semana ${weekIndex + 1}: ${weekSessions.length} sesiones`);
  
  // Agrupar sesiones por día
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
  let sessionsThisWeek = 0;
  sessionsByDay.forEach((daySessions, dayKey) => {
    const dayInfo = daysMap.get(dayKey);
    
    if (!dayInfo) {
      console.log(`   ⚠️  Día ${dayKey} no encontrado en días disponibles`);
      return;
    }
    
    if (dayInfo.hours === 0) {
      console.log(`   ⚠️  Día ${dayKey} tiene 0 horas disponibles`);
      return;
    }
    
    console.log(`   ✓ Día ${dayKey}: ${daySessions.length} sesiones, ${dayInfo.hours}h disponibles`);
    
    // Convertir sesiones
    daySessions.forEach(session => {
      sessions.push({
        studyPlanId: 1,
        themeId: session.themeId,
        scheduledDate: dayInfo.date,
        scheduledHours: session.hours,
        status: 'PENDING',
        notes: `Estudio: ${session.themeName}`,
        sessionType: 'STUDY',
        reviewStage: 0
      });
      sessionsThisWeek++;
    });
  });
  
  console.log(`   → Sesiones convertidas esta semana: ${sessionsThisWeek}`);
  totalProcessedWeeks++;
});

console.log(`\n✅ RESUMEN DE CONVERSIÓN:`);
console.log(`   Semanas procesadas: ${totalProcessedWeeks}`);
console.log(`   Sesiones totales convertidas: ${sessions.length}`);
console.log(`   Sesiones por semana promedio: ${(sessions.length / totalProcessedWeeks).toFixed(1)}`);

if (sessions.length > 0) {
  const firstDate = sessions[0].scheduledDate;
  const lastDate = sessions[sessions.length - 1].scheduledDate;
  console.log(`   Cobertura: ${firstDate.toLocaleDateString()} → ${lastDate.toLocaleDateString()}`);
  
  const coverageDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`   Días de cobertura: ${coverageDays}`);
  console.log(`   Semanas de cobertura: ${(coverageDays / 7).toFixed(1)}`);
}