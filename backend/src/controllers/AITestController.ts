import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import AIQuestionGenerator from '../services/AIQuestionGenerator';
import AdaptiveTestEngine from '../services/AdaptiveTestEngine';
import AIAnalysisService from '../services/AIAnalysisService';
import TestAttempt from '../models/TestAttempt';
import { QuestionDifficulty } from '../models/TestQuestion';

class AITestController {
  /**
   * POST /api/tests/adaptive/start
   * Iniciar test adaptativo con IA
   */
  async startAdaptiveTest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { themeId, questionCount = 15, startDifficulty = 5 } = req.body;

      if (!themeId) {
        return res.status(400).json({ message: 'Theme ID requerido' });
      }

      // Iniciar test adaptativo
      const result = await AdaptiveTestEngine.runAdaptiveTest({
        userId,
        themeId,
        totalQuestions: questionCount,
        startDifficulty,
      });

      return res.json(result);
    } catch (error: any) {
      console.error('Error en startAdaptiveTest:', error);
      return res.status(500).json({ message: error.message || 'Error al iniciar test adaptativo' });
    }
  }

  /**
   * GET /api/tests/analysis
   * Obtener análisis con IA del rendimiento del usuario
   */
  async getAIAnalysis(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      // Verificar que tenga tests completados
      const testsCount = await TestAttempt.count({
        where: { userId },
      });

      if (testsCount === 0) {
        return res.json({
          message: 'Completa al menos un test para recibir análisis personalizado',
          weakAreas: [],
          strongAreas: [],
          recommendations: [],
        });
      }

      const analysis = await AIAnalysisService.analyzeUserPerformance(userId);

      return res.json(analysis);
    } catch (error: any) {
      console.error('Error en getAIAnalysis:', error);
      return res.status(500).json({ message: error.message || 'Error al obtener análisis' });
    }
  }

  /**
   * GET /api/tests/recommendations
   * Obtener recomendaciones personalizadas
   */
  async getRecommendations(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const recommendations = await AIAnalysisService.generateRecommendations(userId);
      const weakAreas = await AIAnalysisService.identifyWeakAreas(userId);

      return res.json({
        recommendations,
        weakAreas,
      });
    } catch (error: any) {
      console.error('Error en getRecommendations:', error);
      return res.status(500).json({ message: error.message || 'Error al obtener recomendaciones' });
    }
  }

  /**
   * POST /api/admin/tests/generate
   * Generar preguntas con IA (solo admin)
   */
  async generateQuestions(req: AuthRequest, res: Response) {
    try {
      const { themeId, count = 5, difficulty } = req.body;

      if (!themeId) {
        return res.status(400).json({ message: 'Theme ID requerido' });
      }

      if (count > 20) {
        return res.status(400).json({ message: 'Máximo 20 preguntas por solicitud' });
      }

      // Verificar si la generación con IA está habilitada
      if (process.env.AI_QUESTION_GENERATION !== 'true') {
        return res.status(403).json({ 
          message: 'La generación de preguntas con IA está deshabilitada' 
        });
      }

      const questions = await AIQuestionGenerator.generateBulkQuestions(
        themeId,
        count,
        { difficulty: difficulty as QuestionDifficulty }
      );

      return res.json({
        message: `${questions.length} preguntas generadas exitosamente`,
        questions: questions.map(q => ({
          id: q.id,
          question: q.question,
          difficulty: q.difficulty,
          source: q.source,
        })),
      });
    } catch (error: any) {
      console.error('Error en generateQuestions:', error);
      return res.status(500).json({ message: error.message || 'Error al generar preguntas' });
    }
  }

  /**
   * POST /api/tests/weakness-test
   * Generar test centrado en debilidades detectadas
   */
  async createWeaknessTest(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;

      const weakAreas = await AIAnalysisService.identifyWeakAreas(userId);

      if (weakAreas.length === 0) {
        return res.status(400).json({ 
          message: 'No se detectaron áreas débiles. Completa más tests primero.' 
        });
      }

      // TODO: Implementar lógica para crear test de debilidades
      // Por ahora solo retornamos las áreas débiles

      return res.json({
        message: 'Test de debilidades preparado',
        weakAreas,
        recommendation: 'Estudia estos temas antes de realizar el test',
      });
    } catch (error: any) {
      console.error('Error en createWeaknessTest:', error);
      return res.status(500).json({ message: error.message || 'Error al crear test de debilidades' });
    }
  }
}

export default new AITestController();
