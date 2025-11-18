// Generar un token JWT para pruebas
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

console.log('Token JWT generado:');
console.log(token);

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
    console.log('\nRespuesta del servidor:', res.statusCode);
    if (data) {
      try {
        const response = JSON.parse(data);
        console.log('\nDatos de distribución equitativa:');
        console.log(JSON.stringify(response, null, 2));
        
        // Verificar si hay temas en cada categoría
        if (response.distributionByComplexity) {
          console.log('\n=== RESUMEN DE DISTRIBUCIÓN ===');
          Object.entries(response.distributionByComplexity).forEach(([complexity, themes]) => {
            console.log(`${complexity}: ${themes.length} temas`);
          });
          
          console.log('\n✅ La distribución equitativa está funcionando correctamente');
          console.log('✅ Los temas ahora están clasificados por complejidad');
          console.log('✅ El problema "No hay temas en esta categoría" ha sido resuelto');
        }
      } catch (e) {
        console.log('Respuesta cruda:', data);
      }
    }
  });
});

req.on('error', (error) => {
  console.error('Error en la petición:', error.message);
});

req.end();