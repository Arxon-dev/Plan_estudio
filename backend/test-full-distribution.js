const axios = require('axios');

async function getActivePlan() {
  try {
    // Obtener planes del usuario
    const plansResponse = await axios.get('http://localhost:3000/api/study-plans', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('Planes encontrados:', plansResponse.data.plans.length);
    
    const activePlan = plansResponse.data.plans.find(p => p.status === 'ACTIVE');
    
    if (activePlan) {
      console.log(`Plan activo: ID ${activePlan.id}`);
      
      // Obtener distribución equitativa
      const distResponse = await axios.get(`http://localhost:3000/api/study-plans/${activePlan.id}/equitable-distribution`, {
        headers: {
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
        }
      });
      
      console.log('\n📊 Distribución equitativa:');
      console.log(`LOW: ${distResponse.data.stats.LOW.themes} temas, ${distResponse.data.stats.LOW.totalSessions} sesiones`);
      console.log(`MEDIUM: ${distResponse.data.stats.MEDIUM.themes} temas, ${distResponse.data.stats.MEDIUM.totalSessions} sesiones`);
      console.log(`HIGH: ${distResponse.data.stats.HIGH.themes} temas, ${distResponse.data.stats.HIGH.totalSessions} sesiones`);
      
      // Mostrar detalles de temas por complejidad
      console.log('\n📋 Detalles por complejidad:');
      
      ['LOW', 'MEDIUM', 'HIGH'].forEach(complexity => {
        const themes = distResponse.data.distributionByComplexity[complexity];
        if (themes.length > 0) {
          console.log(`\n${complexity} (${themes.length} temas):`);
          themes.slice(0, 3).forEach(theme => {
            console.log(`  - ${theme.theme.title} (${theme.totalSessions} sesiones)`);
          });
          if (themes.length > 3) {
            console.log(`  ... y ${themes.length - 3} más`);
          }
        } else {
          console.log(`\n${complexity}: No hay temas en esta categoría`);
        }
      });
      
    } else {
      console.log('No hay plan activo');
    }
    
  } catch (error) {
    console.error('Error completo:', error.response?.data || error.message);
  }
}

getActivePlan();