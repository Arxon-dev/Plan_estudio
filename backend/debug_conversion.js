const { StudyPlanService } = require('./dist/services/StudyPlanService');

async function debugConversion() {
  console.log('🔄 Depurando conversión de sesiones...');
  
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
    console.log('📊 Validando plan...');
    const validation = StudyPlanService.validatePlan(startDate, endDate, weeklySchedule, themes);
    
    console.log('✅ Validación exitosa:');
    console.log(`   - Días disponibles: ${validation.daysWithHours.length}`);
    console.log(`   - Horas disponibles: ${validation.totalAvailableHours}h`);
    console.log(`   - Horas requeridas: ${validation.totalRequiredHours}h`);
    
    // Ver primeros y últimos días
    console.log(`   - Primer día: ${validation.daysWithHours[0].date.toISOString()}`);
    console.log(`   - Último día: ${validation.daysWithHours[validation.daysWithHours.length - 1].date.toISOString()}`);
    
    // Generar plan de rotación
    const { RotationStudyService } = require('./dist/services/RotationStudyService');
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
    
    // Ver fechas del plan
    const allDates = [];
    rotationPlan.forEach(week => {
      week.forEach(session => {
        if (session.lastStudied) {
          allDates.push(session.lastStudied.toISOString().split('T')[0]);
        }
      });
    });
    
    allDates.sort();
    console.log(`   - Primera fecha: ${allDates[0]}`);
    console.log(`   - Última fecha: ${allDates[allDates.length - 1]}`);
    
    // Convertir a sesiones
    console.log('\n🔄 Convirtiendo a sesiones de BD...');
    const sessions = StudyPlanService.convertRotationPlanToSessions(1, rotationPlan, validation.daysWithHours);
    
    console.log('✅ Conversión completada:');
    console.log(`   - Sesiones generadas: ${sessions.length}`);
    
    if (sessions.length > 0) {
      console.log(`   - Primera sesión: ${sessions[0].scheduledDate.toISOString()}`);
      console.log(`   - Última sesión: ${sessions[sessions.length - 1].scheduledDate.toISOString()}`);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugConversion();