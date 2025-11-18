const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3000/api';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLnBlcmV6Lm1pbGxhQGdtYWlsLmNvbSIsImlhdCI6MTc2MzQ3ODI3NywiZXhwIjoxNzY0MDgzMDc3fQ.eDmrmXaTMOLihMaQzG8odwKSXGbtvjb2RmrdePNWKWA';

async function checkPlanSessions() {
  try {
    console.log('🔍 Verificando sesiones del Plan ID: 142');
    
    const response = await axios.get(
      `${API_URL}/study-plans/142/sessions`,
      {
        headers: {
          'Authorization': `Bearer ${USER_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const sessions = response.data;
    console.log('✅ Sesiones obtenidas exitosamente!');
    console.log('📚 Total de sesiones:', sessions.length);
    
    // Verificar ONU y OTAN
    const onuSessions = sessions.filter(s => s.notes && s.notes.includes('ONU'));
    const otanSessions = sessions.filter(s => s.notes && s.notes.includes('OTAN'));
    
    console.log('📚 Sesiones con ONU:', onuSessions.length);
    console.log('📚 Sesiones con OTAN:', otanSessions.length);
    
    if (onuSessions.length === 0) {
      console.log('❌ ONU no aparece en las sesiones');
    } else {
      console.log('✅ ONU aparece correctamente en las sesiones');
    }
    
    if (otanSessions.length === 0) {
      console.log('❌ OTAN no aparece en las sesiones');
    } else {
      console.log('✅ OTAN aparece correctamente en las sesiones');
    }
    
    // Verificar temas por partes
    const parteSessions = sessions.filter(s => s.notes && s.notes.includes('Parte'));
    console.log('📚 Sesiones con partes:', parteSessions.length);
    
    if (parteSessions.length === 0) {
      console.log('❌ Las partes no se están generando individualmente');
    } else {
      console.log('✅ Las partes se generan correctamente');
    }
    
    // Mostrar distribución por temas
    const themeDistribution = {};
    sessions.forEach(session => {
      const themeName = session.notes || 'Sin nombre';
      if (!themeDistribution[themeName]) {
        themeDistribution[themeName] = 0;
      }
      themeDistribution[themeName]++;
    });
    
    console.log('\n📊 Distribución de sesiones por tema:');
    Object.entries(themeDistribution).slice(0, 10).forEach(([theme, count]) => {
      console.log(`  - ${theme}: ${count} sesiones`);
    });
    
    // Mostrar algunas sesiones de ejemplo
    console.log('\n📋 Ejemplos de sesiones:');
    sessions.slice(0, 10).forEach((session, index) => {
      console.log(`  ${index + 1}. ${session.notes} - ${session.scheduledDate} (${session.scheduledHours}h)`);
      if (session.subThemeIndex > 0) {
        console.log(`     └─ Parte ${session.subThemeIndex}: ${session.subThemeLabel}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error al obtener sesiones:');
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.data);
      console.error('📡 Estado:', error.response.status);
    } else {
      console.error('💥 Error:', error.message);
    }
  }
}

// Ejecutar la verificación
checkPlanSessions();