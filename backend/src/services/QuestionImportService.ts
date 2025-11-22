import TestQuestion, { QuestionDifficulty, QuestionSource } from '../models/TestQuestion';
import Theme from '../models/Theme';
import GiftParser, { ParsedQuestion } from '../utils/GiftParser';
import { Transaction } from 'sequelize';
import sequelize from '@config/database';

interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: string[];
  skippedDetails: Array<{ question: string; reason: string }>;
  questions: TestQuestion[];
}

interface ImportOptions {
  themeId?: number;
  skipDuplicates?: boolean;
  overwriteExisting?: boolean;
}

class QuestionImportService {
  /**
   * Importar preguntas desde formato GIFT
   */
  async importFromGift(
    giftContent: string,
    options: ImportOptions = {}
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [],
      skippedDetails: [],
      questions: [],
    };

    // Validar formato GIFT
    const validation = GiftParser.validate(giftContent);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    // Parsear preguntas
    let parsedQuestions: ParsedQuestion[];
    try {
      parsedQuestions = GiftParser.parse(giftContent);
    } catch (error: any) {
      result.errors.push(`Error al parsear GIFT: ${error.message}`);
      return result;
    }

    if (parsedQuestions.length === 0) {
      result.errors.push('No se encontraron preguntas válidas en el archivo');
      return result;
    }

    // Validar tema si se especifica
    if (options.themeId) {
      const theme = await Theme.findByPk(options.themeId);
      if (!theme) {
        result.errors.push(`Tema con ID ${options.themeId} no encontrado`);
        return result;
      }
    }

    // Importar preguntas en transacción
    const transaction = await sequelize.transaction();

    try {
      for (const parsed of parsedQuestions) {
        try {
          const { question: imported, skipReason } = await this.importSingleQuestion(
            parsed,
            options,
            transaction
          );

          if (imported) {
            result.imported++;
            result.questions.push(imported);
          } else {
            result.skipped++;
            if (skipReason) {
              result.skippedDetails.push({
                question: parsed.question.substring(0, 100),
                reason: skipReason
              });
            }
          }
        } catch (error: any) {
          result.errors.push(
            `Error importando pregunta "${parsed.question.substring(0, 50)}...": ${error.message}`
          );
        }
      }

      await transaction.commit();
      result.success = true;
    } catch (error: any) {
      await transaction.rollback();
      result.errors.push(`Error en transacción: ${error.message}`);
      result.success = false;
    }

    return result;
  }

  /**
   * Importar una pregunta individual
   */
  private async importSingleQuestion(
    parsed: ParsedQuestion,
    options: ImportOptions,
    transaction: Transaction
  ): Promise<{ question: TestQuestion | null; skipReason?: string }> {
    // Verificar duplicados si está habilitado
    if (options.skipDuplicates) {
      const existing = await TestQuestion.findOne({
        where: {
          question: parsed.question,
          ...(options.themeId ? { themeId: options.themeId } : {}),
        },
        transaction,
      });

      if (existing) {
        if (options.overwriteExisting) {
          await existing.destroy({ transaction });
        } else {
          return { question: null, skipReason: 'Pregunta duplicada' }; // Saltar duplicado
        }
      }
    }

    // Validar que tenga al menos 2 opciones
    if (parsed.options.length < 2) {
      throw new Error('La pregunta debe tener al menos 2 opciones');
    }

    // Validar que tenga exactamente 4 opciones (rellenar si faltan)
    while (parsed.options.length < 4) {
      parsed.options.push(`Opción ${parsed.options.length + 1}`);
    }

    // Si tiene más de 4, tomar solo las primeras 4
    if (parsed.options.length > 4) {
      parsed.options = parsed.options.slice(0, 4);
      // Ajustar índice de respuesta correcta si es necesario
      if (parsed.correctAnswerIndex > 3) {
        parsed.correctAnswerIndex = 0;
      }
    }

    // Validar índice de respuesta correcta
    if (
      parsed.correctAnswerIndex < 0 ||
      parsed.correctAnswerIndex >= parsed.options.length
    ) {
      throw new Error('Índice de respuesta correcta inválido');
    }

    // Determinar dificultad
    const difficulty = parsed.difficulty
      ? QuestionDifficulty[parsed.difficulty as keyof typeof QuestionDifficulty]
      : QuestionDifficulty.MEDIUM;

    // Crear pregunta
    const question = await TestQuestion.create(
      {
        themeId: options.themeId || 1, // Default al tema 1 si no se especifica
        themePart: parsed.themePart,  // Incluir parte detectada automáticamente
        question: parsed.question,
        options: parsed.options,
        correctAnswer: parsed.correctAnswerIndex,
        explanation: parsed.explanation || 'Sin explicación disponible.',
        difficulty,
        source: QuestionSource.MANUAL,
        tags: parsed.tags,
        usageCount: 0,
        successRate: 0,
      },
      { transaction }
    );

    return { question };
  }

  /**
   * Importar preguntas mixtas (simulacros)
   * Detecta automáticamente el tema basándose en tags
   */
  async importMixedQuestions(giftContent: string): Promise<ImportResult> {
    const result: ImportResult = {
      success: false,
      imported: 0,
      skipped: 0,
      errors: [],
      skippedDetails: [],
      questions: [],
    };

    // Validar formato
    const validation = GiftParser.validate(giftContent);
    if (!validation.valid) {
      result.errors = validation.errors;
      return result;
    }

    // Parsear preguntas
    let parsedQuestions: ParsedQuestion[];
    try {
      parsedQuestions = GiftParser.parse(giftContent);
    } catch (error: any) {
      result.errors.push(`Error al parsear GIFT: ${error.message}`);
      return result;
    }

    // Obtener todos los temas para mapeo
    const themes = await Theme.findAll();
    const themeMap = new Map<string, number>();

    themes.forEach(theme => {
      const key = `tema ${theme.themeNumber}`.toLowerCase();
      themeMap.set(key, theme.id);
      themeMap.set(theme.title.toLowerCase(), theme.id);
    });

    // Importar preguntas
    const transaction = await sequelize.transaction();

    try {
      for (const parsed of parsedQuestions) {
        try {
          // Detectar tema desde tags
          let themeId: number | undefined;

          for (const tag of parsed.tags) {
            const tagLower = tag.toLowerCase();

            // Buscar coincidencia exacta
            if (themeMap.has(tagLower)) {
              themeId = themeMap.get(tagLower);
              break;
            }

            // Buscar coincidencia parcial
            for (const [key, id] of themeMap.entries()) {
              if (tagLower.includes(key) || key.includes(tagLower)) {
                themeId = id;
                break;
              }
            }

            if (themeId) break;
          }

          if (!themeId) {
            const reason = `No se pudo detectar tema para pregunta: "${parsed.question.substring(0, 50)}..."`;
            result.errors.push(reason);
            result.skipped++;
            result.skippedDetails.push({
              question: parsed.question.substring(0, 100),
              reason: "No se pudo detectar el tema"
            });
            continue;
          }

          const { question: imported, skipReason } = await this.importSingleQuestion(
            parsed,
            { themeId, skipDuplicates: true },
            transaction
          );

          if (imported) {
            result.imported++;
            result.questions.push(imported);
          } else {
            result.skipped++;
            if (skipReason) {
              result.skippedDetails.push({
                question: parsed.question.substring(0, 100),
                reason: skipReason
              });
            }
          }
        } catch (error: any) {
          result.errors.push(
            `Error importando pregunta: ${error.message}`
          );
        }
      }

      await transaction.commit();
      result.success = true;
    } catch (error: any) {
      await transaction.rollback();
      result.errors.push(`Error en transacción: ${error.message}`);
    }

    return result;
  }

  /**
   * Vista previa de importación (sin guardar)
   */
  async previewImport(giftContent: string): Promise<{
    valid: boolean;
    questionCount: number;
    questions: Array<{
      question: string;
      optionsCount: number;
      hasExplanation: boolean;
      difficulty: string;
      tags: string[];
    }>;
    errors: string[];
  }> {
    const validation = GiftParser.validate(giftContent);

    if (!validation.valid) {
      return {
        valid: false,
        questionCount: 0,
        questions: [],
        errors: validation.errors,
      };
    }

    const parsed = GiftParser.parse(giftContent);

    return {
      valid: true,
      questionCount: parsed.length,
      questions: parsed.map(q => ({
        question: q.question.substring(0, 100) + (q.question.length > 100 ? '...' : ''),
        optionsCount: q.options.length,
        hasExplanation: q.explanation.length > 0,
        difficulty: q.difficulty || 'MEDIUM',
        tags: q.tags,
      })),
      errors: [],
    };
  }
}

export default new QuestionImportService();
