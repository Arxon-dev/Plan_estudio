const axios = require('axios');

async function checkPlan92() {
  try {
    // Intentar obtener el plan 92 con el token actual
    const response = await axios.get('http://localhost:3000/api/study-plans/92/equitable-distribution', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('✅ Plan 92 accesible con usuario actual');
    console.log('📊 Resultados:');
    console.log(`Total de temas: ${response.data.themes.length}`);
    console.log(`Total de sesiones: ${response.data.sessions.length}`);
    
    // Mostrar estadísticas por complejidad
    const stats = response.data.stats;
    console.log('\n📈 Estadísticas por complejidad:');
    console.log(`LOW: ${stats.LOW.themes} temas, ${stats.LOW.totalSessions} sesiones`);
    console.log(`MEDIUM: ${stats.MEDIUM.themes} temas, ${stats.MEDIUM.totalSessions} sesiones`);
    console.log(`HIGH: ${stats.HIGH.themes} temas, ${stats.HIGH.totalSessions} sesiones`);
    
    // Verificar distribución
    const distribution = response.data.distributionByComplexity;
    console.log('\n✅ Verificación de categorías:');
    console.log(`Temas cortos (LOW): ${distribution.LOW.length} temas`);
    console.log(`Temas medios (MEDIUM): ${distribution.MEDIUM.length} temas`);
    console.log(`Temas extensos (HIGH): ${distribution.HIGH.length} temas`);
    
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('❌ Plan 92 no encontrado o no pertenece al usuario actual');
      console.log('Error:', error.response.data);
    } else {
      console.error('Error:', error.response?.data || error.message);
    }
  }
}

checkPlan92();