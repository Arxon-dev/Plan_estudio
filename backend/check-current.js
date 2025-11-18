// Script para verificar el estado actual del plan 47
const axios = require('axios');

async function checkCurrentPlan() {
  try {
    console.log('🔍 Verificando estado actual del plan...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    
    // Verificar plan activo
    const activeResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    const planId = activeResponse.data.plan.id;
    console.log('📅 Plan activo:', planId);
    
    // Verificar estado de generación
    const statusResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/status`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📊 Estado de generación:');
    console.log('  - Plan ID:', statusResponse.data.plan.id);
    console.log('  - Estado:', statusResponse.data.plan.status);
    console.log('  - Sesiones totales:', statusResponse.data.totalSessions);
    console.log('  - ¿Generación completada?', statusResponse.data.generationCompleted);
    
    if (statusResponse.data.generationCompleted) {
      console.log('✅ ¡La generación del calendario fue exitosa!');
    } else {
      console.log('⚠️ La generación aún está en proceso o falló');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkCurrentPlan();