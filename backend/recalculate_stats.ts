import dotenv from 'dotenv';
import sequelize from './src/config/database';
import User from './src/models/User';
import TestAttempt from './src/models/TestAttempt';
import UserTestStats from './src/models/UserTestStats';
import TestService from './src/services/TestService';

dotenv.config();

async function recalculateStats() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a DB');

        const users = await User.findAll();
        console.log(`Encontrados ${users.length} usuarios.`);

        for (const user of users) {
            console.log(`\nRecalculando para usuario ${user.id} (${user.email})...`);
            const attempts = await TestAttempt.findAll({
                where: { userId: user.id },
                order: [['createdAt', 'ASC']]
            });

            if (attempts.length === 0) {
                console.log(`Usuario ${user.id} no tiene intentos.`);
                continue;
            }

            console.log(`Encontrados ${attempts.length} intentos.`);

            // Reset stats
            let stats = await UserTestStats.findOne({ where: { userId: user.id } });
            if (!stats) {
                stats = await UserTestStats.create({
                    userId: user.id,
                    totalTests: 0,
                    totalQuestionsAnswered: 0,
                    globalSuccessRate: 0,
                    totalTimeSpent: 0,
                    monthlyPracticeTests: 0,
                    overallMasteryLevel: 0,
                    examReadinessScore: 0,
                    averageTestSpeed: 0,
                    consistencyScore: 0,
                });
            } else {
                await stats.update({
                    totalTests: 0,
                    totalQuestionsAnswered: 0,
                    globalSuccessRate: 0,
                    totalTimeSpent: 0,
                    monthlyPracticeTests: 0,
                    overallMasteryLevel: 0,
                    examReadinessScore: 0,
                    averageTestSpeed: 0,
                    consistencyScore: 0,
                });
            }

            // Replay history using TestService to ensure logic consistency
            for (const attempt of attempts) {
                await TestService.updateUserStats(user.id, attempt);
            }
            console.log(`Usuario ${user.id} actualizado.`);
        }

    } catch (error) {
        console.error('Error recalculando stats:', error);
    } finally {
        await sequelize.close();
    }
}

recalculateStats();
