const { Sequelize } = require('sequelize');
require('dotenv').config();

// Configuración de conexión (ajustar según tu .env)
const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
        host: process.env.DB_HOST,
        dialect: 'mysql', // o 'sqlite', 'postgres', etc.
        logging: console.log
    }
);

async function addMethodologyColumn() {
    try {
        await sequelize.authenticate();
        console.log('✅ Conexión establecida');

        // Verificar si la columna ya existe
        const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_NAME = 'study_plans' 
      AND COLUMN_NAME = 'methodology'
    `);

        if (results.length > 0) {
            console.log('⚠️  La columna "methodology" ya existe');
            return;
        }

        // Añadir columna
        await sequelize.query(`
      ALTER TABLE study_plans 
      ADD COLUMN methodology VARCHAR(20) DEFAULT 'rotation' NOT NULL
    `);

        console.log('✅ Columna "methodology" añadida exitosamente');

        // Actualizar planes existentes
        await sequelize.query(`
      UPDATE study_plans 
      SET methodology = 'rotation' 
      WHERE methodology IS NULL
    `);

        console.log('✅ Planes existentes actualizados');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await sequelize.close();
    }
}

addMethodologyColumn();
