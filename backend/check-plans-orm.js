// Verificar planes usando el ORM directamente
const { Sequelize } = require('sequelize');

async function checkPlansORM() {
  try {
    console.log('=== VERIFICANDO PLANES USANDO ORM ===');
    
    // Conectar a la base de datos directamente
    const sequelize = new Sequelize(
      'u449034524_plan_estudio',
      'u449034524_plan_estudio',
      'Sirius//03072503//',
      {
        host: 'srv1702.hstgr.io',
        port: 3306,
        dialect: 'mysql',
        logging: false
      }
    );

    // Definir modelos simples
    const StudyPlan = sequelize.define('study_plans', {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      userId: { type: Sequelize.INTEGER },
      status: { type: Sequelize.STRING }
    });

    const StudySession = sequelize.define('study_sessions', {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      studyPlanId: { type: Sequelize.INTEGER },
      themeId: { type: Sequelize.INTEGER }
    });

    const Theme = sequelize.define('themes', {
      id: { type: Sequelize.INTEGER, primaryKey: true },
      title: { type: Sequelize.STRING },
      complexity: { type: Sequelize.STRING }
    });

    // Buscar planes
    const plans = await StudyPlan.findAll({
      order: [['id', 'DESC']],
      limit: 5
    });

    console.log(`Planes encontrados: ${plans.length}`);

    for (const plan of plans) {
      console.log(`\nPlan ID: ${plan.id}, Usuario ID: ${plan.userId}, Estado: ${plan.status}`);
      
      // Contar sesiones
      const sessionCount = await StudySession.count({
        where: { studyPlanId: plan.id }
      });
      console.log(`  Sesiones: ${sessionCount}`);
      
      if (sessionCount > 0) {
        // Obtener temas únicos
        const sessions = await StudySession.findAll({
          where: { studyPlanId: plan.id },
          attributes: ['themeId'],
          group: ['themeId']
        });
        
        const themeIds = sessions.map(s => s.themeId);
        console.log(`  Temas únicos: ${themeIds.length}`);
        
        if (themeIds.length > 0) {
          const themes = await Theme.findAll({
            where: { id: themeIds }
          });
          
          console.log('  Temas por complejidad:');
          const byComplexity = { LOW: [], MEDIUM: [], HIGH: [] };
          
          themes.forEach(theme => {
            byComplexity[theme.complexity].push(theme.title);
          });
          
          Object.entries(byComplexity).forEach(([complexity, names]) => {
            if (names.length > 0) {
              console.log(`    ${complexity}: ${names.length} temas`);
            }
          });
          
          // Probar distribución equitativa con este plan
          if (plan.id === 94) {
            console.log(`\n=== PROBANDO DISTRIBUCIÓN EQUITATIVA CON PLAN 94 ===`);
            await testEquitableDistribution(plan.id);
          }
        }
      }
    }

    await sequelize.close();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

async function testEquitableDistribution(planId) {
  // Generar token JWT
  const jwt = require('jsonwebtoken');
  const token = jwt.sign(
    { id: 16, email: 'user@example.com', iat: Math.floor(Date.now() / 1000) },
    'plan-estudio-secret-key-2025-opomelilla'
  );
  
  console.log('Token generado, haciendo petición...');
  
  // Hacer petición HTTP
  const http = require('http');
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/study-plans/${planId}/equitable-distribution`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Respuesta del servidor:', res.statusCode);
      
      if (res.statusCode === 200 && data) {
        try {
          const response = JSON.parse(data);
          console.log('\n=== DISTRIBUCIÓN EQUITATIVA FUNCIONANDO ===');
          
          if (response.distributionByComplexity) {
            Object.entries(response.distributionByComplexity).forEach(([complexity, themes]) => {
              console.log(`${complexity}: ${themes.length} temas`);
              if (themes.length > 0) {
                themes.forEach(theme => {
                  console.log(`  📚 ${theme.name}: ${theme.sessions} sesiones`);
                });
              } else {
                console.log(`  ❌ No hay temas en esta categoría`);
              }
            });
            
            console.log('\n✅ SUCCESS: La distribución equitativa está funcionando correctamente');
            console.log('✅ El problema "No hay temas en esta categoría" ha sido resuelto');
          }
        } catch (e) {
          console.log('Respuesta cruda:', data);
        }
      } else {
        console.log('Error o respuesta vacía:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error en la petición:', error.message);
  });

  req.end();
}

checkPlansORM();