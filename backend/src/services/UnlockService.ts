import ThemeProgress, { ThemeLevel } from '../models/ThemeProgress';
import StudySession, { SessionType } from '../models/StudySession';
import TestAttempt from '../models/TestAttempt';

class UnlockService {
  /**
   * Desbloquear tema al completar primera sesión de estudio
   * LOCKED → BRONZE
   */
  async unlockByStudySession(userId: number, themeId: number) {
    let progress = await ThemeProgress.findOne({
      where: { userId, themeId },
    });

    if (!progress) {
      // Crear nuevo progreso directamente en BRONZE
      progress = await ThemeProgress.create({
        userId,
        themeId,
        level: ThemeLevel.BRONZE,
        totalTests: 0,
        averageScore: 0,
        bestScore: 0,
        studySessionsCompleted: 1,
        reviewSessionsCompleted: 0,
        testSessionsCompleted: 0,
        masteryLevel: 0,
        lastStudyDate: new Date(),
      });
    } else if (progress.level === ThemeLevel.LOCKED) {
      // Actualizar de LOCKED a BRONZE
      await progress.update({
        level: ThemeLevel.BRONZE,
        studySessionsCompleted: progress.studySessionsCompleted + 1,
        lastStudyDate: new Date(),
      });
    } else {
      // Solo incrementar contador si ya está desbloqueado
      await progress.update({
        studySessionsCompleted: progress.studySessionsCompleted + 1,
        lastStudyDate: new Date(),
      });
    }

    return progress;
  }

  /**
   * Verificar si un tema está desbloqueado para tests
   */
  async checkTestAccess(userId: number, themeId: number): Promise<{
    hasAccess: boolean;
    reason?: string;
    currentLevel?: ThemeLevel;
  }> {
    const progress = await ThemeProgress.findOne({
      where: { userId, themeId },
    });

    if (!progress) {
      return {
        hasAccess: false,
        reason: 'Debes completar al menos una sesión de estudio antes de hacer tests',
        currentLevel: ThemeLevel.LOCKED,
      };
    }

    if (progress.level === ThemeLevel.LOCKED) {
      return {
        hasAccess: false,
        reason: 'Debes completar al menos una sesión de estudio antes de hacer tests',
        currentLevel: ThemeLevel.LOCKED,
      };
    }

    return {
      hasAccess: true,
      currentLevel: progress.level,
    };
  }

  /**
   * Obtener requisitos para desbloquear siguiente nivel
   */
  async getUnlockRequirements(userId: number, themeId: number) {
    const progress = await ThemeProgress.findOne({
      where: { userId, themeId },
    });

    if (!progress) {
      return {
        currentLevel: ThemeLevel.LOCKED,
        nextLevel: ThemeLevel.BRONZE,
        requirements: [
          'Completar 1 sesión de estudio del tema',
        ],
      };
    }

    switch (progress.level) {
      case ThemeLevel.LOCKED:
        return {
          currentLevel: ThemeLevel.LOCKED,
          nextLevel: ThemeLevel.BRONZE,
          requirements: [
            'Completar 1 sesión de estudio del tema',
          ],
        };

      case ThemeLevel.BRONZE:
        return {
          currentLevel: ThemeLevel.BRONZE,
          nextLevel: ThemeLevel.SILVER,
          requirements: [
            'Aprobar el primer test obligatorio (≥70%)',
          ],
        };

      case ThemeLevel.SILVER:
        return {
          currentLevel: ThemeLevel.SILVER,
          nextLevel: ThemeLevel.GOLD,
          requirements: [
            'Obtener promedio ≥85% en los últimos 3 tests',
          ],
        };

      case ThemeLevel.GOLD:
        return {
          currentLevel: ThemeLevel.GOLD,
          nextLevel: ThemeLevel.DIAMOND,
          requirements: [
            'Obtener promedio ≥95% en los últimos 5 tests',
          ],
        };

      case ThemeLevel.DIAMOND:
        return {
          currentLevel: ThemeLevel.DIAMOND,
          nextLevel: null,
          requirements: [
            '¡Has alcanzado el nivel máximo! 💎',
          ],
        };

      default:
        return {
          currentLevel: progress.level,
          nextLevel: null,
          requirements: [],
        };
    }
  }

  /**
   * Verificar límite de tests por día (máximo 2 del mismo tema)
   */
  async checkDailyLimit(userId: number, themeId: number): Promise<{
    canTakeTest: boolean;
    testsToday: number;
    reason?: string;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const testsToday = await TestAttempt.count({
      where: {
        userId,
        themeId,
        createdAt: {
          $gte: today,
        },
      },
    });

    const MAX_TESTS_PER_DAY = 2;

    if (testsToday >= MAX_TESTS_PER_DAY) {
      return {
        canTakeTest: false,
        testsToday,
        reason: `Has alcanzado el límite de ${MAX_TESTS_PER_DAY} tests por día para este tema. Vuelve mañana.`,
      };
    }

    return {
      canTakeTest: true,
      testsToday,
    };
  }
}

export default new UnlockService();
