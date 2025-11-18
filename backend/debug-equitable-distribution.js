const axios = require('axios');

async function debugEquitableDistribution() {
  try {
    console.log('🔍 Depurando distribución equitativa del plan 94...');
    
    // Obtener distribución equitativa
    const response = await axios.get('http://localhost:3000/api/study-plans/94/equitable-distribution', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('📊 Datos recibidos:');
    console.log(`themes.length: ${response.data.themes.length}`);
    console.log(`sessions.length: ${response.data.sessions.length}`);
    console.log(`distributionByComplexity.LOW.length: ${response.data.distributionByComplexity.LOW.length}`);
    console.log(`distributionByComplexity.MEDIUM.length: ${response.data.distributionByComplexity.MEDIUM.length}`);
    console.log(`distributionByComplexity.HIGH.length: ${response.data.distributionByComplexity.HIGH.length}`);
    
    // Si hay temas, mostrar ejemplos
    if (response.data.themes.length > 0) {
      console.log('\n📋 Primeros 3 temas:');
      response.data.themes.slice(0, 3).forEach(theme => {
        console.log(`- ${theme.theme.title} (${theme.theme.complexity}): ${theme.totalSessions} sesiones`);
      });
    }
    
    // Verificar las estadísticas
    const stats = response.data.stats;
    console.log('\n📈 Estadísticas:');
    console.log(`LOW themes: ${stats.LOW.themes}`);
    console.log(`MEDIUM themes: ${stats.MEDIUM.themes}`);
    console.log(`HIGH themes: ${stats.HIGH.themes}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

debugEquitableDistribution();