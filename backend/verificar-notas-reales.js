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

// Temas que queremos verificar
const temasParaVerificar = [7, 14, 15, 16, 21];

async function verificarNotasDeSesiones() {
  try {
    // Primero obtener el plan activo
    const activePlanResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const planId = activePlanResponse.data.plan.id;
    console.log('Plan ID:', planId);

    // Obtener las sesiones del plan
    const sessionsResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/sessions`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📝 NOTAS DE SESIONES PARA TEMAS ESPECÍFICOS:');
    console.log('==============================================');

    // Filtrar sesiones por los temas que nos interesan
    const sesionesFiltradas = sessionsResponse.data.filter(session => 
      temasParaVerificar.includes(session.themeId)
    );

    // Agrupar por tema
    const sesionesPorTema = {};
    sesionesFiltradas.forEach(session => {
      if (!sesionesPorTema[session.themeId]) {
        sesionesPorTema[session.themeId] = [];
      }
      sesionesPorTema[session.themeId].push(session);
    });

    // Analizar cada tema
    for (const themeId of temasParaVerificar) {
      const sesiones = sesionesPorTema[themeId] || [];
      
      if (sesiones.length > 0) {
        // Obtener información del tema
        const themeResponse = await axios.get(`http://localhost:3000/api/themes/${themeId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const tema = themeResponse.data;
        console.log(`\n📚 TEMA ${themeId}: ${tema.title}`);
        console.log(`   Total de sesiones: ${sesiones.length}`);
        
        // Mostrar algunas notas de ejemplo
        const notasMuestra = sesiones.slice(0, 5).map(session => session.notes || 'Sin notas');
        console.log(`   Notas de ejemplo:`);
        notasMuestra.forEach((nota, index) => {
          console.log(`     ${index + 1}. ${nota.substring(0, 100)}${nota.length > 100 ? '...' : ''}`);
        });
        
        // Verificar si hay patrones en las notas
        const todasLasNotas = sesiones.map(s => s.notes || '').join(' ');
        console.log(`   🔍 Patrones encontrados:`);
        
        if (todasLasNotas.includes('Ley 39/2007') || todasLasNotas.includes('Carrera Militar')) {
          console.log(`     ✓ Contiene "Ley 39/2007" o "Carrera Militar"`);
        }
        if (todasLasNotas.includes('Ley 8/2006') || todasLasNotas.includes('Tropa y Marinería')) {
          console.log(`     ✓ Contiene "Ley 8/2006" o "Tropa y Marinería"`);
        }
        if (todasLasNotas.includes('Procedimiento Administrativo')) {
          console.log(`     ✓ Contiene "Procedimiento Administrativo"`);
        }
        if (todasLasNotas.includes('1150/2021') || todasLasNotas.includes('Estrategia')) {
          console.log(`     ✓ Contiene "1150/2021" o "Estrategia"`);
        }
        if (todasLasNotas.includes('PDC') || todasLasNotas.includes('Doctrina')) {
          console.log(`     ✓ Contiene "PDC" o "Doctrina"`);
        }
        if (todasLasNotas.includes('Misiones') || todasLasNotas.includes('Internacionales')) {
          console.log(`     ✓ Contiene "Misiones" o "Internacionales"`);
        }
        
      } else {
        console.log(`\n❌ TEMA ${themeId}: No se encontraron sesiones`);
      }
    }

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

verificarNotasDeSesiones();