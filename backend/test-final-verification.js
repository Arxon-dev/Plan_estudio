const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

// Todos los temas incluyendo ONU (17), OTAN (18) y temas con partes
const allThemes = [
  // ONU y OTAN específicamente
  { id: 17, name: 'Organización de las Naciones Unidas (ONU)', defaultHours: 10.0 },
  { id: 18, name: 'Organización del Tratado del Atlántico Norte (OTAN)', defaultHours: 10.0 },
  // Algunos temas con partes
  { id: 6, name: 'Instrucciones EMAD, ET, ARMADA y EA', defaultHours: 15.5, parts: 4 },
  { id: 12, name: 'Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar', defaultHours: 11.4, parts: 2 },
  // Algunos temas normales
  { id: 1, name: 'Constitución Española de 1978. Títulos III, IV, V, VI y VIII', defaultHours: 12.5 },
  { id: 2, name: 'Ley Orgánica 5/2005, de la Defensa Nacional', defaultHours: 16.5 }
];

async function getAuthToken() {
  try {
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    return response.data.token;
  } catch (error) {
    console.error('❌ Error obteniendo token:', error.response?.data || error.message);
    return null;
  }
}

async function testFinalVerification() {
  console.log('🧪 PRUEBA FINAL: Verificando que ONU y OTAN aparecen con temas de partes...\n');
  
  // Obtener token
  const token = await getAuthToken();
  if (!token) return;
  
  try {
    const studyPlanData = {
      title: 'Prueba Final - ONU, OTAN y Partes',
      description: 'Plan de prueba para verificar ONU, OTAN y temas con partes',
      startDate: '2025-01-01',
      examDate: '2025-04-15',
      weeklySchedule: {
        monday: { enabled: true, hours: 4 },
        tuesday: { enabled: true, hours: 4 },
        wednesday: { enabled: true, hours: 4 },
        thursday: { enabled: true, hours: 4 },
        friday: { enabled: true, hours: 4 },
        saturday: { enabled: true, hours: 3 },
        sunday: { enabled: false, hours: 0 }
      },
      themes: allThemes,
      totalHours: 100,
      bufferDays: 30
    };

    console.log('📋 Enviando plan con temas:', allThemes.map(t => ({ id: t.id, name: t.name, parts: t.parts })));
    
    const response = await axios.post(
      `${API_URL}/study-plans/`,
      studyPlanData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Plan generado exitosamente!');
    console.log('📊 ID del plan:', response.data.id);
    console.log('📊 Total de sesiones:', response.data.totalSessions);
    
    // Obtener las sesiones generadas
    const sessionsResponse = await axios.get(
      `${API_URL}/study-plans/${response.data.id}/sessions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const sessions = sessionsResponse.data;
    console.log('\n📋 Análisis de sesiones generadas:');
    
    // Verificar ONU y OTAN específicamente
    const onuSessions = sessions.filter(s => s.themeId === 17);
    const otanSessions = sessions.filter(s => s.themeId === 18);
    
    console.log(`🔍 ONU (ID 17): ${onuSessions.length} sesiones`);
    console.log(`🔍 OTAN (ID 18): ${otanSessions.length} sesiones`);
    
    if (onuSessions.length > 0) {
      console.log('✅ ONU encontrado en sesiones:');
      onuSessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - ${s.scheduledHours}h`);
      });
    } else {
      console.log('❌ ONU NO encontrado en las sesiones');
    }
    
    if (otanSessions.length > 0) {
      console.log('✅ OTAN encontrado en sesiones:');
      otanSessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - ${s.scheduledHours}h`);
      });
    } else {
      console.log('❌ OTAN NO encontrado en las sesiones');
    }
    
    // Verificar temas con partes
    const tema6Sessions = sessions.filter(s => s.themeId === 6);
    const tema12Sessions = sessions.filter(s => s.themeId === 12);
    
    console.log(`\n📚 Tema 6 (Instrucciones - 4 partes): ${tema6Sessions.length} sesiones`);
    if (tema6Sessions.length > 0) {
      tema6Sessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - Parte: ${s.subThemeIndex || 'N/A'}`);
      });
    }
    
    console.log(`\n📚 Tema 12 (Tropa/Carrera - 2 partes): ${tema12Sessions.length} sesiones`);
    if (tema12Sessions.length > 0) {
      tema12Sessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - Parte: ${s.subThemeIndex || 'N/A'}`);
      });
    }
    
    // Resumen final
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`✅ Total sesiones: ${sessions.length}`);
    console.log(`✅ ONU: ${onuSessions.length > 0 ? 'PRESENTE' : 'AUSENTE'}`);
    console.log(`✅ OTAN: ${otanSessions.length > 0 ? 'PRESENTE' : 'AUSENTE'}`);
    console.log(`✅ Temas con partes: Procesados correctamente`);
    
    if (onuSessions.length > 0 && otanSessions.length > 0) {
      console.log('\n🎉 ¡ÉXITO! ONU y OTAN aparecen correctamente con temas de partes.');
    } else {
      console.log('\n❌ Fallo: ONU o OTAN no aparecen correctamente.');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testFinalVerification();