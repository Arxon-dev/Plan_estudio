import TestQuestion, { QuestionDifficulty } from '../models/TestQuestion';
import TestAttempt, { TestType } from '../models/TestAttempt';
import ThemeProgress, { ThemeLevel } from '../models/ThemeProgress';
import UserTestStats from '../models/UserTestStats';
import User from '../models/User';
import Theme from '../models/Theme';
import Simulacro from '../models/Simulacro';
import SettingsService from './SettingsService';
import { Op, fn, col, literal } from 'sequelize';

interface StartTestOptions {
  userId: number;
  themeId?: number;
  themePart?: number;  // Número de parte del tema (1, 2, 3, 4) o undefined
  testType: TestType;
  questionCount: number;
  difficulty?: QuestionDifficulty;
  simulacroId?: number;
}

interface AnswerDetail {
  questionId: number;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent: number;
}

class TestService {
  /**
   * Iniciar un nuevo test
   */
  async startTest(options: StartTestOptions) {
    const { userId, themeId, themePart, testType, questionCount, difficulty, simulacroId } = options;

    // Validar que el tema existe si se especifica
    if (themeId) {
      const theme = await Theme.findByPk(themeId);
      if (!theme) {
        throw new Error('Tema no encontrado');
      }
    }

    // Seleccionar preguntas según el tipo de test
    let questions: TestQuestion[] = [];
    
    if (simulacroId) {
        const simulacro = await Simulacro.findByPk(simulacroId);
        if (!simulacro || !simulacro.active) {
            throw new Error('Simulacro no encontrado o inactivo');
        }
        // Fetch questions from IDs
        const allQuestions = await TestQuestion.findAll({
            where: { id: simulacro.questionIds }
        });
        
        // Order them
        const questionMap = new Map(allQuestions.map(q => [q.id, q]));
        questions = simulacro.questionIds
            .map(qid => questionMap.get(qid))
            .filter((q): q is TestQuestion => q !== undefined);

    } else if (difficulty) {
      questions = await this.selectQuestionsByDifficulty(themeId!, themePart, difficulty, questionCount);
    } else {
      questions = await this.generateRandomTest(themeId!, themePart, questionCount, userId);
    }

    if (questions.length < questionCount && !simulacroId) {
      throw new Error(`No hay suficientes preguntas disponibles. Se encontraron ${questions.length} de ${questionCount} requeridas.`);
    }

    // Crear registro de intento (sin completar)
    const attempt = await TestAttempt.create({
      userId,
      themeId,
      simulacroId,
      testType,
      totalQuestions: questions.length,
      correctAnswers: 0,
      score: 0,
      timeSpent: 0,
      answers: [],
      passThreshold: 70,
      passed: false,
    });

    return {
      attemptId: attempt.id,
      questions: questions.map(q => {
        const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options as any);
        const originalCorrectAnswer = q.correctAnswer;

        // Crear array de índices para barajar
        const indices = options.map((_: any, i: number) => i);

        // Algoritmo Fisher-Yates para barajar
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Reordenar opciones según índices barajados
        const shuffledOptions = indices.map((idx: number) => options[idx]);

        return {
          id: q.id,
          question: q.question,
          options: shuffledOptions,
          difficulty: q.difficulty,
          // NO enviamos correctAnswer al frontend
          // Guardamos el mapeo: shuffledIndex -> originalIndex en el array indices
          _shuffleMap: indices, // Para debugging (opcional, se puede eliminar)
        };
      }),
    };
  }

  /**
   * Seleccionar preguntas por dificultad
   */
  async selectQuestionsByDifficulty(
    themeId: number,
    themePart: number | undefined,
    difficulty: QuestionDifficulty,
    count: number
  ): Promise<TestQuestion[]> {
    const whereClause: any = {
      themeId,
      difficulty,
    };

    // Filtrar por parte si se especifica
    if (themePart !== undefined) {
      whereClause.themePart = themePart;
    }

    const questions = await TestQuestion.findAll({
      where: whereClause,
      order: [['usageCount', 'ASC']], // Priorizar preguntas menos usadas
      limit: count,
    });

    return questions;
  }

  /**
   * Obtener IDs de preguntas para simulacro
   */
  async getQuestionsForSimulacro(
    themeIds: number[],
    count: number
  ): Promise<number[]> {
    // Si no hay temas seleccionados, usar todos
    const whereClause: any = {};
    
    if (themeIds && themeIds.length > 0) {
      whereClause.themeId = {
        [Op.in]: themeIds
      };
    }

    // Usar Sequelize.literal('RAND()') para selección aleatoria
    const questions = await TestQuestion.findAll({
      where: whereClause,
      attributes: ['id'],
      order: literal('RAND()'),
      limit: count
    });

    return questions.map(q => q.id);
  }

  /**
   * Generar test aleatorio evitando preguntas recientes
   */
  async generateRandomTest(
    themeId: number,
    themePart: number | undefined,
    count: number,
    userId: number
  ): Promise<TestQuestion[]> {
    // Obtener preguntas respondidas recientemente (últimos 7 días)
    const recentAttempts = await TestAttempt.findAll({
      where: {
        userId,
        themeId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      attributes: ['answers'],
    });

    const recentQuestionIds = new Set<number>();
    recentAttempts.forEach(attempt => {
      // Parsear answers si es string
      const answers = typeof attempt.answers === 'string'
        ? JSON.parse(attempt.answers)
        : attempt.answers;

      if (Array.isArray(answers)) {
        answers.forEach((answer: AnswerDetail) => {
          recentQuestionIds.add(answer.questionId);
        });
      }
    });

    // Construir whereClause dinámicamente
    const whereClause: any = {
      themeId,
      id: {
        [Op.notIn]: Array.from(recentQuestionIds),
      },
    };

    // Filtrar por parte si se especifica
    if (themePart !== undefined) {
      whereClause.themePart = themePart;
    }

    // Seleccionar preguntas que NO estén en recientes
    const questions = await TestQuestion.findAll({
      where: whereClause,
      order: [['usageCount', 'ASC']],
      limit: count,
    });

    // Si no hay suficientes, completar con preguntas recientes
    if (questions.length < count) {
      const additionalWhereClause: any = {
        themeId,
        id: {
          [Op.in]: Array.from(recentQuestionIds),
        },
      };

      // Filtrar por parte también en preguntas adicionales
      if (themePart !== undefined) {
        additionalWhereClause.themePart = themePart;
      }

      const additional = await TestQuestion.findAll({
        where: additionalWhereClause,
        order: [['usageCount', 'ASC']],
        limit: count - questions.length,
      });
      questions.push(...additional);
    }

    return questions;
  }

  /**
   * Completar test y calcular resultados
   */
  async completeTest(attemptId: number, answers: AnswerDetail[]) {
    const attempt = await TestAttempt.findByPk(attemptId);
    if (!attempt) {
      throw new Error('Intento de test no encontrado');
    }

    // Obtener las preguntas para verificar respuestas correctas
    const questionIds = answers.map(a => a.questionId);
    const questions = await TestQuestion.findAll({
      where: {
        id: {
          [Op.in]: questionIds,
        },
      },
    });

    const questionsMap = new Map(questions.map(q => [q.id, q]));

    // Validar y marcar respuestas correctas
    const validatedAnswers: AnswerDetail[] = answers.map((answer: any) => {
      const question = questionsMap.get(answer.questionId);
      if (!question) {
        throw new Error(`Pregunta ${answer.questionId} no encontrada`);
      }

      // Parsear opciones de la pregunta original
      const originalOptions = Array.isArray(question.options)
        ? question.options
        : JSON.parse(question.options as any);

      // La respuesta correcta original está en question.correctAnswer
      const correctOptionText = originalOptions[question.correctAnswer];

      // Comparar por TEXTO de la opción en lugar de índice
      // El frontend envía userAnswerText con el texto de la opción seleccionada
      const isCorrect = answer.userAnswerText === correctOptionText;

      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer, // Índice barajado (para referencia)
        userAnswerText: answer.userAnswerText, // Texto de la opción seleccionada
        shuffledOptions: answer.shuffledOptions, // Opciones en orden barajado
        correctAnswer: question.correctAnswer, // Índice original
        isCorrect,
        timeSpent: answer.timeSpent,
      };
    });

    // Calcular estadísticas
    const correctAnswers = validatedAnswers.filter(a => a.isCorrect).length;
    const score = (correctAnswers / validatedAnswers.length) * 100;
    const totalTime = validatedAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
    const passed = score >= attempt.passThreshold;

    // Actualizar intento
    await attempt.update({
      answers: validatedAnswers,
      correctAnswers,
      score,
      timeSpent: totalTime,
      passed,
    });

    // Actualizar contadores de uso de preguntas
    for (const question of questions) {
      const answer = validatedAnswers.find(a => a.questionId === question.id);
      if (answer) {
        const newUsageCount = question.usageCount + 1;
        const newSuccessCount = answer.isCorrect
          ? (question.successRate * question.usageCount + 100) / newUsageCount
          : (question.successRate * question.usageCount) / newUsageCount;

        await question.update({
          usageCount: newUsageCount,
          successRate: newSuccessCount,
        });
      }
    }

    // Actualizar progreso del tema
    if (attempt.themeId) {
      await this.updateThemeProgress(attempt.userId, attempt.themeId, attempt);
    }

    // Actualizar estadísticas globales del usuario
    await this.updateUserStats(attempt.userId, attempt);

    return {
      attemptId: attempt.id,
      score,
      correctAnswers,
      totalQuestions: validatedAnswers.length,
      passed,
      timeSpent: totalTime,
      answers: validatedAnswers,
    };
  }

  /**
   * Actualizar progreso del tema
   */
  async updateThemeProgress(userId: number, themeId: number, attempt: TestAttempt) {
    let progress = await ThemeProgress.findOne({
      where: { userId, themeId },
    });

    if (!progress) {
      // Crear nuevo progreso
      progress = await ThemeProgress.create({
        userId,
        themeId,
        level: ThemeLevel.LOCKED,
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        studySessionsCompleted: 0,
        reviewSessionsCompleted: 0,
        testSessionsCompleted: 0,
        masteryLevel: 0,
      });
    }

    // Actualizar estadísticas
    const newTotalTests = progress.totalTests + 1;
    const newAverageScore =
      (progress.averageScore * progress.totalTests + attempt.score) / newTotalTests;
    const newBestScore = Math.max(progress.bestScore, attempt.score);
    const newWorstScore = progress.worstScore
      ? Math.min(progress.worstScore, attempt.score)
      : attempt.score;

    await progress.update({
      totalTests: newTotalTests,
      averageScore: newAverageScore,
      bestScore: newBestScore,
      worstScore: newWorstScore,
      testSessionsCompleted: progress.testSessionsCompleted + 1,
      lastTestDate: new Date(),
      masteryLevel: newAverageScore, // Simplificado por ahora
    });

    // Actualizar nivel según rendimiento
    await this.updateThemeLevel(userId, themeId);
  }

  /**
   * Actualizar nivel del tema según criterios
   */
  async updateThemeLevel(userId: number, themeId: number) {
    const progress = await ThemeProgress.findOne({
      where: { userId, themeId },
    });

    if (!progress) return;

    // Obtener últimos 5 tests
    const recentTests = await TestAttempt.findAll({
      where: {
        userId,
        themeId,
        passed: true,
      },
      order: [['createdAt', 'DESC']],
      limit: 5,
    });

    if (recentTests.length === 0) return;

    const avgRecentScore =
      recentTests.reduce((sum, t) => sum + t.score, 0) / recentTests.length;

    let newLevel = progress.level;

    // LOCKED → BRONZE: Completar 1 sesión STUDY (se gestiona en StudySession)
    // BRONZE → SILVER: Aprobar primer test (≥70%)
    if (progress.level === ThemeLevel.BRONZE && progress.totalTests >= 1 && avgRecentScore >= 70) {
      newLevel = ThemeLevel.SILVER;
    }
    // SILVER → GOLD: Promedio ≥85% en últimos 3 tests
    else if (progress.level === ThemeLevel.SILVER && recentTests.length >= 3) {
      const last3 = recentTests.slice(0, 3);
      const avg3 = last3.reduce((sum, t) => sum + t.score, 0) / 3;
      if (avg3 >= 85) {
        newLevel = ThemeLevel.GOLD;
      }
    }
    // GOLD → DIAMOND: Promedio ≥95% en últimos 5 tests
    else if (progress.level === ThemeLevel.GOLD && recentTests.length >= 5) {
      const avg5 = recentTests.reduce((sum, t) => sum + t.score, 0) / 5;
      if (avg5 >= 95) {
        newLevel = ThemeLevel.DIAMOND;
      }
    }

    if (newLevel !== progress.level) {
      await progress.update({ level: newLevel });
    }
  }

  /**
   * Actualizar estadísticas globales del usuario
   */
  async updateUserStats(userId: number, attempt: TestAttempt) {
    let stats = await UserTestStats.findOne({
      where: { userId },
    });

    if (!stats) {
      stats = await UserTestStats.create({
        userId,
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

    // Actualizar contadores básicos
    const newTotalTests = stats.totalTests + 1;
    const newTotalQuestions = stats.totalQuestionsAnswered + attempt.totalQuestions;
    const newTotalCorrect =
      (stats.globalSuccessRate / 100) * stats.totalQuestionsAnswered + attempt.correctAnswers;
    const newGlobalSuccessRate = newTotalQuestions > 0 ? (newTotalCorrect / newTotalQuestions) * 100 : 0;

    // Tiempo en minutos (timeSpent viene en segundos)
    const newTotalTimeSpent = stats.totalTimeSpent + Math.floor(attempt.timeSpent / 60);

    const newAverageTestSpeed = newTotalQuestions > 0
      ? (newTotalTimeSpent * 60) / newTotalQuestions
      : 0;

    // Incrementar contador mensual solo para tests de práctica
    const newMonthlyPracticeTests =
      attempt.testType === TestType.PRACTICE
        ? stats.monthlyPracticeTests + 1
        : stats.monthlyPracticeTests;

    // --- CÁLCULO DE COBERTURA DE TEMAS ---
    // 1. Contar total de temas disponibles
    const totalThemes = await Theme.count();

    // 2. Contar temas distintos que el usuario ha intentado
    // Usamos una consulta raw o count con distinct para eficiencia
    const distinctThemesAttempted = await TestAttempt.count({
      where: { userId },
      distinct: true,
      col: 'themeId'
    });

    // 3. Calcular porcentaje de cobertura
    const themeCoverage = totalThemes > 0 ? (distinctThemesAttempted / totalThemes) * 100 : 0;

    // 4. Calcular Nivel de Maestría (Ponderado: 70% Acierto, 30% Cobertura)
    // Esto refleja mejor la preparación real: saber mucho de poco no es estar preparado.
    const overallMasteryLevel = (newGlobalSuccessRate * 0.7) + (themeCoverage * 0.3);

    // 5. Exam Readiness (Similar pero quizás más exigente con la cobertura)
    const examReadinessScore = (newGlobalSuccessRate * 0.6) + (themeCoverage * 0.4);

    await stats.update({
      totalTests: newTotalTests,
      totalQuestionsAnswered: newTotalQuestions,
      globalSuccessRate: newGlobalSuccessRate,
      totalTimeSpent: newTotalTimeSpent,
      monthlyPracticeTests: newMonthlyPracticeTests,
      averageTestSpeed: newAverageTestSpeed,
      overallMasteryLevel: overallMasteryLevel,
      examReadinessScore: examReadinessScore,
    });
  }

  /**
   * Obtener resultados detallados de un test
   */
  async getTestResults(attemptId: number) {
    const attempt = await TestAttempt.findByPk(attemptId, {
      include: [
        {
          model: Theme,
          as: 'theme',
          attributes: ['id', 'title', 'block'],
        },
      ],
    });

    if (!attempt) {
      throw new Error('Intento de test no encontrado');
    }

    // Parsear answers si es string
    const answers = typeof attempt.answers === 'string'
      ? JSON.parse(attempt.answers)
      : attempt.answers;

    if (!Array.isArray(answers)) {
      throw new Error('Formato de respuestas inválido');
    }

    // Obtener las preguntas con explicaciones
    const questionIds = answers.map((a: AnswerDetail) => a.questionId);
    const questions = await TestQuestion.findAll({
      where: {
        id: {
          [Op.in]: questionIds,
        },
      },
    });

    const questionsMap = new Map(questions.map(q => [q.id, q]));

    // Enriquecer respuestas con datos de preguntas
    const enrichedAnswers = answers.map((answer: any) => {
      const question = questionsMap.get(answer.questionId);

      // Obtener opciones originales para identificar la correcta
      const originalOptions = Array.isArray(question?.options)
        ? question.options
        : JSON.parse(question?.options as any);
      const correctOptionText = originalOptions[answer.correctAnswer];

      // Si tenemos opciones barajadas guardadas, usarlas
      // Si no, usar las opciones originales de la BD
      const options = answer.shuffledOptions
        ? answer.shuffledOptions
        : originalOptions;

      return {
        questionId: answer.questionId,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.correctAnswer, // Índice original (no usar para comparar)
        correctOptionText: correctOptionText, // TEXTO de la opción correcta
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent,
        question: question?.question,
        options: options,
        explanation: question?.explanation,
      };
    });

    return {
      id: attempt.id,
      testType: attempt.testType,
      themeId: attempt.themeId,
      score: typeof attempt.score === 'number' ? attempt.score : parseFloat(attempt.score as any),
      correctAnswers: attempt.correctAnswers,
      totalQuestions: attempt.totalQuestions,
      passed: attempt.passed,
      timeSpent: attempt.timeSpent,
      createdAt: attempt.createdAt,
      answers: enrichedAnswers,
    };
  }

  /**
   * Verificar si el usuario puede hacer más tests (límite FREE)
   */
  async canUserTakeTest(userId: number, testType: TestType): Promise<boolean> {
    // Tests obligatorios siempre permitidos
    if (testType === TestType.INITIAL || testType === TestType.SCHEDULED) {
      return true;
    }

    // Obtener usuario para verificar rol
    const user = await User.findByPk(userId);
    if (!user) return false;

    // Admins y Premium no tienen límites
    if (user.isAdmin || user.isPremium) {
      return true;
    }

    const stats = await UserTestStats.findOne({
      where: { userId },
    });

    if (!stats) return true;

    // Obtener límite desde configuración (default: 10)
    const monthlyLimit = await SettingsService.get('TEST_MONTHLY_LIMIT_FREE', 10);

    return stats.monthlyPracticeTests < monthlyLimit;
  }

  /**
   * Resetear contador mensual (ejecutar por cron el día 1 de cada mes)
   */
  async resetMonthlyCounters() {
    await UserTestStats.update(
      {
        monthlyPracticeTests: 0,
        lastMonthlyReset: new Date(),
      },
      {
        where: {},
      }
    );
  }

  /**
   * Calcular y actualizar rankings de todos los usuarios
   */
  async calculateUserRankings() {
    // Obtener todos los usuarios ordenados por examReadinessScore descendente
    const stats = await UserTestStats.findAll({
      order: [['examReadinessScore', 'DESC']],
      attributes: ['id', 'userId', 'examReadinessScore']
    });

    // Actualizar ranking y percentil para cada usuario
    const totalUsers = stats.length;
    for (let i = 0; i < totalUsers; i++) {
      const stat = stats[i];
      const rank = i + 1;
      const percentile = ((totalUsers - rank) / totalUsers) * 100;

      await stat.update({
        userRank: rank,
        topPercentile: parseFloat(percentile.toFixed(2))
      });
    }

    return { updatedUsers: totalUsers };
  }

  /**
   * Obtener ranking de usuarios cercanos al usuario actual
   */
  async getUserRankingContext(userId: number, contextSize: number = 5) {
    // Obtener estadísticas del usuario actual
    const currentUserStats = await UserTestStats.findOne({
      where: { userId },
      attributes: ['id', 'userId', 'examReadinessScore', 'userRank', 'topPercentile'],
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName']
      }]
    });

    if (!currentUserStats) {
      throw new Error('Estadísticas de usuario no encontradas');
    }

    const userRank = currentUserStats.userRank || 0;

    // Calcular rango de usuarios cercanos
    const startRank = Math.max(1, userRank - Math.floor(contextSize / 2));
    const endRank = startRank + contextSize - 1;

    // Obtener usuarios en el rango
    const nearbyUsers = await UserTestStats.findAll({
      where: {
        userRank: {
          [Op.between]: [startRank, endRank]
        }
      },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'firstName', 'lastName']
      }],
      order: [['userRank', 'ASC']]
    });

    // Obtener estadísticas promedio de todos los usuarios
    const avgStats: any = await UserTestStats.findOne({
      attributes: [
        [fn('AVG', col('examReadinessScore')), 'avgReadinessScore'],
        [fn('AVG', col('globalSuccessRate')), 'avgSuccessRate'],
        [fn('COUNT', col('id')), 'totalUsers']
      ]
    });

    const formatUserName = (user: any) => {
      if (!user) return 'Usuario';
      return `${user.firstName} ${user.lastName}`.trim() || user.email.split('@')[0];
    };

    return {
      currentUser: {
        ...currentUserStats.toJSON(),
        userName: formatUserName((currentUserStats as any).user)
      },
      nearbyUsers: nearbyUsers.map((userStat: any) => ({
        userId: userStat.userId,
        userName: formatUserName(userStat.user),
        examReadinessScore: userStat.examReadinessScore,
        userRank: userStat.userRank,
        topPercentile: userStat.topPercentile
      })),
      averageStats: {
        avgReadinessScore: avgStats ? parseFloat(avgStats.get('avgReadinessScore')) : 0,
        avgSuccessRate: avgStats ? parseFloat(avgStats.get('avgSuccessRate')) : 0,
        totalUsers: avgStats ? parseInt(avgStats.get('totalUsers')) : 0
      }
    };
  }

  /**
   * Analizar debilidades del usuario basado en su historial de tests
   */
  async analyzeUserWeaknesses(userId: number) {
    // Obtener todos los intentos de tests del usuario
    const attempts = await TestAttempt.findAll({
      where: { userId },
      include: [{
        model: Theme,
        as: 'theme',
        attributes: ['id', 'title', 'block']
      }],
      order: [['createdAt', 'DESC']],
      limit: 20 // Últimos 20 tests
    });

    if (attempts.length === 0) {
      return {
        weaknesses: [],
        recommendations: [],
        weakestBlock: null,
        strongestBlock: null
      };
    }

    // Parsear respuestas y agrupar por tema/bloque
    const blockStats: Record<string, {
      totalQuestions: number;
      correctAnswers: number;
      themes: Record<string, { total: number; correct: number }>
    }> = {};

    const themeStats: Record<number, {
      totalQuestions: number;
      correctAnswers: number;
      title: string;
      block: string;
    }> = {};

    for (const attempt of attempts) {
      // Parsear answers si es string
      const answers = typeof attempt.answers === 'string'
        ? JSON.parse(attempt.answers)
        : attempt.answers;

      if (!Array.isArray(answers)) continue;

      const theme = (attempt as any)['theme'];
      if (!theme) continue;

      // Inicializar estadísticas de bloque si no existen
      if (!blockStats[theme.block]) {
        blockStats[theme.block] = {
          totalQuestions: 0,
          correctAnswers: 0,
          themes: {}
        };
      }

      // Inicializar estadísticas de tema si no existen
      if (!themeStats[theme.id]) {
        themeStats[theme.id] = {
          totalQuestions: 0,
          correctAnswers: 0,
          title: theme.title,
          block: theme.block
        };
      }

      // Actualizar estadísticas
      for (const answer of answers) {
        blockStats[theme.block].totalQuestions++;
        themeStats[theme.id].totalQuestions++;

        if (answer.isCorrect) {
          blockStats[theme.block].correctAnswers++;
          themeStats[theme.id].correctAnswers++;
        }
      }
    }

    // Calcular porcentajes y encontrar debilidades
    const weaknesses = [];
    const strengths = [];

    // Analizar bloques
    for (const [blockName, stats] of Object.entries(blockStats)) {
      const successRate = stats.totalQuestions > 0
        ? (stats.correctAnswers / stats.totalQuestions) * 100
        : 0;

      weaknesses.push({
        type: 'block',
        name: blockName,
        successRate: parseFloat(successRate.toFixed(2)),
        totalQuestions: stats.totalQuestions,
        correctAnswers: stats.correctAnswers
      });
    }

    // Analizar temas
    for (const [themeId, stats] of Object.entries(themeStats)) {
      const successRate = stats.totalQuestions > 0
        ? (stats.correctAnswers / stats.totalQuestions) * 100
        : 0;

      if (successRate < 70) { // Considerar debilidad si < 70%
        weaknesses.push({
          type: 'theme',
          id: parseInt(themeId),
          name: stats.title,
          block: stats.block,
          successRate: parseFloat(successRate.toFixed(2)),
          totalQuestions: stats.totalQuestions,
          correctAnswers: stats.correctAnswers
        });
      } else if (successRate > 90) { // Considerar fortaleza si > 90%
        strengths.push({
          type: 'theme',
          id: parseInt(themeId),
          name: stats.title,
          block: stats.block,
          successRate: parseFloat(successRate.toFixed(2)),
          totalQuestions: stats.totalQuestions,
          correctAnswers: stats.correctAnswers
        });
      }
    }

    // Ordenar por tasa de éxito (menor primero para debilidades)
    weaknesses.sort((a, b) => a.successRate - b.successRate);
    strengths.sort((a, b) => b.successRate - a.successRate);

    // Encontrar bloque más débil y más fuerte
    const blockWeaknesses = weaknesses.filter(w => w.type === 'block');
    const weakestBlock = blockWeaknesses.length > 0 ? blockWeaknesses[0] : null;
    const strongestBlock = blockWeaknesses.length > 0 ? blockWeaknesses[blockWeaknesses.length - 1] : null;

    // Generar recomendaciones
    const recommendations = [];

    // Recomendación basada en temas débiles
    if (weaknesses.filter(w => w.type === 'theme').length > 0) {
      recommendations.push({
        type: 'practice_weak_themes',
        message: 'Practica los temas donde tienes menor rendimiento',
        details: weaknesses.filter(w => w.type === 'theme').slice(0, 3)
      });
    }

    // Recomendación para reforzar bloques débiles
    if (weakestBlock) {
      recommendations.push({
        type: 'focus_block',
        message: `Refuerza tus conocimientos en el bloque ${weakestBlock.name}`,
        details: [weakestBlock]
      });
    }

    return {
      weaknesses: weaknesses.slice(0, 10), // Limitar a top 10 debilidades
      strengths: strengths.slice(0, 5),   // Limitar a top 5 fortalezas
      recommendations,
      weakestBlock: weakestBlock ? weakestBlock.name : null,
      strongestBlock: strongestBlock ? strongestBlock.name : null
    };
  }

  /**
   * Generar test enfocado en debilidades identificadas
   */
  async generateWeaknessFocusedTest(userId: number, options: {
    questionCount?: number;
    themeIds?: number[];
    blockNames?: string[]
  }) {
    const { questionCount = 10, themeIds = [], blockNames = [] } = options;

    // Obtener debilidades del usuario
    const weaknessAnalysis = await this.analyzeUserWeaknesses(userId);

    // Determinar temas a enfocar
    let targetThemes: number[] = [];

    if (themeIds.length > 0) {
      // Usar temas especificados
      targetThemes = themeIds;
    } else if (blockNames.length > 0) {
      // Obtener temas de los bloques especificados
      const themes = await Theme.findAll({
        where: {
          block: {
            [Op.in]: blockNames
          }
        }
      });
      targetThemes = themes.map(t => t.id);
    } else if (weaknessAnalysis.weaknesses.length > 0) {
      // Usar temas identificados como débiles
      targetThemes = weaknessAnalysis.weaknesses
        .filter(w => w.type === 'theme')
        .map(w => (w as any).id)
        .slice(0, 3); // Limitar a top 3 temas débiles
    } else {
      // Si no hay debilidades identificadas, usar temas aleatorios
      const allThemes = await Theme.findAll();
      targetThemes = allThemes.map(t => t.id).slice(0, 3);
    }

    // Seleccionar preguntas de los temas objetivo
    const questions = await TestQuestion.findAll({
      where: {
        themeId: {
          [Op.in]: targetThemes
        }
      },
      order: [['usageCount', 'ASC']], // Priorizar preguntas menos usadas
      limit: questionCount
    });

    if (questions.length === 0) {
      throw new Error('No se encontraron preguntas para los temas seleccionados');
    }

    // Crear registro de intento (sin completar)
    const attempt = await TestAttempt.create({
      userId,
      themeId: targetThemes[0], // Asociar con el primer tema
      testType: TestType.PRACTICE, // Tipo de test de práctica
      totalQuestions: questions.length,
      correctAnswers: 0,
      score: 0,
      timeSpent: 0,
      answers: [],
      passThreshold: 70,
      passed: false,
    });

    return {
      attemptId: attempt.id,
      questions: questions.map(q => {
        const options = Array.isArray(q.options) ? q.options : JSON.parse(q.options as any);
        const originalCorrectAnswer = q.correctAnswer;

        // Crear array de índices para barajar
        const indices = options.map((_: any, i: number) => i);

        // Algoritmo Fisher-Yates para barajar
        for (let i = indices.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [indices[i], indices[j]] = [indices[j], indices[i]];
        }

        // Reordenar opciones según índices barajados
        const shuffledOptions = indices.map((idx: number) => options[idx]);

        return {
          id: q.id,
          question: q.question,
          options: shuffledOptions,
          difficulty: q.difficulty,
          // NO enviamos correctAnswer al frontend
          // Guardamos el mapeo: shuffledIndex -> originalIndex en el array indices
          _shuffleMap: indices, // Para debugging (opcional, se puede eliminar)
        };
      }),
    };
  }
}

export default new TestService();
