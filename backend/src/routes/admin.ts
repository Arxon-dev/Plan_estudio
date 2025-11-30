import { Router } from 'express';
import AdminController from '@controllers/AdminController';
import { AdminBaremoController } from '@controllers/AdminBaremoController';
import AITestController from '@controllers/AITestController';
import TestController from '@controllers/TestController';
import { AITrackingController } from '@controllers/AITrackingController';
import { authMiddleware } from '@middleware/auth';
import { exec } from 'child_process';
import path from 'path';

const router = Router();

/**
 * @route   GET /api/admin/stats
 * @desc    Obtiene estadísticas generales (solo admin)
 * @access  Private (Admin only)
 */
router.get('/stats', authMiddleware, AdminController.getStatistics);

/**
 * @route   GET /api/admin/ai-usage/stats
 * @desc    Obtener estadísticas de uso de IA (solo admin)
 * @access  Private (Admin only)
 */
router.get('/ai-usage/stats', authMiddleware, AITrackingController.getStats);

/**
 * @route   GET /api/admin/check
 * @desc    Verifica si el usuario actual es admin
 * @access  Private
 */
router.get('/check', authMiddleware, AdminController.checkAdminStatus);

/**
 * @route   POST /api/admin/tests/generate
 * @desc    Generar preguntas con IA (solo admin)
 * @access  Private (Admin only)
 */
router.post('/tests/generate', authMiddleware, AITestController.generateQuestions);

/**
 * @route   POST /api/admin/questions/import-gift
 * @desc    Importar preguntas desde formato GIFT (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/import-gift', authMiddleware, TestController.importGiftQuestions);

/**
 * @route   POST /api/admin/questions/import-gift-mixed
 * @desc    Importar preguntas mixtas (simulacros) desde GIFT (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/import-gift-mixed', authMiddleware, TestController.importMixedGiftQuestions);

/**
 * @route   POST /api/admin/questions/preview-gift
 * @desc    Vista previa de importación GIFT sin guardar (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/preview-gift', authMiddleware, TestController.previewGiftImport);

/**
 * @route   GET /api/admin/questions/:themeId
 * @desc    Listar todas las preguntas de un tema (solo admin)
 * @access  Private (Admin only)
 */
router.get('/questions/:themeId', authMiddleware, TestController.getQuestionsByTheme);

/**
 * @route   DELETE /api/admin/questions/:questionId
 * @desc    Eliminar una pregunta específica (solo admin)
 * @access  Private (Admin only)
 */
router.delete('/questions/:questionId', authMiddleware, TestController.deleteQuestion);

/**
 * @route   POST /api/admin/questions/delete-bulk
 * @desc    Eliminar múltiples preguntas (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions/delete-bulk', authMiddleware, TestController.deleteBulkQuestions);

/**
 * @route   DELETE /api/admin/questions/theme/:themeId
 * @desc    Eliminar todas las preguntas de un tema (solo admin)
 * @access  Private (Admin only)
 */
router.delete('/questions/theme/:themeId', authMiddleware, TestController.deleteQuestionsByTheme);

/**
 * @route   POST /api/admin/questions
 * @desc    Crear una nueva pregunta manualmente (solo admin)
 * @access  Private (Admin only)
 */
router.post('/questions', authMiddleware, TestController.createQuestion);

/**
 * @route   PUT /api/admin/questions/:questionId
 * @desc    Actualizar una pregunta existente (solo admin)
 * @access  Private (Admin only)
 */
router.put('/questions/:questionId', authMiddleware, TestController.updateQuestion);

/**
 * @route   GET /api/admin/settings
 * @desc    Obtener configuraciones del sistema (solo admin)
 * @access  Private (Admin only)
 */
router.get('/settings', authMiddleware, AdminController.getSettings);

/**
 * @route   PUT /api/admin/settings
 * @desc    Actualizar configuraciones del sistema (solo admin)
 * @access  Private (Admin only)
 */
router.put('/settings', authMiddleware, AdminController.updateSettings);

/**
 * @route   POST /api/admin/system/test-ai-connection
 * @desc    Probar conexión con proveedor de IA (solo admin)
 * @access  Private (Admin only)
 */
router.post('/system/test-ai-connection', authMiddleware, AdminController.testAIConnection);

/**
 * @route   GET /api/admin/users
 * @desc    Obtener lista de usuarios (solo admin)
 * @access  Private (Admin only)
 */
router.get('/users', authMiddleware, AdminController.getUsers);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Obtener detalles de un usuario (solo admin)
 * @access  Private (Admin only)
 */
router.get('/users/:id', authMiddleware, AdminController.getUserById);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Actualizar usuario (solo admin)
 * @access  Private (Admin only)
 */
router.put('/users/:id', authMiddleware, AdminController.updateUser);

/**
 * @route   GET /api/admin/users/:id/logs
 * @desc    Obtener historial de cambios de un usuario (solo admin)
 * @access  Private (Admin only)
 */
router.get('/users/:id/logs', authMiddleware, AdminController.getUserLogs);

/**
 * @route   GET /api/admin/users/:id/progress
 * @desc    Obtener progreso detallado de un usuario (solo admin)
 * @access  Private (Admin only)
 */
router.get('/users/:id/progress', authMiddleware, AdminController.getUserProgress);

/**
 * @route   GET /api/admin/users/:userId/baremo
 * @desc    Obtener baremo de un usuario (solo admin)
 * @access  Private (Admin only)
 */
router.get('/users/:userId/baremo', authMiddleware, AdminBaremoController.getUserBaremo);

/**
 * @route   PUT /api/admin/users/:userId/baremo
 * @desc    Actualizar baremo de un usuario (solo admin)
 * @access  Private (Admin only)
 */
router.put('/users/:userId/baremo', authMiddleware, AdminBaremoController.updateUserBaremo);

// --- Syllabus Management ---
import { SyllabusController } from '../controllers/SyllabusController';

router.get('/syllabus', authMiddleware, SyllabusController.getSyllabus);
router.post('/syllabus/blocks', authMiddleware, SyllabusController.createBlock);
router.put('/syllabus/blocks/reorder', authMiddleware, SyllabusController.reorderBlocks);
router.put('/syllabus/blocks/:id', authMiddleware, SyllabusController.updateBlock);
router.delete('/syllabus/blocks/:id', authMiddleware, SyllabusController.deleteBlock);

router.post('/syllabus/themes', authMiddleware, SyllabusController.createTheme);
router.put('/syllabus/themes/:id', authMiddleware, SyllabusController.updateTheme);
router.delete('/syllabus/themes/:id', authMiddleware, SyllabusController.deleteTheme);

// --- Guide Management ---
import { GuideController } from '../controllers/GuideController';

router.get('/guide', authMiddleware, GuideController.getAllSections);
router.post('/guide', authMiddleware, GuideController.createSection);
router.put('/guide/:id', authMiddleware, GuideController.updateSection);
router.put('/guide/:id/toggle', authMiddleware, GuideController.toggleVisibility);

// --- Marketing & Pricing Management ---
import { MarketingController } from '../controllers/MarketingController';

// Plans
router.get('/marketing/plans', authMiddleware, MarketingController.getAllPlans);
router.post('/marketing/plans', authMiddleware, MarketingController.createPlan);
router.put('/marketing/plans/reorder', authMiddleware, MarketingController.reorderPlans);
router.put('/marketing/plans/:id', authMiddleware, MarketingController.updatePlan);
router.delete('/marketing/plans/:id', authMiddleware, MarketingController.deletePlan);

// Content
router.get('/marketing/sections', authMiddleware, MarketingController.getMarketingSections);
router.put('/marketing/sections/:page/:sectionId', authMiddleware, MarketingController.updateMarketingSection);

// --- Announcements Management ---
import { AnnouncementController } from '../controllers/AnnouncementController';

router.get('/announcements', authMiddleware, AnnouncementController.getAllAnnouncements);
router.post('/announcements', authMiddleware, AnnouncementController.createAnnouncement);
router.put('/announcements/:id', authMiddleware, AnnouncementController.updateAnnouncement);
router.delete('/announcements/:id', authMiddleware, AnnouncementController.deleteAnnouncement);

// --- System Logs ---
import { SystemLogController } from '../controllers/SystemLogController';

router.get('/system/logs', authMiddleware, SystemLogController.getLogs);

/**
 * @route   POST /api/admin/load-docs-to-railway
 * @desc    Cargar documentos en el servidor (solo admin)
 * @access  Private (Admin only)
 */
router.post('/load-docs-to-railway', authMiddleware, async (req, res) => {
    try {
        const scriptPath = path.join(__dirname, '../scripts/loadDocuments.ts');
        const command = `npx ts-node -r tsconfig-paths/register "${scriptPath}"`;

        console.log('🚀 Iniciando carga de documentos vía Admin API...');

        exec(command, { cwd: path.join(__dirname, '../../') }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Error ejecutando load-docs: ${error.message}`);
                return;
            }
            if (stderr) {
                console.error(`⚠️ Stderr load-docs: ${stderr}`);
            }
            console.log(`✅ Salida load-docs: ${stdout}`);
        });

        res.json({ message: 'Proceso de carga de documentos iniciado en segundo plano.' });

    } catch (error: any) {
        console.error('Error en load-docs-to-railway:', error);
        res.status(500).json({ error: 'Error iniciando el proceso', details: error.message });
    }
});

export default router;
