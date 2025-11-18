// Simular el flujo completo del controlador
const { addDays } = require('date-fns');

// Datos del usuario (como los recibe el controlador)
const userInput = {
  startDate: '2025-11-18',
  examDate: '2026-10-22',
  weeklySchedule: {
    monday: 2,
    tuesday: 2,
    wednesday: 2,
    thursday: 2,
    friday: 2,
    saturday: 0,
    sunday: 0
  }
};

console.log('🔄 SIMULACIÓN DEL FLUJO DEL CONTROLADOR:');
console.log(`📅 startDate recibido: ${userInput.startDate}`);
console.log(`📅 examDate recibido: ${userInput.examDate}`);

// Paso 1: Calcular buffer (como en el controlador)
const bufferDays = 30;
const startDate = new Date(userInput.startDate);
const examDate = new Date(userInput.examDate);
const bufferEnd = addDays(examDate, -bufferDays);

console.log(`📅 bufferEnd calculado: ${bufferEnd.toLocaleDateString()}`);

// Paso 2: Calcular semanas (como en RotationStudyService)
const totalDays = Math.ceil((bufferEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeks = Math.ceil(totalDays / 7);

console.log(`📅 totalDays: ${totalDays}`);
console.log(`📅 totalWeeks: ${totalWeeks}`);

// Paso 3: Verificar si hay algún problema con las fechas
console.log('\n🔍 VERIFICACIÓN DE FECHAS:');
console.log(`   startDate: ${startDate.toISOString()}`);
console.log(`   examDate: ${examDate.toISOString()}`);
console.log(`   bufferEnd: ${bufferEnd.toISOString()}`);

// Paso 4: Verificar si el problema está en el formato de fecha
console.log('\n🔍 VERIFICACIÓN DE FORMATO ISO:');
console.log(`   startDate ISO: ${startDate.toISOString().split('T')[0]}`);
console.log(`   bufferEnd ISO: ${bufferEnd.toISOString().split('T')[0]}`);

// Paso 5: Simular la generación de semanas
console.log('\n🔄 SIMULACIÓN DE GENERACIÓN DE SEMANAS:');
const weeks = [];
for (let week = 0; week < totalWeeks; week++) {
  const weekStart = addDays(startDate, week * 7);
  weeks.push({
    week: week + 1,
    startDate: weekStart,
    isoDate: weekStart.toISOString().split('T')[0]
  });
}

console.log(`   Semanas generadas: ${weeks.length}`);
console.log(`   Primera semana: ${weeks[0].isoDate}`);
console.log(`   Última semana: ${weeks[weeks.length - 1].isoDate}`);

// Paso 6: Verificar si hay alguna condición de parada temprana
console.log('\n🔍 VERIFICACIÓN DE POSIBLES PROBLEMAS:');

// Verificar si el problema está en que se está pasando examDate en lugar de bufferEnd
const wrongWeeks = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
console.log(`   Si se usara examDate sin buffer: ${wrongWeeks} semanas`);

// Verificar si hay algún problema con la hora/hora del día
const startDateOnly = startDate.toISOString().split('T')[0];
const bufferEndOnly = bufferEnd.toISOString().split('T')[0];
const daysDiff = Math.ceil((new Date(bufferEndOnly).getTime() - new Date(startDateOnly).getTime()) / (1000 * 60 * 60 * 24));
const weeksDiff = Math.ceil(daysDiff / 7);
console.log(`   Usando solo fechas sin hora: ${weeksDiff} semanas`);