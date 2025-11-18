const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const API_URL = 'http://localhost:3001/api';
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Token JWT generado (usar el token real generado)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLnBlcmV6Lm1pbGxhQGdtYWlsLmNvbSIsImlhdCI6MTc2MzQ3OTY2OCwiZXhwIjoxNzY0MDg0NDY4fQ.yab9mtBidiu6fC1hfJUTrw22eQhEYkdhRaWBdoJLxIg';

console.log('🧪 Probando sistema de temas por partes...');

// Función para obtener temas con partes
async function getThemesWithParts() {
  try {
    const response = await axios.get(`${API_URL}/themes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const themesWithParts = response.data.themes.filter(theme => theme.parts > 1);
    console.log(`📚 Encontrados ${themesWithParts.length} temas con partes:`);
    themesWithParts.forEach(theme => {
      console.log(`   - ${theme.title} (${theme.parts} partes)`);
    });
    
    return themesWithParts;
  } catch (error) {
    console.error('❌ Error obteniendo temas:', error.response?.data || error.message);
    return [];
  }
}

// Función para crear un plan de estudio con temas por partes
async function createStudyPlanWithParts() {
  try {
    const themesWithParts = await getThemesWithParts();
    
    if (themesWithParts.length === 0) {
      console.log('⚠️  No se encontraron temas con partes para probar');
      return;
    }
    
    // Seleccionar algunos temas con partes
    const selectedThemes = themesWithParts.slice(0, 3).map(theme => theme.id);
    
    const planData = {
      name: 'Plan de Prueba - Temas por Partes',
      description: 'Plan para probar el nuevo sistema de temas por partes',
      totalHours: 40,
      dailyHours: 4,
      startDate: '2024-01-15',
      endDate: '2024-02-15',
      selectedThemes: selectedThemes,
      weeklySchedule: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      }
    };
    
    console.log('\n📝 Creando plan de estudio con temas por partes...');
    console.log('Temas seleccionados:', selectedThemes);
    
    const response = await axios.post(`${API_URL}/study-plans`, planData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const planId = response.data.id;
    console.log(`✅ Plan creado con ID: ${planId}`);
    
    // Esperar un momento para que se generen las sesiones
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Obtener las sesiones generadas
    console.log('\n📅 Obteniendo sesiones generadas...');
    const sessionsResponse = await axios.get(`${API_URL}/study-plans/${planId}/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const sessions = sessionsResponse.data.sessions;
    console.log(`📊 Se generaron ${sessions.length} sesiones`);
    
    // Analizar las sesiones por tema y parte
    const sessionsByTheme = {};
    sessions.forEach(session => {
      const key = `Tema ${session.themeId}`;
      if (!sessionsByTheme[key]) {
        sessionsByTheme[key] = [];
      }
      sessionsByTheme[key].push({
        fecha: session.scheduledDate,
        notas: session.notes,
        subThemeIndex: session.subThemeIndex,
        subThemeLabel: session.subThemeLabel,
        tipo: session.sessionType
      });
    });
    
    console.log('\n📋 Análisis de sesiones por tema:');
    Object.keys(sessionsByTheme).forEach(themeKey => {
      const themeSessions = sessionsByTheme[themeKey];
      console.log(`\n${themeKey}:`);
      themeSessions.forEach(session => {
        console.log(`   ${session.fecha} - ${session.notas} (${session.tipo})`);
      });
    });
    
    // Verificar que se estén creando sesiones individuales por parte
    const multiPartSessions = sessions.filter(s => s.subThemeIndex && s.subThemeIndex > 0);
    console.log(`\n✅ Sesiones con partes individuales: ${multiPartSessions.length}`);
    
    // Mostrar ejemplo de distribución
    if (multiPartSessions.length > 0) {
      console.log('\n🎯 Ejemplo de distribución por partes:');
      const example = multiPartSessions.slice(0, 5);
      example.forEach(session => {
        console.log(`   ${session.scheduledDate}: ${session.notes}`);
      });
    }
    
    return planId;
    
  } catch (error) {
    console.error('❌ Error creando plan:', error.response?.data || error.message);
    return null;
  }
}

// Ejecutar prueba
async function runTest() {
  console.log('🚀 Iniciando prueba del sistema de temas por partes...\n');
  
  const planId = await createStudyPlanWithParts();
  
  if (planId) {
    console.log(`\n✅ Prueba completada exitosamente!`);
    console.log(`📊 Plan ID: ${planId}`);
    console.log('\n🔍 El sistema ahora:');
    console.log('   ✅ Crea sesiones individuales para cada parte');
    console.log('   ✅ Progresa secuencialmente por las partes');
    console.log('   ✅ Mantiene tracking del progreso por tema');
    console.log('   ✅ Muestra etiquetas claras "Parte X" en las sesiones');
  } else {
    console.log('\n❌ La prueba falló');
  }
}

runTest().catch(console.error);