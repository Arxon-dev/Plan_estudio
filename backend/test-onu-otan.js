const axios = require('axios');

// Configuración
const API_URL = 'http://localhost:3000/api';
const USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLnBlcmV6Lm1pbGxhQGdtYWlsLmNvbSIsImlhdCI6MTczMTk5NzQ3NCwiZXhwIjoxNzMyNjAyMjc0fQ.1yU0nR2d8I0O7vV2g7Y1sX8tK4hC3rM0jP6wE9qT8uY'; // Reemplaza con tu token real

// Datos de prueba
const testData = {
  startDate: '2024-12-01',
  examDate: '2025-06-01',
  weeklySchedule: {
    monday: 4,
    tuesday: 4,
    wednesday: 4,
    thursday: 4,
    friday: 4,
    saturday: 2,
    sunday: 2
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
        }
      }
    );
    
    console.log('✅ Calendario generado exitosamente!');
    console.log('📊 Plan ID:', response.data.plan?.id);
    console.log('📊 Respuesta:', JSON.stringify(response.data, null, 2));
    
    // Si hay advertencias, mostrarlas
    if (response.data.bufferWarning) {
      console.log('⚠️ Advertencia:', response.data.bufferWarning.message);
    }
    
  } catch (error) {
    console.error('❌ Error al generar calendario:');
    if (error.response) {
      console.error('📡 Respuesta del servidor:', error.response.data);
      console.error('📡 Estado:', error.response.status);
    } else {
      console.error('💥 Error:', error.message);
    }
  }
}

// Ejecutar la prueba
testCalendarGeneration();