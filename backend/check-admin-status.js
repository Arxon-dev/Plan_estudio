const { Sequelize } = require('sequelize');
require('dotenv').config({ path: '.env.local' });

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'mysql',
        logging: false,
    }
);

async function checkAndSetAdmin() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conectado a la base de datos\n');

        const email = 'carlos.opomelilla@gmail.com';

        // Verificar estado actual
        const [currentUser] = await sequelize.query(
            'SELECT id, email, firstName, lastName, isAdmin FROM users WHERE email = ?',
            {
                replacements: [email],
                type: Sequelize.QueryTypes.SELECT,
            }
        );

        if (!currentUser) {
            console.log('❌ Usuario no encontrado:', email);
            process.exit(1);
        }

        console.log('📋 Estado actual del usuario:');
        console.log('   ID:', currentUser.id);
        console.log('   Email:', currentUser.email);
        console.log('   Nombre:', currentUser.firstName, currentUser.lastName);
        console.log('   isAdmin:', currentUser.isAdmin);
        console.log('');

        if (currentUser.isAdmin) {
            console.log('✅ El usuario YA es administrador');
        } else {
            console.log('⚠️  El usuario NO es administrador');
            console.log('🔧 Actualizando a administrador...\n');

            // Actualizar a admin
            await sequelize.query(
                'UPDATE users SET isAdmin = 1 WHERE email = ?',
                {
                    replacements: [email],
                    type: Sequelize.QueryTypes.UPDATE,
                }
            );

            // Verificar actualización
            const [updatedUser] = await sequelize.query(
                'SELECT id, email, firstName, lastName, isAdmin FROM users WHERE email = ?',
                {
                    replacements: [email],
                    type: Sequelize.QueryTypes.SELECT,
                }
            );

            console.log('✅ Usuario actualizado correctamente:');
            console.log('   ID:', updatedUser.id);
            console.log('   Email:', updatedUser.email);
            console.log('   Nombre:', updatedUser.firstName, updatedUser.lastName);
            console.log('   isAdmin:', updatedUser.isAdmin);
        }

        await sequelize.close();
        console.log('\n✅ Proceso completado');
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkAndSetAdmin();
