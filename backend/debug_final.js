const { RotationStudyService } = require('./dist/services/RotationStudyService');

async function debugFinal() {
  console.log('🔄 Depuración final del sistema de rotación...');
  
  const startDate = new Date('2025-11-18');
  const endDate = new Date('2026-09-22'); // Fecha con buffer
  
  const themes = [
    { id: 1, title: 'TEMA 1: LA CONSTITUCIÓN ESPAÑOLA DE 1978', complexity: 3, priority: 1 },
    { id: 2, title: 'TEMA 2: EL ESTADO DE LAS AUTONOMÍAS', complexity: 2, priority: 2 },
    { id: 3, title: 'TEMA 3: LA UNIÓN EUROPEA', complexity: 4, priority: 3 },
    { id: 4, title: 'TEMA 4: ADMINISTRACIÓN INSTITUCIONAL DE LA UE', complexity: 2, priority: 4 }
  ];
  
  const weeklySchedule = { monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 };
  
  try {
    console.log('🎯 Generando plan de rotación...');
    const rotationPlan = await RotationStudyService.createRotationGroups(
      themes,
      weeklySchedule,
      startDate,
      endDate
    );
    
    console.log('📊 Plan de rotación generado:');
    console.log(`   - Total semanas: ${rotationPlan.length}`);
    
    // Ver fechas de las primeras 5 semanas y últimas 5 semanas
    console.log('\n📅 Verificación de fechas:');
    
    const allDates = [];
    rotationPlan.forEach((week, weekIndex) => {
      week.forEach(session => {
        if (session.lastStudied) {
          allDates.push(session.lastStudied.toISOString().split('T')[0]);
        }
      });
    });
    
    allDates.sort();
    console.log(`   - Primera fecha: ${allDates[0]}`);
    console.log(`   - Última fecha: ${allDates[allDates.length - 1]}`);
    console.log(`   - Total fechas únicas: ${allDates.length}`);
    
    // Ver distribución por día de la semana
    const dayOfWeekCount = {};
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    
    allDates.forEach(dateStr => {
      const date = new Date(dateStr);
      const dayOfWeek = date.getDay();
      const dayName = dayNames[dayOfWeek];
      dayOfWeekCount[dayName] = (dayOfWeekCount[dayName] || 0) + 1;
    });
    
    console.log('\n📊 Distribución por día de la semana:');
    Object.entries(dayOfWeekCount).forEach(([day, count]) => {
      console.log(`   ${day}: ${count} sesiones`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugFinal();