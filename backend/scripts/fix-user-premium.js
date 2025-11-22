require('dotenv').config({ path: 'backend/.env' });
const mysql = require('mysql2/promise');

async function fixUserPremium() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            port: process.env.DB_PORT
        });

        console.log('✅ Connected to DB');

        const email = 'prueba@gmail.com';

        const [result] = await connection.execute(
            `UPDATE users 
             SET isPremium = 1, 
                 subscriptionStatus = 'trialing', 
                 hasUsedTrial = 1,
                 updatedAt = NOW()
             WHERE email = ?`,
            [email]
        );

        console.log(`✅ Updated user ${email}. Rows affected: ${result.affectedRows}`);

    } catch (error) {
        console.error('❌ Error updating user:', error);
    } finally {
        if (connection) await connection.end();
    }
}

fixUserPremium();
