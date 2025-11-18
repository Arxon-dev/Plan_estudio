// Probar el endpoint con el plan 94 y verificar la estructura de datos
const jwt = require('jsonwebtoken');

// Crear un token JWT válido con el secreto correcto
const payload = {
  id: 16,
  email: 'user@example.com',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
};

const secret = 'plan-estudio-secret-key-2025-opomelilla';
const token = jwt.sign(payload, secret);

console.log('=== PROBANDO ENDPOINT DE DISTRIBUCIÓN EQUITATIVA ===');
console.log('Plan: 94');
console.log('Usuario: 16');

// Hacer petición HTTP
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
    console.log('Status:', res.statusCode);
    
    if (res.statusCode === 200 && data) {
      try {
        const response = JSON.parse(data);
        console.log('\n=== ESTRUCTURA DE DATOS RECIBIDOS ===');
        
        // Verificar la estructura principal
        console.log('✓ distributionByComplexity:', !!response.distributionByComplexity);
        console.log('✓ stats:', !!response.stats);
        console.log('✓ themes:', !!response.themes);
        console.log('✓ sessions:', !!response.sessions);
        
        if (response.distributionByComplexity) {
          console.log('\n=== DISTRIBUCIÓN POR COMPLEJIDAD ===');
          Object.entries(response.distributionByComplexity).forEach(([complexity, themes]) => {
            console.log(`\n${complexity}: ${themes.length} temas`);
            
            if (themes.length > 0) {
              // Verificar la estructura de cada tema
              const firstTheme = themes[0];
              console.log('  Estructura del primer tema:');
              console.log('    ✓ theme:', !!firstTheme.theme);
              console.log('    ✓ totalSessions:', typeof firstTheme.totalSessions);
              console.log('    ✓ reviewSessions:', typeof firstTheme.reviewSessions);
              console.log('    ✓ totalHours:', typeof firstTheme.totalHours);
              
              if (firstTheme.theme) {
                console.log('    ✓ theme.id:', !!firstTheme.theme.id);
                console.log('    ✓ theme.title:', !!firstTheme.theme.title);
                console.log('    ✓ theme.block:', !!firstTheme.theme.block);
                console.log('    ✓ theme.complexity:', !!firstTheme.theme.complexity);
              }
              
              // Verificar si hay valores problemáticos
              if (typeof firstTheme.totalHours !== 'number') {
                console.log(`    ⚠️  totalHours no es número: ${firstTheme.totalHours} (${typeof firstTheme.totalHours})`);
              }
              if (typeof firstTheme.totalSessions !== 'number') {
                console.log(`    ⚠️  totalSessions no es número: ${firstTheme.totalSessions} (${typeof firstTheme.totalSessions})`);
              }
            }
          });
        }
        
        console.log('\n=== VERIFICACIÓN DE TIPOS ===');
        // Buscar problemas de tipos en todos los temas
        let typeIssues = 0;
        if (response.distributionByComplexity) {
          Object.values(response.distributionByComplexity).forEach(function(themes) {
            themes.forEach(function(td) {
              if (typeof td.totalHours !== 'number') typeIssues++;
              if (typeof td.totalSessions !== 'number') typeIssues++;
              if (typeof td.reviewSessions !== 'number') typeIssues++;
            });
          });
        }
        
        if (typeIssues === 0) {
          console.log('✅ No hay problemas de tipos en los datos');
        } else {
          console.log(`⚠️  Se encontraron ${typeIssues} problemas de tipos`);
        }
        
      } catch (e) {
        console.log('Error parseando JSON:', data.substring(0, 200));
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