import User from '../models/User';
import sequelize from '../config/database';

const resetUser = async () => {
    try {
        const email = 'carlos.opomelilla@gmail.com';
        const user = await User.findOne({ where: { email } });

        if (!user) {
            console.log(`❌ Usuario ${email} no encontrado.`);
            process.exit(1);
        }

        console.log(`🔍 Estado actual de ${user.email}:`);
        console.log(`   - isPremium: ${user.isPremium}`);
        console.log(`   - hasUsedTrial: ${user.hasUsedTrial}`);
        console.log(`   - subscriptionStatus: ${user.subscriptionStatus}`);

        user.isPremium = false;
        user.hasUsedTrial = false;
        user.subscriptionStatus = null;
        user.subscriptionEndDate = null;
        // Opcional: Limpiar stripeCustomerId si queremos simular un usuario virgen en Stripe también,
        // pero eso podría crear duplicados en Stripe Dashboard. Mejor dejarlo y que Stripe maneje la parte de cobro.
        // Para la lógica de "oferta de prueba" de nuestra app, basta con hasUsedTrial = false.

        await user.save();

        console.log(`✅ Usuario reseteado correctamente.`);
        console.log(`   - isPremium: ${user.isPremium}`);
        console.log(`   - hasUsedTrial: ${user.hasUsedTrial}`);
        console.log(`   - subscriptionStatus: ${user.subscriptionStatus}`);

    } catch (error) {
        console.error('❌ Error al resetear usuario:', error);
    } finally {
        await sequelize.close();
    }
};

resetUser();
