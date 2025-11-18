const axios = require('axios');

// Token de Carlos
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzMzUwOTIxLCJleHAiOjE3NjM5NTU3MjF9.RGHxloiQjDc1M8CTCz7hN7zUTSodhvjhDW7eVYM_7O8';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Authorization': `Bearer ${TOKEN}`,
    'Content-Type': 'application/json'
  }
});

async function testEquitableDistribution() {
  try {
    console.log('🧪 Probando endpoint de distribución equitativa...');
    
    // Primero obtener el plan activo
    console.log('📋 Obteniendo plan activo...');
    const planResponse = await api.get('/study-plans/active');
    const plan = planResponse.data.plan;
    
    if (!plan) {
      console.log('❌ No hay plan activo');
      return;
    }
    
    console.log(`✅ Plan encontrado: ID ${plan.id}`);
    
    // Ahora probar el nuevo endpoint
    console.log('📊 Obteniendo distribución equitativa...');
    const distributionResponse = await api.get(`/study-plans/${plan.id}/equitable-distribution`);
    const data = distributionResponse.data;
    
    console.log('✅ Distribución equitativa obtenida exitosamente');
    console.log('\n📈 RESUMEN POR COMPLEJIDAD:');
    console.log('='.repeat(50));
    
    // Mostrar estadísticas por complejidad
    ['LOW', 'MEDIUM', 'HIGH'].forEach(complexity => {
      const stats = data.stats[complexity];
      const themes = data.distributionByComplexity[complexity];
      
      console.log(`\n${complexity}:`);
      console.log(`  📚 Temas: ${stats.themes}`);
      console.log(`  📊 Sesiones promedio: ${stats.avgSessions.toFixed(1)}`);
      console.log(`  ⏱️  Horas totales: ${stats.totalHours.toFixed(1)}`);
      console.log(`  🔄 Límites repaso: ${stats.reviewLimits.min}-${stats.reviewLimits.max}`);
      
      if (themes.length > 0) {
        console.log('  📋 Temas detallados:');
        themes.forEach(td => {
          console.log(`    - ${td.theme.title}: ${td.totalSessions} sesiones (${td.reviewSessions} repasos)`);
        });
      }
    });
    
    console.log('\n🎉 ¡Prueba completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

testEquitableDistribution();