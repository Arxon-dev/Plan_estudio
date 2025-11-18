const path = require('path');
process.env.NODE_PATH = path.join(__dirname, 'dist');
require('module').Module._initPaths();

const { Theme, ThemeBlock, ThemeComplexity } = require('./dist/models');

const themesData = [
  // BLOQUE 1 - ORGANIZACIÓN
  { block: ThemeBlock.ORGANIZACION, themeNumber: 1, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.ORGANIZACION, themeNumber: 2, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.ORGANIZACION, themeNumber: 3, complexity: ThemeComplexity.HIGH },
  { block: ThemeBlock.ORGANIZACION, themeNumber: 4, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.ORGANIZACION, themeNumber: 5, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.ORGANIZACION, themeNumber: 6, complexity: ThemeComplexity.HIGH },

  // BLOQUE 2 - JURÍDICO-SOCIAL
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 1, complexity: ThemeComplexity.HIGH },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 2, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 3, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 4, complexity: ThemeComplexity.HIGH },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 5, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 6, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 7, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.JURIDICO_SOCIAL, themeNumber: 8, complexity: ThemeComplexity.HIGH },

  // BLOQUE 3 - SEGURIDAD NACIONAL
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 1, complexity: ThemeComplexity.HIGH },
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 2, complexity: ThemeComplexity.HIGH },
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 3, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 4, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 5, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 6, complexity: ThemeComplexity.MEDIUM },
  { block: ThemeBlock.SEGURIDAD_NACIONAL, themeNumber: 7, complexity: ThemeComplexity.HIGH },
];

async function updateThemesComplexity() {
  try {
    console.log('🔄 Actualizando complejidad de temas...');
    
    // Verificar temas actuales
    const currentThemes = await Theme.findAll({
      attributes: ['id', 'block', 'themeNumber', 'complexity'],
      order: [['block', 'ASC'], ['themeNumber', 'ASC']]
    });
    
    console.log(`📚 Temas encontrados: ${currentThemes.length}`);
    
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