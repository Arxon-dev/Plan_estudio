// Script para actualizar complejidad de temas directamente
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Datos de complejidad
const complexityData = {
  'ORGANIZACION': {
    1: 'MEDIUM',
    2: 'MEDIUM', 
    3: 'HIGH',
    4: 'MEDIUM',
    5: 'MEDIUM',
    6: 'HIGH',
  },
  'JURIDICO_SOCIAL': {
    1: 'HIGH',
    2: 'MEDIUM',
    3: 'MEDIUM',
    4: 'HIGH',
    5: 'MEDIUM',
    6: 'MEDIUM',
    7: 'MEDIUM',
    8: 'HIGH',
  },
  'SEGURIDAD_NACIONAL': {
    1: 'HIGH',
    2: 'HIGH',
    3: 'MEDIUM',
    4: 'MEDIUM',
    5: 'MEDIUM',
    6: 'MEDIUM',
    7: 'HIGH',
  },
};

async function updateThemesComplexity() {
  return new Promise((resolve, reject) => {
    console.log('🔄 Actualizando complejidad de temas...');
    
    let updatedCount = 0;
    let totalCount = 0;

    // Contar total de actualizaciones necesarias
    Object.entries(complexityData).forEach(([block, themes]) => {
      Object.keys(themes).forEach(() => totalCount++);
    });

    console.log(`📊 Total de temas a actualizar: ${totalCount}`);

    // Actualizar cada tema
    Object.entries(complexityData).forEach(([block, themes]) => {
      Object.entries(themes).forEach(([themeNumber, complexity]) => {
        const query = `UPDATE themes SET complexity = ? WHERE block = ? AND themeNumber = ?`;
        
        db.run(query, [complexity, block, parseInt(themeNumber)], function(err) {
          if (err) {
            console.error(`❌ Error actualizando ${block}-${themeNumber}:`, err.message);
          } else if (this.changes > 0) {
            updatedCount++;
            console.log(`✅ Tema ${block}-${themeNumber} actualizado a ${complexity}`);
          } else {
            console.log(`⚠️  Tema ${block}-${themeNumber} no encontrado`);
          }

          // Verificar si hemos terminado
          if (updatedCount + (totalCount - updatedCount - (this.changes === 0 ? 1 : 0)) === totalCount) {
            console.log(`\n✅ Actualización completada: ${updatedCount} temas actualizados`);
            
            // Verificar resultados finales
            db.all(`SELECT block, themeNumber, complexity FROM themes ORDER BY block, themeNumber`, (err, rows) => {
              if (err) {
                console.error('❌ Error verificando resultados:', err);
                db.close();
                reject(err);
                return;
              }

              const complexityCount = { LOW: 0, MEDIUM: 0, HIGH: 0 };
              rows.forEach(row => {
                complexityCount[row.complexity]++;
              });

              console.log('\n📊 Distribución por complejidad:');
              console.log(`🔴 LOW: ${complexityCount.LOW} temas`);
              console.log(`🟡 MEDIUM: ${complexityCount.MEDIUM} temas`);
              console.log(`🟢 HIGH: ${complexityCount.HIGH} temas`);

              db.close();
              resolve();
            });
          }
        });
      });
    });
  });
}

updateThemesComplexity().catch(console.error);