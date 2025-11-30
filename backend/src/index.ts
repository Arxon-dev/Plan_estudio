import express, { Application } from 'express'; // Force restart 3
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database';
import { errorHandler } from './middleware/errorHandler';

// Cargar variables de entorno
dotenv.config();

const app: Application = express();
const PORT = Number(process.env.PORT) || 3001;

console.log('🔍 PORT detectado:', process.env.PORT);
console.log('🔍 PORT usado:', PORT);

import authRoutes from './routes/auth';
import studyPlanRoutes from './routes/studyPlans';
import themeRoutes from './routes/themes';
import adminRoutes from './routes/admin';
import testRoutes from './routes/tests';
import aiRoutes from './routes/aiRoutes';
import guideRoutes from './routes/guide';
import sessionRoutes from './routes/sessions';

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

// Webhook de Stripe (necesita raw body)
import { PaymentController } from './controllers/PaymentController';
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), PaymentController.handleWebhook);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Aumentar timeout a 2 minutos (120000ms) para peticiones largas a Gemini
app.use((req, res, next) => {
  req.setTimeout(120000);
  res.setTimeout(120000, () => {
    console.log('Request has timed out.');
    res.status(408).send('Request has timed out.');
  });
  next();
});

// Middleware de mantenimiento
import { maintenanceMiddleware } from './middleware/maintenance';
app.use(maintenanceMiddleware);

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/themes', themeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/tests', testRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/guide', guideRoutes);
app.use('/api/sessions', sessionRoutes);
import marketingRoutes from './routes/marketing';
app.use('/api/marketing', marketingRoutes);
import announcementRoutes from './routes/announcements';
app.use('/api/announcements', announcementRoutes);
import paymentRoutes from './routes/payments';
app.use('/api/payments', paymentRoutes);
import baremoRoutes from './routes/baremo';
app.use('/api/baremo', baremoRoutes);
import rankingRoutes from './routes/ranking';
app.use('/api/ranking', rankingRoutes);
import chatRoutes from './routes/chat';
app.use('/api/chat', chatRoutes);
import simulacroRoutes from './routes/simulacros';
app.use('/api/simulacros', simulacroRoutes);

// Manejador de errores
app.use(errorHandler);

// Función para iniciar el servidor
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida correctamente');

    // NO sincronizar modelos automáticamente para evitar conflictos
    // Las tablas ya existen en la BD (creadas por migraciones)
    console.log('ℹ️ DB Sync deshabilitado - Usando tablas existentes');

    // Iniciar servidor
    // Railway detecta automáticamente el puerto desde process.env.PORT
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📚 API disponible en http://0.0.0.0:${PORT}/api`);
      console.log(`🏥 Health check: http://0.0.0.0:${PORT}/api/health`);
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
