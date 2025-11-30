import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { chatLimitsMiddleware } from '../middleware/chatLimits';
import * as ChatController from '../controllers/chatController';

const router = express.Router();

// Middleware de autenticación para todas las rutas de chat
router.use(authMiddleware);

// Obtener uso (sin límite de consumo, solo auth)
router.get('/usage', ChatController.getUsageStats);

// Obtener documentos disponibles
router.get('/documents', ChatController.handleGetDocuments);

// Enviar mensaje (con verificación de límites)
router.post('/', chatLimitsMiddleware, ChatController.sendMessage);

// Generar resumen
router.post('/generate-summary', chatLimitsMiddleware, ChatController.handleGenerateSummary);

// Generar diagrama
router.post('/generate-diagram', chatLimitsMiddleware, ChatController.handleGenerateDiagram);

// Comparar leyes
router.post('/compare-laws', chatLimitsMiddleware, ChatController.handleCompareLaws);

// Generar flashcards
router.post('/generate-flashcards', chatLimitsMiddleware, ChatController.handleGenerateFlashcards);

// Generar mnemotecnia (Nota: chatLimitsMiddleware dejará pasar si no está en la lista de consumo, pero igual lo usamos para validar usuario)
router.post('/generate-mnemonic', chatLimitsMiddleware, ChatController.handleGenerateMnemonic);

export default router;
