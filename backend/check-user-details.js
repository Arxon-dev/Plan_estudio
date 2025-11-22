const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUser() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        const [rows] = await connection.query(
            'SELECT id, email, isPremium, subscriptionStatus, subscriptionEndDate, cancelAtPeriodEnd FROM users WHERE email = ?',
            ['test01@gmail.com']
        );

        console.log('User Data:', rows[0]);

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

checkUser();
