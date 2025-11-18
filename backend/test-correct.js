const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3000/api';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLnBlcmV6Lm1pbGxhQGdtYWlsLmNvbSIsImlhdCI6MTc2MzQ3ODI3NywiZXhwIjoxNzY0MDgzMDc3fQ.eDmrmXaTMOLihMaQzG8odwKSXGbtvjb2RmrdePNWKWA';

// Datos de prueba
const testData = {
  startDate: '2024-12-01',
  examDate: '2025-06-01',
  weeklySchedule: {
    monday: 2,
    tuesday: 2,
    wednesday: 2,
    thursday: 2,
    friday: 2,
    saturday: 1,
    sunday: 1
  },
  themes: [
    // ONU y OTAN - estos son los que deben aparecer
    { id: 17, name: 'Tema 3. Organización de las Naciones Unidas (ONU)', hours: 8, priority: 1 },
    { id: 18, name: 'Tema 4. Organización del Tratado del Atlántico Norte (OTAN)', hours: 8, priority: 2 }
  ]
};

async function testCalendarGeneration() {
  try {
    console.log('🚀 Iniciando prueba de generación de calendario...');
    console.log('📅 Fecha de inicio:', testData.startDate);
    console.log('📅 Fecha de examen:', testData.examDate);
    console.log('📚 Temas seleccionados:', testData.themes.length);
    console.log('📚 Temas:', testData.themes.map(t => t.name));
    
    console.log('\n📝 Enviando petición al backend...');
    
    const response = await axios.post(
      `${API_URL}/study-plans/`,
      testData,
      {
        headers: {
          'Authorization': `Bearer ${USER_TOKEN}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000 // 30 segundos de timeout
      }
    );
    
    console.log('✅ Calendario generado exitosamente!');
    console.log('📊 Plan ID:', response.data.plan?.id);
    
    // Si hay advertencias, mostrarlas
    if (response.data.bufferWarning) {
      console.log('⚠️ Advertencia:', response.data.bufferWarning.message);
    }
    
    // Verificar que ONU y OTAN estén en las sesiones
    if (response.data.sessions && response.data.sessions.length > 0) {
      const sessions = response.data.sessions;
      const onuSessions = sessions.filter(s => s.notes && s.notes.includes('ONU'));
      const otanSessions = sessions.filter(s => s.notes && s.notes.includes('OTAN'));
      
      console.log('📚 Total de sesiones:', sessions.length);
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
      
      // Mostrar algunas sesiones de ejemplo
      console.log('\n📋 Ejemplos de sesiones:');
      sessions.slice(0, 10).forEach((session, index) => {
        console.log(`  ${index + 1}. ${session.notes} - ${session.scheduledDate} (${session.scheduledHours}h)`);
      });
      
    } else {
      console.log('⚠️ No se recibieron sesiones en la respuesta');
    }
    
  } catch (error) {
    console.error('❌ Error al generar calendario:');
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.data);
      console.error('📡 Estado:', error.response.status);
    } else if (error.code === 'ECONNREFUSED') {
      console.error('🔌 Error: El servidor no está respondiendo en', API_URL);
    } else if (error.code === 'ETIMEDOUT') {
      console.error('⏰ Error: Tiempo de espera agotado');
    } else {
      console.error('💥 Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testCalendarGeneration();