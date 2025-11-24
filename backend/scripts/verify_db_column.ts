
import { Recompensa, User } from '../src/models';
import sequelize from '../src/config/database';

async function verifyColumnLength() {
    try {
        await sequelize.authenticate();
        console.log('✅ Connected to DB');

        // Create a dummy user if needed or use existing
        let user = await User.findOne();
        if (!user) {
            user = await User.create({
                firstName: 'Test',
                lastName: 'Length',
                email: 'test_length@example.com',
                password: 'password',
                // ... other required fields
            } as any);
        }

        const longString = "Condecoraciones extranjeras (recompensas militares concedidas por organización u organismo internacional)";
        console.log(`📝 Attempting to save string of length: ${longString.length}`);

        // Create reward
        const reward = await Recompensa.create({
            userId: user.id,
            tipo: longString,
            puntos: 0.5
        });

        console.log('✅ Reward created');

        // Fetch back
        const fetchedReward = await Recompensa.findByPk(reward.id);
        console.log(`📥 Fetched string: "${fetchedReward?.tipo}"`);
        console.log(`📏 Fetched length: ${fetchedReward?.tipo.length}`);

        if (fetchedReward?.tipo === longString) {
            console.log('✅ SUCCESS: String saved and retrieved correctly.');
        } else {
            console.error('❌ FAILURE: String mismatch or truncation.');
        }

        // Cleanup
        await reward.destroy();

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await sequelize.close();
    }
}

verifyColumnLength();
