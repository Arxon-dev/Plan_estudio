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
    { id: 18, name: 'Tema 4. Organización del Tratado del Atlántico Norte (OTAN)', hours: 8, priority: 2 },
    
    // Algunos temas con partes para verificar el desglose
    { id: '6-1', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 1: Instrucción 55/2021, EMAD', hours: 11.25, priority: 3 },
    { id: '6-2', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 2: Instrucción 14/2021, ET', hours: 11.25, priority: 4 },
    { id: '6-3', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 3: Instrucción 15/2021, ARMADA', hours: 11.25, priority: 5 },
    { id: '6-4', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 4: Instrucción 6/2025, EA', hours: 11.25, priority: 6 }
  ]
};

async function testCalendarGeneration() {
  try {
    console.log('🚀 Iniciando prueba de generación de calendario...');
    console.log('📅 Fecha de inicio:', testData.startDate);
    console.log('📅 Fecha de examen:', testData.examDate);
    console.log('📚 Temas seleccionados:', testData.themes.length);
    
    // Verificar que temas incluyen ONU y OTAN
    const onuTheme = testData.themes.find(t => t.name.includes('ONU'));
    const otanTheme = testData.themes.find(t => t.name.includes('OTAN'));
    console.log('✅ Tema ONU encontrado:', onuTheme?.name);
    console.log('✅ Tema OTAN encontrado:', otanTheme?.name);
    
    console.log('\n📝 Enviando petición al backend...');
    
    const response = await axios.post(
      `${API_URL}/study-plans/smart`,
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
      
      // Verificar temas por partes
      const parteSessions = sessions.filter(s => s.notes && s.notes.includes('Parte'));
      console.log('📚 Sesiones con partes:', parteSessions.length);
      
      if (parteSessions.length === 0) {
        console.log('❌ Las partes no se están generando individualmente');
      } else {
        console.log('✅ Las partes se generan correctamente');
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