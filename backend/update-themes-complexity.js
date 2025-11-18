const { Theme, ThemeBlock, ThemeComplexity } = require('./dist/models');
const sequelize = require('./dist/config/database');

const themesData = [
  // BLOQUE 1 - ORGANIZACIÓN
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 1,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 2,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 3,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 4,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 6,
    complexity: ThemeComplexity.HIGH,
  },

  // BLOQUE 2 - JURÍDICO-SOCIAL
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 1,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 2,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 3,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 4,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 6,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 7,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 8,
    complexity: ThemeComplexity.HIGH,
  },

  // BLOQUE 3 - SEGURIDAD NACIONAL
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 1,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 2,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 3,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 4,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 6,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 7,
    complexity: ThemeComplexity.HIGH,
  },
];

async function updateThemesComplexity() {
  try {
    console.log('🔄 Actualizando complejidad de temas...');
    
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
        console.log(`✅ Tema ${themeData.block}-${themeData.themeNumber} actualizado a ${themeData.complexity}`);
      } else {
        console.log(`⚠️  Tema ${themeData.block}-${themeData.themeNumber} no encontrado`);
      }
    }
    
    console.log('✅ Actualización completada');
    
    // Verificar resultados
    console.log('\n📊 Verificación:');
    const themes = await Theme.findAll({
      attributes: ['id', 'block', 'themeNumber', 'title', 'complexity'],
      order: [['block', 'ASC'], ['themeNumber', 'ASC']]
    });
    
    themes.forEach(theme => {
      console.log(`ID: ${theme.id} | ${theme.block}-${theme.themeNumber} | ${theme.complexity} | ${theme.title.substring(0, 50)}...`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error actualizando temas:', error);
    process.exit(1);
  }
}

updateThemesComplexity();