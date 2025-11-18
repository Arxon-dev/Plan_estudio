// Verificar qué planes de estudio existen
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Ejecutar usando ts-node
const script = `
import { User, StudyPlan, StudySession } from './src/models';
import sequelize from './src/config/database';

async function checkExistingPlans() {
  try {
    console.log('=== VERIFICANDO PLANES EXISTENTES ===');
    
    // Buscar el usuario
    const user = await User.findOne({ where: { email: 'user1@example.com' } });
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log(\`Usuario ID: \${user.id}\`);

    // Obtener todos los planes del usuario
    const plans = await StudyPlan.findAll({
      where: { userId: user.id },
      attributes: ['id', 'status', 'createdAt']
    });

    console.log(\`Total de planes: \${plans.length}\`);

    for (const plan of plans) {
      console.log(\`\\nPlan ID: \${plan.id}, Estado: \${plan.status}, Creado: \${plan.createdAt}\`);
      
      // Contar sesiones por plan
      const sessionCount = await StudySession.count({
        where: { studyPlanId: plan.id }
      });
      
      console.log(\`  Sesiones: \${sessionCount}\`);
    }

    if (plans.length > 0) {
      console.log('\\n=== PRIMER PLAN DISPONIBLE ===');
      const firstPlan = plans[0];
      console.log(\`Usando Plan ID: \${firstPlan.id} para pruebas\`);
      
      return firstPlan.id;
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await sequelize.close();
  }
}

checkExistingPlans();
`;

// Guardar el script temporal
const scriptPath = path.join(__dirname, 'temp-check-plans.ts');
fs.writeFileSync(scriptPath, script);

try {
  // Ejecutar con ts-node
  console.log('Verificando planes existentes...');
  execSync(`npx ts-node ${scriptPath}`, { stdio: 'inherit' });
} catch (error) {
  console.error('Error ejecutando el script:', error.message);
} finally {
  // Limpiar archivo temporal
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
  }
}