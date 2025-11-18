const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function testBackend() {
  console.log('🧪 Iniciando pruebas del backend...\n');

  try {
    // 1. Health Check
    console.log('1️⃣ Probando Health Check...');
    const healthResponse = await axios.get(`${API_URL}/health`);
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // 2. Registro de usuario de prueba
    console.log('2️⃣ Registrando usuario de prueba...');
    const registerData = {
      email: `test${Date.now()}@example.com`,
      password: 'test123456',
      firstName: 'Usuario',
      lastName: 'Prueba'
    };
    
    const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
    console.log('✅ Usuario registrado:', registerResponse.data.user.email);
    const token = registerResponse.data.token;
    console.log('✅ Token generado');
    console.log('');

    // 3. Login con el usuario creado
    console.log('3️⃣ Probando login...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: registerData.email,
      password: registerData.password
    });
    console.log('✅ Login exitoso:', loginResponse.data.message);
    console.log('');

    // 4. Obtener perfil del usuario
    console.log('4️⃣ Obteniendo perfil del usuario...');
    const profileResponse = await axios.get(`${API_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Perfil obtenido:', profileResponse.data.user);
    console.log('');

    console.log('5️⃣ Obteniendo todos los temas...');
    const themesResponse = await axios.get(`${API_URL}/themes`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Total de temas: ${themesResponse.data.themes.length}`);
    const lower = themesResponse.data.themes.map(t=>t.title.toLowerCase());
    console.log('🔍 ONU presente:', lower.some(t=>t.includes('naciones unidas')));
    console.log('🔍 OTAN presente:', lower.some(t=>t.includes('atlántico norte')) || lower.some(t=>t.includes('otan')));
    console.log('');

    const selectedThemes = themesResponse.data.themes.map(theme => ({
      id: theme.id,
      title: theme.title,
      hours: Math.max(6, Number(theme.estimatedHours || 6)),
      priority: 1
    }));

    // 6. Crear un plan de estudio
    console.log('6️⃣ Creando plan de estudio con IA...');
    const planData = {
      startDate: '2025-11-18T00:00:00.000Z',
      examDate: '2026-10-22T00:00:00.000Z',
      weeklySchedule: {
        monday: 4,
        tuesday: 4,
        wednesday: 4,
        thursday: 4,
        friday: 6,
        saturday: 8,
        sunday: 0
      },
      useAI: true,
      themes: selectedThemes
    };

    const planResponse = await axios.post(`${API_URL}/study-plans`, planData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Plan creado con ID:', planResponse.data.plan.id);
    console.log('⏳ Esperando generación del calendario (15s)...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    console.log('');

    // 7. Obtener plan activo
    console.log('7️⃣ Obteniendo plan activo...');
    const activePlanResponse = await axios.get(`${API_URL}/study-plans/active`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Plan activo obtenido:', activePlanResponse.data.plan.id);
    console.log('');

    // 8. Obtener progreso del plan
    console.log('8️⃣ Obteniendo progreso del plan...');
    const progressResponse = await axios.get(`${API_URL}/study-plans/${planResponse.data.plan.id}/progress`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Progreso del plan:');
    console.log(`   - Sesiones totales: ${progressResponse.data.totalSessions}`);
    console.log(`   - Sesiones completadas: ${progressResponse.data.completedSessions}`);
    console.log(`   - Sesiones pendientes: ${progressResponse.data.pendingSessions}`);
    console.log(`   - Progreso: ${progressResponse.data.progressPercentage}%`);
    console.log(`   - Días restantes: ${progressResponse.data.daysRemaining}`);
    console.log('');

    // 9. Obtener sesiones del plan
    console.log('9️⃣ Obteniendo sesiones del plan...');
    const sessionsResponse = await axios.get(`${API_URL}/study-plans/${planResponse.data.plan.id}/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`✅ Total de sesiones: ${sessionsResponse.data.sessions.length}`);
    console.log('Primeras 5 sesiones:');
    sessionsResponse.data.sessions.slice(0, 5).forEach((session, index) => {
      console.log(`   ${index + 1}. Fecha: ${new Date(session.scheduledDate).toLocaleDateString()} - Tema: ${session.theme?.title.substring(0, 50)}... - Horas: ${session.scheduledHours}`);
    });
    console.log('');

    // 10. Completar una sesión
    if (sessionsResponse.data.sessions.length > 0) {
      const firstSession = sessionsResponse.data.sessions[0];
      console.log('🔟 Completando primera sesión...');
      const completeResponse = await axios.put(
        `${API_URL}/sessions/${firstSession.id}/complete`,
        {
          completedHours: firstSession.scheduledHours,
          notes: 'Sesión de prueba completada exitosamente'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('✅ Sesión completada:', completeResponse.data.message);
      console.log('');
    }

    console.log('🎉 ¡TODAS LAS PRUEBAS COMPLETADAS EXITOSAMENTE!');
    console.log('\n📊 RESUMEN:');
    console.log('✅ Health Check: OK');
    console.log('✅ Obtener temas: OK');
    console.log('✅ Registro de usuario: OK');
    console.log('✅ Login: OK');
    console.log('✅ Obtener perfil: OK');
    console.log('✅ Crear plan con IA: OK');
    console.log('✅ Obtener plan activo: OK');
    console.log('✅ Obtener progreso: OK');
    console.log('✅ Obtener sesiones: OK');
    console.log('✅ Completar sesión: OK');
    console.log('\n🚀 El backend está funcionando perfectamente!');

  } catch (error) {
    console.error('\n❌ Error en las pruebas:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else {
      console.error(error.message);
    }
    process.exit(1);
  }
}

testBackend();
