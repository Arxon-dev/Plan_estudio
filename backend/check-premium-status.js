const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '3306'),
        dialect: 'mysql',
        logging: false
    }
);

async function checkUserPremiumStatus() {
    try {
        console.log('🔍 Conectando a la base de datos...\n');

        await sequelize.authenticate();

        // Obtener últimos 5 usuarios
        const [users] = await sequelize.query(`
      SELECT id, email, firstName, lastName, isPremium, stripeCustomerId, subscriptionStatus, subscriptionEndDate
      FROM users
      ORDER BY id DESC
      LIMIT 5
    `);

        console.log('📊 Últimos 5 usuarios:\n');
        users.forEach(user => {
            console.log(`ID: ${user.id}`);
            console.log(`Email: ${user.email}`);
            console.log(`Nombre: ${user.firstName} ${user.lastName}`);
            console.log(`isPremium: ${user.isPremium ? '✅ SÍ' : '❌ NO'}`);
            console.log(`Stripe Customer ID: ${user.stripeCustomerId || 'N/A'}`);
            console.log(`Subscription Status: ${user.subscriptionStatus || 'N/A'}`);
            console.log(`Subscription End: ${user.subscriptionEndDate || 'N/A'}`);
            console.log('---');
        });

        await sequelize.close();
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkUserPremiumStatus();
