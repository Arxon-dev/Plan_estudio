import sequelize from '../config/database';
import * as models from '../models';

export async function migrate() {
  try {
    console.log('🔄 Iniciando migración de base de datos...');
    
    // Sincronizar modelos con la base de datos
    await sequelize.sync({ force: false, alter: true });
    
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
