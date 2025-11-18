// Script simple para verificar el estado de generación
const axios = require('axios');

async function simpleCheck() {
  try {
    console.log('🔄 Iniciando verificación simple...');
    
    // Login
    const loginResponse = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login exitoso');
    
    // Verificar plan activo
    const activeResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📅 Plan activo encontrado:', activeResponse.data.plan.id);
    
    // Verificar estado de generación
    const statusResponse = await axios.get(`http://localhost:3000/api/study-plans/${activeResponse.data.plan.id}/status`, {
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

simpleCheck();