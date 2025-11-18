// Script para probar la generación paso a paso
const axios = require('axios');

async function testStepByStep() {
  try {
    console.log('🔄 Iniciando prueba paso a paso...');
    
    // 1. Login
    console.log('\n1️⃣ Login...');
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // 2. Verificar si hay plan activo
    console.log('\n2️⃣ Verificando plan activo...');
    try {
      const activeResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('⚠️ Ya existe un plan activo:', activeResponse.data.plan.id);
      console.log('🗑️ Eliminando plan activo...');
      
      await axios.delete('http://localhost:3000/api/study-plans/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('✅ Plan activo eliminado');
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ No hay plan activo, continuando...');
      } else {
        throw error;
      }
    }
    
    // 3. Crear nuevo plan
    console.log('\n3️⃣ Creando nuevo plan...');
    const planData = {
      startDate: '2024-12-01',
      examDate: '2025-06-01',
      weeklySchedule: {
        monday: 2,
        tuesday: 2,
        wednesday: 2,
        thursday: 2,
        friday: 2,
        saturday: 1,
        sunday: 0
      },
      themes: [
        { id: 1, name: 'Tema 1', hours: 8, priority: 1 },
        { id: 2, name: 'Tema 2', hours: 6, priority: 2 }
      ]
    };
    
    const createResponse = await axios.post('http://localhost:3000/api/study-plans', planData, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('✅ Plan creado:', createResponse.data.plan.id);
    const planId = createResponse.data.plan.id;
    
    // 4. Esperar y verificar estado
    console.log('\n4️⃣ Esperando generación...');
    await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10 segundos
    
    console.log('\n5️⃣ Verificando estado de generación...');
    const statusResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📊 Estado:', {
      id: statusResponse.data.plan.id,
      status: statusResponse.data.plan.status,
      totalSessions: statusResponse.data.totalSessions,
      generationCompleted: statusResponse.data.generationCompleted
    });
    
    // 6. Verificar sesiones si existe
    if (statusResponse.data.totalSessions > 0) {
      console.log('\n6️⃣ Verificando sesiones...');
      const sessionsResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/sessions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log(`✅ Sesiones encontradas: ${sessionsResponse.data.sessions.length}`);
      
      // Mostrar primeras 5 sesiones
      const firstSessions = sessionsResponse.data.sessions.slice(0, 5);
      firstSessions.forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.scheduledDate} - ${session.scheduledHours}h - ${session.theme?.title || 'Sin tema'}`);
      });
    } else {
      console.log('\n❌ No se generaron sesiones');
    }
    
    console.log('\n✅ Prueba completada');
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testStepByStep();