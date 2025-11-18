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

async function checkPlan157Debug() {
  console.log('🔍 Verificando Plan ID 157 - Debug...\n');
  
  // Obtener token
  const token = await getAuthToken();
  if (!token) return;
  
  try {
    // Obtener las sesiones del plan 157
    const response = await axios.get(
      `${API_URL}/study-plans/157/sessions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('📊 Estructura de la respuesta:');
    console.log('Tipo de respuesta:', typeof response.data);
    console.log('Keys de la respuesta:', Object.keys(response.data));
    console.log('Datos completos:', JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ Error verificando plan:', error.response?.data || error.message);
  }
}

checkPlan157Debug();