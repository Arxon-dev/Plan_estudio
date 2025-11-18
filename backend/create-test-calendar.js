const axios = require('axios');

async function createTestCalendar() {
  try {
    console.log('🔄 Creando calendario de prueba...');
    
    const response = await axios.post('http://localhost:3000/api/study-plans', {
      startDate: '2025-01-01',
      examDate: '2025-06-01',
      weeklySchedule: {
        monday: 2,
        tuesday: 2,
        wednesday: 2,
        thursday: 2,
        friday: 2,
        saturday: 4,
        sunday: 4
      },
      themes: [
        { id: 1, name: 'Constitución Española de 1978', hours: 8, priority: 'high' },
        { id: 2, name: 'Ley Orgánica 5/2005, de la Defensa Nacional', hours: 6, priority: 'medium' },
        { id: 3, name: 'Ley 40/2015, de Régimen Jurídico del Sector Público', hours: 5, priority: 'high' },
        { id: 4, name: 'Real Decreto 205/2024, Ministerio de Defensa', hours: 5, priority: 'medium' },
        { id: 5, name: 'Real Decreto 521/2020, Organización Básica de las Fuerzas Armadas', hours: 6, priority: 'medium' },
        { id: 6, name: 'Instrucciones EMAD, ET, ARMADA y EA', hours: 8, priority: 'high' }
      ]
    }, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('✅ Calendario creado exitosamente');
    console.log(`Plan ID: ${response.data.planId}`);
    console.log(`Estado: ${response.data.status}`);
    
    // Esperar un momento para que se generen las sesiones
    console.log('\n⏳ Esperando generación de sesiones...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Verificar distribución equitativa
    console.log('📊 Verificando distribución equitativa...');
    const distResponse = await axios.get(`http://localhost:3000/api/study-plans/${response.data.planId}/equitable-distribution`, {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log('\n📈 Resultados de distribución equitativa:');
    console.log(`Total de temas: ${distResponse.data.themes.length}`);
    console.log(`Total de sesiones: ${distResponse.data.sessions.length}`);
    
    const stats = distResponse.data.stats;
    console.log('\n📊 Estadísticas por complejidad:');
    console.log(`LOW: ${stats.LOW.themes} temas, ${stats.LOW.totalSessions} sesiones`);
    console.log(`MEDIUM: ${stats.MEDIUM.themes} temas, ${stats.MEDIUM.totalSessions} sesiones`);
    console.log(`HIGH: ${stats.HIGH.themes} temas, ${stats.HIGH.totalSessions} sesiones`);
    
    // Verificar distribución
    const distribution = distResponse.data.distributionByComplexity;
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
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

createTestCalendar();