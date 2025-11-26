const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de conexión
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql',
        logging: false
    }
);

async function verify() {
    console.log('🔍 Verificando implementación...\n');

    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // 1. Verificar columna methodology
        const [columns] = await sequelize.query(`
      SHOW COLUMNS FROM study_plans LIKE 'methodology'
    `);

        if (columns.length > 0) {
            console.log('✅ Columna methodology: EXISTE');
            console.log('   Detalles:', columns[0]);
        } else {
            console.error('❌ Columna methodology: NO EXISTE');
        }

        // 2. Verificar estadísticas de planes
        const [stats] = await sequelize.query(`
      SELECT methodology, COUNT(*) as count 
      FROM study_plans 
      GROUP BY methodology
    `);

        console.log('\n📈 Estadísticas de planes:');
        console.table(stats);

        // 3. Verificar últimas sesiones creadas
        const [sessions] = await sequelize.query(`
      SELECT s.id, s.sessionType, s.scheduledDate, p.methodology
      FROM study_sessions s
      JOIN study_plans p ON s.studyPlanId = p.id
      ORDER BY s.id DESC
      LIMIT 5
    `);

        console.log('\n📊 Últimas 5 sesiones creadas:');
        console.table(sessions);

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

verify();
