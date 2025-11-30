import sequelize from '../config/database';
import fs from 'fs';
import path from 'path';

async function runMigration() {
    try {
        console.log('🔄 Ejecutando migración SQL...');
        const sqlPath = path.join(__dirname, '../db/migrations/002_create_flashcard_progress.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        await sequelize.query(sql);
        console.log('✅ Migración ejecutada exitosamente.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error ejecutando migración:', error);
        process.exit(1);
    }
}

runMigration();
