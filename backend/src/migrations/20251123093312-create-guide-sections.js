'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('guide_sections', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER.UNSIGNED
      },
      sectionId: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      title: {
        type: Sequelize.STRING(200),
        allowNull: false
      },
      content: {
        type: Sequelize.TEXT('long'),
        allowNull: false
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      isVisible: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Seed data
    const sections = [
      {
        sectionId: 'intro',
        title: '¿Qué es Plan de Estudio?',
        order: 1,
        content: `
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-primary-600">Bienvenido a Plan de Estudio</h2>
          <p class="text-gray-700">
            Plan de Estudio es una aplicación inteligente diseñada para ayudarte a organizar y optimizar
            tu preparación para oposiciones. El sistema genera automáticamente un calendario de estudio
            personalizado basado en tus disponibilidad, preferencias y la complejidad de cada tema.
          </p>
          
          <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 class="font-semibold text-blue-900 mb-2">🎯 Características principales:</h3>
            <ul class="list-disc list-inside space-y-1 text-blue-800">
              <li>Calendario inteligente con distribución equitativa de temas</li>
              <li>Seguimiento de progreso en tiempo real</li>
              <li>Recomendaciones automáticas de estudio</li>
              <li>Gestión de sesiones de estudio y repasos</li>
              <li>Estadísticas detalladas por tema y bloque</li>
            </ul>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div class="bg-green-50 p-4 rounded-lg">
              <h4 class="font-semibold text-green-900 mb-2">📚 Para Opositores</h4>
              <p class="text-sm text-green-800">
                Organiza tu estudio de forma eficiente con un plan adaptado a tus necesidades
              </p>
            </div>
            <div class="bg-purple-50 p-4 rounded-lg">
              <h4 class="font-semibold text-purple-900 mb-2">⏰ Ahorra Tiempo</h4>
              <p class="text-sm text-purple-800">
                El algoritmo inteligente planifica por ti, tú solo concéntrate en estudiar
              </p>
            </div>
            <div class="bg-orange-50 p-4 rounded-lg">
              <h4 class="font-semibold text-orange-900 mb-2">📊 Seguimiento</h4>
              <p class="text-sm text-orange-800">
                Visualiza tu progreso y adapta tu plan según avanzas
              </p>
            </div>
          </div>
        </div>`
      },
      {
        sectionId: 'getting-started',
        title: 'Primeros Pasos',
        order: 2,
        content: `
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-primary-600">Comenzando con la Aplicación</h2>
          
          <div class="space-y-4">
            <div class="border-l-4 border-primary-500 pl-4">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">1. Registro e Inicio de Sesión</h3>
              <p class="text-gray-700 mb-2">
                Para comenzar, necesitas crear una cuenta proporcionando:
              </p>
              <ul class="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Nombre y apellidos</li>
                <li>Correo electrónico</li>
                <li>Contraseña segura (mínimo 6 caracteres)</li>
              </ul>
              <div class="mt-3 bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                💡 <strong>Consejo:</strong> Usa una contraseña única y guárdala en un lugar seguro
              </div>
            </div>

            <div class="border-l-4 border-primary-500 pl-4">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">2. Acceso al Dashboard</h3>
              <p class="text-gray-700">
                Una vez inicies sesión, llegarás al Dashboard principal donde podrás:
              </p>
              <ul class="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Ver tu agenda del día</li>
                <li>Consultar estadísticas de progreso</li>
                <li>Acceder rápidamente a sesiones pendientes</li>
                <li>Crear un nuevo plan de estudio</li>
              </ul>
            </div>

            <div class="border-l-4 border-primary-500 pl-4">
              <h3 class="text-xl font-semibold text-gray-800 mb-2">3. Crear tu Primer Plan</h3>
              <p class="text-gray-700 mb-2">
                Navega a "Nuevo Plan" desde el menú para comenzar. Necesitarás:
              </p>
              <ol class="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Definir fechas de inicio y examen</li>
                <li>Configurar tu horario semanal</li>
                <li>Seleccionar los temas a estudiar</li>
                <li>¡Dejar que el algoritmo haga su magia!</li>
              </ol>
            </div>
          </div>
        </div>`
      },
      {
        sectionId: 'calendar',
        title: 'Calendario Inteligente',
        order: 3,
        content: `
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-primary-600">El Corazón del Sistema: Calendario Inteligente</h2>
          
          <div class="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 class="text-xl font-semibold text-indigo-900 mb-3">🧠 ¿Cómo funciona?</h3>
            <p class="text-gray-800 mb-4">
              El calendario inteligente utiliza un algoritmo avanzado de distribución equitativa que toma en cuenta
              múltiples factores para crear el plan de estudio más eficiente posible.
            </p>
          </div>

          <div class="space-y-4">
            <h3 class="text-xl font-semibold text-gray-800">📊 Factores que considera el algoritmo:</h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-semibold text-purple-700 mb-2">🎯 Complejidad del Tema</h4>
                <p class="text-sm text-gray-600">
                  Cada tema tiene asignada una complejidad (Baja, Media, Alta) basada en su extensión y dificultad.
                  Los temas más complejos reciben más sesiones de estudio.
                </p>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-semibold text-blue-700 mb-2">📅 Disponibilidad Semanal</h4>
                <p class="text-sm text-gray-600">
                  El sistema respeta tu horario semanal, distribuyendo las sesiones solo en los días y franjas
                  horarias que hayas marcado como disponibles.
                </p>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-semibold text-green-700 mb-2">⚖️ Distribución Equitativa</h4>
                <p class="text-sm text-gray-600">
                  El algoritmo asegura que todos los temas se estudien proporcionalmente, evitando desequilibrios
                  que podrían dejar temas sin preparar.
                </p>
              </div>

              <div class="bg-white p-4 rounded-lg shadow-sm border">
                <h4 class="font-semibold text-orange-700 mb-2">🔄 Sistema de Rotación</h4>
                <p class="text-sm text-gray-600">
                  Los temas rotan en el calendario para garantizar repasos periódicos y evitar que se olvide
                  lo estudiado anteriormente.
                </p>
              </div>
            </div>
          </div>
        </div>`
      },
      {
        sectionId: 'tips',
        title: 'Consejos y Mejores Prácticas',
        order: 4,
        content: `
        <div class="space-y-6">
          <h2 class="text-2xl font-bold text-primary-600">Consejos para Aprovechar al Máximo la Aplicación</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
              <h3 class="font-semibold text-blue-900 mb-3">🎯 Planificación</h3>
              <ul class="space-y-2 text-blue-800 text-sm">
                <li>✅ Sé realista con tu disponibilidad horaria</li>
                <li>✅ Deja margen para imprevistos (10-15% de tiempo extra)</li>
                <li>✅ Revisa tu plan semanalmente y ajusta si es necesario</li>
                <li>✅ Prioriza calidad sobre cantidad de horas</li>
              </ul>
            </div>

            <div class="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <h3 class="font-semibold text-green-900 mb-3">📚 Estudio Efectivo</h3>
              <ul class="space-y-2 text-green-800 text-sm">
                <li>✅ Sigue el orden sugerido por el calendario</li>
                <li>✅ No saltes repasos, son cruciales para retener</li>
                <li>✅ Toma notas durante las sesiones</li>
                <li>✅ Usa técnicas activas: esquemas, mapas mentales</li>
              </ul>
            </div>
          </div>
        </div>`
      }
    ];

    const sectionsWithDates = sections.map(s => ({
      ...s,
      createdAt: new Date(),
      updatedAt: new Date()
    }));

    await queryInterface.bulkInsert('guide_sections', sectionsWithDates);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('guide_sections');
  }
};
