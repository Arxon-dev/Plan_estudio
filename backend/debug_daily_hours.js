const { RotationStudyService } = require('./dist/services/RotationStudyService');

function debugDailyHours() {
  console.log('🔄 Depurando cálculo de horas diarias...');
  
  const weeklySchedule = { monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 };
  const weeklyHours = 10;
  
  console.log('📅 Horario semanal recibido:');
  console.log(`   Lunes: ${weeklySchedule.monday}h`);
  console.log(`   Martes: ${weeklySchedule.tuesday}h`);
  console.log(`   Miércoles: ${weeklySchedule.wednesday}h`);
  console.log(`   Jueves: ${weeklySchedule.thursday}h`);
  console.log(`   Viernes: ${weeklySchedule.friday}h`);
  console.log(`   Sábado: ${weeklySchedule.saturday}h`);
  console.log(`   Domingo: ${weeklySchedule.sunday}h`);
  console.log(`   Total semanal: ${weeklyHours}h`);
  
  // Llamar al método calculateDailyHours directamente
  const dailyHours = RotationStudyService.calculateDailyHours(weeklySchedule, weeklyHours);
  
  console.log('\n📊 Resultado de calculateDailyHours:');
  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  dailyHours.forEach((hours, index) => {
    console.log(`   ${dayNames[index]}: ${hours}h`);
  });
}

debugDailyHours();