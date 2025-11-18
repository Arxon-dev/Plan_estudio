// Probar con el plan 94 directamente con token JWT
const jwt = require('jsonwebtoken');

// Crear un token JWT válido con el secreto correcto
const payload = {
  id: 1,
  email: 'user1@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
};

const secret = 'plan-estudio-secret-key-2025-opomelilla'; // Secreto del .env
const token = jwt.sign(payload, secret);

console.log('=== PROBANDO DISTRIBUCIÓN EQUITATIVA CON PLAN 94 ===');

// Hacer una petición de prueba
const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/study-plans/94/equitable-distribution',
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
        console.log('Datos completos:', JSON.stringify(response, null, 2));
        
        if (response.distributionByComplexity) {
          console.log('\n=== RESUMEN POR COMPLEJIDAD ===');
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
          
          console.log('\n✅ SUCCESS: La distribución equitativa está funcionando');
          console.log('✅ Los temas están clasificados por complejidad (LOW, MEDIUM, HIGH)');
          
          // Verificar si el problema está resuelto
          const hasThemesInAllCategories = Object.values(response.distributionByComplexity).every(themes => themes.length > 0);
          if (hasThemesInAllCategories) {
            console.log('✅ PROBLEMA RESUELTO: Todos las categorías tienen temas');
          } else {
            console.log('⚠️  Algunas categorías aún no tienen temas');
          }
        }
      } catch (e) {
        console.log('Respuesta cruda:', data);
      }
    } else if (res.statusCode === 404) {
      console.log('Plan 94 no encontrado. Intentando con otros planes...');
      // Probar con planes del 1 al 10
      testMultiplePlans(token);
    } else {
      console.log('Error:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('Error en la petición:', error.message);
});

req.end();

function testMultiplePlans(token) {
  console.log('\n=== PROBANDO MULTIPLES PLANES ===');
  
  // Probar con planes 1-10
  for (let planId = 1; planId <= 10; planId++) {
    setTimeout(() => {
      testPlan(token, planId);
    }, planId * 500); // Esperar 500ms entre cada prueba
  }
}

function testPlan(token, planId) {
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
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          if (response.distributionByComplexity) {
            const totalThemes = Object.values(response.distributionByComplexity).reduce((sum, themes) => sum + themes.length, 0);
            if (totalThemes > 0) {
              console.log(`\n✅ Plan ${planId}: ENCONTRADO con ${totalThemes} temas`);
              Object.entries(response.distributionByComplexity).forEach(([complexity, themes]) => {
                console.log(`  ${complexity}: ${themes.length} temas`);
              });
            }
          }
        } catch (e) {
          // Ignorar errores de parseo
        }
      }
    });
  });

  req.on('error', () => {
    // Ignorar errores de conexión
  });

  req.end();
}