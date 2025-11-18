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

async function analyzeCalendar() {
  try {
    console.log('🔍 Obteniendo plan activo de Carlos...');
    
    // Obtener plan activo
    const planResponse = await api.get('/study-plans/active');
    const plan = planResponse.data.plan;
    
    if (!plan) {
      console.log('❌ No hay plan activo');
      return;
    }
    
    console.log(`✅ Plan encontrado: ID ${plan.id}`);
    console.log(`📅 Fechas: ${plan.startDate} hasta ${plan.examDate}`);
    
    // Obtener todas las sesiones
    console.log('📚 Obteniendo todas las sesiones...');
    const sessionsResponse = await api.get(`/study-plans/${plan.id}/sessions`);
    const sessions = sessionsResponse.data.sessions;
    
    console.log(`✅ ${sessions.length} sesiones encontradas`);
    
    // Análisis por tema
    const themeAnalysis = {};
    
    sessions.forEach(session => {
      const themeKey = session.theme?.title || `Tema ${session.themeId}`;
      const themeBlock = session.theme?.block || 'SIN-BLOQUE';
      const fullThemeName = `${themeBlock} - ${themeKey}`;
      
      if (!themeAnalysis[fullThemeName]) {
        themeAnalysis[fullThemeName] = {
          themeId: session.themeId,
          block: themeBlock,
          title: themeKey,
          totalSessions: 0,
          studySessions: 0,
          reviewSessions: 0,
          testSessions: 0,
          simulationSessions: 0,
          totalHours: 0,
          completedHours: 0,
          firstSession: null,
          lastSession: null,
          sessionDates: []
        };
      }
      
      const analysis = themeAnalysis[fullThemeName];
      analysis.totalSessions++;
      analysis.totalHours += session.scheduledHours;
      analysis.completedHours += (session.completedHours || 0);
      
      // Clasificar por tipo
      switch (session.sessionType) {
        case 'STUDY':
          analysis.studySessions++;
          break;
        case 'REVIEW':
          analysis.reviewSessions++;
          break;
        case 'TEST':
          analysis.testSessions++;
          break;
        case 'SIMULATION':
          analysis.simulationSessions++;
          break;
      }
      
      // Fechas
      const sessionDate = new Date(session.scheduledDate);
      analysis.sessionDates.push(sessionDate);
      
      if (!analysis.firstSession || sessionDate < analysis.firstSession) {
        analysis.firstSession = sessionDate;
      }
      if (!analysis.lastSession || sessionDate > analysis.lastSession) {
        analysis.lastSession = sessionDate;
      }
    });
    
    // Ordenar por bloque y número de tema
    const sortedThemes = Object.entries(themeAnalysis).sort((a, b) => {
      const [blockA, themeA] = a[0].split(' - ');
      const [blockB, themeB] = b[0].split(' - ');
      
      if (blockA !== blockB) return blockA.localeCompare(blockB);
      
      // Extraer número del tema para ordenar numéricamente
      const numA = parseInt(themeA.match(/\d+/)?.[0] || '0');
      const numB = parseInt(themeB.match(/\d+/)?.[0] || '0');
      return numA - numB;
    });
    
    // Generar informe
    console.log('\n' + '='.repeat(80));
    console.log('📊 ANÁLISIS DETALLADO DEL CALENDARIO DE CARLOS');
    console.log('='.repeat(80));
    
    let totalStudySessions = 0;
    let totalReviewSessions = 0;
    let totalTestSessions = 0;
    let totalSimulationSessions = 0;
    
    sortedThemes.forEach(([themeName, data]) => {
      console.log(`\n📝 ${themeName}`);
      console.log(`   📊 Total sesiones: ${data.totalSessions}`);
      console.log(`   📖 Estudios: ${data.studySessions} | 🔄 Repasos: ${data.reviewSessions} | 📝 Tests: ${data.testSessions} | 🎯 Simulacros: ${data.simulationSessions}`);
      console.log(`   ⏱️  Horas planificadas: ${data.totalHours} | Horas completadas: ${data.completedHours}`);
      console.log(`   📅 Primera sesión: ${data.firstSession?.toLocaleDateString()} | Última: ${data.lastSession?.toLocaleDateString()}`);
      
      // Calcular frecuencia de repasos
      if (data.reviewSessions > 0 && data.studySessions > 0) {
        const studySpan = (data.lastSession - data.firstSession) / (1000 * 60 * 60 * 24); // días
        const avgDaysBetweenReviews = studySpan / data.reviewSessions;
        console.log(`   📈 Repaso cada ${avgDaysBetweenReviews.toFixed(1)} días de media`);
      }
      
      totalStudySessions += data.studySessions;
      totalReviewSessions += data.reviewSessions;
      totalTestSessions += data.testSessions;
      totalSimulationSessions += data.simulationSessions;
    });
    
    // Estadísticas globales
    console.log('\n' + '='.repeat(80));
    console.log('📈 ESTADÍSTICAS GLOBALES');
    console.log('='.repeat(80));
    console.log(`📚 Total sesiones: ${sessions.length}`);
    console.log(`📖 Estudios totales: ${totalStudySessions}`);
    console.log(`🔄 Repasos totales: ${totalReviewSessions}`);
    console.log(`📝 Tests totales: ${totalTestSessions}`);
    console.log(`🎯 Simulacros totales: ${totalSimulationSessions}`);
    console.log(`📊 Ratio repaso/estudio: ${(totalReviewSessions / totalStudySessions).toFixed(2)}`);
    
    // Análisis de equidad
    console.log('\n' + '='.repeat(80));
    console.log('⚖️  ANÁLISIS DE EQUIDAD ENTRE TEMAS');
    console.log('='.repeat(80));
    
    const themeTotals = sortedThemes.map(([_, data]) => data.totalSessions);
    const avgSessions = themeTotals.reduce((a, b) => a + b, 0) / themeTotals.length;
    const maxSessions = Math.max(...themeTotals);
    const minSessions = Math.min(...themeTotals);
    const stdDev = Math.sqrt(themeTotals.reduce((sq, n) => sq + Math.pow(n - avgSessions, 2), 0) / themeTotals.length);
    
    console.log(`📊 Media de sesiones por tema: ${avgSessions.toFixed(2)}`);
    console.log(`📈 Máximo: ${maxSessions} sesiones | Mínimo: ${minSessions} sesiones`);
    console.log(`📉 Desviación estándar: ${stdDev.toFixed(2)}`);
    console.log(`🔍 Diferencia máx/min: ${((maxSessions - minSessions) / minSessions * 100).toFixed(1)}%`);
    
    // Identificar temas sobre/sub-estudiados
    const overStudied = sortedThemes.filter(([_, data]) => data.totalSessions > avgSessions + stdDev);
    const underStudied = sortedThemes.filter(([_, data]) => data.totalSessions < avgSessions - stdDev);
    
    if (overStudied.length > 0) {
      console.log(`\n⚠️  Temas con más sesiones (sobre la media + desv. estándar):`);
      overStudied.forEach(([themeName, data]) => {
        console.log(`   📚 ${themeName}: ${data.totalSessions} sesiones`);
      });
    }
    
    if (underStudied.length > 0) {
      console.log(`\n⚠️  Temas con menos sesiones (bajo la media - desv. estándar):`);
      underStudied.forEach(([themeName, data]) => {
        console.log(`   📖 ${themeName}: ${data.totalSessions} sesiones`);
      });
    }
    
    // Respuestas específicas a las preguntas
    console.log('\n' + '='.repeat(80));
    console.log('❓ RESPUESTAS A TUS PREGUNTAS');
    console.log('='.repeat(80));
    
    console.log('\n1️⃣ ¿Se estudia y repasa todos los temas en igualdad?');
    if (stdDev < avgSessions * 0.3) {
      console.log('✅ SÍ - Distribución bastante equitativa (desv. estándar < 30% de la media)');
    } else {
      console.log(`❌ NO - Hay desigualdad significativa (desv. estándar = ${(stdDev/avgSessions*100).toFixed(1)}% de la media)`);
    }
    
    console.log('\n2️⃣ ¿Existe gran diferencia entre estudio y repaso de un tema con respecto a otros?');
    if ((maxSessions - minSessions) / minSessions > 0.5) {
      console.log(`✅ SÍ - Diferencia sustancial del ${((maxSessions - minSessions) / minSessions * 100).toFixed(1)}% entre temas`);
    } else {
      console.log('❌ NO - Las diferencias son moderadas');
    }
    
    console.log('\n' + '='.repeat(80));
    
  } catch (error) {
    console.error('❌ Error al analizar calendario:', error.response?.data || error.message);
  }
}

analyzeCalendar();