// Script de prueba para crear un plan de estudio
const axios = require('axios');

async function testCreatePlan() {
  try {
    // Primero necesitamos autenticarnos
    console.log('🔐 Intentando autenticación...');
    
    // Intentar login con credenciales de prueba
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    let token;
    try {
      const loginResponse = await axios.post('http://localhost:3000/api/auth/login', loginData);
      token = loginResponse.data.token;
      console.log('✅ Login exitoso');
    } catch (error) {
      console.log('❌ Login fallido, intentando registro...');
      
      const registerData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123'
      };
      
      const registerResponse = await axios.post('http://localhost:3000/api/auth/register', registerData);
      token = registerResponse.data.token;
      console.log('✅ Registro exitoso');
    }
    
    // Crear plan de estudio
    console.log('📅 Creando plan de estudio...');
    
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
        { id: 2, name: 'Tema 2', hours: 6, priority: 2 },
        { id: 3, name: 'Tema 3', hours: 5, priority: 3 }
      ]
    };
    
    const response = await axios.post('http://localhost:3000/api/study-plans', planData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Plan creado:', response.data);
    
    // Verificar estado de generación
    console.log('⏳ Verificando estado de generación...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    const statusResponse = await axios.get(`http://localhost:3000/api/study-plans/${response.data.plan.id}/status`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('📊 Estado de generación:', statusResponse.data);
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testCreatePlan();