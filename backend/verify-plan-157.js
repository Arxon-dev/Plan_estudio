const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

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

async function checkPlan157() {
  console.log('🔍 Verificando Plan ID 157 - ONU y OTAN...\n');
  
  // Obtener token
  const token = await getAuthToken();
  if (!token) return;
  
  try {
    // Obtener las sesiones del plan 157
    const sessionsResponse = await axios.get(
      `${API_URL}/study-plans/157/sessions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const sessions = sessionsResponse.data;
    console.log(`📋 Total de sesiones encontradas: ${sessions.length}`);
    
    // Verificar ONU y OTAN específicamente
    const onuSessions = sessions.filter(s => s.themeId === 17);
    const otanSessions = sessions.filter(s => s.themeId === 18);
    
    console.log(`\n🔍 ONU (ID 17): ${onuSessions.length} sesiones`);
    console.log(`🔍 OTAN (ID 18): ${otanSessions.length} sesiones`);
    
    if (onuSessions.length > 0) {
      console.log('✅ ONU encontrado en sesiones:');
      onuSessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - ${s.scheduledHours}h - Fecha: ${s.scheduledDate}`);
      });
    } else {
      console.log('❌ ONU NO encontrado en las sesiones');
    }
    
    if (otanSessions.length > 0) {
      console.log('\n✅ OTAN encontrado en sesiones:');
      otanSessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - ${s.scheduledHours}h - Fecha: ${s.scheduledDate}`);
      });
    } else {
      console.log('\n❌ OTAN NO encontrado en las sesiones');
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
    
    if (onuSessions.length > 0 && otanSessions.length > 0) {
      console.log('\n🎉 ¡ÉXITO COMPLETO! ONU y OTAN aparecen correctamente incluso con temas de partes.');
      console.log('✅ El problema ha sido completamente resuelto.');
    } else {
      console.log('\n❌ Fallo: ONU o OTAN no aparecen correctamente.');
    }
    
  } catch (error) {
    console.error('❌ Error verificando plan:', error.response?.data || error.message);
  }
}

// Ejecutar la verificación
checkPlan157();