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

async function diagnosticarSesiones() {
  try {
    console.log('🔍 DIAGNÓSTICO DETALLADO DE SESIONES');
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
    
    // 2. Obtener sesiones directamente
    console.log('\n📚 Obteniendo sesiones del plan...');
    const sessionsResponse = await api.get(`/study-plans/${plan.id}/sessions`);
    const sessions = sessionsResponse.data.sessions;
    
    console.log(`✅ ${sessions.length} sesiones encontradas`);
    
    // 3. Analizar las primeras 10 sesiones en detalle
    console.log('\n🔍 ANÁLISIS DE LAS PRIMERAS 10 SESIONES:');
    console.log('='.repeat(60));
    
    sessions.slice(0, 10).forEach((session, index) => {
      console.log(`\n${index + 1}. Sesión ID: ${session.id}`);
      console.log(`   📅 Fecha: ${session.scheduledDate}`);
      console.log(`   ⏱️  Horas: ${session.scheduledHours}`);
      console.log(`   🏷️  Tipo: ${session.sessionType}`);
      console.log(`   📖 Theme ID: ${session.themeId}`);
      console.log(`   📚 Tema: ${session.theme?.title || 'Sin título'}`);
      console.log(`   📁 Bloque: ${session.theme?.block || 'Sin bloque'}`);
      if (session.theme) {
        console.log(`   ⚙️  Complejidad: ${session.theme.complexity || 'Sin complejidad'}`);
      }
    });
    
    // 4. Verificar IDs de temas únicos
    console.log('\n📊 RESUMEN DE THEME IDs:');
    console.log('='.repeat(60));
    
    const themeIds = sessions.map(s => s.themeId).filter(id => id != null);
    const uniqueThemeIds = [...new Set(themeIds)];
    
    console.log(`Total de sesiones: ${sessions.length}`);
    console.log(`Sesiones con themeId: ${themeIds.length}`);
    console.log(`Theme IDs únicos: ${uniqueThemeIds.length}`);
    console.log(`Theme IDs: [${uniqueThemeIds.join(', ')}]`);
    
    // 5. Problemas detectados
    console.log('\n⚠️  PROBLEMAS DETECTADOS:');
    console.log('='.repeat(60));
    
    const sessionsWithoutThemeId = sessions.filter(s => s.themeId == null).length;
    const sessionsWithoutTheme = sessions.filter(s => !s.theme).length;
    
    if (sessionsWithoutThemeId > 0) {
      console.log(`❌ ${sessionsWithoutThemeId} sesiones sin themeId`);
    }
    
    if (sessionsWithoutTheme > 0) {
      console.log(`❌ ${sessionsWithoutTheme} sesiones sin información del tema`);
    }
    
    if (uniqueThemeIds.length === 0) {
      console.log('❌ No hay theme IDs válidos');
      console.log('💡 Solución: Las sesiones no están correctamente vinculadas a temas');
    }
    
    // 6. Verificar si los theme IDs existen en la BD
    if (uniqueThemeIds.length > 0) {
      console.log('\n🔍 VERIFICANDO THEMES EN BASE DE DATOS...');
      console.log('='.repeat(60));
      
      // Intentar obtener un theme específico
      try {
        const themeResponse = await api.get(`/themes/${uniqueThemeIds[0]}`);
        const theme = themeResponse.data;
        console.log(`✅ Theme ID ${uniqueThemeIds[0]} encontrado:`);
        console.log(`   📊 Título: ${theme.title}`);
        console.log(`   📁 Bloque: ${theme.block}`);
        console.log(`   ⚙️  Complejidad: ${theme.complexity}`);
      } catch (error) {
        console.log(`❌ Theme ID ${uniqueThemeIds[0]} no encontrado en BD`);
        console.log('💡 Problema: Los theme IDs de las sesiones no existen en la tabla themes');
      }
    }
    
    console.log('\n🎯 DIAGNÓSTICO COMPLETADO');
    
  } catch (error) {
    console.error('❌ Error en el diagnóstico:', error.response?.data || error.message);
    
    if (error.response?.status === 404) {
      console.log('\n💡 Sugerencia: Verifica que el servidor esté ejecutándose');
    }
  }
}

diagnosticarSesiones();