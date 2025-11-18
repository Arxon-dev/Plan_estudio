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

    console.log('Equitable Distribution Response:');
    console.log('Total themes:', distributionResponse.data.stats.totalThemes);
    console.log('Distribution by complexity:', Object.keys(distributionResponse.data.distributionByComplexity));

    // Buscar específicamente el tema de Instrucciones EMAD en la distribución equitativa
    const allThemes = [
      ...distributionResponse.data.distributionByComplexity.LOW,
      ...distributionResponse.data.distributionByComplexity.MEDIUM,
      ...distributionResponse.data.distributionByComplexity.HIGH
    ];

    const instruccionesTheme = allThemes.find(theme => 
      theme.theme.title.includes('Instrucciones EMAD')
    );

    if (instruccionesTheme) {
      console.log('\n✅ Tema "Instrucciones EMAD" encontrado en equitable distribution:');
      console.log(`- Título: ${instruccionesTheme.theme.title}`);
      console.log(`- Complejidad: ${instruccionesTheme.theme.complexity}`);
      console.log(`- Total sesiones: ${instruccionesTheme.totalSessions}`);
      console.log(`- Total horas: ${instruccionesTheme.totalHours}`);
      console.log(`- Sesiones de repaso: ${instruccionesTheme.reviewSessions}`);
    } else {
      console.log('\n❌ Tema "Instrucciones EMAD" no encontrado en equitable distribution');
    }

    // Ahora probar el endpoint de estadísticas por partes para comparar
    const partsStatsResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/theme-parts-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const instruccionesParts = partsStatsResponse.data.themePartsStats.find(theme => 
      theme.themeName.includes('Instrucciones EMAD')
    );

    if (instruccionesParts) {
      console.log('\n✅ Datos desglosados por partes:');
      const totalSessionsFromParts = instruccionesParts.parts.reduce((sum, part) => sum + part.totalSessions, 0);
      const totalHoursFromParts = instruccionesParts.parts.reduce((sum, part) => sum + part.totalHours, 0);
      const totalReviewSessionsFromParts = instruccionesParts.parts.reduce((sum, part) => sum + part.reviewSessions, 0);
      
      console.log(`- Sesiones totales (de partes): ${totalSessionsFromParts}`);
      console.log(`- Horas totales (de partes): ${totalHoursFromParts}`);
      console.log(`- Sesiones de repaso (de partes): ${totalReviewSessionsFromParts}`);
      
      console.log('\nPartes individuales:');
      instruccionesParts.parts.forEach(part => {
        console.log(`  - Parte ${part.partIndex}: ${part.partLabel} - ${part.totalSessions} sesiones, ${part.totalHours}h, ${part.reviewSessions} repasos`);
      });
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testEquitableDistribution();