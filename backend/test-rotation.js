const axios = require('axios');

async function testRotation() {
  try {
    console.log('🔄 Probando sistema de rotación...');
    
    const response = await axios.post('http://localhost:3000/api/study-plans/test-rotation', {
      startDate: '2025-11-18',
      examDate: '2026-10-22'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzMzUwOTIxLCJleHAiOjE3NjM5NTU3MjF9.RGHxloiQjDc1M8CTCz7hN7zUTSodhvjhDW7eVYM_7O8'
      }
    });

    console.log('✅ Respuesta exitosa:');
    console.log('📊 Total de sesiones:', response.data.totalSessions);
    console.log('📅 Primera sesión:', response.data.firstSession);
    console.log('📅 Última sesión:', response.data.lastSession);
    console.log('📏 Días de cobertura:', response.data.coverageDays);
    console.log('📅 Fecha solicitada inicio:', response.data.requestedStart);
    console.log('📅 Fecha solicitada fin:', response.data.requestedEnd);
    
    // Calcular días totales entre las fechas
    const start = new Date(response.data.requestedStart);
    const end = new Date(response.data.requestedEnd);
    const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    console.log('📊 Análisis de cobertura:');
    console.log(`   - Días solicitados: ${totalDays}`);
    console.log(`   - Días cubiertos: ${response.data.coverageDays}`);
    console.log(`   - Cobertura: ${((response.data.coverageDays / totalDays) * 100).toFixed(1)}%`);
    
    if (response.data.coverageDays >= totalDays * 0.95) {
      console.log('✅ COBERTURA COMPLETA - El sistema cubre casi todos los días solicitados');
    } else {
      console.log('⚠️ COBERTURA INCOMPLETA - Faltan días por cubrir');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testRotation();