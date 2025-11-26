const { Sequelize } = require('sequelize');
const { format } = require('date-fns');
require('dotenv').config();

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

async function verifyDailySessions() {
    console.log('🔍 Verificando distribución de sesiones diarias...\n');

    try {
        await sequelize.authenticate();

        // 1. Buscar el último plan creado (preferiblemente monthly-blocks)
        const [plans] = await sequelize.query(`
            SELECT id, methodology, createdAt 
            FROM study_plans 
            ORDER BY createdAt DESC 
            LIMIT 1
        `);

        if (plans.length === 0) {
            console.log('❌ No hay planes de estudio creados.');
            return;
        }

        const plan = plans[0];
        console.log(`📋 Analizando Plan ID: ${plan.id} (${plan.methodology})`);

        // 2. Obtener sesiones agrupadas por día
        const [sessions] = await sequelize.query(`
            SELECT 
                DATE(scheduledDate) as date,
                COUNT(*) as count,
                GROUP_CONCAT(CONCAT(sessionType, ': ', themeId) SEPARATOR ' | ') as details
            FROM study_sessions
            WHERE studyPlanId = ${plan.id}
            GROUP BY DATE(scheduledDate)
            ORDER BY date ASC
            LIMIT 10
        `);

        if (sessions.length === 0) {
            console.log('❌ El plan no tiene sesiones generadas.');
            return;
        }

        console.log('\n📊 Sesiones por día (Primeros 10 días con actividad):');
        console.table(sessions.map(s => ({
            Fecha: format(new Date(s.date), 'yyyy-MM-dd'),
            'Num Sesiones': s.count,
            'Detalles': s.details.substring(0, 50) + (s.details.length > 50 ? '...' : '')
        })));

        // 3. Verificar si hay días con > 1 sesión
        const multiSessionDays = sessions.filter(s => s.count > 1);
        if (multiSessionDays.length > 0) {
            console.log(`\n✅ ÉXITO: Se detectaron ${multiSessionDays.length} días con múltiples sesiones.`);
        } else {
            console.log('\n⚠️ ADVERTENCIA: Todos los días mostrados tienen solo 1 sesión. Verifica si el horario permite más.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

verifyDailySessions();
