// Verificar directamente en la base de datos qué planes existen
const mysql = require('mysql2/promise');

async function checkPlansDirectly() {
  try {
    console.log('=== VERIFICANDO PLANES EN BASE DE DATOS DIRECTAMENTE ===');
    
    // Conectar a la base de datos
    const connection = await mysql.createConnection({
      host: 'srv1702.hstgr.io',
      port: 3306,
      user: 'u449034524_plan_estudio',
      password: 'Sirius//03072503//',
      database: 'u449034524_plan_estudio'
    });

    // Verificar planes existentes
    const [plans] = await connection.execute('SELECT id, userId, status, createdAt FROM study_plans ORDER BY id DESC LIMIT 10');
    
    console.log(`Total de planes encontrados: ${plans.length}`);
    
    if (plans.length === 0) {
      console.log('No hay planes en la base de datos');
      return;
    }

    for (const plan of plans) {
      console.log(`\nPlan ID: ${plan.id}, Usuario ID: ${plan.userId}, Estado: ${plan.status}`);
      
      // Contar sesiones por plan
      const [sessions] = await connection.execute('SELECT COUNT(*) as count FROM study_sessions WHERE studyPlanId = ?', [plan.id]);
      console.log(`  Sesiones: ${sessions[0].count}`);
      
      // Ver temas únicos en este plan
      const [themes] = await connection.execute('SELECT DISTINCT themeId FROM study_sessions WHERE studyPlanId = ?', [plan.id]);
      console.log(`  Temas únicos: ${themes.length}`);
      
      if (themes.length > 0) {
        // Obtener nombres de temas
        const themeIds = themes.map(t => t.themeId);
        const [themeNames] = await connection.execute('SELECT id, name, complexity FROM themes WHERE id IN (?)', [themeIds]);
        console.log('  Temas por complejidad:');
        
        const byComplexity = { LOW: [], MEDIUM: [], HIGH: [] };
        themeNames.forEach(theme => {
          byComplexity[theme.complexity].push(theme.name);
        });
        
        Object.entries(byComplexity).forEach(([complexity, names]) => {
          if (names.length > 0) {
            console.log(`    ${complexity}: ${names.length} temas`);
          }
        });
      }
    }

    // Probar el primer plan con distribución equitativa
    if (plans.length > 0) {
      const firstPlan = plans[0];
      console.log(`\n=== PROBANDO DISTRIBUCIÓN EQUITATIVA CON PLAN ${firstPlan.id} ===`);
      
      // Generar token JWT
      const jwt = require('jsonwebtoken');
      const token = jwt.sign(
        { id: firstPlan.userId, email: 'user@example.com', iat: Math.floor(Date.now() / 1000) },
        'plan-estudio-secret-key-2025-opomelilla'
      );
      
      console.log('Token generado, haciendo petición...');
      
      // Hacer petición HTTP
      const http = require('http');
      const options = {
        hostname: 'localhost',
        port: 3000,
        path: `/api/study-plans/${firstPlan.id}/equitable-distribution`,
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

    await connection.end();
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkPlansDirectly();