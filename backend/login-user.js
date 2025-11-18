const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function loginUser() {
  try {
    // Hacer login con usuario existente
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('🔑 Haciendo login con:', loginData.email);
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('✅ Login exitoso!');
    console.log('🔑 Token JWT:');
    console.log(response.data.token);
    
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
  }
}

loginUser();