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
    
    console.log('✅ Respuesta completa:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error completo:', error.response?.data || error.message);
  }
}

createTestCalendar();