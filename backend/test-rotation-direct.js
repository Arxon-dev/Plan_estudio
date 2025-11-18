const { StudyPlan, WeeklySchedule, Theme } = require('./dist/models');
const { StudyPlanService } = require('./dist/services/StudyPlanService');
const { Op } = require('sequelize');

async function testRotation() {
  try {
    console.log('🔄 Probando sistema de rotación...');
    
    // Buscar plan activo
    const plan = await StudyPlan.findOne({
      where: { userId: 15, status: 'ACTIVE' },
    });

    if (!plan) {
      console.error('❌ No hay plan activo');
      return;
    }

    // Obtener horario semanal
    const weeklySchedule = await WeeklySchedule.findOne({
      where: { userId: 15 },
    });

    if (!weeklySchedule) {
      console.error('❌ No hay horario semanal configurado');
      return;
    }

    // Obtener temas del plan
    const themes = await Theme.findAll({
      where: { userId: 15 },
      order: [['order', 'ASC']],
    });

    if (themes.length === 0) {
      console.error('❌ No hay temas configurados');
      return;
    }

    const startDate = '2025-11-18';
    const examDate = '2026-10-22';

    console.log(`📅 Período: ${startDate} al ${examDate}`);
    console.log(`📊 Temas: ${themes.length}`);
    
    // Calcular horas semanales
    const scheduleValues = Object.values(weeklySchedule.dataValues);
    const weeklyHours = scheduleValues
      .filter(val => typeof val === 'number')
      .reduce((sum, val) => sum + val, 0);
    console.log(`⏰ Horas semanales: ${weeklyHours}`);

    // Probar el sistema de rotación
    const result = await StudyPlanService.generateSmartCalendar(
      plan.id,
      new Date(startDate),
      new Date(examDate),
      weeklySchedule,
      themes
    );

    if (result.success) {
      console.log(`✅ Sistema de rotación exitoso: ${result.sessions.length} sesiones generadas`);
      
      // Análisis de cobertura de fechas
      const sessions = result.sessions;
      const firstDate = new Date(Math.min(...sessions.map(s => new Date(s.lastStudied).getTime())));
      const lastDate = new Date(Math.max(...sessions.map(s => new Date(s.lastStudied).getTime())));
      
      console.log('📅 Primera sesión:', firstDate.toISOString().split('T')[0]);
      console.log('📅 Última sesión:', lastDate.toISOString().split('T')[0]);
      console.log('📏 Días de cobertura:', Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);
      
      // Calcular días totales entre las fechas
      const start = new Date(startDate);
      const end = new Date(examDate);
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const coveredDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const coveragePercentage = ((coveredDays / totalDays) * 100).toFixed(1);
      
      console.log('📊 Análisis de cobertura:');
      console.log(`   - Días solicitados: ${totalDays}`);
      console.log(`   - Días cubiertos: ${coveredDays}`);
      console.log(`   - Cobertura: ${coveragePercentage}%`);
      
      // Verificar distribución por temas
      const themeDistribution = {};
      sessions.forEach(session => {
        const themeName = session.theme.title;
        themeDistribution[themeName] = (themeDistribution[themeName] || 0) + 1;
      });
      
      console.log('📊 Distribución por temas:');
      Object.entries(themeDistribution).forEach(([theme, count]) => {
        console.log(`   - ${theme}: ${count} sesiones`);
      });
      
      if (coveredDays >= totalDays * 0.95) {
        console.log('✅ COBERTURA COMPLETA - El sistema cubre casi todos los días solicitados');
      } else {
        console.log('⚠️ COBERTURA INCOMPLETA - Faltan días por cubrir');
      }
      
    } else {
      console.error(`❌ Error en sistema de rotación: ${result.message}`);
    }
  } catch (error) {
    console.error('❌ Error al probar rotación:', error);
  }
}

testRotation();