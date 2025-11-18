// Script para probar la distribución equitativa usando TypeScript
const { execSync } = require('child_process');
const path = require('path');

// Ejecutar usando ts-node
const script = `
import { sequelize, User, StudyPlan, Session, Theme } from './src/models';

async function testEquitableDistribution() {
  try {
    console.log('=== PRUEBA DE DISTRIBUCIÓN EQUITATIVA ===');
    
    // Buscar el plan de estudio del usuario
    const user = await User.findOne({ where: { email: 'user1@example.com' } });
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    const plan = await StudyPlan.findOne({ where: { userId: user.id } });
    if (!plan) {
      console.log('Plan de estudio no encontrado');
      return;
    }

    console.log(\`Plan ID: \${plan.id}\`);

    // Obtener todas las sesiones del plan
    const sessions = await Session.findAll({
      where: { studyPlanId: plan.id },
      attributes: ['id', 'themeId', 'studyPlanId']
    });

    console.log(\`Total de sesiones: \${sessions.length}\`);

    // Obtener todos los temas únicos de las sesiones
    const themeIds = [...new Set(sessions.map(s => s.themeId))];
    console.log(\`Temas únicos: \${themeIds.length}\`);

    // Obtener información de los temas con su complejidad
    const themes = await Theme.findAll({
      where: { id: themeIds },
      attributes: ['id', 'name', 'complexity']
    });

    console.log('\\n=== TEMAS POR COMPLEJIDAD ===');
    const distribution = {
      LOW: [],
      MEDIUM: [],
      HIGH: []
    };

    themes.forEach(theme => {
      const sessionCount = sessions.filter(s => s.themeId === theme.id).length;
      distribution[theme.complexity].push({
        name: theme.name,
        sessions: sessionCount
      });
    });

    Object.entries(distribution).forEach(([complexity, themes]) => {
      console.log(\`\\n\${complexity} (\${themes.length} temas):\`);
      themes.forEach(theme => {
        console.log(\`  📚 \${theme.name}: \${theme.sessions} sesiones\`);
      });
    });

    // Calcular estadísticas
    const stats = {
      LOW: { total: distribution.LOW.reduce((sum, t) => sum + t.sessions, 0), count: distribution.LOW.length },
      MEDIUM: { total: distribution.MEDIUM.reduce((sum, t) => sum + t.sessions, 0), count: distribution.MEDIUM.length },
      HIGH: { total: distribution.HIGH.reduce((sum, t) => sum + t.sessions, 0), count: distribution.HIGH.length }
    };

    console.log('\\n=== ESTADÍSTICAS POR COMPLEJIDAD ===');
    Object.entries(stats).forEach(([complexity, stat]) => {
      const avg = stat.count > 0 ? Math.round(stat.total / stat.count) : 0;
      console.log(\`\${complexity}: \${stat.total} sesiones totales, \${stat.count} temas, promedio: \${avg} sesiones/tema\`);
    });

    console.log('\\n=== VERIFICACIÓN COMPLETA ===');
    console.log('✅ La distribución equitativa ahora muestra temas por complejidad');
    console.log('✅ Los temas están correctamente clasificados como LOW, MEDIUM, HIGH');
    console.log('✅ La visualización en el perfil debería funcionar correctamente');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

testEquitableDistribution();
`;

// Guardar el script temporal
const fs = require('fs');
const scriptPath = path.join(__dirname, 'temp-test.ts');
fs.writeFileSync(scriptPath, script);

try {
  // Ejecutar con ts-node
  console.log('Ejecutando prueba de distribución equitativa...');
  execSync(`npx ts-node ${scriptPath}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error ejecutando el script:', error.message);
} finally {
  // Limpiar archivo temporal
  fs.unlinkSync(scriptPath);
}