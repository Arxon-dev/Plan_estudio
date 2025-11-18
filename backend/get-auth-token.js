const axios = require('axios');

const API_URL = 'http://localhost:3001/api';

async function getAuthToken() {
  try {
    // Intentar login con credenciales por defecto
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    console.log('🔑 Intentando autenticación con:', loginData);
    
    const response = await axios.post(`${API_URL}/auth/login`, loginData);
    
    console.log('✅ Login exitoso!');
    console.log('🔑 Token JWT:');
    console.log(response.data.token);
    
  } catch (error) {
    console.log('❌ Error con credenciales por defecto, intentando registro...');
    
    try {
      // Intentar registro
      const registerData = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      };
      
      const registerResponse = await axios.post(`${API_URL}/auth/register`, registerData);
      console.log('✅ Registro exitoso!');
      console.log('🔑 Token JWT:');
      console.log(registerResponse.data.token);
      
    } catch (registerError) {
      console.error('❌ Error en registro:', registerError.response?.data || registerError.message);
    }
  }
}

getAuthToken();