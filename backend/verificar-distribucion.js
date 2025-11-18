const { StudyPlan } = require('./dist/models');

async function verificarDistribucion(planId) {
  try {
    console.log(`🔍 Verificando distribución del plan ${planId}...`);
    
    const plan = await StudyPlan.findByPk(planId, {
      include: [{
        model: require('./dist/models').StudySession,
        as: 'sessions',
        include: [{
          model: require('./dist/models').Theme,
          as: 'theme'
        }]
      }]
    });

    if (!plan) {
      console.log(`❌ Plan ${planId} no encontrado`);
      return;
    }

    const distribucion = {};
    const bloques = { 1: 0, 2: 0, 3: 0 };
    
    plan.sessions.forEach(session => {
      const themeName = session.theme.name;
      const block = session.theme.block;
      
      if (!distribucion[themeName]) {
        distribucion[themeName] = {
          total: 0,
          porTipo: {},
          bloque: block
        };
      }
      
      distribucion[themeName].total++;
      bloques[block]++;
      
      const tipo = session.type;
      if (!distribucion[themeName].porTipo[tipo]) {
        distribucion[themeName].porTipo[tipo] = 0;
      }
      distribucion[themeName].porTipo[tipo]++;
    });

    console.log('\n📊 DISTRIBUCIÓN POR TEMAS:');
    console.log('='.repeat(60));
    
    // Ordenar por bloque y mostrar
    const temasPorBloque = { 1: [], 2: [], 3: [] };
    
    Object.entries(distribucion).forEach(([tema, datos]) => {
      temasPorBloque[datos.bloque].push({ tema, ...datos });
    });

    [1, 2, 3].forEach(bloque => {
      console.log(`\n🎯 BLOQUE ${bloque}:`);
      console.log('-'.repeat(40));
      
      temasPorBloque[bloque].sort((a, b) => b.total - a.total).forEach(({ tema, total, porTipo }) => {
        const tipos = Object.entries(porTipo)
          .map(([tipo, cantidad]) => `${tipo}: ${cantidad}`)
          .join(', ');
        console.log(`${tema}: ${total} sesiones (${tipos})`);
      });
      
      console.log(`Total Bloque ${bloque}: ${bloques[bloque]} sesiones`);
    });

    console.log('\n📈 RESUMEN POR BLOQUES:');
    console.log('='.repeat(30));
    const totalSesiones = bloques[1] + bloques[2] + bloques[3];
    
    [1, 2, 3].forEach(bloque => {
      const porcentaje = ((bloques[bloque] / totalSesiones) * 100).toFixed(1);
      console.log(`Bloque ${bloque}: ${bloques[bloque]} sesiones (${porcentaje}%)`);
    });
    
    console.log(`\nTotal general: ${totalSesiones} sesiones`);
    
    // Verificar si hay desigualdad significativa
    const maxBloque = Math.max(bloques[1], bloques[2], bloques[3]);
    const minBloque = Math.min(bloques[1], bloques[2], bloques[3]);
    const ratio = maxBloque / minBloque;
    
    console.log('\n⚖️ ANÁLISIS DE EQUIDAD:');
    console.log('='.repeat(30));
    console.log(`Ratio máximo/mínimo: ${ratio.toFixed(2)}`);
    
    if (ratio > 2.0) {
      console.log('⚠️  ALERTA: Hay desigualdad significativa entre bloques');
    } else if (ratio > 1.5) {
      console.log('⚡ ADVERTENCIA: Hay cierta desigualdad entre bloques');
    } else {
      console.log('✅ BIEN: La distribución es relativamente equitativa');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    process.exit(0);
  }
}

const planId = process.argv[2];
if (!planId) {
  console.log('❌ Por favor proporciona un ID de plan');
  console.log('Uso: node verificar-distribucion.js <planId>');
  process.exit(1);
}

verificarDistribucion(planId);