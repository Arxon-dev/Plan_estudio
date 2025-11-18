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

// Función para determinar el bloque al que pertenece un tema (igual que en el frontend)
function getThemeBlock(themeId, themeTitle) {
  // Bloque 1 – Organización (temas 1-6)
  if (themeId >= 1 && themeId <= 6) return 'BLOQUE_1';
  
  // Bloque 2 – Jurídico-Social (temas 7-14)
  if (themeId >= 7 && themeId <= 14) return 'BLOQUE_2';
  
  // Bloque 3 – Seguridad Nacional (temas 15-21)
  if (themeId >= 15 && themeId <= 21) return 'BLOQUE_3';
  
  return 'BLOQUE_1'; // Por defecto
}

function getBlockName(block) {
  switch (block) {
    case 'BLOQUE_1': return 'Bloque 1 – Organización';
    case 'BLOQUE_2': return 'Bloque 2 – Jurídico-Social';
    case 'BLOQUE_3': return 'Bloque 3 – Seguridad Nacional';
    default: return 'Bloque Desconocido';
  }
}

// Probar el endpoint de distribución equitativa
async function testBlockDistribution() {
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

    const { distributionByComplexity } = distributionResponse.data;
    
    // Combinar todos los temas
    const allThemes = [
      ...(distributionByComplexity.LOW || []),
      ...(distributionByComplexity.MEDIUM || []),
      ...(distributionByComplexity.HIGH || [])
    ];

    // Agrupar por bloques
    const themesByBlock = {
      BLOQUE_1: [],
      BLOQUE_2: [],
      BLOQUE_3: []
    };

    allThemes.forEach(theme => {
      const block = getThemeBlock(theme.theme.id, theme.theme.title);
      themesByBlock[block].push(theme);
    });

    // Mostrar resultados por bloques
    console.log('\n📊 DISTRIBUCIÓN POR BLOQUES:');
    console.log('=====================================');

    Object.entries(themesByBlock).forEach(([block, themes]) => {
      console.log(`\n${getBlockName(block)}:`);
      console.log(`Total de temas: ${themes.length}`);
      
      if (themes.length > 0) {
        themes.forEach(theme => {
          console.log(`  - Tema ${theme.theme.id}: ${theme.theme.title}`);
          console.log(`    📚 ${theme.totalSessions} sesiones | 🔄 ${theme.reviewSessions} repasos | ⏱️ ${theme.totalHours}h`);
        });
        
        // Estadísticas del bloque
        const totalSessions = themes.reduce((sum, theme) => sum + theme.totalSessions, 0);
        const totalHours = themes.reduce((sum, theme) => sum + theme.totalHours, 0);
        const avgSessions = totalSessions / themes.length;
        
        console.log(`  📊 Estadísticas del bloque:`);
        console.log(`     Total sesiones: ${totalSessions}`);
        console.log(`     Total horas: ${totalHours}h`);
        console.log(`     Promedio sesiones por tema: ${avgSessions.toFixed(1)}`);
      }
    });

    // Verificar equidad por bloques
    console.log('\n⚖️ ANÁLISIS DE EQUIDAD POR BLOQUES:');
    console.log('=====================================');

    Object.entries(themesByBlock).forEach(([block, themes]) => {
      if (themes.length > 1) {
        const sessions = themes.map(theme => theme.totalSessions);
        const maxDifference = Math.max(...sessions) - Math.min(...sessions);
        const isEquitable = maxDifference <= 15;
        
        console.log(`${getBlockName(block)}:`);
        console.log(`  Diferencia máxima de sesiones: ${maxDifference}`);
        console.log(`  ¿Es equitativo? ${isEquitable ? '✅ Sí' : '⚠️ No'} (límite: 15)`);
        console.log(`  Rango de sesiones: ${Math.min(...sessions)} - ${Math.max(...sessions)}`);
      }
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

testBlockDistribution();