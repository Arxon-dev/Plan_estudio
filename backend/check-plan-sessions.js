const axios = require('axios');

async function checkPlanSessions() {
  try {
    console.log('🔍 Verificando sesiones del plan 94...');
    
    // Obtener sesiones del plan
    const response = await axios.get('http://localhost:3000/api/study-plans/94/sessions', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log(`📊 Total de sesiones: ${response.data.sessions.length}`);
    
    if (response.data.sessions.length > 0) {
      console.log('\n📅 Primeras 5 sesiones:');
      response.data.sessions.slice(0, 5).forEach(session => {
        console.log(`ID: ${session.id} | Fecha: ${session.scheduledDate} | Tema ID: ${session.themeId} | Tipo: ${session.sessionType} | Horas: ${session.scheduledHours}`);
      });
      
      // Verificar themeIds únicos
      const themeIds = [...new Set(response.data.sessions.map(s => s.themeId))];
      console.log(`\n🎯 Theme IDs únicos: ${themeIds.join(', ')}`);
      console.log(`📚 Total de temas únicos: ${themeIds.length}`);
      
      // Verificar distribución por tema
      const themeDistribution = {};
      response.data.sessions.forEach(session => {
        if (!themeDistribution[session.themeId]) {
          themeDistribution[session.themeId] = 0;
        }
        themeDistribution[session.themeId]++;
      });
      
      console.log('\n📊 Distribución por tema:');
      Object.entries(themeDistribution).forEach(([themeId, count]) => {
        console.log(`Tema ${themeId}: ${count} sesiones`);
      });
      
    } else {
      console.log('No hay sesiones en este plan');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkPlanSessions();