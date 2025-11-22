const mysql = require('mysql2/promise');
require('dotenv').config();

async function runMigration() {
    let connection;

    try {
        console.log('🔌 Conectando a la base de datos...');

        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('✅ Conectado exitosamente');
        console.log('📝 Ejecutando migración: Agregando columna cancelAtPeriodEnd...\n');

        // Check if column exists
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM users LIKE 'cancelAtPeriodEnd'
        `);

        if (columns.length > 0) {
            console.log('⚠️ La columna cancelAtPeriodEnd ya existe. Saltando migración.');
            return;
        }

        // Add cancelAtPeriodEnd column
        console.log('1️⃣ Agregando columna cancelAtPeriodEnd...');
        await connection.query(`
            ALTER TABLE users
            ADD COLUMN cancelAtPeriodEnd TINYINT(1) NOT NULL DEFAULT 0 AFTER hasUsedTrial
        `);
        console.log('   ✅ cancelAtPeriodEnd agregada');

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);
        throw error;
    } finally {
        if (connection) {
            await connection.end();
            console.log('\n🔌 Conexión cerrada');
        }
    }
}

// Run migration
runMigration()
    .then(() => {
        console.log('\n✨ Proceso completado');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Error fatal:', error);
        process.exit(1);
    });
