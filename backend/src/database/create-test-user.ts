import sequelize from '../config/database';
import User from '../models/User';
import bcrypt from 'bcrypt';

async function createTestUser() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión establecida');

    // Verificar si ya existe el usuario
    const existingUser = await User.findOne({
      where: { email: 'carlos.opomelilla@gmail.com' },
    });

    if (existingUser) {
      console.log('ℹ️  Usuario de prueba ya existe');
      console.log(`   Email: ${existingUser.email}`);
      console.log(`   ID: ${existingUser.id}`);
      
      // Actualizar contraseña a password123
      const hashedPassword = await bcrypt.hash('password123', 10);
      await existingUser.update({ password: hashedPassword });
      console.log('✅ Contraseña actualizada a: password123');
      console.log(`   Hash generado: ${hashedPassword.substring(0, 20)}...`);
      
      // Verificar que funciona
      const isValid = await bcrypt.compare('password123', hashedPassword);
      console.log(`   ✅ Verificación de hash: ${isValid ? 'OK' : 'FALLO'}`);
    } else {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash('password123', 10);
      const newUser = await User.create({
        email: 'carlos.opomelilla@gmail.com',
        password: hashedPassword,
        firstName: 'Carlos',
        lastName: 'Test',
        isAdmin: true,
      });
      
      console.log('✅ Usuario de prueba creado');
      console.log(`   Email: ${newUser.email}`);
      console.log(`   Password: password123`);
      console.log(`   ID: ${newUser.id}`);
    }

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTestUser();
