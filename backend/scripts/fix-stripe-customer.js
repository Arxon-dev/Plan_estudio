
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixStripeCustomer() {
    console.log('🔧 Iniciando reparación de Stripe Customer ID...');

    // Configuración de conexión (usando las mismas variables que la app)
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
        console.log('✅ Conexión a BD establecida.');

        // Ejecutar query directa para limpiar el ID
        // Asumimos que el usuario afectado es el que tiene el email configurado o buscamos por el ID que falló en los logs
        // En este caso, vamos a limpiar el ID del usuario actual si tiene el formato de test (o simplemente limpiarlo para forzar regeneración)

        // El log mostraba: 'cus_TSvCEbh1QUK098'
        const invalidCustomerId = 'cus_TSvCEbh1QUK098';

        const [results, metadata] = await sequelize.query(
            `UPDATE users SET stripeCustomerId = NULL, isPremium = 0, subscriptionStatus = NULL WHERE stripeCustomerId = '${invalidCustomerId}'`
        );

        console.log(`✅ Resultado de la actualización:`, metadata);

        if (metadata.affectedRows > 0) {
            console.log('🎉 ÉXITO: Se ha eliminado el ID de cliente inválido. El próximo intento de pago creará uno nuevo en Live Mode.');
        } else {
            console.log('⚠️ AVISO: No se encontró ningún usuario con ese ID de cliente específico. Puede que ya se haya borrado o el ID sea diferente.');

            // Opción B: Limpiar por email si conocemos el email del usuario (carlos.opomelilla@gmail.com según logs anteriores)
            console.log('Intentando limpieza por email...');
            const [resultsEmail, metadataEmail] = await sequelize.query(
                `UPDATE users SET stripeCustomerId = NULL WHERE email = 'carlos.opomelilla@gmail.com'`
            );
            console.log(`✅ Resultado por email:`, metadataEmail);
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

fixStripeCustomer();
