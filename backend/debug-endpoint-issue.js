// Script para depurar el problema del endpoint
const { StudySession, Theme } = require('./dist/models');
const sequelize = require('./dist/config/database').default;

async function debugEndpoint() {
  try {
    console.log('🔍 Depurando endpoint de distribución equitativa...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');
    
    // Obtener sesiones del plan 94
    const sessions = await StudySession.findAll({
      where: { studyPlanId: 94 },
      order: [['scheduledDate', 'ASC']]
    });
    
    console.log(`📊 Total de sesiones: ${sessions.length}`);
    
    if (sessions.length > 0) {
      console.log('\n📅 Primeras 5 sesiones:');
      sessions.slice(0, 5).forEach(session => {
        console.log(`ID: ${session.id} | Tema ID: ${session.themeId} | Fecha: ${session.scheduledDate}`);
      });
      
      // Obtener themeIds únicos
      const themeIds = [...new Set(sessions.map(session => session.themeId))];
      console.log(`\n🎯 Theme IDs únicos: ${themeIds.join(', ')}`);
      
      // Buscar temas con esos IDs
      const themes = await Theme.findAll({
        where: { id: themeIds },
        order: [['block', 'ASC'], ['themeNumber', 'ASC']]
      });
      
      console.log(`\n📚 Temas encontrados: ${themes.length}`);
      
      if (themes.length > 0) {
        themes.forEach(theme => {
          console.log(`ID: ${theme.id} | ${theme.block}-${theme.themeNumber} | ${theme.complexity} | ${theme.title.substring(0, 50)}...`);
        });
      } else {
        console.log('❌ No se encontraron temas con esos IDs');
        
        // Verificar todos los temas existentes
        const allThemes = await Theme.findAll({
          attributes: ['id', 'block', 'themeNumber', 'title', 'complexity'],
          order: [['block', 'ASC'], ['themeNumber', 'ASC']]
        });
        
        console.log('\n📋 Todos los temas existentes:');
        allThemes.forEach(theme => {
          console.log(`ID: ${theme.id} | ${theme.block}-${theme.themeNumber} | ${theme.complexity} | ${theme.title.substring(0, 50)}...`);
        });
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugEndpoint();