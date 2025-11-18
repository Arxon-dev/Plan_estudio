const axios = require('axios');

const API_URL = 'http://localhost:3000/api';

async function createNewUser() {
  try {
    // Crear nuevo usuario
    const registerData = {
      email: 'test2@example.com',
      password: 'password123',
      firstName: 'Test',
      lastName: 'User2'
    };
    
    console.log('🔑 Creando nuevo usuario:', registerData.email);
    
    const response = await axios.post(`${API_URL}/auth/register`, registerData);
    
    console.log('✅ Usuario creado exitosamente!');
    console.log('🔑 Token JWT:');
    console.log(response.data.token);
    
  } catch (error) {
    console.error('❌ Error creando usuario:', error.response?.data || error.message);
  }
}

createNewUser();