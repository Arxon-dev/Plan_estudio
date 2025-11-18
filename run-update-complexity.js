// Script para ejecutar la actualización de complejidad directamente
const { execSync } = require('child_process');
const path = require('path');

// Cambiar al directorio backend
process.chdir(path.join(__dirname, 'backend'));

try {
  console.log('🔄 Compilando TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('🔄 Ejecutando actualización de complejidad...');
  
  // Crear script temporal para ejecutar la actualización
  const updateScript = `
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
              console.log(\`✅ Tema \${block}-\${themeNumber} actualizado a \${complexity}\`);
            } else {
              console.log(\`⚠️  Tema \${block}-\${themeNumber} no encontrado\`);
            }
          }
        }

        console.log(\`\\n✅ Actualización completada: \${updatedCount} temas actualizados\`);

        process.exit(0);
      } catch (error) {
        console.error('❌ Error actualizando temas:', error);
        process.exit(1);
      }
    }

    updateThemesComplexity();
  `;
  
  require('fs').writeFileSync('temp-update.js', updateScript);
  
  execSync('node temp-update.js', { stdio: 'inherit' });
  
  // Limpiar
  require('fs').unlinkSync('temp-update.js');
  
  console.log('✅ Proceso completado');
  
} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}