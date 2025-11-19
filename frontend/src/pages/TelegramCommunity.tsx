import React from 'react';
import { useNavigate } from 'react-router-dom';

export const TelegramCommunity: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' width='32' height='32' fill='none' stroke='rgb(255 255 255 / 0.3)'%3e%3cpath d='M0 .5H31.5V32'/%3e%3c/svg%3e\")"}}></div>
        </div>
        
        <div className="relative container mx-auto px-6 pt-12 pb-20">
          {/* Back Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 mb-8 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-all duration-200 shadow-sm hover:shadow-md font-medium backdrop-blur-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver
          </button>

          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Telegram Icon */}
            <div className="inline-block">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl">
                <svg className="w-14 h-14 text-blue-500" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                </svg>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight">
              Únete a la Comunidad
              <br />
              <span className="text-yellow-300">OpoMelilla en Telegram</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed">
              Miles de opositores preparándose juntos. Preguntas ilimitadas, estadísticas avanzadas y tecnología IA.
              <span className="font-bold block mt-2">¡Todo desde tu móvil con Telegram!</span>
            </p>

            {/* CTA Button */}
            <div className="pt-4">
              <a 
                href="https://t.me/permanencia_opomelilla" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  Unirme al Grupo de Telegram
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </a>
            </div>

            {/* Stats */}
            <div className="pt-8 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold">21</div>
                <div className="text-sm opacity-90">Materias</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold">Miles</div>
                <div className="text-sm opacity-90">Preguntas</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-3xl font-bold">24/7</div>
                <div className="text-sm opacity-90">Disponible</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              📱 ¿Qué Puedes Hacer en Telegram?
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Elige el plan que mejor se adapte a tu preparación
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
            {/* Plan Gratuito */}
            <div className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl border-2 border-slate-200 p-8 hover:shadow-xl transition-all">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🆓</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Plan Gratuito</h3>
                <div className="text-4xl font-bold text-slate-900 mb-2">€0</div>
                <p className="text-slate-600">Para siempre</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Canal público de preguntas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Visualización de preguntas compartidas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Participación en ranking público</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl flex-shrink-0">✗</span>
                  <span className="text-slate-400">Sin preguntas privadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl flex-shrink-0">✗</span>
                  <span className="text-slate-400">Sin simulacros personalizados</span>
                </li>
              </ul>
            </div>

            {/* Plan Básico */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-blue-300 p-8 hover:shadow-xl transition-all">
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">🥉</div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Plan Básico</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">€4.99<span className="text-lg text-slate-600">/mes</span></div>
                <p className="text-slate-600">Lo esencial</p>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700"><strong>100 preguntas diarias</strong> en privado</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700">Sistema de <strong>preguntas falladas</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700">Estadísticas básicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700">Simulacros estándar</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700">Gamificación (puntos, rachas, logros)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700">Duelos y torneos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-700">Notificaciones inteligentes</span>
                </li>
              </ul>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 hover:shadow-2xl transition-all relative overflow-hidden transform hover:scale-105">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-yellow-400 rounded-full opacity-20"></div>
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-sm font-bold rounded-bl-xl">
                🏆 PREMIUM
              </div>
              <div className="text-center mb-6 text-white relative z-10">
                <div className="text-4xl mb-3">💎</div>
                <h3 className="text-2xl font-bold mb-2">Plan Premium</h3>
                <div className="text-4xl font-bold mb-2">€9.99<span className="text-lg opacity-90">/mes</span></div>
                <p className="opacity-90">¡El más completo!</p>
              </div>
              <ul className="space-y-3 mb-6 text-white relative z-10">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>PREGUNTAS ILIMITADAS</strong> 🚀</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Simulacros personalizados</strong> por especialidad:</span>
                </li>
                <li className="pl-8 flex items-start gap-2 text-sm">
                  <span>🎖️</span>
                  <span>Ejército de Tierra</span>
                </li>
                <li className="pl-8 flex items-start gap-2 text-sm">
                  <span>✈️</span>
                  <span>Ejército del Aire</span>
                </li>
                <li className="pl-8 flex items-start gap-2 text-sm">
                  <span>⚓</span>
                  <span>Armada</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Análisis con IA</strong> de tus respuestas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Estadísticas avanzadas</strong> con predicciones</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Integración con Moodle</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Exámenes oficiales 2024 y 2025</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>TODO lo del Plan Básico</span>
                </li>
              </ul>
              <div className="bg-yellow-400 text-yellow-900 rounded-lg p-3 text-center font-bold relative z-10">
                🎁 PRUEBA GRATIS 7 DÍAS
              </div>
              <p className="text-white text-xs text-center mt-2 opacity-75">Sin tarjeta • Sin renovación automática</p>
            </div>
          </div>
        </div>
      </section>

      {/* Commands Section */}
      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              🎯 Comandos Principales
            </h2>
            <p className="text-xl text-slate-600">
              Controla todo desde Telegram con comandos simples
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Comandos Básicos */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                Básicos
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-blue-600">/start - Registrarte</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-blue-600">/help - Ayuda</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-blue-600">/mi_plan - Ver suscripción</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-blue-600">/planes - Ver planes</li>
              </ul>
            </div>

            {/* Preguntas Aleatorias */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎲</span>
                Preguntas Aleatorias
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-purple-600">/aleatorias10 - 10 preguntas</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-purple-600">/aleatorias20 - 20 preguntas</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-purple-600">/aleatorias50 - 50 preguntas</li>
              </ul>
            </div>

            {/* Por Materia */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-green-400 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📜</span>
                Por Materia
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-green-600">/constitucion10</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-green-600">/defensanacional10</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-green-600">/et10 - Ejército Tierra</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-green-600">/aire10 - Ejército Aire</li>
              </ul>
            </div>

            {/* Preguntas Falladas */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🔄</span>
                Repaso de Falladas
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-orange-600">/falladas10</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-orange-600">/falladas20</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-orange-600">/constitucionfalladas10</li>
              </ul>
            </div>

            {/* Simulacros */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-red-400 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎖️</span>
                Simulacros Premium
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-red-600">/simulacro_premium_et</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-red-600">/simulacro_premium_aire</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-red-600">/simulacro_premium_armada</li>
              </ul>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-xl p-6 border-2 border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Estadísticas
              </h3>
              <ul className="space-y-2 text-sm">
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-indigo-600">/stats - Estadísticas</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-indigo-600">/ranking - Ver ranking</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-indigo-600">/racha - Tu racha</li>
                <li className="font-mono bg-slate-50 px-3 py-2 rounded text-indigo-600">/prediccion - Predicción IA</li>
              </ul>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-slate-600 mb-6">
              ¡Y muchos más comandos! Descubre todo al unirte al grupo
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              💪 ¿Por Qué OpoMelilla en Telegram?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📱</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Desde tu móvil</h3>
              <p className="text-slate-600">Estudia donde quieras, cuando quieras</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Respuestas instantáneas</h3>
              <p className="text-slate-600">Sin esperas, sin complicaciones</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">👥</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Comunidad activa</h3>
              <p className="text-slate-600">Miles de opositores como tú</p>
            </div>

            <div className="text-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🎯</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enfoque total</h3>
              <p className="text-slate-600">Sin distracciones, solo estudiar</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center text-white space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              ¿Listo para Aprobar?
            </h2>
            <p className="text-xl opacity-90">
              Únete ahora y empieza a prepararte con la mejor tecnología
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a 
                href="https://t.me/permanencia_opomelilla" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-300"
              >
                <span className="flex items-center gap-3">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
                  </svg>
                  Unirme Ahora a Telegram
                  <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                </span>
              </a>
            </div>

            <div className="pt-8">
              <p className="text-sm opacity-75">
                💡 Consejo: Usa <span className="font-mono bg-white/20 px-2 py-1 rounded">/premium_gratis</span> para probar Premium 7 días GRATIS
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
