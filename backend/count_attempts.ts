import dotenv from 'dotenv';
import sequelize from './src/config/database';
import User from './src/models/User';
import TestAttempt from './src/models/TestAttempt';

dotenv.config();

async function countAttempts() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a DB');

        const email = 'test2@example.com';
        const user: any = await User.findOne({ where: { email } });

        if (!user) {
            console.error(`❌ Usuario ${email} no encontrado`);
            return;
        }

        console.log(`\n👤 Usuario: ${user.name} (ID: ${user.id})`);

        // Contar total de intentos
        const totalAttempts = await TestAttempt.count({
            where: { userId: user.id }
        });

        console.log(`\n📊 Total de intentos en TestAttempt: ${totalAttempts}`);

        // Contar por estado
        const passed = await TestAttempt.count({
            where: { userId: user.id, passed: true }
        });

        const failed = await TestAttempt.count({
            where: { userId: user.id, passed: false }
        });

        console.log(`   ✅ Aprobados: ${passed}`);
        console.log(`   ❌ Suspendidos: ${failed}`);

        // Calcular tasa de acierto real
        const realSuccessRate = totalAttempts > 0 ? (passed / totalAttempts) * 100 : 0;
        console.log(`\n📈 Tasa de acierto REAL: ${realSuccessRate.toFixed(2)}%`);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await sequelize.close();
    }
}

countAttempts();
