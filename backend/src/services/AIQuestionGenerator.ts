import axios from 'axios';
import TestQuestion, { QuestionDifficulty, QuestionSource } from '../models/TestQuestion';
import Theme from '../models/Theme';

interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  tags: string[];
}

class AIQuestionGenerator {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.Z_AI_API_KEY || '';
    this.apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
    this.model = process.env.Z_AI_MODEL || 'glm-4.5';
  }

  /**
   * Generar una pregunta de test con IA
   */
  async generateQuestion(themeId: number, difficulty: number): Promise<TestQuestion> {
    if (!this.apiKey) {
      throw new Error('API key de Z.AI no configurada');
    }

    const theme = await Theme.findByPk(themeId);
    if (!theme) {
      throw new Error('Tema no encontrado');
    }

    // Obtener preguntas existentes para evitar duplicados
    const existingQuestions = await TestQuestion.findAll({
      where: { themeId },
      attributes: ['question'],
      limit: 50,
    });

    const systemPrompt = this.buildSystemPrompt();
    const userPrompt = this.buildUserPrompt(theme, difficulty, existingQuestions);

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          temperature: 0.7,
          top_p: 0.9,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const generatedText = response.data.choices[0].message.content;
      const parsed = this.parseAndValidate(generatedText);

      // Crear pregunta en la BD
      const question = await TestQuestion.create({
        themeId,
        question: parsed.question,
        options: parsed.options,
        correctAnswer: parsed.correctAnswer,
        explanation: parsed.explanation,
        difficulty: this.mapDifficultyToLevel(difficulty),
        source: QuestionSource.AI_GENERATED,
        aiModel: this.model,
        usageCount: 0,
        successRate: 0,
        tags: parsed.tags,
      });

      return question;
    } catch (error: any) {
      console.error('Error al generar pregunta con IA:', error.response?.data || error.message);
      throw new Error('Error al generar pregunta con IA');
    }
  }

  /**
   * Generar múltiples preguntas de forma masiva
   */
  async generateBulkQuestions(
    themeId: number,
    count: number,
    config?: { difficulty?: QuestionDifficulty }
  ): Promise<TestQuestion[]> {
    const questions: TestQuestion[] = [];
    const difficulties = config?.difficulty
      ? [this.mapLevelToDifficulty(config.difficulty)]
      : [3, 5, 8]; // EASY, MEDIUM, HARD

    for (let i = 0; i < count; i++) {
      const difficulty = difficulties[i % difficulties.length];
      try {
        const question = await this.generateQuestion(themeId, difficulty);
        questions.push(question);

        // Pequeña pausa para no saturar la API
        await this.sleep(1000);
      } catch (error) {
        console.error(`Error generando pregunta ${i + 1}:`, error);
      }
    }

    return questions;
  }

  /**
   * Prompt del sistema con reglas de calidad
   */
  private buildSystemPrompt(): string {
    return `Eres un experto en la creación de preguntas tipo test para oposiciones de las Fuerzas Armadas Españolas.

REGLAS FUNDAMENTALES:

1. PRECISIÓN LEGAL:
   - Todas las preguntas deben basarse en legislación oficial española vigente
   - Cita artículos, fechas y cifras exactas
   - NO inventes datos ni aproximes fechas

2. CALIDAD DE LAS OPCIONES:
   - Exactamente 4 opciones de respuesta
   - Solo 1 respuesta correcta
   - Las 3 incorrectas deben ser plausibles (no obviamente falsas)
   - Las opciones incorrectas deben tener errores sutiles

3. DIFICULTAD:
   - EASY (1-3): Conceptos básicos, fechas clave, definiciones simples
   - MEDIUM (4-7): Aplicación de conceptos, comparaciones, procedimientos
   - HARD (8-10): Análisis profundo, excepciones legales, casos específicos

4. EXPLICACIÓN:
   - Debe justificar por qué la respuesta es correcta
   - Debe explicar por qué las otras opciones son incorrectas
   - Debe incluir referencia legal (artículo, ley, fecha)

RESPONDE SIEMPRE EN JSON con esta estructura exacta:
{
  "question": "texto de la pregunta",
  "options": ["opción A", "opción B", "opción C", "opción D"],
  "correctAnswer": 0,
  "explanation": "explicación detallada con referencias legales",
  "tags": ["tag1", "tag2", "tag3"]
}

IMPORTANTE: Solo devuelve el JSON, sin texto adicional antes o después.`;
  }

  /**
   * Prompt específico por tema y dificultad
   */
  private buildUserPrompt(theme: Theme, difficulty: number, existingQuestions: TestQuestion[]): string {
    const difficultyLevel = this.mapDifficultyToLevel(difficulty);
    const difficultyText = this.getDifficultyInstructions(difficulty);

    const existingTopics = existingQuestions
      .map(q => `- ${q.question.substring(0, 100)}...`)
      .join('\n');

    return `GENERA 1 PREGUNTA DE TEST:

TEMA: ${theme.title}
CONTENIDO DEL TEMA: ${theme.content || 'Legislación relacionada con ' + theme.title}
NIVEL DE DIFICULTAD: ${difficulty}/10 (${difficultyLevel})

${difficultyText}

${existingTopics ? `TÓPICOS YA CUBIERTOS (evita duplicar):\n${existingTopics}\n` : ''}

FORMATO DE RESPUESTA: JSON según estructura especificada`;
  }

  /**
   * Instrucciones específicas por dificultad
   */
  private getDifficultyInstructions(difficulty: number): string {
    if (difficulty <= 3) {
      return `NIVEL FÁCIL (${difficulty}/10):
- Pregunta sobre conceptos básicos o definiciones
- Fechas importantes o datos clave
- Información directa que aparece en el texto legal
- La respuesta correcta debe ser clara y directa`;
    } else if (difficulty <= 7) {
      return `NIVEL MEDIO (${difficulty}/10):
- Pregunta sobre aplicación de conceptos
- Comparación entre diferentes artículos o leyes
- Procedimientos o trámites específicos
- Requiere comprensión del tema, no solo memorización`;
    } else {
      return `NIVEL DIFÍCIL (${difficulty}/10):
- Pregunta sobre casos complejos o excepciones
- Análisis profundo de artículos específicos
- Combinación de múltiples conceptos
- Opciones muy similares que requieren conocimiento detallado`;
    }
  }

  /**
   * Parsear y validar respuesta de IA
   */
  private parseAndValidate(aiResponse: string): GeneratedQuestion {
    // Limpiar el texto para extraer solo el JSON
    let jsonText = aiResponse.trim();

    // Buscar entre ```json y ``` si está presente
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      // Buscar solo entre ``` y ```
      const codeMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonText = codeMatch[1];
      }
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonText);
    } catch (error) {
      console.error('Error parseando JSON de IA:', jsonText);
      throw new Error('Respuesta de IA no es JSON válido');
    }

    const errors: string[] = [];

    // Validar campos requeridos
    if (!parsed.question || parsed.question.length < 20) {
      errors.push('Pregunta demasiado corta o vacía (mínimo 20 caracteres)');
    }

    if (!Array.isArray(parsed.options) || parsed.options.length !== 4) {
      errors.push('Debe tener exactamente 4 opciones');
    }

    if (typeof parsed.correctAnswer !== 'number' ||
      parsed.correctAnswer < 0 ||
      parsed.correctAnswer > 3) {
      errors.push('Respuesta correcta debe ser 0, 1, 2 o 3');
    }

    if (!parsed.explanation || parsed.explanation.length < 50) {
      errors.push('Explicación demasiado corta (mínimo 50 caracteres)');
    }

    if (parsed.options && new Set(parsed.options).size !== 4) {
      errors.push('Las opciones deben ser diferentes entre sí');
    }

    if (!Array.isArray(parsed.tags)) {
      parsed.tags = [];
    }

    if (errors.length > 0) {
      throw new Error(`Pregunta inválida: ${errors.join(', ')}`);
    }

    return parsed as GeneratedQuestion;
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
   * Mapear nivel a dificultad numérica
   */
  private mapLevelToDifficulty(level: QuestionDifficulty): number {
    switch (level) {
      case QuestionDifficulty.EASY: return 2;
      case QuestionDifficulty.MEDIUM: return 5;
      case QuestionDifficulty.HARD: return 8;
      default: return 5;
    }
  }

  /**
   * Utilidad: sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new AIQuestionGenerator();
