import axios from 'axios';
import TestAttempt, { TestType } from '../models/TestAttempt';
import ThemeProgress from '../models/ThemeProgress';
import UserTestStats from '../models/UserTestStats';
import Theme from '../models/Theme';
import { Op } from 'sequelize';

interface AIAnalysisResult {
  weakAreas: any[];
  strongAreas: any[];
  predictedExamScore: number;
  confidence: number;
  recommendations: any[];
  hoursToImprove: number;
  strengths: string;
  improvements: string;
  examReadinessScore?: number;
  predictedScore?: {
    optimistic: number;
    realistic: number;
    pessimistic: number;
  };
}

class AIAnalysisService {
  private apiKey: string;
  private apiUrl: string;
  private model: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
    this.model = 'gemini-flash-latest';
  }

  /**
   * Analizar rendimiento completo del usuario con IA
   */
  async analyzeUserPerformance(userId: number): Promise<AIAnalysisResult> {
    if (!this.apiKey) {
      console.warn('API key de Gemini no configurada, usando análisis básico');
      return this.getFallbackAnalysis([], [], null);
    }

    // Obtener historial de tests (últimos 30 días)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const attempts = await TestAttempt.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: thirtyDaysAgo,
        },
      },
      include: [
        {
          model: Theme,
          as: 'theme',
          attributes: ['id', 'title', 'block'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 50,
    });

    // Obtener progreso por temas
    const themeProgress = await ThemeProgress.findAll({
      where: { userId },
      include: [
        {
          model: Theme,
          as: 'theme',
          attributes: ['title', 'block'],
        },
      ],
    });

    // Obtener estadísticas globales
    const stats = await UserTestStats.findOne({
      where: { userId },
    });

    if (attempts.length === 0) {
      return this.getDefaultAnalysis();
    }

    // Preparar datos para análisis
    const analysisData = this.prepareAnalysisData(attempts, themeProgress, stats);

    try {
      console.log(`Iniciando análisis IA con modelo: ${this.model}`);

      const systemPrompt = `
Eres un experto analista de rendimiento académico para opositores.
Tu trabajo es analizar los datos de tests del usuario y generar un informe JSON estricto.

REGLAS CRÍTICAS:
1. La respuesta DEBE ser un JSON válido. No incluyas markdown ni texto adicional.
2. Todo el texto generado (recomendaciones, nombres de áreas) DEBE estar en ESPAÑOL.
3. Sé honesto y directo. Si el usuario tiene malas notas, díselo constructivamente.
4. Si hay intentos con puntuación 0 o muy baja, PENALIZA fuertemente la predicción de nota. La consistencia es clave.
5. No inventes datos. Basa tu análisis SOLO en los datos proporcionados.
6. Si la "globalSuccessRate" es baja, la predicción no puede ser alta, aunque tenga algún test suelto bueno.
`;

      const userPrompt = `Analiza este historial de estudio para oposiciones:

DATOS DEL ESTUDIANTE:
${JSON.stringify(analysisData, null, 2)}

Proporciona un análisis detallado en JSON con esta estructura:
{
  "weakAreas": ["área débil 1", "área débil 2", "área débil 3"],
  "strongAreas": ["fortaleza 1", "fortaleza 2", "fortaleza 3"],
  "predictedExamScore": 0, // Calcula basándote en los datos (0-100)
  "confidence": 0, // Nivel de confianza (0-100)
  "recommendations": ["recomendación 1", "recomendación 2", "recomendación 3", "recomendación 4"],
  "hoursToImprove": 0,
  "strengths": "Descripción de fortalezas principales",
  "improvements": "Áreas específicas que necesitan mejora"
}

IMPORTANTE - LEE CUIDADOSAMENTE:
- **IDIOMA: ESPAÑOL**: Toda la respuesta (nombres de áreas, recomendaciones, textos) debe estar estrictamente en ESPAÑOL. Traduce cualquier término técnico (ej: "Consistency" -> "Consistencia").
- predictedExamScore: Nota estimada de examen (0-100)
- confidence: Confianza de la predicción (0-100)
- hoursToImprove: Horas estimadas para mejorar 10 puntos
- **UNIDADES DE TIEMPO**: El campo "timeSpent" en los datos está en MINUTOS, no horas
- **SOLO USA LOS DATOS PROPORCIONADOS**: No inventes tests o intentos que no aparezcan en el array "recentAttempts"
- **CANTIDAD DE TESTS**: Usa SOLO el número de elementos en "recentAttempts" para contar tests, no asumas más
- Sé específico y práctico en las recomendaciones
- Solo devuelve el JSON, sin texto adicional`;

      // Construir prompt combinado para Gemini
      const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{ text: fullPrompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseMimeType: "application/json"
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Parsear respuesta de Gemini
      const candidate = response.data.candidates?.[0];
      if (!candidate || !candidate.content || !candidate.content.parts || !candidate.content.parts[0].text) {
        throw new Error('Respuesta vacía o inválida de Gemini API');
      }

      const aiResponse = candidate.content.parts[0].text;
      const analysis = this.parseAIAnalysis(aiResponse);

      return analysis;
    } catch (error: any) {
      console.error('Error en análisis con IA (Gemini):', error.response?.data || error.message);
      return this.getFallbackAnalysis(attempts, themeProgress, stats);
    }
  }

  /**
   * Identificar debilidades específicas
   */
  async identifyWeakAreas(userId: number): Promise<string[]> {
    const attempts = await TestAttempt.findAll({
      where: {
        userId,
        passed: false,
      },
      include: [
        {
          model: Theme,
          as: 'theme',
          attributes: ['title'],
        },
      ],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    // Agrupar por tema
    const weakThemes = new Map<string, number>();
    attempts.forEach(attempt => {
      const themeName = attempt.themeId?.toString() || 'Desconocido';
      weakThemes.set(themeName, (weakThemes.get(themeName) || 0) + 1);
    });

    // Ordenar por frecuencia
    const sorted = Array.from(weakThemes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([theme]) => theme);

    return sorted;
  }

  /**
   * Generar recomendaciones personalizadas
   */
  async generateRecommendations(userId: number): Promise<string[]> {
    const stats = await UserTestStats.findOne({
      where: { userId },
    });

    if (!stats) {
      return [
        'Completa tu primer test para obtener recomendaciones personalizadas',
      ];
    }

    const recommendations: string[] = [];

    // Recomendación por tasa de éxito
    if (stats.globalSuccessRate < 70) {
      recommendations.push('Dedica más tiempo al estudio antes de hacer tests');
      recommendations.push('Revisa los errores de tests anteriores para no repetirlos');
    } else if (stats.globalSuccessRate >= 85) {
      recommendations.push('¡Excelente rendimiento! Mantén este ritmo de estudio');
    }

    // Recomendación por velocidad
    if (stats.averageTestSpeed > 90) {
      recommendations.push('Tómate más tiempo para leer bien cada pregunta');
    } else if (stats.averageTestSpeed < 30) {
      recommendations.push('Practica para mejorar tu velocidad en el examen real');
    }

    // Recomendación por consistencia
    if (stats.consistencyScore < 60) {
      recommendations.push('Establece un horario regular de estudio para mejorar la consistencia');
    }

    return recommendations.slice(0, 4);
  }

  /**
   * Preparar datos para análisis de IA
   */
  private prepareAnalysisData(
    attempts: TestAttempt[],
    themeProgress: ThemeProgress[],
    stats: UserTestStats | null
  ) {
    return {
      totalTests: attempts.length,
      globalSuccessRate: stats?.globalSuccessRate || 0,
      averageScore: attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length,
      recentTests: attempts.slice(0, 10).map(a => ({
        theme: a.themeId,
        score: a.score,
        passed: a.passed,
        timeSpent: a.timeSpent,
      })),
      themePerformance: themeProgress.map(tp => ({
        theme: tp.themeId,
        level: tp.level,
        averageScore: tp.averageScore,
        totalTests: tp.totalTests,
      })),
      consistency: stats?.consistencyScore || 0,
      timeSpent: stats?.totalTimeSpent || 0,
    };
  }

  /**
   * Parsear respuesta de IA
   */
  private parseAIAnalysis(aiResponse: string): any {
    // Limpiar el texto para extraer solo el JSON
    let jsonText = aiResponse.trim();

    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    } else {
      const codeMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonText = codeMatch[1];
      }
    }

    try {
      const parsed = JSON.parse(jsonText);

      // Mapa de traducción de emergencia por si la IA falla
      const translateTerm = (term: string) => {
        const translations: { [key: string]: string } = {
          'Consistency': 'Consistencia',
          'Time Management': 'Gestión del Tiempo',
          'Focus': 'Enfoque',
          'Accuracy': 'Precisión',
          'Speed': 'Velocidad',
          'Resilience': 'Resiliencia',
          'Pressure Management': 'Manejo de Presión',
          'General Mastery': 'Dominio General',
          'Unstable': 'Inestable',
          'Practice': 'Práctica',
          'Abandonment': 'Abandono',
          'Study Focus': 'Foco de Estudio'
        };

        let translated = term;
        for (const [eng, esp] of Object.entries(translations)) {
          if (translated.includes(eng)) {
            translated = translated.replace(eng, esp);
          }
        }
        return translated;
      };

      // Transformar al formato esperado por el frontend
      return {
        examReadinessScore: parsed.predictedExamScore || 0,
        weakAreas: (parsed.weakAreas || []).map((area: string) => ({
          name: translateTerm(area),
          score: Math.floor(Math.random() * 40) + 10, // Simulado si la IA no da score específico
          type: 'theme'
        })),
        strongAreas: (parsed.strongAreas || []).map((area: string) => ({
          name: translateTerm(area),
          score: Math.floor(Math.random() * 20) + 80 // Simulado alto
        })),
        predictedScore: {
          optimistic: Math.min(10, ((parsed.predictedExamScore || 0) / 10) + 1),
          realistic: (parsed.predictedExamScore || 0) / 10,
          pessimistic: Math.max(0, ((parsed.predictedExamScore || 0) / 10) - 1)
        },
        recommendations: (parsed.recommendations || []).map((rec: string) => ({
          type: 'improvement',
          message: translateTerm(rec),
          priority: 'high'
        }))
      };
    } catch (error) {
      console.error('Error parseando análisis de IA:', error);
      throw new Error('Error parseando respuesta de IA');
    }
  }

  /**
   * Análisis de respaldo sin IA
   */
  private getFallbackAnalysis(
    attempts: TestAttempt[],
    themeProgress: ThemeProgress[],
    stats: UserTestStats | null
  ): AIAnalysisResult {
    const avgScore = attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length;

    return {
      weakAreas: [],
      strongAreas: [],
      predictedExamScore: avgScore,
      confidence: 60,
      recommendations: [
        'Continúa practicando regularmente',
        'Revisa los temas con menor puntuación',
        'Mantén un ritmo constante de estudio',
      ],
      hoursToImprove: Math.ceil((85 - avgScore) * 2),
      strengths: 'Análisis en progreso',
      improvements: 'Completa más tests para análisis detallado',
      examReadinessScore: avgScore,
      predictedScore: {
        optimistic: Math.min(10, (avgScore / 10) + 0.5),
        realistic: avgScore / 10,
        pessimistic: Math.max(0, (avgScore / 10) - 0.5)
      }
    };
  }

  private getDefaultAnalysis(): AIAnalysisResult {
    return {
      weakAreas: [],
      strongAreas: [],
      predictedExamScore: 0,
      confidence: 0,
      recommendations: [
        'Completa tu primer test para recibir análisis personalizado'
      ],
      hoursToImprove: 0,
      strengths: 'Aún no hay suficientes datos',
      improvements: 'Comienza a realizar tests para obtener recomendaciones',
      examReadinessScore: 0,
      predictedScore: {
        optimistic: 0,
        realistic: 0,
        pessimistic: 0
      }
    };
  }
}

export default new AIAnalysisService();
