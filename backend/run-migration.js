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
        console.log('📝 Ejecutando migración: Agregando columnas premium...\n');

        // Add isPremium column
        console.log('1️⃣ Agregando columna isPremium...');
        await connection.query(`
            ALTER TABLE users
            ADD COLUMN isPremium TINYINT(1) NOT NULL DEFAULT 0 AFTER isAdmin
        `);
        console.log('   ✅ isPremium agregada');

        // Add stripeCustomerId column
        console.log('2️⃣ Agregando columna stripeCustomerId...');
        await connection.query(`
            ALTER TABLE users
            ADD COLUMN stripeCustomerId VARCHAR(255) NULL AFTER isPremium
        `);
        console.log('   ✅ stripeCustomerId agregada');

        // Add subscriptionStatus column
        console.log('3️⃣ Agregando columna subscriptionStatus...');
        await connection.query(`
            ALTER TABLE users
            ADD COLUMN subscriptionStatus VARCHAR(50) NULL AFTER stripeCustomerId
        `);
        console.log('   ✅ subscriptionStatus agregada');

        // Add subscriptionEndDate column
        console.log('4️⃣ Agregando columna subscriptionEndDate...');
        await connection.query(`
            ALTER TABLE users
            ADD COLUMN subscriptionEndDate DATETIME NULL AFTER subscriptionStatus
        `);
        console.log('   ✅ subscriptionEndDate agregada');

        // Add indexes
        console.log('5️⃣ Creando índices...');
        await connection.query(`
            CREATE INDEX idx_users_isPremium ON users(isPremium)
        `);
        await connection.query(`
            CREATE INDEX idx_users_stripeCustomerId ON users(stripeCustomerId)
        `);
        await connection.query(`
            CREATE INDEX idx_users_subscriptionStatus ON users(subscriptionStatus)
        `);
        console.log('   ✅ Índices creados');

        // Verify changes
        console.log('\n📋 Verificando estructura de la tabla...');
        const [columns] = await connection.query(`
            SHOW COLUMNS FROM users
        `);

        console.log('\n✅ MIGRACIÓN COMPLETADA EXITOSAMENTE\n');
        console.log('Columnas en la tabla users:');
        columns.forEach(col => {
            console.log(`   - ${col.Field} (${col.Type})`);
        });

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error.message);

        // Check if columns already exist
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('\n⚠️  Las columnas ya existen. No se requiere migración.');
        } else {
            throw error;
        }
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
