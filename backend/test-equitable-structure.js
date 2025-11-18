const jwt = require('jsonwebtoken');
const axios = require('axios');

// Usar el JWT_SECRET del archivo .env
const JWT_SECRET = 'plan-estudio-secret-key-2025-opomelilla';

// Generar un token JWT válido para el usuario con ID 15 (Carlos)
const userId = 15;
const token = jwt.sign(
  { 
    id: userId, 
    email: 'carlos@example.com',
    role: 'USER'
  },
  JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('Token generado:', token);

// Probar el endpoint de distribución equitativa
async function testEquitableDistribution() {
  try {
    // Primero obtener el plan activo
    const activePlanResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const planId = activePlanResponse.data.plan.id;
    console.log('Plan ID:', planId);

    // Probar el endpoint de distribución equitativa
    const distributionResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/equitable-distribution`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('EQUITABLE DISTRIBUTION RESPONSE:');
    console.log('Estructura:', Object.keys(distributionResponse.data));
    
    const { distributionByComplexity, stats } = distributionResponse.data;
    
    console.log('\nDistribution by Complexity:');
    console.log('- LOW:', distributionByComplexity.LOW?.length || 0, 'temas');
    console.log('- MEDIUM:', distributionByComplexity.MEDIUM?.length || 0, 'temas');
    console.log('- HIGH:', distributionByComplexity.HIGH?.length || 0, 'temas');

    console.log('\nStats by Complexity:');
    console.log('- LOW:', stats.LOW);
    console.log('- MEDIUM:', stats.MEDIUM);
    console.log('- HIGH:', stats.HIGH);

    // Ver algunos temas de ejemplo
    console.log('\nEjemplo de temas MEDIUM:');
    distributionByComplexity.MEDIUM?.slice(0, 3).forEach(theme => {
      console.log(`- Tema ${theme.theme.id}: ${theme.theme.title} (Complejidad: ${theme.theme.complexity})`);
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEquitableDistribution();