// Verificar el flujo completo con buffer
const { addDays } = require('date-fns');

// Simular los datos del usuario
const userStartDate = '2025-11-18';
const userExamDate = '2026-10-22';
const bufferDays = 30;

console.log('🔍 VERIFICACIÓN DEL FLUJO COMPLETO:');
console.log(`📅 Fecha inicio usuario: ${userStartDate}`);
console.log(`📅 Fecha examen usuario: ${userExamDate}`);
console.log(`📅 Buffer días: ${bufferDays}`);

// Calcular buffer (como en el controlador)
const startDate = new Date(userStartDate);
const examDate = new Date(userExamDate);
const bufferEnd = addDays(examDate, -bufferDays);

console.log(`📅 Buffer end calculado: ${bufferEnd.toLocaleDateString()}`);

// Verificar períodos
const totalDaysFull = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeksFull = Math.ceil(totalDaysFull / 7);

const totalDaysBuffer = Math.ceil((bufferEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeksBuffer = Math.ceil(totalDaysBuffer / 7);

console.log(`\n📊 PERÍODOS:`);
console.log(`   Período completo: ${totalDaysFull} días → ${totalWeeksFull} semanas`);
console.log(`   Con buffer: ${totalDaysBuffer} días → ${totalWeeksBuffer} semanas`);

// Verificar qué semanas cubre realmente
console.log(`\n📅 COBERTURA REAL:`);
console.log(`   Debería cubrir hasta: ${bufferEnd.toLocaleDateString()}`);

// El usuario reportó que solo llega hasta 28/12/2025
const reportedEnd = new Date('2025-12-28');
const reportedDays = Math.ceil((reportedEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const reportedWeeks = Math.ceil(reportedDays / 7);

console.log(`   Usuario reporta que llega hasta: ${reportedEnd.toLocaleDateString()}`);
console.log(`   Eso son: ${reportedDays} días → ${reportedWeeks} semanas`);

console.log(`\n🚨 PROBLEMA IDENTIFICADO:`);
console.log(`   El sistema debería generar ${totalWeeksBuffer} semanas pero solo genera ${reportedWeeks}`);
console.log(`   Esto es un ${((reportedWeeks/totalWeeksBuffer)*100).toFixed(1)}% del total esperado`);