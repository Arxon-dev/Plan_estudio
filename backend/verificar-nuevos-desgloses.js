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

// Temas que deberían estar desglosados ahora
const temasParaVerificar = [
  { id: 7, nombre: 'Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar' },
  { id: 14, nombre: 'Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas' },
  { id: 15, nombre: 'Ley 36/2015, Seguridad Nacional / RD 1150/2021, Estrategia de Seguridad Nacional 2021' },
  { id: 16, nombre: 'PDC-01(B) Doctrina para el empleo de las FAS' },
  { id: 21, nombre: 'España y su participación en Misiones Internacionales' }
];

async function verificarNuevosDesgloses() {
  try {
    // Primero obtener el plan activo
    const activePlanResponse = await axios.get('http://localhost:3000/api/study-plans/active', {
      headers: { Authorization: `Bearer ${token}` }
    });

    const planId = activePlanResponse.data.plan.id;
    console.log('Plan ID:', planId);

    // Obtener estadísticas por partes
    const partsStatsResponse = await axios.get(`http://localhost:3000/api/study-plans/${planId}/theme-parts-stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    console.log('\n📋 VERIFICACIÓN DE NUEVOS DESGLOSES:');
    console.log('=====================================');

    temasParaVerificar.forEach(tema => {
      const themeData = partsStatsResponse.data.themePartsStats.find(theme => theme.themeId === tema.id);
      
      if (themeData) {
        console.log(`\n📝 ${tema.nombre}`);
        console.log(`   ID: ${tema.id}`);
        console.log(`   Total de partes: ${themeData.parts.length}`);
        
        if (themeData.parts.length > 1) {
          console.log(`   ✅ ESTÁ DESGLOSADO:`);
          themeData.parts.forEach(part => {
            console.log(`     - Parte ${part.partIndex}: ${part.partLabel} (${part.totalSessions} sesiones, ${part.totalHours}h)`);
          });
        } else {
          console.log(`   ⚠️  NO está desglosado - Solo parte única (${themeData.parts[0].totalSessions} sesiones)`);
          console.log(`   📝 Etiqueta actual: ${themeData.parts[0].partLabel}`);
        }
      } else {
        console.log(`\n❌ Tema ${tema.id} no encontrado: ${tema.nombre}`);
      }
    });

    // Ver distribución actual por bloques con los cambios
    console.log('\n📊 DISTRIBUCIÓN POR BLOQUES CON NUEVOS DESGLOSES:');
    console.log('=====================================');

    const { distributionByComplexity } = await axios.get(`http://localhost:3000/api/study-plans/${planId}/equitable-distribution`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => res.data);

    const allThemes = [
      ...(distributionByComplexity.LOW || []),
      ...(distributionByComplexity.MEDIUM || []),
      ...(distributionByComplexity.HIGH || [])
    ];

    // Agrupar por bloques
    const bloques = {
      'Bloque 1 – Organización': allThemes.filter(theme => theme.theme.id >= 1 && theme.theme.id <= 6),
      'Bloque 2 – Jurídico-Social': allThemes.filter(theme => theme.theme.id >= 7 && theme.theme.id <= 14),
      'Bloque 3 – Seguridad Nacional': allThemes.filter(theme => theme.theme.id >= 15 && theme.theme.id <= 21)
    };

    Object.entries(bloques).forEach(([bloque, temas]) => {
      console.log(`\n${bloque}:`);
      const totalSesiones = temas.reduce((sum, tema) => sum + tema.totalSessions, 0);
      const promedioSesiones = totalSesiones / temas.length;
      console.log(`  📚 Total sesiones: ${totalSesiones}`);
      console.log(`  📊 Promedio por tema: ${promedioSesiones.toFixed(1)}`);
      console.log(`  📋 Número de temas: ${temas.length}`);
      console.log(`  📋 Lista de temas:`);
      
      temas.forEach(tema => {
        console.log(`    - Tema ${tema.theme.id}: ${tema.theme.title}`);
        console.log(`      📚 ${tema.totalSessions} sesiones | 🔄 ${tema.reviewSessions} repasos | ⏱️ ${tema.totalHours}h`);
      });
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    if (error.response?.data?.error) {
      console.error('Detalles del error:', error.response.data);
    }
  }
}

verificarNuevosDesgloses();