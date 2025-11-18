const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

// Verificar todas las tablas
db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Tablas existentes:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });

  // Si hay tablas, verificar datos
  if (tables.length > 0) {
    console.log('\n📊 Verificando datos en las tablas:');
    
    // Verificar study_plans
    db.get("SELECT COUNT(*) as count FROM study_plans", (err, result) => {
      if (!err) {
        console.log(`Planes de estudio: ${result.count}`);
        
        if (result.count > 0) {
          db.all("SELECT id, name, start_date, end_date FROM study_plans LIMIT 10", (err, plans) => {
            if (!err) {
              console.log('\nPlanes encontrados:');
              plans.forEach(plan => {
                console.log(`- Plan ${plan.id}: ${plan.name} (${plan.start_date} - ${plan.end_date})`);
              });
            }
          });
        }
      }
    });

    // Verificar themes
    db.get("SELECT COUNT(*) as count FROM themes", (err, result) => {
      if (!err) {
        console.log(`Temas: ${result.count}`);
      }
    });

    // Verificar study_sessions
    db.get("SELECT COUNT(*) as count FROM study_sessions", (err, result) => {
      if (!err) {
        console.log(`Sesiones: ${result.count}`);
        
        if (result.count > 0) {
          db.all(`
            SELECT 
              s.study_plan_id,
              COUNT(*) as total_sessions,
              MIN(s.scheduled_date) as first_date,
              MAX(s.scheduled_date) as last_date
            FROM study_sessions s
            GROUP BY s.study_plan_id
            ORDER BY total_sessions DESC
            LIMIT 10
          `, (err, results) => {
            if (!err) {
              console.log('\nDistribución por plan:');
              results.forEach(row => {
                console.log(`- Plan ${row.study_plan_id}: ${row.total_sessions} sesiones (${row.first_date} - ${row.last_date})`);
              });
            }
          });
        }
      }
    });
  }
  
  setTimeout(() => db.close(), 2000);
});