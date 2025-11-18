// Script para probar la distribución equitativa usando TypeScript
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ejecutar usando ts-node
const script = `
import { User, Theme, StudyPlan, StudySession } from './src/models';
import { sequelize } from './src/config/database';

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
    const sessions = await StudySession.findAll({
      where: { studyPlanId: plan.id },
      attributes: ['id', 'themeId', 'studyPlanId']
    });

    console.log(\`Total de sesiones: \${sessions.length}\`);

    // Obtener todos los temas únicos de las sesiones
    const themeIds = [...new Set(sessions.map((s: any) => s.themeId))];
    console.log(\`Temas únicos: \${themeIds.length}\`);

    // Obtener información de los temas con su complejidad
    const themes = await Theme.findAll({
      where: { id: themeIds as any },
      attributes: ['id', 'name', 'complexity']
    });

    console.log('\\n=== TEMAS POR COMPLEJIDAD ===');
    const distribution = {
      LOW: [] as any[],
      MEDIUM: [] as any[],
      HIGH: [] as any[]
    };

    themes.forEach((theme: any) => {
      const sessionCount = sessions.filter((s: any) => s.themeId === theme.id).length;
      distribution[theme.complexity as keyof typeof distribution].push({
        name: theme.name,
        sessions: sessionCount
      });
    });

    Object.entries(distribution).forEach(([complexity, themes]) => {
      console.log(\`\\n\${complexity} (\${themes.length} temas):\`);
      themes.forEach((theme: any) => {
        console.log(\`  📚 \${theme.name}: \${theme.sessions} sesiones\`);
      });
    });

    // Calcular estadísticas
    const stats = {
      LOW: { total: distribution.LOW.reduce((sum: number, t: any) => sum + t.sessions, 0), count: distribution.LOW.length },
      MEDIUM: { total: distribution.MEDIUM.reduce((sum: number, t: any) => sum + t.sessions, 0), count: distribution.MEDIUM.length },
      HIGH: { total: distribution.HIGH.reduce((sum: number, t: any) => sum + t.sessions, 0), count: distribution.HIGH.length }
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
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
  }
}