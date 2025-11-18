const { Sequelize } = require('sequelize');

// Configuración de la base de datos
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
  logging: false,
});

// Definir modelo Theme simplificado
const Theme = sequelize.define('themes', {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  block: {
    type: Sequelize.ENUM('ORGANIZACION', 'JURIDICO_SOCIAL', 'SEGURIDAD_NACIONAL'),
    allowNull: false,
  },
  themeNumber: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  complexity: {
    type: Sequelize.ENUM('LOW', 'MEDIUM', 'HIGH'),
    allowNull: false,
    defaultValue: 'MEDIUM',
  },
});

const themesData = [
  // BLOQUE 1 - ORGANIZACIÓN
  { block: 'ORGANIZACION', themeNumber: 1, complexity: 'MEDIUM' },
  { block: 'ORGANIZACION', themeNumber: 2, complexity: 'MEDIUM' },
  { block: 'ORGANIZACION', themeNumber: 3, complexity: 'HIGH' },
  { block: 'ORGANIZACION', themeNumber: 4, complexity: 'MEDIUM' },
  { block: 'ORGANIZACION', themeNumber: 5, complexity: 'MEDIUM' },
  { block: 'ORGANIZACION', themeNumber: 6, complexity: 'HIGH' },

  // BLOQUE 2 - JURÍDICO-SOCIAL
  { block: 'JURIDICO_SOCIAL', themeNumber: 1, complexity: 'HIGH' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 2, complexity: 'MEDIUM' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 3, complexity: 'MEDIUM' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 4, complexity: 'HIGH' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 5, complexity: 'MEDIUM' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 6, complexity: 'MEDIUM' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 7, complexity: 'MEDIUM' },
  { block: 'JURIDICO_SOCIAL', themeNumber: 8, complexity: 'HIGH' },

  // BLOQUE 3 - SEGURIDAD NACIONAL
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 1, complexity: 'HIGH' },
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 2, complexity: 'HIGH' },
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 3, complexity: 'MEDIUM' },
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 4, complexity: 'MEDIUM' },
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 5, complexity: 'MEDIUM' },
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 6, complexity: 'MEDIUM' },
  { block: 'SEGURIDAD_NACIONAL', themeNumber: 7, complexity: 'HIGH' },
];

async function updateThemesComplexity() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    
    console.log('📊 Verificando temas actuales...');
    const currentThemes = await Theme.findAll({
      attributes: ['id', 'block', 'themeNumber', 'complexity'],
      order: [['block', 'ASC'], ['themeNumber', 'ASC']]
    });
    
    console.log(`📚 Temas encontrados: ${currentThemes.length}`);
    
    console.log('🔄 Actualizando complejidad de temas...');
    let updatedCount = 0;
    
    for (const themeData of themesData) {
      const [updatedRows] = await Theme.update(
        { complexity: themeData.complexity },
        {
          where: {
            block: themeData.block,
            themeNumber: themeData.themeNumber,
          },
        }
      );
      
      if (updatedRows > 0) {
        updatedCount++;
        console.log(`✅ Tema ${themeData.block}-${themeData.themeNumber} actualizado a ${themeData.complexity}`);
      } else {
        console.log(`⚠️  Tema ${themeData.block}-${themeData.themeNumber} no encontrado`);
      }
    }
    
    console.log(`\n✅ Actualización completada: ${updatedCount} temas actualizados`);
    
    // Verificar resultados finales
    console.log('\n📊 Verificación final:');
    const finalThemes = await Theme.findAll({
      attributes: ['block', 'themeNumber', 'complexity'],
      order: [['block', 'ASC'], ['themeNumber', 'ASC']]
    });
    
    const complexityCount = { LOW: 0, MEDIUM: 0, HIGH: 0 };
    finalThemes.forEach(theme => {
      complexityCount[theme.complexity]++;
    });
    
    console.log('Distribución por complejidad:');
    console.log(`🔴 LOW: ${complexityCount.LOW} temas`);
    console.log(`🟡 MEDIUM: ${complexityCount.MEDIUM} temas`);
    console.log(`🟢 HIGH: ${complexityCount.HIGH} temas`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando temas:', error);
    process.exit(1);
  }
}

updateThemesComplexity();