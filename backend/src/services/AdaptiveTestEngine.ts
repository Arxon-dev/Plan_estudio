import TestQuestion, { QuestionDifficulty } from '../models/TestQuestion';
import TestAttempt, { TestType } from '../models/TestAttempt';
import AITestSession, { AdaptiveAlgorithm } from '../models/AITestSession';
import { Op } from 'sequelize';
import AIQuestionGenerator from './AIQuestionGenerator';

interface AdaptiveTestConfig {
  userId: number;
  themeId: number;
  totalQuestions: number;
  startDifficulty?: number;
  algorithm?: AdaptiveAlgorithm;
}

interface QuestionWithAnswer {
  question: TestQuestion;
  userAnswer?: number;
  isCorrect?: boolean;
  timeSpent?: number;
}

class AdaptiveTestEngine {
  /**
   * Ejecutar test adaptativo completo
   */
  async runAdaptiveTest(config: AdaptiveTestConfig) {
    const {
      userId,
      themeId,
      totalQuestions = 15,
      startDifficulty = 5,
      algorithm = AdaptiveAlgorithm.SIMPLE,
    } = config;

    let currentDifficulty = startDifficulty;
    const selectedQuestions: TestQuestion[] = [];
    const difficultyProgression: number[] = [];

    // Crear registro de intento
    const attempt = await TestAttempt.create({
      userId,
      themeId,
      testType: TestType.ADAPTIVE,
      totalQuestions,
      correctAnswers: 0,
      score: 0,
      timeSpent: 0,
      answers: [],
      passThreshold: 70,
      passed: false,
      adaptiveDifficulty: startDifficulty,
    });

    // Seleccionar preguntas adaptándose a las respuestas
    for (let i = 0; i < totalQuestions; i++) {
      const question = await this.selectQuestionByDifficulty(
        themeId,
        currentDifficulty,
        selectedQuestions.map(q => q.id)
      );

      if (!question) {
        // Si no hay pregunta del nivel exacto, intentar generar con IA
        if (process.env.AI_QUESTION_GENERATION === 'true') {
          try {
            const generated = await AIQuestionGenerator.generateQuestion(themeId, currentDifficulty);
            selectedQuestions.push(generated);
            difficultyProgression.push(currentDifficulty);
            continue;
          } catch (error) {
            console.error('Error generando pregunta adaptativa:', error);
          }
        }

        // Si falla IA o está deshabilitada, usar la más cercana
        const fallback = await this.selectNearestQuestion(
          themeId,
          currentDifficulty,
          selectedQuestions.map(q => q.id)
        );
        if (fallback) {
          selectedQuestions.push(fallback);
          difficultyProgression.push(currentDifficulty);
        }
        continue;
      }

      selectedQuestions.push(question);
      difficultyProgression.push(currentDifficulty);

      // Simulación: ajustar dificultad basándose en respuestas esperadas
      // En implementación real, esto se haría después de cada respuesta del usuario
      const estimatedCorrect = this.estimateCorrectProbability(currentDifficulty, i);
      currentDifficulty = this.adjustDifficulty(currentDifficulty, estimatedCorrect);
    }

    // Crear sesión de IA para tracking
    await AITestSession.create({
      userId,
      themeId,
      testAttemptId: attempt.id,
      initialDifficulty: startDifficulty,
      finalDifficulty: currentDifficulty,
      adaptiveAlgorithm: algorithm,
      aiAnalysis: {
        difficultyProgression,
        questionsSelected: selectedQuestions.length,
        aiGeneratedCount: 0,
      },
      generatedQuestions: 0,
      personalizedFeedback: 'Test adaptativo completado. Las preguntas se ajustaron según tu nivel.',
    });

    return {
      attemptId: attempt.id,
      questions: selectedQuestions.map(q => ({
        id: q.id,
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
      })),
      initialDifficulty: startDifficulty,
      finalDifficulty: currentDifficulty,
    };
  }

  /**
   * Seleccionar pregunta por dificultad numérica
   */
  private async selectQuestionByDifficulty(
    themeId: number,
    difficulty: number,
    excludeIds: number[]
  ): Promise<TestQuestion | null> {
    const difficultyLevel = this.mapDifficultyToLevel(difficulty);

    const question = await TestQuestion.findOne({
      where: {
        themeId,
        difficulty: difficultyLevel,
        id: {
          [Op.notIn]: excludeIds.length > 0 ? excludeIds : [0],
        },
      },
      order: [['usageCount', 'ASC'], ['successRate', 'ASC']],
    });

    return question;
  }

  /**
   * Seleccionar pregunta más cercana si no hay del nivel exacto
   */
  private async selectNearestQuestion(
    themeId: number,
    targetDifficulty: number,
    excludeIds: number[]
  ): Promise<TestQuestion | null> {
    const questions = await TestQuestion.findAll({
      where: {
        themeId,
        id: {
          [Op.notIn]: excludeIds.length > 0 ? excludeIds : [0],
        },
      },
      order: [['usageCount', 'ASC']],
      limit: 20,
    });

    if (questions.length === 0) return null;

    // Encontrar la pregunta más cercana al nivel objetivo
    let nearest = questions[0];
    let minDiff = Math.abs(this.getQuestionDifficulty(nearest) - targetDifficulty);

    for (const q of questions) {
      const diff = Math.abs(this.getQuestionDifficulty(q) - targetDifficulty);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = q;
      }
    }

    return nearest;
  }

  /**
   * Ajustar dificultad según aciertos/fallos
   */
  private adjustDifficulty(currentDifficulty: number, isCorrect: boolean): number {
    if (isCorrect) {
      // Aumentar dificultad si acierta
      return Math.min(10, currentDifficulty + 0.8);
    } else {
      // Reducir dificultad si falla
      return Math.max(1, currentDifficulty - 1.2);
    }
  }

  /**
   * Calcular nivel de maestría basado en respuestas
   */
  calculateMastery(answers: QuestionWithAnswer[]): number {
    if (answers.length === 0) return 0;

    let totalDifficulty = 0;
    let correctWeightedSum = 0;

    answers.forEach(({ question, isCorrect }) => {
      const difficulty = this.getQuestionDifficulty(question);
      totalDifficulty += difficulty;
      if (isCorrect) {
        correctWeightedSum += difficulty;
      }
    });

    // Maestría = (suma ponderada correctas / suma total dificultades) * 100
    return (correctWeightedSum / totalDifficulty) * 100;
  }

  /**
   * Mapear dificultad numérica a nivel
   */
  private mapDifficultyToLevel(difficulty: number): QuestionDifficulty {
    if (difficulty <= 3) return QuestionDifficulty.EASY;
    if (difficulty <= 7) return QuestionDifficulty.MEDIUM;
    return QuestionDifficulty.HARD;
  }

  /**
   * Obtener dificultad numérica de una pregunta
   */
  private getQuestionDifficulty(question: TestQuestion): number {
    switch (question.difficulty) {
      case QuestionDifficulty.EASY: return 2;
      case QuestionDifficulty.MEDIUM: return 5;
      case QuestionDifficulty.HARD: return 8;
      default: return 5;
    }
  }

  /**
   * Estimar probabilidad de acierto (para simulación)
   */
  private estimateCorrectProbability(difficulty: number, questionIndex: number): boolean {
    // Simulación simple: más probable acertar preguntas fáciles
    const baseProb = Math.max(0.3, 1 - (difficulty / 10));
    const learningBonus = questionIndex * 0.02; // Mejora con el tiempo
    const finalProb = Math.min(0.9, baseProb + learningBonus);
    
    return Math.random() < finalProb;
  }
}

export default new AdaptiveTestEngine();
