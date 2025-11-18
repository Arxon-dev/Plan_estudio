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

async function diagnosticarProblema() {
  try {
    console.log('🔍 DIAGNÓSTICO DE PROBLEMA DE COMPLEJIDAD');
    console.log('='.repeat(60));
    
    // 1. Obtener plan activo
    console.log('\n📋 Obteniendo plan activo...');
    const planResponse = await api.get('/study-plans/active');
    const plan = planResponse.data.plan;
    
    if (!plan) {
      console.log('❌ No hay plan activo');
      return;
    }
    
    console.log(`✅ Plan encontrado: ID ${plan.id}`);
    console.log(`📅 Fechas: ${plan.startDate} hasta ${plan.examDate}`);
    
    // 2. Obtener distribución equitativa
    console.log('\n📊 Obteniendo distribución equitativa...');
    const distributionResponse = await api.get(`/study-plans/${plan.id}/equitable-distribution`);
    const data = distributionResponse.data;
    
    console.log('✅ Datos obtenidos');
    console.log(`📈 Total de temas: ${data.themes.length}`);
    console.log(`📚 Total de sesiones: ${data.sessions.length}`);
    
    // 3. Analizar cada tema individualmente
    console.log('\n🔍 ANÁLISIS DETALLADO DE TEMAS:');
    console.log('='.repeat(60));
    
    data.themes.forEach((td, index) => {
      console.log(`\n${index + 1}. ${td.theme.title}`);
      console.log(`   📊 ID: ${td.theme.id}`);
      console.log(`   📁 Bloque: ${td.theme.block}`);
      console.log(`   🔢 Número: ${td.theme.themeNumber}`);
      console.log(`   ⚙️  Complejidad: ${td.theme.complexity}`);
      console.log(`   📅 Sesiones totales: ${td.totalSessions}`);
      console.log(`   🔄 Repasos: ${td.reviewSessions}`);
      console.log(`   📖 Estudios: ${td.studySessions}`);
      console.log(`   📝 Tests: ${td.testSessions}`);
      console.log(`   🎯 Simulacros: ${td.simulationSessions}`);
      console.log(`   ⏱️  Horas: ${td.totalHours.toFixed(2)}`);
      
      // Verificar si la complejidad es válida
      if (!['LOW', 'MEDIUM', 'HIGH'].includes(td.theme.complexity)) {
        console.log(`   ⚠️  ❌ COMPLEJIDAD INVÁLIDA: ${td.theme.complexity}`);
      }
    });
    
    // 4. Verificar distribución por complejidad
    console.log('\n📊 DISTRIBUCIÓN POR COMPLEJIDAD:');
    console.log('='.repeat(60));
    
    ['LOW', 'MEDIUM', 'HIGH'].forEach(complexity => {
      const themes = data.distributionByComplexity[complexity];
      console.log(`\n${complexity}: ${themes.length} temas`);
      
      if (themes.length === 0) {
        console.log('   ⚠️  No hay temas en esta categoría');
      } else {
        themes.forEach(td => {
          console.log(`   - ${td.theme.title} (${td.totalSessions} sesiones)`);
        });
      }
    });
    
    // 5. Verificar valores de complejidad
    console.log('\n🔍 VERIFICACIÓN DE VALORES DE COMPLEJIDAD:');
    console.log('='.repeat(60));
    
    const allComplexities = data.themes.map(td => td.theme.complexity);
    const uniqueComplexities = [...new Set(allComplexities)];
    
    console.log('Valores únicos encontrados:', uniqueComplexities);
    
    uniqueComplexities.forEach(complexity => {
      const count = allComplexities.filter(c => c === complexity).length;
      const isValid = ['LOW', 'MEDIUM', 'HIGH'].includes(complexity);
      console.log(`   ${complexity}: ${count} temas ${isValid ? '✅' : '❌'}`);
    });
    
    // 6. Sugerencias
    console.log('\n💡 SUGERENCIAS:');
    console.log('='.repeat(60));
    
    if (data.themes.length === 0) {
      console.log('   ❌ No hay temas en el plan');
    } else if (uniqueComplexities.some(c => !['LOW', 'MEDIUM', 'HIGH'].includes(c))) {
      console.log('   ⚠️  Hay valores de complejidad no válidos');
      console.log('   📝 Los valores válidos son: LOW, MEDIUM, HIGH');
    } else if (data.distributionByComplexity.LOW.length === 0 && 
               data.distributionByComplexity.MEDIUM.length === 0 && 
               data.distributionByComplexity.HIGH.length === 0) {
      console.log('   ❌ Todos los temas tienen complejidad válida pero no se están agrupando');
      console.log('   🔧 Problema en el filtrado del backend');
    } else {
      console.log('   ✅ La configuración parece correcta');
    }
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Sugerencia: Verifica que el servidor esté ejecutándose y que haya un plan activo');
    }
  }
}

diagnosticarProblema();