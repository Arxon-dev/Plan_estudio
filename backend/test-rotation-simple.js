const path = require('path');

// Configurar paths absolutos para los requires
const modelsPath = path.join(__dirname, 'dist', 'models');
const servicesPath = path.join(__dirname, 'dist', 'services');

// Importar modelos y servicios
const { StudyPlan, WeeklySchedule, Theme } = require(path.join(modelsPath, 'index'));
const { StudyPlanService } = require(path.join(servicesPath, 'StudyPlanService'));

async function testRotationSystem() {
  try {
    console.log('🔄 Iniciando prueba del sistema de rotación...');
    
    // Buscar plan activo del usuario 15
    const plan = await StudyPlan.findOne({
      where: { userId: 15, status: 'ACTIVE' },
    });

    if (!plan) {
      console.log('❌ No hay plan activo para el usuario 15');
      return;
    }

    console.log(`✅ Plan encontrado: ID ${plan.id}`);

    // Obtener horario semanal
    const weeklySchedule = await WeeklySchedule.findOne({
      where: { studyPlanId: plan.id },
    });

    if (!weeklySchedule) {
      console.log('❌ No hay horario semanal configurado');
      return;
    }

    console.log(`✅ Horario semanal encontrado`);

    // Obtener temas del plan
    const themes = await Theme.findAll({
      where: { userId: 15 },
      order: [['order', 'ASC']],
    });

    if (themes.length === 0) {
      console.log('❌ No hay temas configurados');
      return;
    }

    console.log(`✅ Temas encontrados: ${themes.length}`);

    // Calcular horas semanales
    const weeklyHours = weeklySchedule.monday + weeklySchedule.tuesday + 
                       weeklySchedule.wednesday + weeklySchedule.thursday + 
                       weeklySchedule.friday + weeklySchedule.saturday + weeklySchedule.sunday;
    
    console.log(`📊 Horas semanales: ${weeklyHours}`);

    // Probar el sistema de rotación
    const startDate = new Date('2025-11-18');
    const examDate = new Date('2026-10-22');
    
    console.log(`📅 Período: ${startDate.toISOString().split('T')[0]} al ${examDate.toISOString().split('T')[0]}`);
    
    const result = await StudyPlanService.generateSmartCalendar(
      plan.id,
      startDate,
      examDate,
      weeklySchedule,
      themes
    );

    if (result.success) {
      console.log(`✅ Sistema de rotación exitoso: ${result.sessions.length} sesiones generadas`);
      
      // Análisis de cobertura de fechas
      const sessions = result.sessions;
      const firstDate = new Date(Math.min(...sessions.map(s => new Date(s.lastStudied).getTime())));
      const lastDate = new Date(Math.max(...sessions.map(s => new Date(s.lastStudied).getTime())));
      
      console.log(`📊 Primera sesión: ${firstDate.toISOString().split('T')[0]}`);
      console.log(`📊 Última sesión: ${lastDate.toISOString().split('T')[0]}`);
      console.log(`📊 Días de cobertura: ${Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1}`);
      
      // Verificar distribución por bloques
      const blockDistribution = {};
      sessions.forEach(session => {
        const block = session.themeBlock || 'Sin bloque';
        blockDistribution[block] = (blockDistribution[block] || 0) + 1;
      });
      
      console.log('📊 Distribución por bloques:');
      Object.entries(blockDistribution).forEach(([block, count]) => {
        console.log(`   ${block}: ${count} sesiones`);
      });
      
      // Mostrar primeras y últimas 5 sesiones
      console.log('\n📝 Primeras 5 sesiones:');
      sessions.slice(0, 5).forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.themeTitle} - ${session.lastStudied.split('T')[0]}`);
      });
      
      console.log('\n📝 Últimas 5 sesiones:');
      sessions.slice(-5).forEach((session, index) => {
        console.log(`   ${sessions.length - 4 + index}. ${session.themeTitle} - ${session.lastStudied.split('T')[0]}`);
      });
      
    } else {
      console.log(`❌ Error en sistema de rotación: ${result.message}`);
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
  } finally {
    process.exit(0);
  }
}

testRotationSystem();