import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

interface Question {
  id: number;
  question: string;
  options: string[];
  difficulty: string;
}

const TestSession: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { themeId, themePart, themeTitle, attemptId: initialAttemptId, questions: initialQuestions } = location.state || {};

  const [attemptId, setAttemptId] = useState<number | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<number, number>>(new Map());
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState<{ title: string, message: string, type: 'error' | 'info' } | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ [key: number]: { isCorrect: boolean, explanation: string } }>({});

  // Estado para el avance automático, inicializado desde localStorage
  const [autoAdvance, setAutoAdvance] = useState(() => {
    const saved = localStorage.getItem('test_auto_advance');
    return saved !== null ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    if (!themeId && !initialAttemptId) {
      navigate('/tests');
      return;
    }
    startTest();
  }, [themeId, initialAttemptId]);

  // Guardar preferencia de auto-avance
  useEffect(() => {
    localStorage.setItem('test_auto_advance', JSON.stringify(autoAdvance));
  }, [autoAdvance]);

  const startTest = async () => {
    try {
      // Si ya tenemos los datos del test (ej. test de debilidades), usarlos directamente
      if (initialAttemptId && initialQuestions) {
        setAttemptId(initialAttemptId);
        setQuestions(initialQuestions);
        setStartTime(Date.now());
        setLoading(false);
        return;
      }

      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tests/start`,
        {
          themeId,
          themePart,  // Incluir parte del tema
          testType: 'PRACTICE',
          questionCount: 15,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttemptId(response.data.attemptId);
      setQuestions(response.data.questions);
      setStartTime(Date.now());
    } catch (error: any) {
      console.error('Error al iniciar test:', error);
      setAlertMessage({
        title: 'Error',
        message: error.response?.data?.message || 'Error al iniciar el test',
        type: 'error'
      });
      navigate('/tests');
    } finally {
      setLoading(false);
    }
  };

  const selectAnswer = (optionIndex: number) => {
    const newAnswers = new Map(answers);
    // Si la opción ya está seleccionada, la desmarcamos
    if (newAnswers.get(questions[currentIndex].id) === optionIndex) {
      newAnswers.delete(questions[currentIndex].id);
    } else {
      newAnswers.set(questions[currentIndex].id, optionIndex);

      // Avance automático si está activado y no es la última pregunta
      if (autoAdvance && currentIndex < questions.length - 1) {
        setTimeout(() => {
          setCurrentIndex(prev => {
            // Verificar que seguimos en la misma pregunta (el usuario no navegó manualmente)
            if (prev === currentIndex) {
              return prev + 1;
            }
            return prev;
          });
        }, 700);
      }
    }
    setAnswers(newAnswers);
  };
  const clearAnswer = () => {
    const newAnswers = new Map(answers);
    newAnswers.delete(questions[currentIndex].id);
    setAnswers(newAnswers);
  };

  const goToQuestion = (index: number) => {
    setCurrentIndex(index);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const submitTest = async () => {
    if (answers.size < questions.length) {
      // Mostrar modal de confirmación en lugar de alert
      setShowConfirmModal(true);
      return;
    }
    // Si todas las preguntas están respondidas, enviar directamente
    await submitTestConfirmed();
  };

  const submitTestConfirmed = async () => {
    setSubmitting(true);
    setShowConfirmModal(false);

    try {
      const token = localStorage.getItem('token');
      const totalTime = Math.floor((Date.now() - startTime) / 1000);
      const avgTimePerQuestion = Math.floor(totalTime / questions.length);

      const answersArray = questions.map((q) => ({
        questionId: q.id,
        userAnswer: answers.get(q.id) ?? -1,
        userAnswerText: answers.get(q.id) !== undefined ? q.options[answers.get(q.id)!] : '',
        shuffledOptions: q.options, // Guardar el orden barajado
        isCorrect: false,
        timeSpent: avgTimePerQuestion,
      }));

      await axios.post(
        `${import.meta.env.VITE_API_URL}/tests/${attemptId}/complete`,
        { answers: answersArray },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      navigate(`/test-results/${attemptId}`);
    } catch (error: any) {
      console.error('Error al enviar test:', error);
      setAlertMessage({
        title: 'Error',
        message: error.response?.data?.message || 'Error al enviar el test',
        type: 'error'
      });
      setSubmitting(false);
    }
  };

  const submitTestCancelled = () => {
    setShowConfirmModal(false);
  };

  // Función para verificar la respuesta de la pregunta actual
  const checkAnswer = async () => {
    const currentQuestionId = questions[currentIndex].id;
    const selectedOptionIndex = answers.get(currentQuestionId);

    if (selectedOptionIndex === undefined) {
      setAlertMessage({
        title: 'Atención',
        message: 'Por favor, selecciona una respuesta primero',
        type: 'info'
      });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Obtener la pregunta completa del backend para verificar la respuesta
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/tests/question/${currentQuestionId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const questionData = response.data;

      // Obtener el texto de la opción seleccionada por el usuario (usando las opciones barajadas del frontend)
      const currentQuestion = questions[currentIndex];
      const selectedOptionText = currentQuestion.options[selectedOptionIndex];

      // Obtener el texto de la respuesta correcta (usando las opciones originales del backend)
      const correctOptionIndex = questionData.correctAnswer;
      const correctOptionText = questionData.options[correctOptionIndex];

      // Comparar por texto en lugar de índice
      const isCorrect = selectedOptionText === correctOptionText;
      const explanation = questionData.explanation || 'No hay explicación disponible para esta pregunta.';

      // Actualizar el estado de retroalimentación
      setShowFeedback(prev => ({
        ...prev,
        [currentQuestionId]: { isCorrect, explanation }
      }));
    } catch (error) {
      console.error('Error al verificar respuesta:', error);
      setAlertMessage({
        title: 'Error',
        message: 'No se pudo verificar la respuesta. Por favor, inténtalo de nuevo.',
        type: 'error'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Preparando test...</div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-xl mb-4">No hay preguntas disponibles para este tema</p>
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

  const currentQuestion = questions[currentIndex];
  const selectedAnswer = answers.get(currentQuestion.id);
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel lateral con navegación rápida */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h3 className="font-semibold mb-3">Navegación Rápida</h3>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, index) => {
                const isVerified = showFeedback[q.id];
                const isCorrect = isVerified?.isCorrect;
                const isCurrent = index === currentIndex;
                const isAnswered = answers.has(q.id);

                let baseClasses = "h-12 rounded-lg font-semibold transition-all relative";
                let colorClasses = "";

                if (isVerified) {
                  colorClasses = isCorrect
                    ? "bg-green-500 text-white"
                    : "bg-red-500 text-white";
                } else if (isCurrent) {
                  colorClasses = "bg-blue-600 text-white";
                } else if (isAnswered) {
                  colorClasses = "bg-green-100 text-green-800 border-2 border-green-300";
                } else {
                  colorClasses = "bg-gray-100 text-gray-600 hover:bg-gray-200";
                }

                const ringClasses = isCurrent ? "ring-2 ring-offset-2 ring-blue-600" : "";

                return (
                  <button
                    key={q.id}
                    onClick={() => goToQuestion(index)}
                    className={`${baseClasses} ${colorClasses} ${ringClasses}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 flex flex-col gap-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-blue-600 rounded mr-2"></span>
                  Actual
                </span>
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-green-100 border-2 border-green-300 rounded mr-2"></span>
                  Respondida
                </span>
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-green-500 rounded mr-2"></span>
                  Correcta
                </span>
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-red-500 rounded mr-2"></span>
                  Incorrecta
                </span>
                <span className="flex items-center">
                  <span className="w-4 h-4 bg-gray-100 rounded mr-2"></span>
                  Pendiente
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Área principal de preguntas */}
        <div className="lg:w-3/4">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold">{themeTitle}</h1>
                <span className="text-gray-600">
                  Pregunta {currentIndex + 1} de {questions.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center cursor-pointer select-none">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={autoAdvance}
                      onChange={() => setAutoAdvance(!autoAdvance)}
                    />
                    <div className={`block w-10 h-6 rounded-full transition-colors ${autoAdvance ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${autoAdvance ? 'transform translate-x-4' : ''}`}></div>
                  </div>
                  <div className="ml-3 text-gray-700 font-medium text-sm">
                    Auto-siguiente
                  </div>
                </label>

                <button
                  onClick={() => setShowExitModal(true)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                >
                  Salir
                </button>
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Pregunta actual */}
          <div className="bg-white rounded-lg shadow-md p-8 mb-6">
            <div className="mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div
                    className="text-xl font-semibold mb-3"
                    dangerouslySetInnerHTML={{ __html: currentQuestion.question }}
                    style={{ whiteSpace: 'pre-line' }}
                  />
                </div>
                <span className={`ml-4 px-3 py-1 rounded-full text-xs ${currentQuestion.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                  currentQuestion.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {currentQuestion.difficulty === 'EASY' ? 'Fácil' :
                    currentQuestion.difficulty === 'MEDIUM' ? 'Media' : 'Difícil'}
                </span>
              </div>
            </div>

            {/* Opciones */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${selectedAnswer === index
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                    }`}
                >
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${selectedAnswer === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                      }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span dangerouslySetInnerHTML={{ __html: option }} />
                  </div>
                </button>
              ))}
            </div>

            {/* Barra de Herramientas Unificada */}
            <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              {/* Botón Anterior */}
              <button
                onClick={previousQuestion}
                disabled={currentIndex === 0}
                className="px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Anterior
              </button>

              {/* Acciones Centrales */}
              <div className="flex gap-3">
                {selectedAnswer !== undefined && (
                  <>
                    <button
                      onClick={clearAnswer}
                      className="px-4 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                    >
                      Desmarcar
                    </button>

                    <button
                      onClick={checkAnswer}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium shadow-sm transition-colors"
                    >
                      Verificar
                    </button>
                  </>
                )}
              </div>

              {/* Botón Siguiente / Finalizar */}
              {currentIndex < questions.length - 1 ? (
                <button
                  onClick={nextQuestion}
                  className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors flex items-center font-medium"
                >
                  Siguiente
                  <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={submitTest}
                  disabled={submitting}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium shadow-sm transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Finalizar Test'}
                </button>
              )}
            </div>

            {/* Retroalimentación (Ahora debajo de los controles) */}
            {showFeedback[currentQuestion.id] && (
              <div className={`mt-6 p-4 rounded-lg border-l-4 animate-fade-in ${showFeedback[currentQuestion.id].isCorrect
                ? 'bg-green-50 border-green-500'
                : 'bg-red-50 border-red-500'
                }`}>
                <div className="flex items-center mb-2">
                  <span className={`font-bold flex items-center ${showFeedback[currentQuestion.id].isCorrect
                    ? 'text-green-700'
                    : 'text-red-700'
                    }`}>
                    {showFeedback[currentQuestion.id].isCorrect ? (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Correcto
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        Incorrecto
                      </>
                    )}
                  </span>
                </div>
                <div className="text-gray-700 pl-7">
                  <strong className="block mb-1 text-gray-900">Explicación:</strong>
                  <span dangerouslySetInnerHTML={{ __html: showFeedback[currentQuestion.id].explanation }} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mx-auto mb-4">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                ¿Enviar test incompleto?
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Tienes {questions.length - answers.size} preguntas sin responder. ¿Estás seguro que deseas enviar el test ahora?
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={submitTestCancelled}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Seguir respondiendo
                </button>

                <button
                  onClick={submitTestConfirmed}
                  disabled={submitting}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Enviando...' : 'Enviar de todos modos'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Salida */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all scale-100">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                ¿Salir del test?
              </h3>

              <p className="text-gray-600 text-center mb-6">
                Si sales ahora, perderás todo tu progreso actual. ¿Estás seguro de que quieres continuar?
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowExitModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors"
                >
                  Salir del Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Alerta Genérico */}
      {alertMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all scale-100">
            <div className="p-6">
              <div className={`flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4 ${alertMessage.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                }`}>
                {alertMessage.type === 'error' ? (
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>

              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">
                {alertMessage.title}
              </h3>

              <p className="text-gray-600 text-center mb-6">
                {alertMessage.message}
              </p>

              <button
                onClick={() => setAlertMessage(null)}
                className={`w-full px-4 py-3 text-white rounded-lg font-medium transition-colors ${alertMessage.type === 'error'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-blue-600 hover:bg-blue-700'
                  }`}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestSession;
