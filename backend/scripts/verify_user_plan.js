const path = require('path');
const tsConfig = require('../tsconfig.json');
const tsConfigPaths = require('tsconfig-paths');

const baseUrl = path.resolve(__dirname, '..');

tsConfigPaths.register({
    baseUrl: baseUrl,
    paths: tsConfig.compilerOptions.paths
});

require('ts-node').register({
    files: true,
    transpileOnly: true,
    project: path.resolve(__dirname, '../tsconfig.json')
});

const { User, StudyPlan, StudySession, WeeklySchedule } = require('../src/models');
const { format, startOfMonth, endOfMonth, isSameMonth } = require('date-fns');

async function verifyUserPlan() {
    console.log('🔍 Verificando plan de estudio para: general@gmail.com\n');

    try {
        const user = await User.findOne({ where: { email: 'general@gmail.com' } });
        if (!user) {
            console.error('❌ Usuario no encontrado.');
            return;
        }

        const plan = await StudyPlan.findOne({
            where: { userId: user.id },
            order: [['createdAt', 'DESC']],
            include: [
                { model: WeeklySchedule, as: 'weeklySchedule' },
                { model: StudySession, as: 'sessions' }
            ]
        });

        if (!plan) {
            console.error('❌ No se encontró ningún plan de estudio para este usuario.');
            return;
        }

        console.log(`✅ Plan encontrado (ID: ${plan.id})`);
        console.log(`   Metodología: ${plan.methodology}`);
        console.log(`   Inicio: ${format(plan.startDate, 'yyyy-MM-dd')}`);
        console.log(`   Examen: ${format(plan.examDate, 'yyyy-MM-dd')}`);

        if (plan.weeklySchedule) {
            console.log('\n📅 Horario Semanal (Horas):');
            console.log(`   L: ${plan.weeklySchedule.monday}, M: ${plan.weeklySchedule.tuesday}, X: ${plan.weeklySchedule.wednesday}, J: ${plan.weeklySchedule.thursday}, V: ${plan.weeklySchedule.friday}, S: ${plan.weeklySchedule.saturday}, D: ${plan.weeklySchedule.sunday}`);
        }

        const sessions = plan.sessions;
        console.log(`\n📊 Total Sesiones: ${sessions.length}`);

        // Agrupar por mes
        const sessionsByMonth = {};
        sessions.forEach(s => {
            const monthKey = format(s.scheduledDate, 'yyyy-MM');
            if (!sessionsByMonth[monthKey]) sessionsByMonth[monthKey] = [];
            sessionsByMonth[monthKey].push(s);
        });

        const monthKeys = Object.keys(sessionsByMonth).sort();

        console.log('\n🔎 Análisis Mensual:');
        monthKeys.forEach(monthKey => {
            const monthSessions = sessionsByMonth[monthKey];
            const totalHours = monthSessions.reduce((sum, s) => sum + Number(s.scheduledHours), 0);

            const types = monthSessions.reduce((acc, s) => {
                acc[s.sessionType] = (acc[s.sessionType] || 0) + 1;
                return acc;
            }, {});

            const flashReviews = monthSessions.filter(s => s.notes && s.notes.includes('Repaso flash')).length;

            console.log(`   📅 ${monthKey}: ${monthSessions.length} sesiones (${totalHours.toFixed(1)} horas)`);
            console.log(`      Tipos: ${JSON.stringify(types)}`);
            if (flashReviews > 0) {
                console.log(`      ⚡ Flash Reviews: ${flashReviews}`);
            }
        });

        // Verificar ciclo para un tema
        if (sessions.length > 0) {
            const firstTopicId = sessions[0].themeId;
            console.log(`\n🔄 Verificando ciclo para Tema ID ${firstTopicId}:`);

            const topicSessions = sessions.filter(s => s.themeId === firstTopicId).sort((a, b) => a.scheduledDate - b.scheduledDate);

            topicSessions.forEach(s => {
                const isFlash = s.notes && s.notes.includes('Repaso flash');
                console.log(`   ${format(s.scheduledDate, 'yyyy-MM-dd')}: ${s.sessionType} (${s.scheduledHours}h)${isFlash ? ' [FLASH]' : ''}`);
            });
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

verifyUserPlan();
