const { RotationStudyService } = require('./dist/services/RotationStudyService');

async function debugDetailed() {
  console.log('🔄 Depuración detallada del sistema de rotación...');
  
  const startDate = new Date('2025-11-18');
  const endDate = new Date('2026-09-22');
  
  const themes = [
    { id: 1, title: 'TEMA 1: LA CONSTITUCIÓN ESPAÑOLA DE 1978', complexity: 3, priority: 1 },
    { id: 2, title: 'TEMA 2: EL ESTADO DE LAS AUTONOMÍAS', complexity: 2, priority: 2 },
    { id: 3, title: 'TEMA 3: LA UNIÓN EUROPEA', complexity: 4, priority: 3 },
    { id: 4, title: 'TEMA 4: ADMINISTRACIÓN INSTITUCIONAL DE LA UE', complexity: 2, priority: 4 }
  ];
  
  const weeklySchedule = { monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 };
  
  console.log('📅 Horario semanal:');
  console.log(`   Lunes: ${weeklySchedule.monday}h`);
  console.log(`   Martes: ${weeklySchedule.tuesday}h`);
  console.log(`   Miércoles: ${weeklySchedule.wednesday}h`);
  console.log(`   Jueves: ${weeklySchedule.thursday}h`);
  console.log(`   Viernes: ${weeklySchedule.friday}h`);
  console.log(`   Sábado: ${weeklySchedule.saturday}h`);
  console.log(`   Domingo: ${weeklySchedule.sunday}h`);
  
  try {
    console.log('\n🎯 Generando plan de rotación...');
    const rotationPlan = await RotationStudyService.createRotationGroups(
      themes,
      weeklySchedule,
      startDate,
      endDate
    );
    
    console.log('📊 Plan de rotación generado:');
    console.log(`   - Total semanas: ${rotationPlan.length}`);
    console.log(`   - Total sesiones: ${rotationPlan.flat().length}`);
    
    // Ver fechas de las primeras 5 semanas
    console.log('\n📅 Primeras 5 semanas:');
    for (let i = 0; i < Math.min(5, rotationPlan.length); i++) {
      const week = rotationPlan[i];
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      console.log(`\nSemana ${i + 1} (inicio: ${weekStart.toISOString().split('T')[0]}):`);
      console.log(`   ${week.length} sesiones`);
      
      // Agrupar por día
      const sessionsByDay = {};
      week.forEach(session => {
        if (session.lastStudied) {
          const day = session.lastStudied.toISOString().split('T')[0];
          if (!sessionsByDay[day]) sessionsByDay[day] = [];
          sessionsByDay[day].push(session);
        }
      });
      
      Object.keys(sessionsByDay).sort().forEach(day => {
        const daySessions = sessionsByDay[day];
        const dayOfWeek = new Date(day).getDay();
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        console.log(`   ${dayNames[dayOfWeek]} ${day}: ${daySessions.length} sesiones`);
      });
    }
    
    // Ver últimas 5 semanas
    console.log('\n📅 Últimas 5 semanas:');
    for (let i = Math.max(0, rotationPlan.length - 5); i < rotationPlan.length; i++) {
      const week = rotationPlan[i];
      const weekStart = new Date(startDate);
      weekStart.setDate(startDate.getDate() + (i * 7));
      
      console.log(`\nSemana ${i + 1} (inicio: ${weekStart.toISOString().split('T')[0]}):`);
      console.log(`   ${week.length} sesiones`);
      
      // Agrupar por día
      const sessionsByDay = {};
      week.forEach(session => {
        if (session.lastStudied) {
          const day = session.lastStudied.toISOString().split('T')[0];
          if (!sessionsByDay[day]) sessionsByDay[day] = [];
          sessionsByDay[day].push(session);
        }
      });
      
      Object.keys(sessionsByDay).sort().forEach(day => {
        const daySessions = sessionsByDay[day];
        const dayOfWeek = new Date(day).getDay();
        const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
        console.log(`   ${dayNames[dayOfWeek]} ${day}: ${daySessions.length} sesiones`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDetailed();