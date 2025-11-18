const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath);

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err);
    return;
  }
  
  console.log('Tablas existentes:');
  tables.forEach(table => {
    console.log(`- ${table.name}`);
  });
  
  // También verificar el esquema de las tablas principales
  const tablasPrincipales = ['study_sessions', 'study_plans', 'themes', 'users'];
  
  tablasPrincipales.forEach(tableName => {
    db.all(`PRAGMA table_info(${tableName})`, (err, columns) => {
      if (!err && columns.length > 0) {
        console.log(`\nEstructura de ${tableName}:`);
        columns.forEach(col => {
          console.log(`  ${col.name}: ${col.type}`);
        });
      }
    });
  });
  
  setTimeout(() => db.close(), 1000);
});