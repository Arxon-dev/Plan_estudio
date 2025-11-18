import { StudySession, StudyPlan, Theme } from '../models';
import sequelize from '../config/database';

async function resetPlan() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    const planId = 2; // Tu plan ID

    // 1. Eliminar TODAS las sesiones pendientes y skipped (estudio + repasos)
    const deleted = await StudySession.destroy({
      where: {
        studyPlanId: planId,
        status: {
          [require('sequelize').Op.in]: ['PENDING', 'SKIPPED']
        }
      }
    });

    console.log(`🗑️ Eliminadas ${deleted} sesiones pendientes/skipped corruptas`);

    // 2. Obtener todos los temas
    const themes = await Theme.findAll();
    console.log(`📚 Temas encontrados: ${themes.length}`);

    // 3. Calcular horas totales basadas SOLO en estimatedHours (datos limpios)
    const totalHours = themes.reduce((sum, theme) => {
      return sum + parseFloat(theme.estimatedHours.toString());
    }, 0);

    console.log(`⏰ Total de horas estimadas (limpias): ${totalHours}h`);

    // 4. Actualizar el plan con las horas correctas
    await StudyPlan.update(
      { totalHours },
      { where: { id: planId } }
    );

    console.log(`✅ Plan actualizado con horas limpias: ${totalHours}h`);
    console.log(`\n🎯 SIGUIENTE PASO:`);
    console.log(`   1. Ve a la interfaz web`);
    console.log(`   2. Haz clic en "Replanificar Estudio"`);
    console.log(`   3. Ahora el plan se generará desde cero con datos correctos\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

resetPlan();
