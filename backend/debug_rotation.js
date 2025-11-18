const { RotationStudyService } = require('./dist/services/RotationStudyService');

async function debugRotation() {
  console.log('🔄 Depurando sistema de rotación...');
  
  const startDate = new Date('2025-11-18');
  const endDate = new Date('2026-09-22'); // Fecha con buffer (30 días antes del examen)
  
  const themes = [
    { id: 1, title: 'TEMA 1: LA CONSTITUCIÓN ESPAÑOLA DE 1978', complexity: 3, priority: 1 },
    { id: 2, title: 'TEMA 2: EL ESTADO DE LAS AUTONOMÍAS', complexity: 2, priority: 2 },
    { id: 3, title: 'TEMA 3: LA UNIÓN EUROPEA', complexity: 4, priority: 3 },
    { id: 4, title: 'TEMA 4: ADMINISTRACIÓN INSTITUCIONAL DE LA UE', complexity: 2, priority: 4 }
  ];
  
  const weeklySchedule = { monday: 2, tuesday: 2, wednesday: 2, thursday: 2, friday: 2, saturday: 0, sunday: 0 };
  
  console.log('📅 Fecha inicio:', startDate.toISOString());
  console.log('📅 Fecha fin (con buffer):', endDate.toISOString());
  console.log('📅 Diferencia en días:', Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
  
  try {
    console.log('\n🎯 Generando plan de rotación...');
    const rotationPlan = await RotationStudyService.createRotationGroups(
      themes,
      weeklySchedule,
      startDate,
      endDate
    );
    
    console.log('📊 Total de semanas generadas:', rotationPlan.length);
    
    if (rotationPlan.length > 0) {
      // Ver fechas
      const allDates = [];
      rotationPlan.forEach((week, weekIndex) => {
        console.log(`Semana ${weekIndex + 1}: ${week.length} sesiones`);
        week.forEach(session => {
          if (session.lastStudied) {
            allDates.push(session.lastStudied.toISOString().split('T')[0]);
          }
        });
      });
      
      allDates.sort();
      console.log('\n📅 Primera fecha:', allDates[0]);
      console.log('📅 Última fecha:', allDates[allDates.length - 1]);
      console.log('📅 Total de fechas únicas:', allDates.length);
      console.log('📅 Total de sesiones:', rotationPlan.flat().length);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugRotation();