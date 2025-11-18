const { Theme } = require('./dist/models');
const sequelize = require('./dist/config/database');

async function checkThemeIds() {
  try {
    await sequelize.authenticate();
    const themes = await Theme.findAll({ attributes: ['id', 'title'], order: [['id', 'ASC']] });
    console.log('IDs de temas en BD:');
    themes.forEach(theme => {
      console.log(`  ID: ${theme.id} - ${theme.title.substring(0, 50)}...`);
    });
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
checkThemeIds();