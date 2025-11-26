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

async function testOptimization() {
    console.log('🧪 Probando Optimización de Distribución de Tiempo...\n');

    const startDate = new Date();
    const examDate = addMonths(startDate, 15);

    // Configurar 3 horas disponibles (180 min)
    const dailySchedule = [{ start: '09:00', end: '12:00' }];
    const weeklySchedule = {
        monday: dailySchedule,
        tuesday: dailySchedule,
        wednesday: dailySchedule,
        thursday: dailySchedule,
        friday: dailySchedule,
        saturday: dailySchedule,
        sunday: dailySchedule
    };

    // Crear suficientes temas
    const selectedTopics = [];
    for (let i = 1; i <= 30; i++) {
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

        // Agrupar por mes
        const sessionsByMonth = {};
        sessions.forEach(s => {
            const monthKey = format(s.scheduledDate, 'yyyy-MM');
            if (!sessionsByMonth[monthKey]) sessionsByMonth[monthKey] = [];
            sessionsByMonth[monthKey].push(s);
        });

        const monthKeys = Object.keys(sessionsByMonth).sort();

        // --- TEST 1: Mes 1 ---
        console.log('\n🔍 TEST 1: Mes 1 (Solo Estudio)');
        const m1 = sessionsByMonth[monthKeys[0]];
        const m1Types = [...new Set(m1.map(s => s.sessionType))];
        const m1AvgDuration = m1.reduce((sum, s) => sum + s.scheduledHours, 0) / m1.length;

        console.log(`   Tipos presentes: [${m1Types.join(', ')}]`);
        console.log(`   Duración media: ${m1AvgDuration.toFixed(2)}h (${(m1AvgDuration * 60).toFixed(0)} min)`);

        if (m1Types.length === 1 && m1Types[0] === 'STUDY' && m1AvgDuration >= 0.9) {
            console.log('   ✅ ÉXITO: Solo Estudio y duración ~1h (100% del tiempo)');
        } else {
            console.log('   ❌ FALLO: Tipos o duración incorrectos');
        }

        // --- TEST 2: Mes 2 (Estudio + Repaso) ---
        console.log('\n🔍 TEST 2: Mes 2 (Estudio + Repaso)');
        const m2 = sessionsByMonth[monthKeys[1]];
        const m2Types = [...new Set(m2.map(s => s.sessionType))];
        const m2Study = m2.filter(s => s.sessionType === 'STUDY');
        const m2Review = m2.filter(s => s.sessionType === 'REVIEW');

        const m2StudyAvg = m2Study.reduce((sum, s) => sum + s.scheduledHours, 0) / m2Study.length;
        const m2ReviewAvg = m2Review.reduce((sum, s) => sum + s.scheduledHours, 0) / m2Review.length;

        console.log(`   Tipos presentes: [${m2Types.join(', ')}]`);
        console.log(`   Estudio media: ${m2StudyAvg.toFixed(2)}h`);
        console.log(`   Repaso media: ${m2ReviewAvg.toFixed(2)}h`);

        if (m2Types.includes('STUDY') && m2Types.includes('REVIEW') && m2StudyAvg > m2ReviewAvg) {
            console.log('   ✅ ÉXITO: Estudio y Repaso presentes, Estudio > Repaso');
        } else {
            console.log('   ❌ FALLO: Distribución incorrecta');
        }

        // --- TEST 3: Mes 6 (Mix Completo) ---
        console.log('\n🔍 TEST 3: Mes 6 (Mix Completo)');
        const m6 = sessionsByMonth[monthKeys[5]]; // Mes 6
        if (m6) {
            const m6Types = [...new Set(m6.map(s => s.sessionType))];
            const m6Flash = m6.filter(s => s.notes && s.notes.includes('Repaso flash'));

            console.log(`   Tipos presentes: [${m6Types.join(', ')}]`);
            console.log(`   Flash Reviews: ${m6Flash.length}`);

            if (m6Flash.length > 0) {
                const flashAvg = m6Flash.reduce((sum, s) => sum + s.scheduledHours, 0) / m6Flash.length;
                console.log(`   Flash media: ${flashAvg.toFixed(2)}h`);
                if (flashAvg < 0.3) {
                    console.log('   ✅ ÉXITO: Flash Reviews presentes y cortos');
                } else {
                    console.log('   ⚠️ AVISO: Flash Reviews quizás muy largos');
                }
            } else {
                console.log('   ❌ FALLO: No hay Flash Reviews');
            }
        } else {
            console.log('   ⚠️ Mes 6 no generado (quizás faltan temas)');
        }

    } catch (error) {
        console.error('❌ Error en la prueba:', error);
    }
}

testOptimization();
