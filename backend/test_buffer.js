// Calcular semanas con buffer de 30 días
const startDate = new Date('2025-11-18');
const examDate = new Date('2026-10-22');
const bufferEnd = new Date('2026-09-22'); // 30 días antes del examen

const totalDaysFull = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeksFull = Math.ceil(totalDaysFull / 7);

const totalDaysBuffer = Math.ceil((bufferEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeksBuffer = Math.ceil(totalDaysBuffer / 7);

console.log('📅 COMPARACIÓN DE PERÍODOS:');
console.log(`   Período completo: ${startDate.toLocaleDateString()} → ${examDate.toLocaleDateString()}`);
console.log(`   - Total días: ${totalDaysFull}`);
console.log(`   - Total semanas: ${totalWeeksFull}`);
console.log('');
console.log(`   Con buffer (30 días antes): ${startDate.toLocaleDateString()} → ${bufferEnd.toLocaleDateString()}`);
console.log(`   - Total días: ${totalDaysBuffer}`);
console.log(`   - Total semanas: ${totalWeeksBuffer}`);
console.log('');
console.log(`   Diferencia: ${totalWeeksFull - totalWeeksBuffer} semanas menos con buffer`);