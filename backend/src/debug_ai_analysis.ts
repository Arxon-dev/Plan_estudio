
import { config } from 'dotenv';
config();

import AIAnalysisService from './services/AIAnalysisService';
import sequelize from './config/database';
import User from './models/User';
import TestAttempt from './models/TestAttempt';
import UserTestStats from './models/UserTestStats';

async function testAI() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a BD exitosa.');

        // Buscar un usuario que tenga intentos
        const attempt = await TestAttempt.findOne();
        if (!attempt) {
            console.error('No hay ningún intento de test en la BD.');
            return;
        }
        const user = await User.findByPk(attempt.userId);
        if (!user) {
            console.error('Usuario del intento no encontrado.');
            return;
        }
        console.log(`Analizando usuario ID: ${user.id}`);

        const attempts = await TestAttempt.findAll({ where: { userId: user.id } });
        console.log(`Total intentos encontrados en BD para usuario ${user.id}: ${attempts.length}`);

        if (attempts.length > 0) {
            console.log('Últimos 3 intentos:');
            attempts.slice(-3).forEach(a => console.log(`- ${a.createdAt}: ${a.score} (${a.passed ? 'Pass' : 'Fail'})`));
        }

        const stats = await UserTestStats.findOne({ where: { userId: user.id } });
        console.log('\n--- ESTADÍSTICAS GLOBALES (UserTestStats) ---');
        console.log(JSON.stringify(stats, null, 2));

        const analysis = await AIAnalysisService.analyzeUserPerformance(user.id);

        console.log('\n--- RESULTADO DEL ANÁLISIS ---');
        console.log(JSON.stringify(analysis, null, 2));

    } catch (error) {
        console.error('Error en el test:', error);
    } finally {
        await sequelize.close();
    }
}

testAI();
