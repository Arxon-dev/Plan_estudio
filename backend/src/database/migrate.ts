import sequelize from '../config/database';
import * as models from '../models';
import TestQuestion from '../models/TestQuestion';
import TestAttempt from '../models/TestAttempt';
import ThemeProgress from '../models/ThemeProgress';
import UserTestStats from '../models/UserTestStats';
import AITestSession from '../models/AITestSession';
import ChatUsage from '../models/ChatUsage';

export async function migrate() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');

    // Asegurar que todos los modelos estén cargados
    console.log('📦 Modelos cargados:', Object.keys(models).join(', '));

    // Sincronizar solo las tablas nuevas del sistema de tests
    console.log('📦 Creando tablas del sistema de tests...');
    await TestQuestion.sync({ force: false });
    console.log('✅ Tabla test_questions creada');

    await TestAttempt.sync({ force: false });
    console.log('✅ Tabla test_attempts creada');

    await ThemeProgress.sync({ force: false });
    console.log('✅ Tabla theme_progress creada');

    await UserTestStats.sync({ force: false });
    console.log('✅ Tabla user_test_stats creada');

    await AITestSession.sync({ force: false });
    console.log('✅ Tabla ai_test_sessions creada');

    await ChatUsage.sync({ force: false });
    console.log('✅ Tabla chat_usage creada');

    console.log('✅ Migración completada exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar migración si es llamado directamente
if (require.main === module) {
  migrate();
}
