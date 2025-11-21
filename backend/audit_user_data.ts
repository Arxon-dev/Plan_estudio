import dotenv from 'dotenv';
import sequelize from './src/config/database';
import User from './src/models/User';
import TestAttempt from './src/models/TestAttempt';
import UserTestStats from './src/models/UserTestStats';
import ThemeProgress from './src/models/ThemeProgress';
import Theme from './src/models/Theme';

dotenv.config();

async function auditUserData() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a DB');

        // Buscar usuario
        const email = 'test2@example.com';
        const user: any = await User.findOne({ where: { email } });

        if (!user) {
            console.error(`❌ Usuario ${email} no encontrado`);
            return;
        }

        console.log(`\n👤 Usuario: ${user.name} (ID: ${user.id})`);

        // 1. Últimos Intentos
        console.log('\n📋 Últimos 15 Intentos de Test:');
        const attempts = await TestAttempt.findAll({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']],
            limit: 15,
            include: [{ model: Theme, as: 'theme', attributes: ['title'] }]
        });

        if (attempts.length === 0) {
            console.log('   (No hay intentos registrados)');
        } else {
            console.table(attempts.map((a: any) => ({
                ID: a.id,
                Fecha: a.createdAt ? new Date(a.createdAt).toISOString().split('T')[0] : 'N/A',
                Tema: a.theme?.title || 'N/A',
                Nota: Number(a.score || 0).toFixed(2),
                Tiempo: `${a.duration}s`,
                Aprobado: a.passed ? '✅' : '❌'
            })));
        }

        // 2. Estadísticas Globales
        console.log('\n📊 Estadísticas Globales (UserTestStats):');
        const stats = await UserTestStats.findOne({ where: { userId: user.id } });
        if (stats) {
            console.log(JSON.stringify(stats.toJSON(), null, 2));
        } else {
            console.log('   (No hay estadísticas globales)');
        }

        // 3. Progreso por Tema
        console.log('\n📚 Progreso por Tema (ThemeProgress):');
        const progress = await ThemeProgress.findAll({
            where: { userId: user.id },
            include: [{ model: Theme, as: 'theme', attributes: ['title'] }]
        });

        if (progress.length === 0) {
            console.log('   (No hay progreso registrado)');
        } else {
            progress.forEach((p: any) => {
                console.log(`   - ${p.theme?.title}: Media ${Number(p.averageScore || 0).toFixed(2)}, Tests ${p.totalTests}`);
            });
        }

    } catch (error) {
        console.error('Error en auditoría:', error);
    } finally {
        await sequelize.close();
    }
}

auditUserData();
