// Script de prueba para el sistema de rotación de temas
const { RotationStudyService } = require('./src/services/RotationStudyService');

// Simular datos de prueba
const mockThemes = [
  { id: 1, name: 'Parte 1: Ley 8/2006, Tropa y Marinería', estimatedHours: 8 },
  { id: 2, name: 'Parte 1: Ley 36/2015, Seguridad Nacional', estimatedHours: 12 },
  { id: 3, name: 'Parte 1: Instrucción 15/2021, Armada', estimatedHours: 10 },
  { id: 4, name: 'Parte 2: Unión Europea (UE)', estimatedHours: 15 },
  { id: 5, name: 'Parte 2: España y su participación en Misiones Internacionales', estimatedHours: 18 },
  { id: 6, name: 'Parte 2: Real Decreto 176/2014, Iniciativas y Quejas', estimatedHours: 8 },
  { id: 7, name: 'Parte 3: Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres', estimatedHours: 10 },
  { id: 8, name: 'Parte 3: Instrucción 55/2021, EMAD', estimatedHours: 12 }
];

const mockWeeklySchedule = {
  monday: 2,
  tuesday: 3,
  wednesday: 2,
  thursday: 3,
  friday: 2,
  saturday: 4,
  sunday: 0
};

console.log('🧪 PROBANDO SISTEMA DE ROTACIÓN DE TEMAS');
console.log('==========================================\n');

// Probar diferentes configuraciones
const configs = [
  { name: 'LIGHT (4h/semana)', hours: 4 },
  { name: 'MEDIUM (12h/semana)', hours: 12 },
  { name: 'INTENSIVE (25h/semana)', hours: 25 }
];

configs.forEach(config => {
  console.log(`\n🎯 CONFIGURACIÓN: ${config.name}`);
  console.log('----------------------------------------');
  
  const rotationConfig = RotationStudyService.calculateOptimalConfig(config.hours);
  console.log(`   Intensidad: ${rotationConfig.intensity}`);
  console.log(`   Ciclo rotación: ${rotationConfig.rotationCycle} días`);
  console.log(`   Temas simultáneos: ${rotationConfig.maxSimultaneousThemes}`);
  console.log(`   Tiempo por sesión: ${rotationConfig.minSessionTime}-${rotationConfig.maxSessionTime}h`);
  
  // Crear plan de rotación
  const startDate = new Date('2024-01-01');
  const examDate = new Date('2024-06-01');
  
  try {
    const rotationPlan = RotationStudyService.createRotationGroups(
      mockThemes,
      mockWeeklySchedule,
      startDate,
      examDate,
      rotationConfig
    );
    
    console.log(`\n📊 RESULTADO:`);
    console.log(`   Total semanas: ${rotationPlan.length}`);
    
    // Mostrar primeras 3 semanas como ejemplo
    rotationPlan.slice(0, 3).forEach((week, index) => {
      console.log(`\n   Semana ${index + 1}: ${week.length} sesiones`);
      
      // Agrupar por día
      const sessionsByDay = {};
      week.forEach(session => {
        const day = session.lastStudied?.toLocaleDateString() || 'Sin fecha';
        if (!sessionsByDay[day]) sessionsByDay[day] = [];
        sessionsByDay[day].push(session);
      });
      
      Object.entries(sessionsByDay).forEach(([day, sessions]) => {
        console.log(`     ${day}: ${sessions.length} sesiones`);
        sessions.forEach(session => {
          console.log(`       - ${session.sessionType}: ${session.themeName} (${session.hours}h)`);
        });
      });
    });
    
    // Estadísticas totales
    const totalSessions = rotationPlan.reduce((sum, week) => sum + week.length, 0);
    const totalHours = rotationPlan.reduce((sum, week) => 
      sum + week.reduce((weekSum, session) => weekSum + session.hours, 0), 0
    );
    
    console.log(`\n📈 ESTADÍSTICAS TOTALES:`);
    console.log(`   Total sesiones: ${totalSessions}`);
    console.log(`   Total horas: ${totalHours.toFixed(1)}h`);
    console.log(`   Promedio por semana: ${(totalHours / rotationPlan.length).toFixed(1)}h`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
});

console.log('\n✅ Prueba completada');