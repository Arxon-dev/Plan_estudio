// Verificar cuántas semanas genera realmente RotationStudyService
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

console.log('🔄 Verificando RotationStudyService...');
console.log(`📅 Período: ${startDate.toLocaleDateString()} → ${examDate.toLocaleDateString()}`);

try {
  const rotationPlan = RotationStudyService.createRotationGroups(
    themes,
    weeklySchedule,
    startDate,
    examDate
  );
  
  console.log(`✅ Semanas generadas por RotationStudyService: ${rotationPlan.length}`);
  
  // Verificar distribución por semanas
  rotationPlan.forEach((weekSessions, index) => {
    const weekStart = new Date(startDate);
    weekStart.setDate(startDate.getDate() + (index * 7));
    console.log(`   Semana ${index + 1} (${weekStart.toLocaleDateString()}): ${weekSessions.length} sesiones`);
  });
  
} catch (error) {
  console.error('❌ Error:', error.message);
}