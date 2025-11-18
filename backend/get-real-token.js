// Script para obtener token real de login
const axios = require('axios');

async function getToken() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('Token:', response.data.token);
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

getToken();