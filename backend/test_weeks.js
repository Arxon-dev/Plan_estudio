// Calcular semanas necesarias para el período completo
const startDate = new Date('2025-11-18');
const examDate = new Date('2026-10-22');

const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeks = Math.ceil(totalDays / 7);

console.log('📅 FECHAS:');
console.log(`   Inicio: ${startDate.toLocaleDateString()}`);
console.log(`   Examen: ${examDate.toLocaleDateString()}`);
console.log(`   Total días: ${totalDays}`);
console.log(`   Total semanas necesarias: ${totalWeeks}`);

// Verificar fechas de cada semana
console.log('\n📅 PRIMERAS SEMANAS:');
for (let week = 0; week < 10; week++) {
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + (week * 7));
  console.log(`   Semana ${week + 1}: ${weekStart.toLocaleDateString()}`);
}

console.log('\n📅 ÚLTIMAS SEMANAS:');
for (let week = totalWeeks - 5; week < totalWeeks; week++) {
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + (week * 7));
  console.log(`   Semana ${week + 1}: ${weekStart.toLocaleDateString()}`);
}