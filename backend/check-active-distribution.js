// Script para verificar el plan activo del usuario actual
const axios = require('axios');

async function checkActivePlan() {
  try {
    // Obtener el plan activo directamente
    const response = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('Plan activo:');
    console.log(`ID: ${response.data.plan.id}`);
    console.log(`Estado: ${response.data.plan.status}`);
    console.log(`Fecha inicio: ${response.data.plan.startDate}`);
    console.log(`Fecha examen: ${response.data.plan.examDate}`);
    
    const planId = response.data.plan.id;
    
    // Ahora obtener la distribución equitativa
    console.log('\n📊 Obteniendo distribución equitativa...');
    const distResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/equitable-distribution`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('\n📈 Resultados:');
    console.log(`Total de temas: ${distResponse.data.themes.length}`);
    console.log(`Total de sesiones: ${distResponse.data.sessions.length}`);
    
    // Mostrar estadísticas por complejidad
    const stats = distResponse.data.stats;
    console.log('\n📊 Estadísticas por complejidad:');
    console.log(`LOW: ${stats.LOW.themes} temas, ${stats.LOW.totalSessions} sesiones, promedio: ${stats.LOW.avgSessions.toFixed(1)}`);
    console.log(`MEDIUM: ${stats.MEDIUM.themes} temas, ${stats.MEDIUM.totalSessions} sesiones, promedio: ${stats.MEDIUM.avgSessions.toFixed(1)}`);
    console.log(`HIGH: ${stats.HIGH.themes} temas, ${stats.HIGH.totalSessions} sesiones, promedio: ${stats.HIGH.avgSessions.toFixed(1)}`);
    
    // Verificar si hay temas en cada categoría
    const distribution = distResponse.data.distributionByComplexity;
    console.log('\n✅ Verificación de categorías:');
    console.log(`Temas cortos (LOW): ${distribution.LOW.length > 0 ? '✅ Hay temas' : '❌ No hay temas'}`);
    console.log(`Temas medios (MEDIUM): ${distribution.MEDIUM.length > 0 ? '✅ Hay temas' : '❌ No hay temas'}`);
    console.log(`Temas extensos (HIGH): ${distribution.HIGH.length > 0 ? '✅ Hay temas' : '❌ No hay temas'}`);
    
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.status === 404) {
      console.log('No hay plan activo');
    }
  }
}

checkActivePlan();