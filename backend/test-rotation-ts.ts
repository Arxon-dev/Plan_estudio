// Script para probar el sistema de rotación con ts-node
require('ts-node/register');
require('tsconfig-paths/register');

const { RotationStudyService } = require('./src/services/RotationStudyService');

async function testRotation() {
  try {
    console.log('🔄 Probando sistema de rotación...');
    
    const startDate = new Date('2025-11-18');
    const examDate = new Date('2026-10-22');
    const weeklySchedule = {
      monday: 2,
      tuesday: 2,
      wednesday: 2,
      thursday: 2,
      friday: 2,
      saturday: 0,
      sunday: 2
    };
    
    const themes = [
      { id: 1, title: 'Tema 1', hours: 50, priority: 1, complexity: 3 },
      { id: 2, title: 'Tema 2', hours: 40, priority: 1, complexity: 2 },
      { id: 3, title: 'Tema 3', hours: 60, priority: 1, complexity: 4 },
      { id: 4, title: 'Tema 4', hours: 30, priority: 1, complexity: 2 },
      { id: 5, title: 'Tema 5', hours: 45, priority: 1, complexity: 3 }
    ];
    
    console.log(`📅 Período: ${startDate.toISOString().split('T')[0]} al ${examDate.toISOString().split('T')[0]}`);
    console.log(`📊 Temas: ${themes.length}`);
    
    // Calcular horas semanales
    const weeklyHours = Object.values(weeklySchedule).reduce((sum, val) => sum + val, 0);
    console.log(`⏰ Horas semanales: ${weeklyHours}`);
    
    // Generar plan de rotación
    console.log('🔄 Generando plan de rotación...');
    const rotationPlan = RotationStudyService.generateRotationPlan(
      themes,
      startDate,
      examDate,
      weeklySchedule
    );
    
    console.log(`✅ Plan de rotación generado: ${rotationPlan.length} semanas`);
    
    // Convertir a sesiones
    console.log('🔄 Convirtiendo a sesiones...');
    const sessions = RotationStudyService.convertRotationPlanToSessions(
      rotationPlan,
      themes,
      startDate,
      examDate,
      weeklySchedule
    );
    
    console.log(`✅ Sesiones generadas: ${sessions.length}`);
    
    if (sessions.length > 0) {
      const firstDate = new Date(Math.min(...sessions.map((s: any) => new Date(s.lastStudied).getTime())));
      const lastDate = new Date(Math.max(...sessions.map((s: any) => new Date(s.lastStudied).getTime())));
      
      console.log('📅 Primera sesión:', firstDate.toISOString().split('T')[0]);
      console.log('📅 Última sesión:', lastDate.toISOString().split('T')[0]);
      
      // Calcular días totales entre las fechas
      const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const coveredDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log('📊 Análisis de cobertura:');
      console.log(`   - Días solicitados: ${totalDays}`);
      console.log(`   - Días cubiertos: ${coveredDays}`);
      console.log(`   - Cobertura: ${((coveredDays / totalDays) * 100).toFixed(1)}%`);
      
      // Verificar distribución por temas
      const themeDistribution: { [key: string]: number } = {};
      sessions.forEach((session: any) => {
        const themeName = session.theme.title;
        themeDistribution[themeName] = (themeDistribution[themeName] || 0) + 1;
      });
      
      console.log('📊 Distribución por temas:');
      Object.entries(themeDistribution).forEach(([theme, count]) => {
        console.log(`   - ${theme}: ${count} sesiones`);
      });
      
      // Mostrar primeras 10 sesiones como ejemplo
      console.log('📋 Primeras 10 sesiones:');
      sessions.slice(0, 10).forEach((session: any, index: number) => {
        console.log(`   ${index + 1}. ${session.lastStudied.split('T')[0]} - ${session.theme.title} (${session.hours}h)`);
      });
      
      // Mostrar últimas 5 sesiones
      console.log('📋 Últimas 5 sesiones:');
      sessions.slice(-5).forEach((session: any, index: number) => {
        console.log(`   ${sessions.length - 4 + index}. ${session.lastStudied.split('T')[0]} - ${session.theme.title} (${session.hours}h)`);
      });
      
      if (coveredDays >= totalDays * 0.95) {
        console.log('✅ COBERTURA COMPLETA - El sistema cubre casi todos los días solicitados');
      } else {
        console.log('⚠️ COBERTURA INCOMPLETA - Faltan días por cubrir');
      }
      
    }
    
  } catch (error: any) {
    console.error('❌ Error al probar rotación:', error);
    console.error(error.stack);
  }
}

testRotation();