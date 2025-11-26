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

const { MonthlyBlocksService } = require('../src/services/MonthlyBlocksService');
const { addDays, addMonths, format } = require('date-fns');

async function testLogic() {
    console.log('🧪 Probando lógica de Spaced Repetition Cycles (incluyendo Flash Review)...\n');

    const startDate = new Date();
    // Simular 15 meses para ver el ciclo completo
    const examDate = addMonths(startDate, 15);

    // Configurar 4 horas disponibles
    const dailySchedule = [{ start: '09:00', end: '13:00' }];
    const weeklySchedule = {
        monday: dailySchedule,
        tuesday: dailySchedule,
        wednesday: dailySchedule,
        thursday: dailySchedule,
        friday: dailySchedule,
        saturday: dailySchedule,
        sunday: dailySchedule
    };

    // Crear suficientes temas para llenar varios meses
    const selectedTopics = [];
    for (let i = 1; i <= 20; i++) {
        selectedTopics.push({ id: `${i}`, name: `Tema ${i}` });
    }

    const config = {
        startDate,
        examDate,
        weeklySchedule,
        selectedTopics,
        topicsPerDay: 3
    };

    try {
        const sessions = await MonthlyBlocksService.generateMonthlyBlocksPlan(config, 999);

        console.log(`✅ Se generaron ${sessions.length} sesiones en total.`);

        // Agrupar por mes (aproximado)
        const sessionsByMonth = {};
        sessions.forEach(s => {
            const monthKey = format(s.scheduledDate, 'yyyy-MM');
            if (!sessionsByMonth[monthKey]) sessionsByMonth[monthKey] = [];
            sessionsByMonth[monthKey].push(s);
        });

        const monthKeys = Object.keys(sessionsByMonth).sort();
        console.log(`📅 Plan abarca ${monthKeys.length} meses.`);

        // Verificar ciclo del Tema 1
        console.log('\n🔍 Verificando ciclo del Tema 1:');

        const checkTopicInMonth = (monthIndex, expectedType, isFlash = false) => {
            if (monthIndex >= monthKeys.length) return;
            const monthKey = monthKeys[monthIndex];
            const sessionsInMonth = sessionsByMonth[monthKey];

            const topicSessions = sessionsInMonth.filter(s => s.themeId === 1);

            if (topicSessions.length > 0) {
                const types = [...new Set(topicSessions.map(s => s.sessionType))];
                const hasFlashNote = topicSessions.some(s => s.notes && s.notes.includes('Repaso flash'));

                let status = '❓';
                if (isFlash) {
                    status = hasFlashNote ? '✅ FLASH DETECTADO' : '❌ FALTA FLASH';
                } else {
                    status = types.includes(expectedType) ? `✅ ${expectedType} OK` : `❌ ESPERADO ${expectedType}`;
                }

                console.log(`   Mes ${monthIndex + 1} (${monthKey}): Encontrado en ${topicSessions.length} sesiones. Tipos: [${types.join(', ')}]. ${status}`);
            } else {
                console.log(`   Mes ${monthIndex + 1} (${monthKey}): NO encontrado.`);
            }
        };

        // Mes 1: Study
        checkTopicInMonth(0, 'STUDY');
        // Mes 2: Review
        checkTopicInMonth(1, 'REVIEW');
        // Mes 3: Descanso (no debería estar, o solo si hay hueco)
        checkTopicInMonth(2, 'NONE');
        // Mes 4: Test
        checkTopicInMonth(3, 'TEST');
        // Mes 5: Flash Review
        checkTopicInMonth(4, 'REVIEW', true);
        // Mes 6: Flash Review
        checkTopicInMonth(5, 'REVIEW', true);

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

testLogic();
