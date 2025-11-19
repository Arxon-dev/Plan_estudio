import sequelize from '../config/database';
import User from '../models/User';

/**
 * Script para añadir columna isAdmin a la tabla users
 * y marcar carlos.opomelilla@gmail.com como administrador
 */
async function addAdminColumn() {
  try {
    console.log('🔄 Conectando a la base de datos...');
    await sequelize.authenticate();
    console.log('✅ Conectado a la base de datos');

    // Añadir columna isAdmin si no existe
    console.log('\n🔄 Añadiendo columna isAdmin...');
    await sequelize.query(`
      ALTER TABLE users 
      ADD COLUMN IF NOT EXISTS "isAdmin" BOOLEAN NOT NULL DEFAULT false;
    `);
    console.log('✅ Columna isAdmin añadida (o ya existía)');

    // Marcar carlos.opomelilla@gmail.com como admin
    console.log('\n🔄 Actualizando usuario administrador...');
    const [updatedCount] = await User.update(
      { isAdmin: true },
      { 
        where: { email: 'carlos.opomelilla@gmail.com' } 
      }
    );

    if (updatedCount > 0) {
      console.log('✅ Usuario carlos.opomelilla@gmail.com marcado como administrador');
    } else {
      console.log('⚠️  Usuario carlos.opomelilla@gmail.com no encontrado');
      console.log('   El usuario será marcado como admin cuando se registre');
    }

    // Verificar usuarios admin
    const adminUsers = await User.findAll({
      where: { isAdmin: true },
      attributes: ['id', 'email', 'firstName', 'lastName', 'isAdmin']
    });

    console.log(`\n📊 Total de administradores: ${adminUsers.length}`);
    adminUsers.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.firstName} ${admin.lastName})`);
    });

    console.log('\n✅ Proceso completado exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al añadir columna isAdmin:', error);
    process.exit(1);
  }
}

addAdminColumn();
