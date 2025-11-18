import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'u449034524_plan_estudio',
  process.env.DB_USER || 'u449034524_plan_estudio',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 60000, // Aumentar a 60 segundos
      idle: 20000,    // Aumentar a 20 segundos
    },
    retry: {
      max: 3, // Reintentar hasta 3 veces
    },
  }
);

export default sequelize;
