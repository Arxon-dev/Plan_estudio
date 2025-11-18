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

async function testNewDistribution() {
  try {
    console.log('🧪 PROBANDO NUEVA DISTRIBUCIÓN EQUILIBRADA...\n');
    
    // Crear un plan de prueba pequeño para ver la distribución
    const testData = {
      startDate: '2025-12-01',
      examDate: '2026-04-01', // 4 meses para ver el refuerzo
      weeklySchedule: {
        monday: 4,
        tuesday: 4,
        wednesday: 4,
        thursday: 4,
        friday: 4,
        saturday: 0,
        sunday: 0
      },
      themes: [
        { id: 1, name: 'Tema LOW Complejidad', hours: 4, priority: 1, complexity: 'LOW' },
        { id: 2, name: 'Tema MEDIUM Complejidad', hours: 4, priority: 2, complexity: 'MEDIUM' },
        { id: 3, name: 'Tema HIGH Complejidad', hours: 4, priority: 3, complexity: 'HIGH' },
        { id: 4, name: 'Tema LOW Complejidad 2', hours: 4, priority: 4, complexity: 'LOW' },
        { id: 5, name: 'Tema MEDIUM Complejidad 2', hours: 4, priority: 5, complexity: 'MEDIUM' }
      ]
    };

    console.log('📊 Datos de prueba:');
    console.log(`📅 Período: ${testData.startDate} hasta ${testData.examDate}`);
    console.log(`📚 Temas: ${testData.themes.length} temas con diferentes complejidades`);
    console.log(`⏱️  Horas por semana: ${Object.values(testData.weeklySchedule).reduce((a, b) => a + b, 0)} horas\n`);

    // Primero cancelar cualquier plan activo
    try {
      await api.delete('/study-plans/active');
      console.log('✅ Plan anterior cancelado');
    } catch (e) {
      console.log('ℹ️ No había plan activo anterior');
    }

    // Crear nuevo plan
    console.log('🎯 Creando plan de prueba...');
    const response = await api.post('/study-plans', testData);
    console.log('✅ Plan creado exitosamente');
    console.log('📋 Mensaje:', response.data.message);

    // Esperar un poco para que se genere
    console.log('⏳ Esperando generación...');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Obtener el plan y sus sesiones
    const planResponse = await api.get('/study-plans/active');
    const plan = planResponse.data.plan;
    
    if (!plan) {
      console.log('❌ No se pudo obtener el plan generado');
      return;
    }

    console.log(`✅ Plan ID: ${plan.id}`);
    
    // Obtener sesiones
    const sessionsResponse = await api.get(`/study-plans/${plan.id}/sessions`);
    const sessions = sessionsResponse.data.sessions;
    
    console.log(`📊 Total de sesiones generadas: ${sessions.length}\n`);

    // Analizar distribución por tema y complejidad
    const analysis = {};
    
    sessions.forEach(session => {
      const themeName = session.theme?.title || `Tema ${session.themeId}`;
      const complexity = testData.themes.find(t => t.id === session.themeId)?.complexity || 'UNKNOWN';
      const key = `${themeName} (${complexity})`;
      
      if (!analysis[key]) {
        analysis[key] = {
          themeId: session.themeId,
          complexity: complexity,
          totalSessions: 0,
          studySessions: 0,
          reviewSessions: 0,
          testSessions: 0,
          totalHours: 0
        };
      }
      
      analysis[key].totalSessions++;
      analysis[key].totalHours += session.scheduledHours;
      
      switch (session.sessionType) {
        case 'STUDY':
          analysis[key].studySessions++;
          break;
        case 'REVIEW':
          analysis[key].reviewSessions++;
          break;
        case 'TEST':
          analysis[key].testSessions++;
          break;
      }
    });

    // Mostrar resultados
    console.log('📈 DISTRIBUCIÓN POR TEMA Y COMPLEJIDAD:');
    console.log('='.repeat(60));
    
    Object.entries(analysis).forEach(([key, data]) => {
      console.log(`\n📝 ${key}`);
      console.log(`   📊 Total: ${data.totalSessions} sesiones | ⏱️ ${Number(data.totalHours).toFixed(1)}h`);
      console.log(`   📖 Estudios: ${data.studySessions} | 🔄 Repasos: ${data.reviewSessions} | 📝 Tests: ${data.testSessions}`);
      console.log(`   📊 Ratio repaso/estudio: ${data.studySessions > 0 ? (data.reviewSessions / data.studySessions).toFixed(2) : 'N/A'}`);
    });

    // Estadísticas por complejidad
    console.log('\n' + '='.repeat(60));
    console.log('📊 ESTADÍSTICAS POR COMPLEJIDAD:');
    console.log('='.repeat(60));
    
    const byComplexity = {};
    Object.values(analysis).forEach(data => {
      if (!byComplexity[data.complexity]) {
        byComplexity[data.complexity] = {
          themes: 0,
          totalSessions: 0,
          totalStudy: 0,
          totalReview: 0,
          totalTest: 0,
          totalHours: 0
        };
      }
      
      byComplexity[data.complexity].themes++;
      byComplexity[data.complexity].totalSessions += data.totalSessions;
      byComplexity[data.complexity].totalStudy += data.studySessions;
      byComplexity[data.complexity].totalReview += data.reviewSessions;
      byComplexity[data.complexity].totalTest += data.testSessions;
      byComplexity[data.complexity].totalHours += Number(data.totalHours);
    });

    Object.entries(byComplexity).forEach(([complexity, data]) => {
      const avgSessions = data.totalSessions / data.themes;
      const avgHours = Number(data.totalHours) / data.themes;
      const ratio = data.totalStudy > 0 ? data.totalReview / data.totalStudy : 0;
      
      console.log(`\n${complexity}:`);
      console.log(`   📚 ${data.themes} temas | Promedio: ${avgSessions.toFixed(1)} sesiones (${avgHours.toFixed(1)}h) por tema`);
      console.log(`   📊 Total: ${data.totalSessions} sesiones | Ratio repaso/estudio: ${ratio.toFixed(2)}`);
    });

    // Verificar equidad
    console.log('\n' + '='.repeat(60));
    console.log('⚖️  ANÁLISIS DE EQUIDAD:');
    console.log('='.repeat(60));
    
    const sessionsPerTheme = Object.values(analysis).map(d => d.totalSessions);
    const avgSessions = sessionsPerTheme.reduce((a, b) => a + b, 0) / sessionsPerTheme.length;
    const maxSessions = Math.max(...sessionsPerTheme);
    const minSessions = Math.min(...sessionsPerTheme);
    const stdDev = Math.sqrt(sessionsPerTheme.reduce((sq, n) => sq + Math.pow(n - avgSessions, 2), 0) / sessionsPerTheme.length);
    
    console.log(`📊 Media: ${avgSessions.toFixed(1)} sesiones por tema`);
    console.log(`📈 Máximo: ${maxSessions} | Mínimo: ${minSessions} | Desv. estándar: ${stdDev.toFixed(1)}`);
    console.log(`🔍 Diferencia máx/min: ${((maxSessions - minSessions) / minSessions * 100).toFixed(1)}%`);
    
    if (stdDev < avgSessions * 0.4) {
      console.log('✅ Distribución EQUILIBRADA (desv. estándar < 40% de la media)');
    } else if (stdDev < avgSessions * 0.6) {
      console.log('⚠️  Distribución ACEPTABLE (desv. estándar < 60% de la media)');
    } else {
      console.log('❌ Distribución DESIGUAL (desv. estándar > 60% de la media)');
    }

    // Limpiar plan de prueba
    await api.delete('/study-plans/active');
    console.log('\n✅ Plan de prueba eliminado');

  } catch (error) {
    console.error('❌ Error en prueba:', error.response?.data || error.message);
  }
}

testNewDistribution();