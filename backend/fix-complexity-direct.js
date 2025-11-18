// Script temporal para actualizar complejidad
try {
  // Configurar paths
  const path = require('path');
  const distPath = path.join(__dirname, 'dist');
  
  // Crear require personalizado
  const Module = require('module');
  const originalRequire = Module.prototype.require;
  
  Module.prototype.require = function(id) {
    if (id.startsWith('@config/')) {
      const newPath = path.join(distPath, 'config', id.replace('@config/', ''));
      return originalRequire.call(this, newPath);
    }
    if (id.startsWith('@models/')) {
      const newPath = path.join(distPath, 'models', id.replace('@models/', ''));
      return originalRequire.call(this, newPath);
    }
    if (id.startsWith('@controllers/')) {
      const newPath = path.join(distPath, 'controllers', id.replace('@controllers/', ''));
      return originalRequire.call(this, newPath);
    }
    if (id.startsWith('@middleware/')) {
      const newPath = path.join(distPath, 'middleware', id.replace('@middleware/', ''));
      return originalRequire.call(this, newPath);
    }
    return originalRequire.call(this, id);
  };

  // Ahora importar y ejecutar
  const { Theme, ThemeBlock, ThemeComplexity } = require('./dist/models');
  const sequelize = require('./dist/config/database').default;

  async function updateThemesComplexity() {
    try {
      console.log('🔄 Conectando a la base de datos...');
      await sequelize.authenticate();
      console.log('✅ Conexión establecida');

      const complexityData = {
        [ThemeBlock.ORGANIZACION]: {
          1: ThemeComplexity.MEDIUM,
          2: ThemeComplexity.MEDIUM,
          3: ThemeComplexity.HIGH,
          4: ThemeComplexity.MEDIUM,
          5: ThemeComplexity.MEDIUM,
          6: ThemeComplexity.HIGH,
        },
        [ThemeBlock.JURIDICO_SOCIAL]: {
          1: ThemeComplexity.HIGH,
          2: ThemeComplexity.MEDIUM,
          3: ThemeComplexity.MEDIUM,
          4: ThemeComplexity.HIGH,
          5: ThemeComplexity.MEDIUM,
          6: ThemeComplexity.MEDIUM,
          7: ThemeComplexity.MEDIUM,
          8: ThemeComplexity.HIGH,
        },
        [ThemeBlock.SEGURIDAD_NACIONAL]: {
          1: ThemeComplexity.HIGH,
          2: ThemeComplexity.HIGH,
          3: ThemeComplexity.MEDIUM,
          4: ThemeComplexity.MEDIUM,
          5: ThemeComplexity.MEDIUM,
          6: ThemeComplexity.MEDIUM,
          7: ThemeComplexity.HIGH,
        },
      };

      let updatedCount = 0;

      console.log('🔄 Actualizando complejidad de temas...');

      for (const [block, themes] of Object.entries(complexityData)) {
        for (const [themeNumber, complexity] of Object.entries(themes)) {
          const [updatedRows] = await Theme.update(
            { complexity },
            {
              where: {
                block: block,
                themeNumber: parseInt(themeNumber),
              },
            }
          );

          if (updatedRows > 0) {
            updatedCount++;
            console.log(`✅ Tema ${block}-${themeNumber} actualizado a ${complexity}`);
          } else {
            console.log(`⚠️  Tema ${block}-${themeNumber} no encontrado`);
          }
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
} catch (error) {
  console.error('❌ Error general:', error);
  process.exit(1);
}