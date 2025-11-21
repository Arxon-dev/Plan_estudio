import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import TestService from '../services/TestService';
import { TestType } from '../models/TestAttempt';
import { QuestionDifficulty } from '../models/TestQuestion';
import ThemeProgress, { ThemeLevel } from '../models/ThemeProgress';
import UserTestStats from '../models/UserTestStats';
import TestAttempt from '../models/TestAttempt';
import Theme from '../models/Theme';
import QuestionImportService from '../services/QuestionImportService';
import TestQuestion from '../models/TestQuestion';

class TestController {
  /**
   * GET /api/tests/dashboard
   * Obtener dashboard completo de tests
   */
  async getDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Obtener estadísticas globales
      const stats = await UserTestStats.findOne({
        where: { userId },
      });

      // Obtener progreso por temas
      const themeProgress = await ThemeProgress.findAll({
        where: { userId },
        include: [
          {
            model: Theme,
            as: 'theme',
            attributes: ['id', 'title', 'block', 'themeNumber'],
          },
        ],
        order: [['averageScore', 'DESC']],
      });

      // Obtener tests obligatorios pendientes (próximos 7 días)
      const upcomingTests = await TestAttempt.findAll({
        where: {
          userId,
          testType: TestType.SCHEDULED,
          passed: false,
        },
        include: [
          {
            model: Theme,
            as: 'theme',
            attributes: ['id', 'title'],
          },
        ],
        limit: 5,
      });

      // Historial reciente (últimos 10 tests)
      const recentTests = await TestAttempt.findAll({
        where: { userId },
        include: [
          {
            model: Theme,
            as: 'theme',
            attributes: ['id', 'title'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit: 10,
      });

      // Convertir score de string a number
      const recentTestsFormatted = recentTests.map(test => ({
        ...test.toJSON(),
        score: test.score != null ? parseFloat(test.score as any) : null,
        passThreshold: parseFloat(test.passThreshold as any),
      }));

      return res.json({
        stats: stats ? {
          totalTests: stats.totalTests,
          globalSuccessRate: parseFloat(stats.globalSuccessRate as any),
          examReadinessScore: parseFloat(stats.examReadinessScore as any),
          monthlyPracticeTests: stats.monthlyPracticeTests,
        } : {
          totalTests: 0,
          globalSuccessRate: 0,
          examReadinessScore: 0,
          monthlyPracticeTests: 0,
        },
        themeProgress,
        upcomingTests,
        recentTests: recentTestsFormatted,
      });
    } catch (error) {
      console.error('Error en getDashboard:', error);
      return res.status(500).json({ message: 'Error al obtener dashboard' });
    }
  }

  /**
   * GET /api/tests/themes
   * Obtener temas con progreso
   */
  async getThemesWithProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const block = req.query.block as string | undefined;

      // Obtener todos los temas
      const themes = await Theme.findAll({
        where: block ? { block } : {},
        order: [['block', 'ASC'], ['themeNumber', 'ASC']],
      });

      // Obtener progreso del usuario para cada tema
      const progress = await ThemeProgress.findAll({
        where: { userId },
      });

      const progressMap = new Map(
        progress.map(p => [p.themeId, p])
      );

      // Combinar temas con progreso
      const themesWithProgress = themes.map(theme => ({
        id: theme.id,
        title: theme.title,
        block: theme.block,
        themeNumber: theme.themeNumber,
        estimatedHours: theme.estimatedHours,
        complexity: theme.complexity,
        progress: progressMap.get(theme.id) || {
          level: ThemeLevel.LOCKED,
          totalTests: 0,
          averageScore: 0,
          bestScore: 0,
        },
      }));

      return res.json(themesWithProgress);
    } catch (error) {
      console.error('Error en getThemesWithProgress:', error);
      return res.status(500).json({ message: 'Error al obtener temas' });
    }
  }

  /**
   * POST /api/tests/start
   * Iniciar un nuevo test
   */
  async startTest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const { themeId, themePart, testType, questionCount, difficulty } = req.body;

      // Validaciones
      if (!testType) {
        return res.status(400).json({ message: 'Tipo de test requerido' });
      }

      if (!Object.values(TestType).includes(testType)) {
        return res.status(400).json({ message: 'Tipo de test inválido' });
      }

      if (!questionCount || questionCount < 1 || questionCount > 100) {
        return res.status(400).json({ message: 'Cantidad de preguntas inválida (1-100)' });
      }

      // Verificar límite mensual
      const canTake = await TestService.canUserTakeTest(userId, testType);
      if (!canTake) {
        return res.status(403).json({
          message: 'Has alcanzado el límite mensual de tests gratuitos. Actualiza a Premium para tests ilimitados.'
        });
      }

      // Iniciar test
      const result = await TestService.startTest({
        userId,
        themeId,
        themePart,  // Incluir parte del tema
        testType,
        questionCount,
        difficulty,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Error en startTest:', error);
      return res.status(500).json({ message: error.message || 'Error al iniciar test' });
    }
  }

  /**
   * POST /api/tests/:attemptId/complete
   * Completar y enviar respuestas de un test
   */
  async completeTest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const { attemptId } = req.params;
      const { answers } = req.body;

      if (!answers || !Array.isArray(answers)) {
        return res.status(400).json({ message: 'Respuestas inválidas' });
      }

      // Verificar que el intento pertenece al usuario
      const attempt = await TestAttempt.findByPk(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: 'Intento de test no encontrado' });
      }

      if (attempt.userId !== userId) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      // Completar test
      const result = await TestService.completeTest(Number(attemptId), answers);

      return res.json(result);
    } catch (error: any) {
      console.error('Error en completeTest:', error);
      return res.status(500).json({ message: error.message || 'Error al completar test' });
    }
  }

  /**
   * GET /api/tests/results/:attemptId
   * Obtener resultados detallados de un test
   */
  async getTestResults(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const { attemptId } = req.params;

      // Verificar que el intento pertenece al usuario
      const attempt = await TestAttempt.findByPk(attemptId);
      if (!attempt) {
        return res.status(404).json({ message: 'Intento de test no encontrado' });
      }

      if (attempt.userId !== userId) {
        return res.status(403).json({ message: 'No autorizado' });
      }

      const results = await TestService.getTestResults(Number(attemptId));

      return res.json(results);
    } catch (error: any) {
      console.error('Error en getTestResults:', error);
      return res.status(500).json({ message: error.message || 'Error al obtener resultados' });
    }
  }

  /**
   * GET /api/tests/history
   * Obtener historial de tests del usuario
   */
  async getHistory(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;
      const themeId = req.query.themeId ? parseInt(req.query.themeId as string) : undefined;

      const where: any = { userId };
      if (themeId) {
        where.themeId = themeId;
      }

      const { count, rows: attempts } = await TestAttempt.findAndCountAll({
        where,
        include: [
          {
            model: Theme,
            as: 'theme',
            attributes: ['id', 'title', 'block'],
          },
        ],
        order: [['createdAt', 'DESC']],
        limit,
        offset,
      });

      return res.json({
        total: count,
        attempts,
        hasMore: offset + limit < count,
      });
    } catch (error) {
      console.error('Error en getHistory:', error);
      return res.status(500).json({ message: 'Error al obtener historial' });
    }
  }

  /**
   * GET /api/tests/stats
   * Obtener estadísticas globales del usuario
   */
  async getStats(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const stats = await UserTestStats.findOne({
        where: { userId },
      });

      if (!stats) {
        return res.json({
          totalTests: 0,
          totalQuestionsAnswered: 0,
          globalSuccessRate: 0,
          totalTimeSpent: 0,
          monthlyPracticeTests: 0,
          overallMasteryLevel: 0,
          examReadinessScore: 0,
          averageTestSpeed: 0,
          consistencyScore: 0,
        });
      }

      return res.json(stats);
    } catch (error) {
      console.error('Error en getStats:', error);
      return res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }

  /**
   * POST /api/admin/questions/import-gift
   * Importar preguntas desde formato GIFT
   */
  async importGiftQuestions(req: AuthRequest, res: Response) {
    try {
      const { giftContent, themeId, skipDuplicates, overwriteExisting } = req.body;

      if (!giftContent || typeof giftContent !== 'string') {
        return res.status(400).json({ message: 'Contenido GIFT requerido' });
      }

      const result = await QuestionImportService.importFromGift(giftContent, {
        themeId: themeId ? parseInt(themeId) : undefined,
        skipDuplicates: skipDuplicates !== false, // Por defecto true
        overwriteExisting: overwriteExisting === true, // Por defecto false
      });

      if (!result.success) {
        return res.status(400).json({
          message: 'Error al importar preguntas',
          errors: result.errors,
        });
      }

      return res.json({
        message: `Importación exitosa: ${result.imported} preguntas importadas, ${result.skipped} omitidas`,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
        questions: result.questions.map(q => ({
          id: q.id,
          question: q.question.substring(0, 100) + '...',
          difficulty: q.difficulty,
        })),
      });
    } catch (error: any) {
      console.error('Error en importGiftQuestions:', error);
      return res.status(500).json({ message: error.message || 'Error al importar preguntas' });
    }
  }

  /**
   * POST /api/admin/questions/import-gift-mixed
   * Importar preguntas mixtas (simulacros) desde GIFT
   */
  async importMixedGiftQuestions(req: AuthRequest, res: Response) {
    try {
      const { giftContent } = req.body;

      if (!giftContent || typeof giftContent !== 'string') {
        return res.status(400).json({ message: 'Contenido GIFT requerido' });
      }

      const result = await QuestionImportService.importMixedQuestions(giftContent);

      if (!result.success) {
        return res.status(400).json({
          message: 'Error al importar preguntas mixtas',
          errors: result.errors,
        });
      }

      return res.json({
        message: `Importación exitosa: ${result.imported} preguntas importadas, ${result.skipped} omitidas`,
        imported: result.imported,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch (error: any) {
      console.error('Error en importMixedGiftQuestions:', error);
      return res.status(500).json({ message: error.message || 'Error al importar preguntas mixtas' });
    }
  }

  /**
   * POST /api/admin/questions/preview-gift
   * Vista previa de importación GIFT (sin guardar)
   */
  async previewGiftImport(req: AuthRequest, res: Response) {
    try {
      const { giftContent } = req.body;

      if (!giftContent || typeof giftContent !== 'string') {
        return res.status(400).json({ message: 'Contenido GIFT requerido' });
      }

      const preview = await QuestionImportService.previewImport(giftContent);

      return res.json(preview);
    } catch (error: any) {
      console.error('Error en previewGiftImport:', error);
      return res.status(500).json({ message: error.message || 'Error al previsualizar preguntas' });
    }
  }

  /**
   * GET /api/tests/ranking
   * Obtener ranking y estadísticas comparativas del usuario
   */
  async getUserRanking(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Calcular rankings actualizados
      await TestService.calculateUserRankings();

      // Obtener contexto de ranking para el usuario
      const rankingContext = await TestService.getUserRankingContext(userId);

      return res.json(rankingContext);
    } catch (error: any) {
      console.error('Error en getUserRanking:', error);
      return res.status(500).json({ message: error.message || 'Error al obtener ranking' });
    }
  }

  /**
   * GET /api/tests/weaknesses
   * Analizar y obtener debilidades del usuario
   */
  async getUserWeaknesses(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Analizar debilidades del usuario
      const weaknessAnalysis = await TestService.analyzeUserWeaknesses(userId);

      return res.json(weaknessAnalysis);
    } catch (error: any) {
      console.error('Error en getUserWeaknesses:', error);
      return res.status(500).json({ message: error.message || 'Error al analizar debilidades' });
    }
  }

  /**
   * POST /api/tests/weakness-focused
   * Generar test enfocado en debilidades identificadas
   */
  async createWeaknessFocusedTest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { questionCount, themeIds, blockNames } = req.body;

      // Generar test enfocado en debilidades
      const test = await TestService.generateWeaknessFocusedTest(userId, {
        questionCount,
        themeIds,
        blockNames
      });

      return res.json(test);
    } catch (error: any) {
      console.error('Error en createWeaknessFocusedTest:', error);
      return res.status(500).json({ message: error.message || 'Error al crear test de debilidades' });
    }
  }

  /**
   * GET /api/tests/question/:questionId
   * Obtener una pregunta específica con su explicación
   */
  async getQuestion(req: AuthRequest, res: Response) {
    try {
      const { questionId } = req.params;
      const userId = req.user!.id;

      // Verificar que la pregunta existe
      const question = await TestQuestion.findByPk(questionId);

      if (!question) {
        return res.status(404).json({ message: 'Pregunta no encontrada' });
      }

      // Devolver la pregunta con su explicación
      return res.json({
        id: question.id,
        question: question.question,
        options: Array.isArray(question.options) ? question.options : JSON.parse(question.options as any),
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        difficulty: question.difficulty
      });
    } catch (error: any) {
      console.error('Error en getQuestion:', error);
      return res.status(500).json({ message: error.message || 'Error al obtener pregunta' });
    }
  }

  /**
   * GET /api/admin/questions/:themeId
   * Listar todas las preguntas de un tema (solo admin)
   */
  async getQuestionsByTheme(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { themeId } = req.params;

      // Verificar que es admin
      const User = (await import('../models/User')).default;
      const user = await User.findByPk(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      const questions = await TestQuestion.findAll({
        where: { themeId: parseInt(themeId) },
        order: [['id', 'ASC']],
        include: [{ model: Theme, as: 'theme' }]
      });

      return res.json({
        count: questions.length,
        themeId: parseInt(themeId),
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          difficulty: q.difficulty,
          optionsCount: Array.isArray(q.options) ? q.options.length : JSON.parse(q.options as any).length,
          hasExplanation: !!q.explanation,
          createdAt: q.createdAt
        }))
      });
    } catch (error: any) {
      console.error('Error al obtener preguntas:', error);
      return res.status(500).json({ message: 'Error al obtener preguntas' });
    }
  }

  /**
   * DELETE /api/admin/questions/:questionId
   * Eliminar una pregunta específica (solo admin)
   */
  async deleteQuestion(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { questionId } = req.params;

      // Verificar que es admin
      const User = (await import('../models/User')).default;
      const user = await User.findByPk(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      const question = await TestQuestion.findByPk(parseInt(questionId));
      if (!question) {
        return res.status(404).json({ message: 'Pregunta no encontrada' });
      }

      await question.destroy();

      return res.json({
        message: 'Pregunta eliminada exitosamente',
        questionId: parseInt(questionId)
      });
    } catch (error: any) {
      console.error('Error al eliminar pregunta:', error);
      return res.status(500).json({ message: 'Error al eliminar pregunta' });
    }
  }

  /**
   * POST /api/admin/questions/delete-bulk
   * Eliminar múltiples preguntas (solo admin)
   */
  async deleteBulkQuestions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { questionIds } = req.body;

      // Verificar que es admin
      const User = (await import('../models/User')).default;
      const user = await User.findByPk(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      if (!Array.isArray(questionIds) || questionIds.length === 0) {
        return res.status(400).json({ message: 'IDs de preguntas inválidos' });
      }

      const deleted = await TestQuestion.destroy({
        where: { id: questionIds }
      });

      return res.json({
        message: `${deleted} preguntas eliminadas exitosamente`,
        deletedCount: deleted
      });
    } catch (error: any) {
      console.error('Error al eliminar preguntas:', error);
      return res.status(500).json({ message: 'Error al eliminar preguntas' });
    }
  }

  /**
   * DELETE /api/admin/questions/theme/:themeId
   * Eliminar todas las preguntas de un tema (solo admin)
   */
  async deleteQuestionsByTheme(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { themeId } = req.params;

      // Verificar que es admin
      const User = (await import('../models/User')).default;
      const user = await User.findByPk(userId);
      if (!user?.isAdmin) {
        return res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
      }

      const deleted = await TestQuestion.destroy({
        where: { themeId: parseInt(themeId) }
      });

      return res.json({
        message: `${deleted} preguntas del tema ${themeId} eliminadas exitosamente`,
        deletedCount: deleted,
        themeId: parseInt(themeId)
      });
    } catch (error: any) {
      console.error('Error al eliminar preguntas del tema:', error);
      return res.status(500).json({ message: 'Error al eliminar preguntas del tema' });
    }
  }
}

export default new TestController();
