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

// Temas que necesitan ser desglosados
const temasParaDesglosar = [
  { id: 7, nombre: 'Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar', parte: 'Carrera Militar' },
  { id: 14, nombre: 'Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas', parte: 'Procedimiento Administrativo' },
  { id: 15, nombre: 'Ley 36/2015, Seguridad Nacional / RD 1150/2021, Estrategia de Seguridad Nacional 2021', parte: 'RD 1150/2021, Estrategia de Seguridad Nacional 2021' },
  { id: 16, nombre: 'PDC-01(B) Doctrina para el empleo de las FAS', parte: 'Doctrina (PDC)' },
  { id: 21, nombre: 'España y su participación en Misiones Internacionales', parte: 'Misiones Internacionales' }
];

async function verificarTemasActuales() {
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

    console.log('\n📋 ANÁLISIS DE TEMAS PARA DESGLOSAR:');
    console.log('=====================================');

    temasParaDesglosar.forEach(tema => {
      const themeData = partsStatsResponse.data.themePartsStats.find(theme => theme.themeId === tema.id);
      
      if (themeData) {
        console.log(`\n📝 ${tema.nombre}`);
        console.log(`   ID: ${tema.id}`);
        console.log(`   Parte a destacar: ${tema.parte}`);
        console.log(`   Total de partes actualmente: ${themeData.parts.length}`);
        
        if (themeData.parts.length > 1) {
          console.log(`   Ya está desglosado:`);
          themeData.parts.forEach(part => {
            console.log(`     - Parte ${part.partIndex}: ${part.partLabel} (${part.totalSessions} sesiones)`);
          });
        } else {
          console.log(`   ⚠️  NO está desglosado - Solo parte única (${themeData.parts[0].totalSessions} sesiones)`);
          console.log(`   💡 Sugerencia: Desglosar para dar más peso a "${tema.parte}"`);
        }
        
        const totalSesiones = themeData.parts.reduce((sum, part) => sum + part.totalSessions, 0);
        const totalHoras = themeData.parts.reduce((sum, part) => sum + part.totalHours, 0);
        console.log(`   📊 Total: ${totalSesiones} sesiones, ${totalHoras} horas`);
      } else {
        console.log(`\n❌ Tema ${tema.id} no encontrado: ${tema.nombre}`);
      }
    });

    // Ver distribución actual por bloques
    console.log('\n📊 DISTRIBUCIÓN ACTUAL POR BLOQUES:');
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
      
      temas.forEach(tema => {
        console.log(`    - Tema ${tema.theme.id}: ${tema.totalSessions} sesiones`);
      });
    });

  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

verificarTemasActuales();