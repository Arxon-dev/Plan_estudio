
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function checkUserStatus() {
    console.log('🔍 Verificando estado del usuario...');

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

    try {
        await sequelize.authenticate();

        // Buscar usuario por email (asumimos el del log anterior o el que se usó en la prueba)
        const email = 'carlos.opomelilla@gmail.com';

        const [results] = await sequelize.query(
            `SELECT id, email, isPremium, stripeCustomerId, subscriptionStatus, hasUsedTrial FROM users WHERE email = '${email}'`
        );

        if (results.length > 0) {
            const user = results[0];
            console.log('👤 Datos del usuario:', user);

            const isEligible = !user.hasUsedTrial && !user.isPremium && !user.subscriptionStatus;
            console.log('🤔 ¿Es elegible para prueba según lógica actual?', isEligible);

            if (!isEligible) {
                console.log('❌ CAUSA DE FALLO DETECTADA:');
                if (user.hasUsedTrial) console.log('   - hasUsedTrial es TRUE (Ya usó la prueba)');
                if (user.isPremium) console.log('   - isPremium es TRUE (Ya es premium)');
                if (user.subscriptionStatus) console.log(`   - subscriptionStatus es '${user.subscriptionStatus}' (No es null/vacío)`);
            } else {
                console.log('✅ El usuario DEBERÍA recibir la prueba. El problema puede estar en la llamada a Stripe.');
            }
        } else {
            console.log('❌ Usuario no encontrado con ese email.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

checkUserStatus();
