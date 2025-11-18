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
async function testThemePartsStats() {
  try {
    // Primero obtener el plan activo
    const activePlanResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const planId = activePlanResponse.data.plan.id;
    console.log('Plan ID:', planId);

    // Probar el endpoint de estadísticas por partes
    const partsStatsResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/theme-parts-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('Theme Parts Stats Response:');
    console.log(JSON.stringify(partsStatsResponse.data, null, 2));

    // Buscar específicamente el tema de Instrucciones EMAD
    const instruccionesTheme = partsStatsResponse.data.themePartsStats.find(theme => 
      theme.themeName.includes('Instrucciones EMAD')
    );

    if (instruccionesTheme) {
      console.log('\n✅ Tema "Instrucciones EMAD" encontrado con partes:');
      console.log(`Total de partes: ${instruccionesTheme.parts.length}`);
      instruccionesTheme.parts.forEach(part => {
        console.log(`- Parte ${part.partIndex}: ${part.partLabel} - ${part.totalSessions} sesiones, ${part.totalHours}h`);
      });
    } else {
      console.log('\n❌ Tema "Instrucciones EMAD" no encontrado en themePartsStats');
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testThemePartsStats();