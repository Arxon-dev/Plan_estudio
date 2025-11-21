import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface QuestionResult {
  questionId: number;
  question: string;
  options: string[];
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
}

interface TestResult {
  id: number;
  testType: string;
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passed: boolean;
  timeSpent: number;
  createdAt: string;
  answers: QuestionResult[];
}

const TestResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const navigate = useNavigate();
  const [result, setResult] = useState<TestResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExplanations, setShowExplanations] = useState(false);

  useEffect(() => {
    if (attemptId) {
      fetchResults();
    }
  }, [attemptId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tests/results/${attemptId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setResult(response.data);
    } catch (error) {
      console.error('Error al cargar resultados:', error);
      alert('Error al cargar los resultados');
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Cargando resultados...</div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">No se encontraron los resultados</p>
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Tests
          </button>
        </div>
      </div>
    );
  }

  const scoreColor = result.score >= 85 ? 'text-green-600' : result.score >= 70 ? 'text-yellow-600' : 'text-red-600';
  const scoreMessage = result.passed ? '¡Aprobado!' : 'No aprobado';

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Resultado Principal */}
      <div className="bg-white rounded-lg shadow-lg p-8 mb-8 text-center">
        <div className={`text-6xl font-bold mb-4 ${scoreColor}`}>
          {typeof result.score === 'number' 
            ? result.score.toFixed(1) 
            : parseFloat(result.score).toFixed(1)}%
        </div>
        <div className="text-2xl font-semibold mb-4">{scoreMessage}</div>
        <div className="text-gray-600 mb-6">
          {result.correctAnswers} de {result.totalQuestions} respuestas correctas
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Tiempo Total</div>
            <div className="text-xl font-semibold">
              {Math.floor(result.timeSpent / 60)} min {result.timeSpent % 60} seg
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 mb-1">Fecha</div>
            <div className="text-xl font-semibold">
              {new Date(result.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-4 justify-center mt-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center gap-2"
          >
            ← Volver a Inicio
          </button>
          <button
            onClick={() => navigate('/tests')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a Tests
          </button>
          <button
            onClick={() => setShowExplanations(!showExplanations)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            {showExplanations ? 'Ocultar' : 'Ver'} Explicaciones
          </button>
        </div>
      </div>

      {/* Revisión de Preguntas */}
      {showExplanations && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Revisión Detallada</h2>
          <div className="space-y-6">
            {result.answers.map((answer, index) => (
              <div
                key={answer.questionId}
                className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                  answer.isCorrect ? 'border-green-500' : 'border-red-500'
                }`}
              >
                {/* Pregunta */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div 
                      className="font-semibold text-lg mb-2"
                      dangerouslySetInnerHTML={{ __html: `${index + 1}. ${answer.question}` }}
                      style={{ whiteSpace: 'pre-line' }}
                    />
                  </div>
                  <span className={`ml-4 px-3 py-1 rounded-full text-sm font-semibold ${
                    answer.isCorrect 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {answer.isCorrect ? '✓ Correcto' : '✗ Incorrecto'}
                  </span>
                </div>

                {/* Opciones */}
                <div className="space-y-2 mb-4">
                  {answer.options.map((option, optIndex) => {
                    const isUserAnswer = optIndex === answer.userAnswer;
                    // Comparar por texto para identificar la opción correcta
                    const isCorrectAnswer = option === (answer as any).correctOptionText;
                    
                    return (
                      <div
                        key={optIndex}
                        className={`p-3 rounded-lg ${
                          isCorrectAnswer
                            ? 'bg-green-50 border-2 border-green-500'
                            : isUserAnswer
                            ? 'bg-red-50 border-2 border-red-500'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="font-semibold mr-2">
                            {String.fromCharCode(65 + optIndex)}.
                          </span>
                          <span dangerouslySetInnerHTML={{ __html: option }} />
                          {isCorrectAnswer && (
                            <span className="ml-auto text-green-600 font-semibold">✓ Correcta</span>
                          )}
                          {isUserAnswer && !isCorrectAnswer && (
                            <span className="ml-auto text-red-600 font-semibold">Tu respuesta</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explicación */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="font-semibold text-blue-900 mb-2">💡 Explicación</div>
                  <div 
                    className="text-gray-700"
                    dangerouslySetInnerHTML={{ __html: answer.explanation }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResults;
