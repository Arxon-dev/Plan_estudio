const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🔄 Running Custom Blocks Migration...');

        // 1. Add configuration column
        try {
            await connection.query(`
        ALTER TABLE study_plans 
        ADD COLUMN configuration JSON NULL COMMENT 'Configuration for custom blocks or other methodologies';
      `);
            console.log('✅ Added configuration column');
        } catch (e) {
            if (e.code === 'ER_DUP_FIELDNAME') {
                console.log('⚠️ Configuration column already exists');
            } else {
                throw e;
            }
        }

        // 2. Update status enum
        await connection.query(`
      ALTER TABLE study_plans 
      MODIFY COLUMN status ENUM('ACTIVE', 'COMPLETED', 'PAUSED', 'CANCELLED', 'DRAFT') 
      NOT NULL DEFAULT 'ACTIVE';
    `);
        console.log('✅ Updated status enum');

        // 3. Update methodology enum
        await connection.query(`
      ALTER TABLE study_plans 
      MODIFY COLUMN methodology ENUM('rotation', 'monthly-blocks', 'custom-blocks') 
      NOT NULL DEFAULT 'rotation';
    `);
        console.log('✅ Updated methodology enum');

        console.log('✅ Migration completed successfully');
    } catch (error) {
        console.error('❌ Migration failed:', error);
    } finally {
        await connection.end();
    }
}

migrate();
