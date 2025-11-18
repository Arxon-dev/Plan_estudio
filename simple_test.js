// Script simple para verificar la generación de semanas
const { addDays } = require('date-fns');

function createSimpleRotationTest() {
  const startDate = new Date('2025-11-18');
  const examDate = new Date('2026-10-22');
  
  const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const totalWeeks = Math.ceil(totalDays / 7);
  
  console.log('📅 FECHAS:');
  console.log(`   Inicio: ${startDate.toLocaleDateString()}`);
  console.log(`   Examen: ${examDate.toLocaleDateString()}`);
  console.log(`   Total días: ${totalDays}`);
  console.log(`   Total semanas necesarias: ${totalWeeks}`);
  
  // Simular generación de semanas
  const weeks = [];
  for (let week = 0; week < totalWeeks; week++) {
    const weekStartDate = addDays(startDate, week * 7);
    weeks.push({
      week: week + 1,
      startDate: weekStartDate,
      sessions: [] // Simular sesiones
    });
  }
  
  console.log(`\n✅ Semanas generadas: ${weeks.length}`);
  
  // Mostrar primeras y últimas semanas
  console.log('\n📊 PRIMERAS SEMANAS:');
  weeks.slice(0, 5).forEach(w => {
    console.log(`   Semana ${w.week}: ${w.startDate.toLocaleDateString()}`);
  });
  
  console.log('\n📊 ÚLTIMAS SEMANAS:');
  weeks.slice(-5).forEach(w => {
    console.log(`   Semana ${w.week}: ${w.startDate.toLocaleDateString()}`);
  });
  
  return weeks;
}

createSimpleRotationTest();