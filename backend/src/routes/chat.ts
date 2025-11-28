import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { chatLimitsMiddleware } from '../middleware/chatLimits';
import * as ChatController from '../controllers/chatController';

const router = express.Router();

// Middleware de autenticación para todas las rutas de chat
router.use(authMiddleware);

// Obtener uso (sin límite de consumo, solo auth)
router.get('/usage', ChatController.getUsageStats);

// Enviar mensaje (con verificación de límites)
router.post('/', chatLimitsMiddleware, ChatController.sendMessage);

export default router;
