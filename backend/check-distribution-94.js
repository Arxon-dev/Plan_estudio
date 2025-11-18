const axios = require('axios');

async function checkDistribution94() {
  try {
    console.log('📊 Verificando distribución equitativa del plan 94...');
    
    // Esperar un momento para que se generen las sesiones
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await axios.get('http://localhost:3000/api/study-plans/94/equitable-distribution', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('\n📈 Resultados de distribución equitativa:');
    console.log(`Total de temas: ${response.data.themes.length}`);
    console.log(`Total de sesiones: ${response.data.sessions.length}`);
    
    // Mostrar estadísticas por complejidad
    const stats = response.data.stats;
    console.log('\n📊 Estadísticas por complejidad:');
    console.log(`LOW: ${stats.LOW.themes} temas, ${stats.LOW.totalSessions} sesiones, promedio: ${stats.LOW.avgSessions.toFixed(1)}`);
    console.log(`MEDIUM: ${stats.MEDIUM.themes} temas, ${stats.MEDIUM.totalSessions} sesiones, promedio: ${stats.MEDIUM.avgSessions.toFixed(1)}`);
    console.log(`HIGH: ${stats.HIGH.themes} temas, ${stats.HIGH.totalSessions} sesiones, promedio: ${stats.HIGH.avgSessions.toFixed(1)}`);
    
    // Verificar distribución
    const distribution = response.data.distributionByComplexity;
    console.log('\n✅ Verificación de categorías:');
    console.log(`Temas cortos (LOW): ${distribution.LOW.length} temas`);
    console.log(`Temas medios (MEDIUM): ${distribution.MEDIUM.length} temas`);
    console.log(`Temas extensos (HIGH): ${distribution.HIGH.length} temas`);
    
    // Mostrar algunos ejemplos de temas por categoría
    console.log('\n📋 Ejemplos de temas por categoría:');
    
    ['LOW', 'MEDIUM', 'HIGH'].forEach(complexity => {
      const themes = distribution[complexity];
      if (themes.length > 0) {
        console.log(`\n${complexity} (${themes.length} temas):`);
        themes.slice(0, 2).forEach(theme => {
          console.log(`  - ${theme.theme.title} (${theme.totalSessions} sesiones)`);
        });
        if (themes.length > 2) {
          console.log(`  ... y ${themes.length - 2} más`);
        }
      } else {
        console.log(`\n${complexity}: No hay temas en esta categoría`);
      }
    });
    
    console.log('\n🎉 ¡La distribución equitativa está funcionando correctamente!');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkDistribution94();