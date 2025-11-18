const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table';", (err, tables) => {
  if (err) {
    console.error('❌ Error:', err);
    db.close();
    return;
  }
  
  console.log('📊 Tablas encontradas:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  // Verificar estructura de la tabla themes
  if (tables.some(t => t.name === 'themes')) {
    db.all("PRAGMA table_info(themes);", (err, columns) => {
      if (err) {
        console.error('❌ Error obteniendo estructura:', err);
      } else {
        console.log('\n📋 Estructura de themes:');
        columns.forEach(col => {
          console.log(`- ${col.name}: ${col.type} (${col.notnull ? 'NOT NULL' : 'NULL'})`);
        });
      }
      db.close();
    });
  } else {
    db.close();
  }
});