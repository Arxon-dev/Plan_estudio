// Script para verificar el estado de un plan
const axios = require('axios');

async function checkPlanStatus() {
  try {
    // Login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', loginData);
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // Verificar plan activo
    console.log('📅 Verificando plan activo...');
    const activePlanResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Plan activo:', activePlanResponse.data.plan.id);
    const planId = activePlanResponse.data.plan.id;
    
    // Verificar estado de generación
    console.log('⏳ Verificando estado de generación...');
    const statusResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Estado de generación:', statusResponse.data);
    
    // Verificar sesiones
    console.log('📋 Verificando sesiones...');
    const sessionsResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/sessions`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Sesiones encontradas: ${sessionsResponse.data.sessions.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkPlanStatus();