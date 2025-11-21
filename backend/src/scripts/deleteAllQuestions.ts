import { TestQuestion } from '../models';
import sequelize from '../config/database';

async function deleteAllQuestions() {
    try {
        await sequelize.authenticate();
        console.log('🔗 Conectado a la base de datos');

        const count = await TestQuestion.count();
        console.log(`📊 Preguntas actuales: ${count}`);

        if (count > 0) {
            console.log('⚠️  Eliminando todas las preguntas...');
            await TestQuestion.destroy({ where: {}, truncate: true });
            console.log('✅ Todas las preguntas han sido eliminadas');
            console.log('');
            console.log('📝 Próximos pasos:');
            console.log('1. Importa las preguntas nuevamente desde el panel de administración');
            console.log('2. El sistema detectará automáticamente las partes de cada tema');
            console.log('3. Verifica que las preguntas tengan el campo themePart correctamente asignado');
        } else {
            console.log('ℹ️  No hay preguntas para eliminar');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

deleteAllQuestions();
