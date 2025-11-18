import { Theme, StudySession } from '../models';
import sequelize from '../config/database';

async function check() {
  try {
    await sequelize.authenticate();
    
    const themes = await Theme.findAll({
      attributes: ['id', 'block', 'themeNumber', 'title', 'estimatedHours', 'complexity'],
      order: [['block', 'ASC'], ['themeNumber', 'ASC']]
    });
    
    console.log(`\n📚 TEMAS EN LA BASE DE DATOS (${themes.length} temas):\n`);
    
    let totalHours = 0;
    themes.forEach(theme => {
      const hours = parseFloat(theme.estimatedHours.toString());
      totalHours += hours;
      console.log(`   [${theme.id}] Tema ${theme.themeNumber} - ${theme.title.substring(0, 50)}...`);
      console.log(`       Bloque: ${theme.block} | Horas: ${hours}h | Complejidad: ${theme.complexity}`);
    });
    
    console.log(`\n⏰ TOTAL DE HORAS ESTIMADAS (ORIGINAL): ${totalHours}h\n`);
    
    // Ahora ver cuántas sesiones pendientes existen
    const pendingSessions = await StudySession.findAll({
      where: {
        studyPlanId: 2,
        status: 'PENDING'
      },
      include: [{
        model: Theme,
        as: 'theme',
        attributes: ['id', 'title', 'estimatedHours']
      }]
    });
    
    console.log(`\n📋 SESIONES PENDIENTES EN BD: ${pendingSessions.length}`);
    
    const sessionsByTheme = new Map<number, number>();
    pendingSessions.forEach(session => {
      const themeId = session.themeId;
      const hours = parseFloat(session.scheduledHours.toString());
      sessionsByTheme.set(themeId, (sessionsByTheme.get(themeId) || 0) + hours);
    });
    
    console.log(`\n🔍 HORAS PENDIENTES POR TEMA:\n`);
    sessionsByTheme.forEach((hours, themeId) => {
      const theme = themes.find(t => t.id === themeId);
      if (theme) {
        console.log(`   Tema ${theme.themeNumber} (${theme.title.substring(0, 30)}): ${hours}h pendientes`);
      }
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

check();
