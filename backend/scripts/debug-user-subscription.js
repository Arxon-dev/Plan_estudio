const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

async function checkUsers() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');

        const [results] = await sequelize.query(`
      SELECT id, email, "firstName", "lastName", "isPremium", "subscriptionStatus", "stripeCustomerId"
      FROM users
      WHERE "stripeCustomerId" IS NOT NULL OR "isPremium" = true
    `);

        console.log('Users with Stripe Customer ID or Premium Status:');
        console.table(results);

    } catch (error) {
        console.error('Unable to connect to the database:', error);
    } finally {
        await sequelize.close();
    }
}

checkUsers();
