/**
 * Parser para formato GIFT (Moodle)
 * Soporta preguntas de opción múltiple con retroalimentación
 * Ahora con soporte para etiquetas de dificultad manual
 */

export interface ParsedQuestion {
  title?: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  difficultySource?: 'manual' | 'auto'; // Indica origen de la clasificación
  themePart?: number;  // Número de parte del tema (1, 2, 3, 4) o null si tema sin partes
  tags: string[];
}

export class GiftParser {
  /**
   * Parsear contenido completo de archivo GIFT
   */
  static parse(content: string): ParsedQuestion[] {
    const questions: ParsedQuestion[] = [];

    // Limpiar contenido
    content = content.trim();

    // Dividir por bloques de preguntas con sus etiquetas de nivel
    const questionBlocks = this.extractQuestionBlocksWithLabels(content);

    for (const block of questionBlocks) {
      try {
        const parsed = this.parseQuestionBlock(block.content, block.difficultyLabel);
        if (parsed) {
          questions.push(parsed);
        }
      } catch (error) {
        console.warn('Error parseando pregunta:', error);
        // Continuar con la siguiente pregunta
      }
    }

    return questions;
  }

  /**
   * Extraer bloques individuales de preguntas con sus etiquetas de nivel
   */
  private static extractQuestionBlocksWithLabels(content: string): Array<{
    content: string;
    difficultyLabel?: 'EASY' | 'MEDIUM' | 'HARD';
  }> {
    const blocks: Array<{ content: string; difficultyLabel?: 'EASY' | 'MEDIUM' | 'HARD' }> = [];
    const lines = content.split('\n');

    let currentDifficultyLabel: 'EASY' | 'MEDIUM' | 'HARD' | undefined;
    let currentBlock = '';
    let braceCount = 0;
    let inQuestion = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detectar etiquetas de nivel
      const difficultyMatch = line.match(/^#\s*(NIVEL\s+)?(FACIL|FÁCIL|EASY|MEDIO|MEDIUM|DIFICIL|DIFÍCIL|HARD)\s*$/i);
      if (difficultyMatch) {
        const label = difficultyMatch[2].toUpperCase();

        // Mapear variantes a valores estándar
        if (label === 'FACIL' || label === 'FÁCIL' || label === 'EASY') {
          currentDifficultyLabel = 'EASY';
        } else if (label === 'MEDIO' || label === 'MEDIUM') {
          currentDifficultyLabel = 'MEDIUM';
        } else if (label === 'DIFICIL' || label === 'DIFÍCIL' || label === 'HARD') {
          currentDifficultyLabel = 'HARD';
        }

        console.log(`📌 Etiqueta de dificultad detectada: ${currentDifficultyLabel}`);
        continue; // Saltar esta línea
      }

      // Procesar contenido de la pregunta
      for (let j = 0; j < line.length; j++) {
        const char = line[j];

        if (char === '{') {
          if (braceCount === 0) {
            inQuestion = true;
          }
          braceCount++;
        } else if (char === '}') {
          braceCount--;
          if (braceCount === 0 && inQuestion) {
            currentBlock += char;
            blocks.push({
              content: currentBlock.trim(),
              difficultyLabel: currentDifficultyLabel
            });
            currentBlock = '';
            inQuestion = false;
            currentDifficultyLabel = undefined; // Reset después de usar
            continue;
          }
        }

        if (inQuestion || braceCount > 0) {
          currentBlock += char;
        } else if (char !== '\n' && char !== '\r') {
          currentBlock += char;
        }
      }

      if (inQuestion || braceCount > 0) {
        currentBlock += '\n';
      }
    }

    return blocks;
  }

  /**
   * Detectar automáticamente la parte del tema basándose en:
   * 1. Etiquetas explícitas: # PARTE 1, # PARTE 2, etc.
   * 2. Tags existentes
   * 3. Contenido de la pregunta (palabras clave)
   */
  private static detectThemePart(
    block: string,
    tags: string[],
    questionText: string
  ): number | undefined {
    // 1. Buscar etiqueta explícita en el bloque completo
    const partMatch = block.match(/# PARTE (\d+)/i);
    if (partMatch) {
      const part = parseInt(partMatch[1]);
      console.log(`✅ Parte detectada por etiqueta: ${part}`);
      return part;
    }

    // 2. Buscar en tags
    const partTag = tags.find(tag => tag.match(/parte\s*(\d+)/i));
    if (partTag) {
      const match = partTag.match(/parte\s*(\d+)/i);
      if (match) {
        const part = parseInt(match[1]);
        console.log(`✅ Parte detectada por tag: ${part}`);
        return part;
      }
    }

    // 3. Detectar por palabras clave en la pregunta
    const lowerQuestion = questionText.toLowerCase();

    // Tema 6 - Instrucciones (4 partes)
    if (lowerQuestion.includes('emad') || lowerQuestion.includes('55/2021')) {
      console.log(`🔍 Parte detectada por contenido: 1 (EMAD)`);
      return 1;
    }
    if (lowerQuestion.includes('ejército de tierra') || lowerQuestion.includes('14/2021')) {
      console.log(`🔍 Parte detectada por contenido: 2 (ET)`);
      return 2;
    }
    if (lowerQuestion.includes('armada') || lowerQuestion.includes('15/2021')) {
      console.log(`🔍 Parte detectada por contenido: 3 (Armada)`);
      return 3;
    }
    if (lowerQuestion.includes('ejército del aire') || lowerQuestion.includes('6/2025')) {
      console.log(`🔍 Parte detectada por contenido: 4 (EA)`);
      return 4;
    }

    // Tema 7 - Leyes (2 partes)
    if (lowerQuestion.includes('tropa') || lowerQuestion.includes('marinería') || lowerQuestion.includes('8/2006')) {
      console.log(`🔍 Parte detectada por contenido: 1 (Ley 8/2006)`);
      return 1;
    }
    if (lowerQuestion.includes('carrera militar') || lowerQuestion.includes('39/2007')) {
      console.log(`🔍 Parte detectada por contenido: 2 (Ley 39/2007)`);
      return 2;
    }

    // Tema 15 - Seguridad (2 partes)
    if (lowerQuestion.includes('ley 36/2015') || (lowerQuestion.includes('seguridad nacional') && !lowerQuestion.includes('estrategia'))) {
      console.log(`🔍 Parte detectada por contenido: 1 (Ley 36/2015)`);
      return 1;
    }
    if (lowerQuestion.includes('1150/2021') || lowerQuestion.includes('estrategia de seguridad')) {
      console.log(`🔍 Parte detectada por contenido: 2 (RD 1150/2021)`);
      return 2;
    }

    // Si no se detecta, retornar undefined (tema sin partes o parte no identificable)
    return undefined;
  }

  /**
   * Parsear un bloque individual de pregunta
   */
  private static parseQuestionBlock(
    block: string,
    manualDifficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  ): ParsedQuestion | null {
    // Separar título/pregunta de opciones
    const match = block.match(/^(.*?)\s*\{([\s\S]*)\}$/);

    if (!match) {
      return null;
    }

    const questionText = match[1].trim();
    const answersBlock = match[2].trim();

    // Parsear opciones y retroalimentación
    const { options, correctIndex, explanation } = this.parseAnswers(answersBlock);

    if (options.length === 0 || correctIndex === -1) {
      return null;
    }

    // Determinar dificultad
    let difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    let difficultySource: 'manual' | 'auto';

    if (manualDifficulty) {
      // Usar etiqueta manual si existe
      difficulty = manualDifficulty;
      difficultySource = 'manual';
      console.log(`✅ Dificultad manual: ${difficulty}`);
    } else {
      // Fallback a detección automática mejorada
      difficulty = this.detectDifficultyImproved(questionText, options);
      difficultySource = 'auto';
      console.log(`🤖 Dificultad automática: ${difficulty}`);
    }

    // Extraer tags del texto
    const tags = this.extractTags(questionText);

    // Detectar parte del tema
    const themePart = this.detectThemePart(block, tags, questionText);

    return {
      question: this.cleanHtml(questionText),
      options,
      correctAnswerIndex: correctIndex,
      explanation: this.cleanHtml(explanation),
      difficulty,
      difficultySource,
      themePart,  // Incluir parte detectada
      tags,
    };
  }

  /**
   * Parsear opciones de respuesta
   */
  private static parseAnswers(answersBlock: string): {
    options: string[];
    correctIndex: number;
    explanation: string;
  } {
    const options: string[] = [];
    let correctIndex = -1;
    let explanation = '';

    // Separar retroalimentación del resto
    const feedbackMatch = answersBlock.match(/####\s*([\s\S]*?)$/);
    if (feedbackMatch) {
      explanation = feedbackMatch[1].trim();
      answersBlock = answersBlock.substring(0, feedbackMatch.index);
    }

    // Parsear líneas de opciones
    const lines = answersBlock.split('\n').map(l => l.trim()).filter(l => l);

    for (const line of lines) {
      // Respuesta correcta: =texto o ~%100%texto
      if (line.startsWith('=') || line.match(/^~%100(\.0*)?%/)) {
        const text = line.replace(/^=/, '').replace(/^~%100(\.0*)?%/, '').trim();
        if (correctIndex === -1) {
          correctIndex = options.length;
        }
        options.push(text);
      }
      // Respuesta incorrecta: ~texto o ~%-XX%texto
      else if (line.startsWith('~')) {
        const text = line.replace(/^~(%?-?[\d.]+%)?/, '').trim();
        options.push(text);
      }
    }

    return { options, correctIndex, explanation };
  }

  /**
   * Limpiar HTML y extraer texto limpio
   */
  private static cleanHtml(text: string): string {
    // Mantener HTML básico pero limpiar excesos
    return text
      .replace(/RETROALIMENTACIÓN:\s*<br>\s*<br>/gi, '')
      .replace(/<br\s*\/?\>\s*<br\s*\/?\>/gi, '\n\n')
      .replace(/<br\s*\/?\>/gi, '\n')
      .trim();
  }

  /**
   * Sistema mejorado de detección automática de dificultad
   * Usado como fallback cuando no hay etiqueta manual
   */
  private static detectDifficultyImproved(
    questionText: string,
    options: string[]
  ): 'EASY' | 'MEDIUM' | 'HARD' {
    let score = 0;
    const lowerText = questionText.toLowerCase();

    // ===== INDICADORES DE NIVEL FÁCIL =====

    // Preguntas de memoria/datos básicos (-2 puntos)
    if (lowerText.match(/¿en qué año|¿cuándo|¿dónde|¿quién/)) {
      score -= 2;
    }

    // Preguntas de definición simple (-1 punto)
    if (lowerText.match(/^¿qué es\b|define|significa|¿cuál es el nombre/)) {
      score -= 1;
    }

    // Preguntas muy cortas suelen ser más directas (-1 punto)
    const wordCount = questionText.split(/\s+/).length;
    if (wordCount < 10) {
      score -= 1;
    }

    // ===== INDICADORES DE NIVEL DIFÍCIL =====

    // Negaciones (más difíciles) (+2 puntos)
    if (lowerText.match(/\bno es\b|\bincorrecta\b|\bexcepción\b|\bexcepto\b|\bsalvo\b|\bno corresponde\b/)) {
      score += 2;
    }

    // Preguntas de análisis/síntesis (+2 puntos)
    if (lowerText.match(/analiza|compara|evalúa|relaciona|distingue|contrasta/)) {
      score += 2;
    }

    // Preguntas de aplicación (+1 punto)
    if (lowerText.match(/según|de acuerdo con|en el contexto|aplicando/)) {
      score += 1;
    }

    // Preguntas largas suelen ser más complejas (+1 punto)
    if (wordCount > 30) {
      score += 1;
    }

    // ===== ANÁLISIS DE OPCIONES =====

    // Muchas opciones = más difícil (+1 punto)
    if (options.length >= 5) {
      score += 1;
    }

    // Opciones largas requieren más análisis (+1 punto)
    const avgOptionLength = options.reduce((sum, opt) => sum + opt.length, 0) / options.length;
    if (avgOptionLength > 50) {
      score += 1;
    }

    // ===== VOCABULARIO TÉCNICO/LEGAL =====

    // Vocabulario complejo (+1 punto)
    const complexWords = [
      'subsidiariedad', 'proporcionalidad', 'jurisdiccional',
      'constitucional', 'preceptivo', 'vinculante', 'colegislador',
      'jurisprudencia', 'normativa', 'competencial'
    ];
    const hasComplexVocab = complexWords.some(word => lowerText.includes(word));
    if (hasComplexVocab) {
      score += 1;
    }

    // Referencias legales específicas (+1 punto)
    if (lowerText.match(/artículo \d+|ley \d+\/\d+|real decreto|disposición/)) {
      score += 1;
    }

    // ===== CLASIFICACIÓN FINAL =====

    if (score <= -2) {
      return 'EASY';
    } else if (score >= 3) {
      return 'HARD';
    } else {
      return 'MEDIUM';
    }
  }

  /**
   * Detectar dificultad basándose en palabras clave (LEGACY - mantenido por compatibilidad)
   * @deprecated Usar detectDifficultyImproved en su lugar
   */
  private static detectDifficulty(text: string): 'EASY' | 'MEDIUM' | 'HARD' {
    const lowerText = text.toLowerCase();

    // Palabras clave para nivel FÁCIL
    if (
      lowerText.includes('¿qué es') ||
      lowerText.includes('¿cuál es') ||
      lowerText.includes('¿en qué año') ||
      lowerText.includes('¿cuándo') ||
      lowerText.includes('define')
    ) {
      return 'EASY';
    }

    // Palabras clave para nivel DIFÍCIL
    if (
      lowerText.includes('incorrecta') ||
      lowerText.includes('no es cierto') ||
      lowerText.includes('excepción') ||
      lowerText.includes('analiza') ||
      lowerText.includes('compara')
    ) {
      return 'HARD';
    }

    // Por defecto MEDIUM
    return 'MEDIUM';
  }

  /**
   * Extraer tags del título/texto
   */
  private static extractTags(text: string): string[] {
    const tags: string[] = [];

    // Buscar etiquetas HTML <b>tag</b>
    const boldMatches = text.matchAll(/<b>(.*?)<\/b>/gi);
    for (const match of boldMatches) {
      tags.push(match[1].toLowerCase());
    }

    // Buscar categorías al inicio "Tema X."
    const themeMatch = text.match(/^(Tema\s+\d+[.-]?\s*[^.]*)/i);
    if (themeMatch) {
      tags.push(themeMatch[1].toLowerCase());
    }

    return [...new Set(tags)]; // Eliminar duplicados
  }

  /**
   * Validar formato GIFT
   */
  static validate(content: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content || content.trim().length === 0) {
      errors.push('El contenido está vacío');
      return { valid: false, errors };
    }

    // Verificar que tenga al menos una pregunta
    if (!content.includes('{') || !content.includes('}')) {
      errors.push('No se encontraron preguntas con formato GIFT válido');
    }

    // Verificar balance de llaves
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push(`Llaves desbalanceadas: ${openBraces} abiertas, ${closeBraces} cerradas`);
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

export default GiftParser;
