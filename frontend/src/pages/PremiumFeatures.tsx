import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import apiClient from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

// Initialize Stripe safely
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_KEY) {
  console.error('⚠️ VITE_STRIPE_PUBLISHABLE_KEY no está definida. Los pagos fallarán.');
} else {
  console.log('✅ Stripe Key cargada:', STRIPE_KEY.substring(0, 10) + '...');
}

const stripePromise = STRIPE_KEY ? loadStripe(STRIPE_KEY) : null;

export const PremiumFeatures: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isEligibleForTrial = !user?.isPremium && !user?.hasUsedTrial;

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);

      if (!stripePromise) {
        throw new Error('La clave de Stripe no está configurada en el frontend.');
      }

      const stripe = await stripePromise;
      if (!stripe) throw new Error('Stripe failed to load');

      // Create checkout session
      const priceId = import.meta.env.VITE_STRIPE_PREMIUM_PRICE_ID;
      if (!priceId) {
        throw new Error('El ID del precio no está configurado (VITE_STRIPE_PREMIUM_PRICE_ID)');
      }

      const { data } = await apiClient.post('/payments/checkout', {
        priceId
      });

      // Redirect to checkout
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Error al iniciar el pago. Por favor, inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-indigo-50"></div>

        <div className="relative container mx-auto px-6 pt-12 pb-20">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 mb-8 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>

          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-medium">
              <span className="text-xl">✨</span>
              Convocatoria 2026 - Preparación Permanencia FAS
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Tu Plaza de Permanencia
              </span>
              <br />
              <span className="text-slate-900">
                Comienza Aquí
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              La plataforma de preparación más avanzada para la Permanencia en las Fuerzas Armadas.
              <span className="font-semibold text-slate-900"> Tecnología IA + Sistema comprobado = Tu éxito garantizado</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Procesando...' : (isEligibleForTrial ? '🎁 Probar 7 Días GRATIS' : '🚀 Suscribirse Ahora')}
                {!isLoading && <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>}
              </button>

              <a
                href="#caracteristicas"
                className="px-8 py-4 bg-white border-2 border-slate-300 text-slate-700 rounded-xl font-bold text-lg hover:border-blue-500 hover:text-blue-600 transition-all duration-300"
              >
                Ver Características
              </a>
            </div>

            {/* Social Proof */}
            <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <span className="font-semibold">Miles de preguntas actualizadas</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                <span className="font-semibold">21 materias disponibles</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="font-semibold">Sistema de IA integrado</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="caracteristicas" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              ¿Por qué OpoMelilla?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              La plataforma más completa con tecnología de vanguardia para tu éxito
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tests Enfocados en Debilidades</h3>
              <p className="text-slate-600">
                Tests personalizados que se centran automáticamente en tus áreas más débiles identificadas por IA
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tests Adaptativos con IA</h3>
              <p className="text-slate-600">
                Tests inteligentes que ajustan la dificultad en tiempo real según tu rendimiento
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Análisis de Rendimiento con IA</h3>
              <p className="text-slate-600">
                Análisis detallado de tu progreso con identificación automática de fortalezas y debilidades
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                💡
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Recomendaciones Personalizadas</h3>
              <p className="text-slate-600">
                Consejos de estudio adaptados a tu ritmo, áreas de mejora y estilo de aprendizaje
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl border border-yellow-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🏆
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Predicción de Nota de Examen</h3>
              <p className="text-slate-600">
                Estimación de tu rendimiento en el examen real basada en tu progreso y análisis con IA
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-cyan-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                📈
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Estadísticas Avanzadas</h3>
              <p className="text-slate-600">
                Métricas detalladas: tasa de éxito, velocidad promedio, consistencia y progresión temporal
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Premium Features Detailed Explanation */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              ¿Qué Incluye Premium?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Descubre en detalle cómo cada funcionalidad te ayudará a conseguir tu plaza
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* Feature 1: Tests Enfocados en Debilidades */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-blue-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Tests Enfocados en Debilidades</h3>
                  <p className="text-slate-600 mb-4">
                    El sistema analiza automáticamente tu historial de tests y identifica los temas y bloques donde tienes más dificultades.
                    Luego genera tests personalizados que se centran específicamente en esas áreas débiles.
                  </p>
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-900">
                      <strong>Ejemplo:</strong> Si has fallado más preguntas de "Derecho Constitucional" y "Organización del Estado",
                      el sistema creará un test con preguntas exclusivamente de esos temas para que los refuerces.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2: Tests Adaptativos con IA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-purple-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-2xl">
                  🤖
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Tests Adaptativos con IA</h3>
                  <p className="text-slate-600 mb-4">
                    Tests inteligentes que ajustan la dificultad de las preguntas en tiempo real según tu rendimiento.
                    Si aciertas, la siguiente pregunta será más difícil. Si fallas, será más fácil. Esto maximiza tu aprendizaje.
                  </p>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-900">
                      <strong>Beneficio:</strong> Estudias al nivel exacto que necesitas, sin perder tiempo con preguntas demasiado fáciles
                      ni frustrarte con preguntas imposibles para tu nivel actual.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3: Análisis de Rendimiento con IA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-green-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-2xl">
                  📊
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Análisis de Rendimiento con IA</h3>
                  <p className="text-slate-600 mb-4">
                    La IA analiza tu historial completo de tests para identificar patrones: tus fortalezas, debilidades,
                    velocidad de respuesta, consistencia, y áreas de mejora específicas.
                  </p>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-900">
                      <strong>Incluye:</strong> Tasa de éxito global, temas más fuertes y más débiles, bloques problemáticos,
                      y análisis de tu evolución temporal.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 4: Recomendaciones Personalizadas */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-orange-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-2xl">
                  💡
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Recomendaciones Personalizadas</h3>
                  <p className="text-slate-600 mb-4">
                    Basándose en tu rendimiento, la IA te da consejos específicos de estudio: qué temas repasar,
                    cuánto tiempo dedicar a cada bloque, y estrategias para mejorar tu velocidad y precisión.
                  </p>
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-900">
                      <strong>Ejemplo:</strong> "Dedica más tiempo al estudio antes de hacer tests" o
                      "Practica para mejorar tu velocidad en el examen real".
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5: Predicción de Nota de Examen */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-yellow-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center text-2xl">
                  🏆
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Predicción de Nota de Examen</h3>
                  <p className="text-slate-600 mb-4">
                    El sistema calcula una estimación de tu rendimiento esperado en el examen real basándose en tu
                    tasa de éxito actual, consistencia, y progreso en los diferentes temas.
                  </p>
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <p className="text-sm text-yellow-900">
                      <strong>Utilidad:</strong> Sabrás si estás listo para el examen o si necesitas más preparación.
                      Te ayuda a planificar tu estudio de forma realista.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 6: Estadísticas Avanzadas */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow border-l-4 border-cyan-600">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-cyan-100 rounded-xl flex items-center justify-center text-2xl">
                  📈
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">Estadísticas Avanzadas</h3>
                  <p className="text-slate-600 mb-4">
                    Métricas detalladas que van más allá de las estadísticas básicas: velocidad promedio de respuesta,
                    puntuación de consistencia, curva de aprendizaje, y progresión temporal.
                  </p>
                  <div className="bg-cyan-50 rounded-lg p-4">
                    <p className="text-sm text-cyan-900">
                      <strong>Incluye:</strong> Gráficos de evolución, comparativa con otros usuarios,
                      análisis de tendencias, y métricas de preparación para el examen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Planes Adaptados a Ti
            </h2>
            <p className="text-xl text-slate-600">
              Desde gratuito hasta premium. Elige el que mejor se adapte a tus necesidades
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Plan Gratuito */}
            <div className="bg-white rounded-2xl border-2 border-slate-200 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Gratuito</h3>
                <div className="text-4xl font-bold text-slate-900 mb-2">€0</div>
                <p className="text-slate-600">Para empezar</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Tests normales por tema</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Historial de tests</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Estadísticas básicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Ranking público</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Progreso por temas</span>
                </li>
              </ul>
            </div>


            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 hover:shadow-2xl transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 right-0 px-4 py-1 text-sm font-bold rounded-bl-xl ${isEligibleForTrial ? 'bg-green-400 text-green-900' : 'bg-yellow-400 text-yellow-900'}`}>
                {isEligibleForTrial ? '🎁 7 DÍAS GRATIS' : '🏆 RECOMENDADO'}
              </div>
              <div className="text-center mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">
                  {isEligibleForTrial ? (
                    <>
                      <span className="line-through text-white/50 text-2xl mr-2">€10</span>
                      €0
                    </>
                  ) : '€10'}
                  <span className="text-lg opacity-90">/mes</span>
                </div>
                <p className="opacity-90">
                  {isEligibleForTrial ? 'Prueba gratis, cancela cuando quieras' : '¡El más completo!'}
                </p>
              </div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Tests Enfocados en Debilidades</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Tests Adaptativos con IA</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Análisis de Rendimiento con IA</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Recomendaciones Personalizadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Predicción de Nota de Examen</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Estadísticas Avanzadas</span>
                </li>
              </ul>

              {!isEligibleForTrial && user?.hasUsedTrial && (
                <div className="bg-white/10 border border-yellow-300/50 rounded-lg p-4 mb-6 text-left backdrop-blur-sm">
                  <div className="flex items-start gap-3">
                    <span className="text-yellow-300 text-xl">⚠️</span>
                    <div>
                      <p className="font-bold text-yellow-300 text-sm">Periodo de prueba agotado</p>
                      <p className="text-white/90 text-xs mt-1">
                        Ya has utilizado tu prueba gratuita de 7 días anteriormente. Se aplicará el precio estándar.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              <button
                onClick={handleSubscribe}
                disabled={isLoading}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-70 disabled:cursor-not-allowed ${isEligibleForTrial
                  ? 'bg-green-400 text-green-900 hover:bg-green-300'
                  : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300'
                  }`}
              >
                {isLoading ? 'Procesando...' : (isEligibleForTrial ? 'Empezar Prueba de 7 Días' : '¡Quiero ser Premium!')}
              </button>
            </div>
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : '🚀 Suscribirse Ahora'}
            </button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para Conseguir tu Plaza?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Únete a miles de opositores que ya están preparándose con la tecnología más avanzada
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Procesando...' : 'Suscribirse Ahora'}
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-10 py-5 bg-blue-700 bg-opacity-50 text-white border-2 border-white rounded-xl font-bold text-xl hover:bg-opacity-70 transition-all duration-300"
            >
              Volver al Plan de Estudio
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
