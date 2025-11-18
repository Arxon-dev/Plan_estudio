import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3001;

const routes = require('./routes').default;

// Middlewares
// CORS con lista de orígenes permitidos (separados por comas)
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:5174')
  .split(',')
  .map(o => o.trim());

console.log('🔧 CORS_ORIGIN configurado:', process.env.CORS_ORIGIN);
console.log('✅ Orígenes permitidos:', allowedOrigins);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (p.ej., curl, tests) y orígenes en la lista
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: origen no permitido: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api', routes);

// Manejador de errores
app.use(errorHandler);

// Función para iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // Sincronizar modelos solo si está habilitado explícitamente (evita ALTER en tablas existentes)
    const shouldSync = process.env.DB_SYNC === 'true';
    if (shouldSync) {
      const alter = process.env.DB_SYNC_ALTER === 'true';
      await sequelize.sync({ alter });
      console.log(`✅ Modelos sincronizados (alter=${alter})`);
    } else {
      console.log('ℹ️ DB Sync deshabilitado (set DB_SYNC=true para habilitar)');
    }

    // Iniciar servidor
    // En producción (Docker/Railway), escuchar en 0.0.0.0 para aceptar conexiones externas
    const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
    app.listen(PORT, host, () => {
      console.log(`🚀 Servidor corriendo en http://${host}:${PORT}`);
      console.log(`📚 API disponible en http://${host}:${PORT}/api`);
      console.log(`🏥 Health check: http://${host}:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Manejo de cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Cerrando servidor...');
  await sequelize.close();
  process.exit(0);
});

// Iniciar servidor
startServer();
