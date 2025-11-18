// Test para verificar convertRotationPlanToSessions
const { StudyPlanService } = require('./dist/services/StudyPlanService');
const { RotationStudyService } = require('./dist/services/RotationStudyService');
const { addDays } = require('date-fns');

// Simular datos de prueba
const themes = [
  { id: 1, title: 'Parte 1 - Tema 1', complexity: 3, multiplier: 1 },
  { id: 2, title: 'Parte 1 - Tema 2', complexity: 2, multiplier: 1 },
  { id: 3, title: 'Parte 2 - Tema 3', complexity: 4, multiplier: 1 },
  { id: 4, title: 'Parte 2 - Tema 4', complexity: 3, multiplier: 1 },
  { id: 5, title: 'Parte 3 - Tema 5', complexity: 5, multiplier: 1 },
  { id: 6, title: 'Parte 3 - Tema 6', complexity: 2, multiplier: 1 }
];

const weeklySchedule = {
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 2,
  friday: 2,
  saturday: 0,
  sunday: 0
};

const startDate = new Date('2025-11-18');
const examDate = new Date('2026-09-22'); // Con buffer de 30 días

console.log('🔄 Test de convertRotationPlanToSessions...');

// Generar plan de rotación
const rotationPlan = RotationStudyService.createRotationGroups(
  themes,
  weeklySchedule,
  startDate,
  examDate
);

console.log(`✅ Plan de rotación generado: ${rotationPlan.length} semanas`);

// Crear días disponibles (simulando la validación)
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

console.log(`✅ Días disponibles: ${daysWithHours.length}`);

// Test del método de conversión
console.log('\n🔄 Procesando conversión...');
const sessions = StudyPlanService.convertRotationPlanToSessions(1, rotationPlan, daysWithHours);

console.log(`✅ Sesiones convertidas: ${sessions.length}`);

// Verificar cobertura
if (sessions.length > 0) {
  const firstDate = sessions[0].scheduledDate;
  const lastDate = sessions[sessions.length - 1].scheduledDate;
  console.log(`📊 Cobertura: ${firstDate.toLocaleDateString()} → ${lastDate.toLocaleDateString()}`);
  
  const coverageDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));
  console.log(`📅 Días de cobertura: ${coverageDays}`);
  
  const expectedWeeks = coverageDays / 7;
  console.log(`📅 Semanas de cobertura: ${expectedWeeks.toFixed(1)}`);
}