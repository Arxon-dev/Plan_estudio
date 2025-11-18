const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

async function verificarDistribucion(planId) {
  return new Promise((resolve, reject) => {
    console.log(`🔍 Verificando distribución del plan ${planId}...`);
    
    const query = `
      SELECT 
        t.name as theme_name,
        t.block as bloque,
        s.type as session_type,
        COUNT(*) as total_sessions
      FROM study_sessions s
      JOIN themes t ON s.theme_id = t.id
      WHERE s.study_plan_id = ?
      GROUP BY t.name, t.block, s.type
      ORDER BY t.block, total_sessions DESC
    `;

    db.all(query, [planId], (err, rows) => {
      if (err) {
        console.error('❌ Error:', err.message);
        reject(err);
        return;
      }

      if (rows.length === 0) {
        console.log(`❌ No se encontraron sesiones para el plan ${planId}`);
        resolve();
        return;
      }

      const distribucion = {};
      const bloques = { 1: 0, 2: 0, 3: 0 };
      
      rows.forEach(row => {
        const themeName = row.theme_name;
        const block = row.bloque;
        const sessionType = row.session_type;
        const count = row.total_sessions;
        
        if (!distribucion[themeName]) {
          distribucion[themeName] = {
            total: 0,
            porTipo: {},
            bloque: block
          };
        }
        
        distribucion[themeName].total += count;
        distribucion[themeName].porTipo[sessionType] = count;
        bloques[block] += count;
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
        
        temasPorBloque[bloque]
          .sort((a, b) => b.total - a.total)
          .forEach(({ tema, total, porTipo }) => {
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

      // Identificar temas extensos mencionados
      const temasExtensos = [
        'Parte 2: Instrucción 14/2021, ET.',
        'Parte 4: Instrucción 6/2025, EA.',
        'Parte 2: Ley 39/2007 de la Carrera Militar.',
        'Tema 8. Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas.',
        'Parte 2: Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021.',
        'Tema 2. PDC-01(B) Doctrina para el empleo de las FAS.',
        'Tema 7. España y su participación en Misiones Internacionales.'
      ];

      console.log('\n🎯 TEMAS EXTENSOS (requieren más sesiones):');
      console.log('='.repeat(60));
      
      temasExtensos.forEach(temaBuscado => {
        const encontrado = Object.entries(distribucion).find(([tema]) => 
          tema.includes(temaBuscado.split(',')[0]) || 
          tema.includes(temaBuscado.split('.')[0])
        );
        
        if (encontrado) {
          const [nombre, datos] = encontrado;
          console.log(`${nombre}: ${datos.total} sesiones`);
        } else {
          console.log(`❌ ${temaBuscado}: No encontrado`);
        }
      });

      db.close();
      resolve();
    });
  });
}

const planId = process.argv[2];
if (!planId) {
  console.log('❌ Por favor proporciona un ID de plan');
  console.log('Uso: node verificar-distribucion-directa.js <planId>');
  process.exit(1);
}

verificarDistribucion(planId).catch(console.error);