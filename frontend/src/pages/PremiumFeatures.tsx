import React from 'react';
import { useNavigate } from 'react-router-dom';

export const PremiumFeatures: React.FC = () => {
  const navigate = useNavigate();

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
              <a 
                href="https://opomelilla.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                🚀 Acceder a OpoMelilla
                <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
              </a>
              
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
                🤖
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Análisis con IA</h3>
              <p className="text-slate-600">
                Sistema de Inteligencia Artificial que analiza tus respuestas y te da recomendaciones personalizadas
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl border border-purple-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🎖️
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Simulacros Militares</h3>
              <p className="text-slate-600">
                Simulacros personalizados por especialidad: Ejército de Tierra, Aire y Armada
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-green-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                📊
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Estadísticas Avanzadas</h3>
              <p className="text-slate-600">
                Seguimiento detallado de tu progreso con predicciones de rendimiento basadas en IA
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 p-8 rounded-2xl border border-orange-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-orange-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🎯
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Preguntas Ilimitadas</h3>
              <p className="text-slate-600">
                Acceso ilimitado a miles de preguntas actualizadas de todas las materias
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-8 rounded-2xl border border-yellow-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🏆
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Gamificación</h3>
              <p className="text-slate-600">
                Sistema de puntos, rachas, logros y duelos que te mantienen motivado
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-8 rounded-2xl border border-cyan-100 hover:shadow-xl transition-shadow">
              <div className="w-14 h-14 bg-cyan-600 rounded-xl flex items-center justify-center text-white text-2xl mb-4">
                🔗
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Integración Moodle</h3>
              <p className="text-slate-600">
                Sincroniza tu progreso con la plataforma Moodle oficial automáticamente
              </p>
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

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
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
                  <span className="text-slate-600">Canal público de preguntas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Ranking público</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-red-500 text-xl flex-shrink-0">✗</span>
                  <span className="text-slate-400">Sin preguntas privadas</span>
                </li>
              </ul>
            </div>

            {/* Plan Básico */}
            <div className="bg-white rounded-2xl border-2 border-blue-300 p-8 hover:shadow-xl transition-shadow">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Básico</h3>
                <div className="text-4xl font-bold text-blue-600 mb-2">€4.99<span className="text-lg text-slate-600">/mes</span></div>
                <p className="text-slate-600">Lo esencial para aprobar</p>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600"><strong>100 preguntas diarias</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Preguntas falladas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Estadísticas básicas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                  <span className="text-slate-600">Gamificación completa</span>
                </li>
              </ul>
            </div>

            {/* Plan Premium */}
            <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl p-8 hover:shadow-2xl transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 px-4 py-1 text-sm font-bold rounded-bl-xl">
                🏆 RECOMENDADO
              </div>
              <div className="text-center mb-6 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-4xl font-bold mb-2">€9.99<span className="text-lg opacity-90">/mes</span></div>
                <p className="opacity-90">¡El más completo!</p>
              </div>
              <ul className="space-y-4 mb-8 text-white">
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>PREGUNTAS ILIMITADAS</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Simulacros por especialidad</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Análisis con IA</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Estadísticas avanzadas</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span><strong>Integración Moodle</strong></span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-yellow-300 text-xl flex-shrink-0">★</span>
                  <span>Exámenes oficiales 2024-2025</span>
                </li>
              </ul>
              <div className="bg-yellow-400 text-yellow-900 rounded-lg p-3 text-center font-bold">
                🎁 7 DÍAS GRATIS
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <a 
              href="https://opomelilla.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block px-10 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              🚀 Comenzar Ahora en OpoMelilla
            </a>
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
            <a 
              href="https://opomelilla.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Acceder a la Plataforma
            </a>
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
