const mysql = require('mysql2/promise');
require('dotenv').config();

async function updateUser() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT || '3306'),
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        // Set subscription end date to 1 month from now
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);

        await connection.query(
            'UPDATE users SET subscriptionEndDate = ? WHERE email = ?',
            [nextMonth, 'test01@gmail.com']
        );

        console.log('✅ User updated successfully');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (connection) await connection.end();
    }
}

updateUser();
