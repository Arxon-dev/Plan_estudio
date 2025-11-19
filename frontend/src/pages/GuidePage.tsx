import { useState } from 'react';
import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';

interface Section {
  id: string;
  title: string;
  content: ReactElement;
}

const GuidePage = () => {
  const [activeSection, setActiveSection] = useState<string>('intro');
  const navigate = useNavigate();

  const sections: Section[] = [
    {
      id: 'intro',
      title: '¿Qué es Plan de Estudio?',
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary-600">Bienvenido a Plan de Estudio</h2>
          <p className="text-gray-700">
            Plan de Estudio es una aplicación inteligente diseñada para ayudarte a organizar y optimizar
            tu preparación para oposiciones. El sistema genera automáticamente un calendario de estudio
            personalizado basado en tus disponibilidad, preferencias y la complejidad de cada tema.
          </p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <h3 className="font-semibold text-blue-900 mb-2">🎯 Características principales:</h3>
            <ul className="list-disc list-inside space-y-1 text-blue-800">
              <li>Calendario inteligente con distribución equitativa de temas</li>
              <li>Seguimiento de progreso en tiempo real</li>
              <li>Recomendaciones automáticas de estudio</li>
              <li>Gestión de sesiones de estudio y repasos</li>
              <li>Estadísticas detalladas por tema y bloque</li>
            </ul>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-900 mb-2">📚 Para Opositores</h4>
              <p className="text-sm text-green-800">
                Organiza tu estudio de forma eficiente con un plan adaptado a tus necesidades
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-900 mb-2">⏰ Ahorra Tiempo</h4>
              <p className="text-sm text-purple-800">
                El algoritmo inteligente planifica por ti, tú solo concéntrate en estudiar
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-lg">
              <h4 className="font-semibold text-orange-900 mb-2">📊 Seguimiento</h4>
              <p className="text-sm text-orange-800">
                Visualiza tu progreso y adapta tu plan según avanzas
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'getting-started',
      title: 'Primeros Pasos',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Comenzando con la Aplicación</h2>
          
          <div className="space-y-4">
            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">1. Registro e Inicio de Sesión</h3>
              <p className="text-gray-700 mb-2">
                Para comenzar, necesitas crear una cuenta proporcionando:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Nombre y apellidos</li>
                <li>Correo electrónico</li>
                <li>Contraseña segura (mínimo 6 caracteres)</li>
              </ul>
              <div className="mt-3 bg-yellow-50 p-3 rounded text-sm text-yellow-800">
                💡 <strong>Consejo:</strong> Usa una contraseña única y guárdala en un lugar seguro
              </div>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">2. Acceso al Dashboard</h3>
              <p className="text-gray-700">
                Una vez inicies sesión, llegarás al Dashboard principal donde podrás:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 ml-4">
                <li>Ver tu agenda del día</li>
                <li>Consultar estadísticas de progreso</li>
                <li>Acceder rápidamente a sesiones pendientes</li>
                <li>Crear un nuevo plan de estudio</li>
              </ul>
            </div>

            <div className="border-l-4 border-primary-500 pl-4">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">3. Crear tu Primer Plan</h3>
              <p className="text-gray-700 mb-2">
                Navega a "Nuevo Plan" desde el menú para comenzar. Necesitarás:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-600 ml-4">
                <li>Definir fechas de inicio y examen</li>
                <li>Configurar tu horario semanal</li>
                <li>Seleccionar los temas a estudiar</li>
                <li>¡Dejar que el algoritmo haga su magia!</li>
              </ol>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'calendar',
      title: 'Calendario Inteligente',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">El Corazón del Sistema: Calendario Inteligente</h2>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <h3 className="text-xl font-semibold text-indigo-900 mb-3">🧠 ¿Cómo funciona?</h3>
            <p className="text-gray-800 mb-4">
              El calendario inteligente utiliza un algoritmo avanzado de distribución equitativa que toma en cuenta
              múltiples factores para crear el plan de estudio más eficiente posible.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">📊 Factores que considera el algoritmo:</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-purple-700 mb-2">🎯 Complejidad del Tema</h4>
                <p className="text-sm text-gray-600">
                  Cada tema tiene asignada una complejidad (Baja, Media, Alta) basada en su extensión y dificultad.
                  Los temas más complejos reciben más sesiones de estudio.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-blue-700 mb-2">📅 Disponibilidad Semanal</h4>
                <p className="text-sm text-gray-600">
                  El sistema respeta tu horario semanal, distribuyendo las sesiones solo en los días y franjas
                  horarias que hayas marcado como disponibles.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-green-700 mb-2">⚖️ Distribución Equitativa</h4>
                <p className="text-sm text-gray-600">
                  El algoritmo asegura que todos los temas se estudien proporcionalmente, evitando desequilibrios
                  que podrían dejar temas sin preparar.
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm border">
                <h4 className="font-semibold text-orange-700 mb-2">🔄 Sistema de Rotación</h4>
                <p className="text-sm text-gray-600">
                  Los temas rotan en el calendario para garantizar repasos periódicos y evitar que se olvide
                  lo estudiado anteriormente.
                </p>
              </div>
            </div>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 rounded mt-6">
              <h4 className="font-semibold text-amber-900 mb-2">⚡ Proceso de Generación del Calendario</h4>
              <ol className="list-decimal list-inside space-y-2 text-amber-800">
                <li><strong>Análisis temporal:</strong> Calcula el tiempo disponible entre inicio y examen</li>
                <li><strong>Cálculo de sesiones:</strong> Determina cuántas sesiones necesita cada tema según su complejidad</li>
                <li><strong>Distribución equitativa:</strong> Reparte las sesiones de forma proporcional en el tiempo</li>
                <li><strong>Optimización de rotación:</strong> Organiza los temas para maximizar el repaso espaciado</li>
                <li><strong>Ajuste de buffer:</strong> Reserva tiempo extra para imprevistos y repasos finales</li>
              </ol>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <h4 className="font-semibold text-indigo-900 mb-3">🎓 Tipos de Sesiones</h4>
              <div className="space-y-2">
                <div className="flex items-start">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold mr-3">PRIMERA VEZ</span>
                  <p className="text-sm text-gray-700">Estudio inicial del tema, lectura comprensiva y esquemas</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-semibold mr-3">REPASO</span>
                  <p className="text-sm text-gray-700">Revisión del contenido ya estudiado, refuerzo de conceptos</p>
                </div>
                <div className="flex items-start">
                  <span className="bg-purple-500 text-white px-2 py-1 rounded text-xs font-semibold mr-3">PROFUNDIZACIÓN</span>
                  <p className="text-sm text-gray-700">Estudio avanzado con ejercicios y casos prácticos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'weekly-schedule',
      title: 'Horario Semanal',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Configuración del Horario Semanal</h2>
          
          <p className="text-gray-700">
            El horario semanal es la base sobre la que se construye tu calendario de estudio. Aquí defines
            cuándo estás disponible para estudiar cada día de la semana.
          </p>

          <div className="bg-blue-50 border border-blue-200 p-5 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-3">📋 Cómo configurar tu horario:</h3>
            <ol className="list-decimal list-inside space-y-3 text-blue-800">
              <li>
                <strong>Selecciona cada día:</strong> Marca los días en los que puedes estudiar
              </li>
              <li>
                <strong>Define franjas horarias:</strong> Para cada día, especifica:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>Hora de inicio de estudio</li>
                  <li>Hora de finalización</li>
                </ul>
              </li>
              <li>
                <strong>Horas totales:</strong> El sistema calcula automáticamente las horas diarias y semanales
              </li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">✅ Buenas Prácticas</h4>
              <ul className="list-disc list-inside space-y-1 text-green-800 text-sm">
                <li>Sé realista con tu disponibilidad</li>
                <li>Incluye tiempo de descanso entre sesiones</li>
                <li>Considera tus compromisos habituales</li>
                <li>Deja días libres para imprevistos</li>
              </ul>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="font-semibold text-red-900 mb-2">⚠️ Evita</h4>
              <ul className="list-disc list-inside space-y-1 text-red-800 text-sm">
                <li>Sobrecargarte con horarios irreales</li>
                <li>No dejar tiempo para repasos</li>
                <li>Estudiar más de 4-5 horas seguidas</li>
                <li>No incluir tiempo de descanso</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-900 mb-2">💡 Ejemplo de Horario Equilibrado</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-purple-200">
                  <tr>
                    <th className="px-4 py-2 text-left">Día</th>
                    <th className="px-4 py-2 text-left">Mañana</th>
                    <th className="px-4 py-2 text-left">Tarde</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody className="text-purple-900">
                  <tr className="border-b border-purple-100">
                    <td className="px-4 py-2">Lunes - Viernes</td>
                    <td className="px-4 py-2">-</td>
                    <td className="px-4 py-2">17:00 - 21:00</td>
                    <td className="px-4 py-2 font-semibold">4h</td>
                  </tr>
                  <tr className="border-b border-purple-100">
                    <td className="px-4 py-2">Sábado</td>
                    <td className="px-4 py-2">09:00 - 13:00</td>
                    <td className="px-4 py-2">16:00 - 20:00</td>
                    <td className="px-4 py-2 font-semibold">8h</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2">Domingo</td>
                    <td className="px-4 py-2 text-gray-500 italic" colSpan={2}>Descanso</td>
                    <td className="px-4 py-2 font-semibold">0h</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-purple-700 text-xs mt-2">Total semanal: 28 horas</p>
          </div>
        </div>
      ),
    },
    {
      id: 'theme-selection',
      title: 'Selección de Temas',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Selección y Gestión de Temas</h2>
          
          <p className="text-gray-700">
            Los temas están organizados por bloques temáticos. Puedes seleccionar los que necesites
            estudiar para tu oposición.
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
            <h3 className="font-semibold text-indigo-900 mb-2">📚 Bloques Temáticos Disponibles:</h3>
            <ul className="space-y-2 text-indigo-800">
              <li><strong>Bloque 1 – Organización</strong></li>
              <li><strong>Bloque 2 – Jurídico-Social</strong></li>
              <li><strong>Bloque 3 – Seguridad Nacional</strong></li>
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">🎯 Complejidad de los Temas</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-300">
                <div className="flex items-center mb-2">
                  <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">BAJA</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Temas concisos con conceptos directos. Requieren menos sesiones de estudio.
                </p>
                <div className="text-xs text-green-800 space-y-1">
                  <p className="font-semibold mb-1">📚 Actualmente no hay temas clasificados como complejidad baja.</p>
                  <p className="italic">Todos los temas de esta oposición requieren al menos nivel medio de preparación.</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
                <div className="flex items-center mb-2">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">MEDIA</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Temas de extensión moderada con varios subapartados. Equilibrio estudio-repaso.
                </p>
                <div className="text-xs text-yellow-800 space-y-1">
                  <p className="font-semibold mb-1">📚 Ejemplos:</p>
                  <p>• Constitución Española de 1978</p>
                  <p>• Ley Orgánica 5/2005, Defensa Nacional</p>
                  <p>• Reales Ordenanzas para las FAS</p>
                  <p>• ONU, OTAN, OSCE, UE</p>
                  <p className="italic mt-2">...y 9 temas más</p>
                </div>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border-2 border-red-300">
                <div className="flex items-center mb-2">
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">ALTA</span>
                </div>
                <p className="text-sm text-gray-700 mb-3">
                  Temas extensos con múltiples partes. Requieren más sesiones y repasos frecuentes.
                </p>
                <div className="text-xs text-red-800 space-y-1">
                  <p className="font-semibold mb-1">📚 Ejemplos:</p>
                  <p>• Ley 40/2015, Régimen Jurídico</p>
                  <p>• Instrucciones EMAD, ET, ARMADA y EA (4 partes)</p>
                  <p>• Ley 8/2006 y Ley 39/2007 (2 partes)</p>
                  <p>• Régimen Disciplinario de las FAS</p>
                  <p>• Ley 36/2015, Seguridad Nacional (2 partes)</p>
                  <p className="italic mt-2">...y 2 temas más</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 p-4 rounded-lg border border-amber-300">
              <h4 className="font-semibold text-amber-900 mb-2">🔍 Temas con Partes</h4>
              <p className="text-amber-800 text-sm mb-3">
                Algunos temas extensos se dividen en partes independientes para facilitar su estudio:
              </p>
              <div className="bg-white p-3 rounded text-sm">
                <p className="font-semibold text-gray-800 mb-2">Ejemplo: Tema 6 (Bloque 1) - Instrucciones EMAD, ET, ARMADA y EA</p>
                <ul className="list-disc list-inside space-y-1 text-gray-700 ml-2">
                  <li>Parte 1: Instrucción 55/2021, EMAD</li>
                  <li>Parte 2: Instrucción 14/2021, ET</li>
                  <li>Parte 3: Instrucción 15/2021, ARMADA</li>
                  <li>Parte 4: Instrucción 6/2025, EA</li>
                </ul>
              </div>
              <p className="text-xs text-amber-700 mt-3">
                💡 Cada parte se estudia como una sesión independiente pero se contabilizan como progreso del tema completo
              </p>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">✨ Consejos para Seleccionar Temas</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-800 text-sm">
              <li>Consulta el temario oficial de tu convocatoria</li>
              <li>Considera empezar por bloques relacionados entre sí</li>
              <li>No selecciones demasiados temas si tienes poco tiempo</li>
              <li>Puedes crear varios planes para diferentes fases de preparación</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'dashboard',
      title: 'Panel de Control (Dashboard)',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Tu Panel de Control</h2>
          
          <p className="text-gray-700">
            El Dashboard es tu centro de operaciones. Aquí tienes una visión completa de tu progreso
            y las tareas del día.
          </p>

          <div className="space-y-4">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">📊 Secciones del Dashboard</h3>
              
              <div className="space-y-3">
                <div className="bg-white p-3 rounded shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-1">🗓️ Agenda del Día</h4>
                  <p className="text-sm text-gray-600">
                    Muestra las sesiones programadas para hoy. Cada sesión incluye el tema, tipo
                    (primera vez/repaso) y duración estimada.
                  </p>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-1">📈 Progreso General</h4>
                  <p className="text-sm text-gray-600">
                    Visualiza tu avance global: sesiones completadas vs pendientes, porcentaje de
                    temas cubiertos y días hasta el examen.
                  </p>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-1">🎯 Estadísticas por Tema</h4>
                  <p className="text-sm text-gray-600">
                    Desglose detallado del progreso en cada tema: sesiones realizadas, repasos,
                    última fecha de estudio y próximo repaso recomendado.
                  </p>
                </div>

                <div className="bg-white p-3 rounded shadow-sm">
                  <h4 className="font-semibold text-gray-800 mb-1">💡 Recomendaciones</h4>
                  <p className="text-sm text-gray-600">
                    El sistema sugiere qué estudiar basándose en prioridades: temas atrasados,
                    repasos pendientes o temas que llevan tiempo sin revisar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3">🎨 Estados de Sesiones</h3>
              <div className="space-y-2">
                <div className="flex items-center">
                  <span className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs font-semibold mr-3 w-32">PENDIENTE</span>
                  <p className="text-sm text-gray-700">Sesión programada pero aún no iniciada</p>
                </div>
                <div className="flex items-center">
                  <span className="bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold mr-3 w-32">EN PROGRESO</span>
                  <p className="text-sm text-gray-700">Estás actualmente trabajando en esta sesión</p>
                </div>
                <div className="flex items-center">
                  <span className="bg-green-500 text-white px-3 py-1 rounded text-xs font-semibold mr-3 w-32">COMPLETADA</span>
                  <p className="text-sm text-gray-700">Sesión finalizada con éxito</p>
                </div>
                <div className="flex items-center">
                  <span className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-semibold mr-3 w-32">SALTADA</span>
                  <p className="text-sm text-gray-700">Sesión omitida (se reprogramará automáticamente)</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-3">⚡ Acciones Rápidas</h3>
              <ul className="space-y-2 text-green-800 text-sm">
                <li>✅ <strong>Marcar como Completada:</strong> Registra que has terminado una sesión. El sistema ajustará automáticamente los intervalos de repaso según tu dificultad.</li>
                <li>▶️ <strong>Iniciar Sesión:</strong> Marca el inicio de tu estudio (útil para tracking)</li>
                <li>⏭️ <strong>Saltar Sesión:</strong> Si no puedes estudiar hoy, omite la sesión. El sistema la reprogramará automáticamente para el siguiente día con capacidad disponible.</li>
                <li>📝 <strong>Añadir Notas:</strong> Guarda apuntes o comentarios sobre tu sesión</li>
              </ul>
              
              <div className="mt-3 p-3 bg-green-100 rounded border border-green-300">
                <p className="text-xs text-green-900 font-medium mb-1">💡 Reprogramación Automática:</p>
                <p className="text-xs text-green-800">
                  Cuando saltas una sesión, el sistema busca automáticamente el siguiente día con horas disponibles
                  y crea una nueva sesión. Respeta tu horario semanal y evita sobrecargar días específicos.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'calendar-view',
      title: 'Vista de Calendario',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Navegación por el Calendario</h2>
          
          <p className="text-gray-700">
            La vista de calendario te permite visualizar tu plan de estudio completo, navegar por
            fechas y ajustar sesiones según sea necesario.
          </p>

          <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded">
            <h3 className="font-semibold text-indigo-900 mb-3">🗓️ Funcionalidades del Calendario</h3>
            <ul className="space-y-2 text-indigo-800">
              <li>📅 <strong>Vista mensual:</strong> Observa todo el mes de un vistazo</li>
              <li>🔍 <strong>Vista diaria:</strong> Detalle completo de las sesiones del día seleccionado</li>
              <li>🎨 <strong>Código de colores:</strong> Identifica rápidamente el tipo de sesión por color</li>
              <li>↔️ <strong>Navegación:</strong> Avanza/retrocede entre fechas fácilmente</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">🎨 Código de Colores</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-100 border-2 border-green-500 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Primera Vez</p>
                  <p className="text-xs text-gray-600">Estudio inicial del tema</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-100 border-2 border-blue-500 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Repaso</p>
                  <p className="text-xs text-gray-600">Revisión de contenido</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-100 border-2 border-purple-500 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Profundización</p>
                  <p className="text-xs text-gray-600">Estudio avanzado</p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-gray-100 border-2 border-gray-400 rounded mr-3"></div>
                <div>
                  <p className="font-semibold text-sm">Día Libre</p>
                  <p className="text-xs text-gray-600">Sin sesiones programadas</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-3">💡 Tips para el Calendario</h3>
            <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
              <li>Revisa tu calendario al inicio de cada semana para planificar</li>
              <li>Identifica días con carga pesada y prepárate mentalmente</li>
              <li>Los días con pocas sesiones son ideales para descanso activo</li>
              <li>Usa el planificador manual para reorganizar sesiones pendientes según tus necesidades</li>
              <li>Las sesiones saltadas se reprograman automáticamente al siguiente día disponible</li>
              <li>Puedes rebalancear el calendario manualmente desde tu perfil si es necesario</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'statistics',
      title: 'Estadísticas y Progreso',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Seguimiento de tu Progreso</h2>
          
          <p className="text-gray-700">
            Las estadísticas te ayudan a visualizar tu avance, identificar áreas que necesitan atención
            y mantenerte motivado viendo tu progreso.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h3 className="font-semibold text-blue-900 mb-3">📊 Métricas Globales</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>📈 Porcentaje de sesiones completadas</li>
                <li>🎯 Temas completados vs totales</li>
                <li>⏰ Horas de estudio acumuladas</li>
                <li>📅 Días transcurridos / días restantes</li>
                <li>🔥 Racha de días estudiando</li>
              </ul>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-3">📚 Por Tema</h3>
              <ul className="space-y-2 text-green-800 text-sm">
                <li>✅ Progreso individual de cada tema</li>
                <li>🔄 Número de repasos realizados</li>
                <li>📅 Última fecha de estudio</li>
                <li>⏭️ Próxima sesión programada</li>
                <li>💯 Porcentaje de dominio estimado</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <h3 className="font-semibold text-purple-900 mb-3">📉 Por Bloque Temático</h3>
              <ul className="space-y-2 text-purple-800 text-sm">
                <li>🎨 Distribución de sesiones por bloque</li>
                <li>⚖️ Equilibrio entre bloques</li>
                <li>📊 Progreso comparativo</li>
                <li>🔍 Identificación de bloques débiles</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
              <h3 className="font-semibold text-orange-900 mb-3">📈 Tendencias</h3>
              <ul className="space-y-2 text-orange-800 text-sm">
                <li>📉 Gráfico de sesiones por semana</li>
                <li>⏱️ Tiempo medio por sesión</li>
                <li>🎯 Tasa de cumplimiento del plan</li>
                <li>🔮 Proyección de finalización</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-300">
            <h3 className="font-semibold text-green-900 mb-3">🎯 Interpretando tus Estadísticas</h3>
            <div className="space-y-3 text-green-800">
              <div>
                <p className="font-semibold mb-1">✅ Si tu progreso está al día:</p>
                <p className="text-sm">Mantén el ritmo, estás siguiendo bien el plan. Considera añadir sesiones extra de temas difíciles.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">⚠️ Si vas retrasado:</p>
                <p className="text-sm">No te preocupes. Identifica sesiones saltadas, reorganiza tu horario o considera rebalancear el plan.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">⚡ Si vas adelantado:</p>
                <p className="text-sm">¡Excelente! Aprovecha para profundizar en temas complejos o añadir repasos extra.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'manual-planner',
      title: 'Planificador Manual',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Planificador Manual</h2>
          
          <p className="text-gray-700">
            El planificador manual te permite reorganizar tus sesiones pendientes arrastrando y soltando
            temas en diferentes días. Es ideal para ajustes rápidos sin necesidad de crear un nuevo plan.
          </p>

          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-5 rounded-lg border border-green-300">
            <h3 className="font-semibold text-green-900 mb-3">📝 Cómo usar el Planificador</h3>
            <ol className="list-decimal list-inside space-y-2 text-green-800">
              <li><strong>Accede desde Dashboard:</strong> Haz clic en "✏️ Editar Manualmente"</li>
              <li><strong>Arrastra temas:</strong> Selecciona un tema del panel izquierdo y arrástralo al día deseado</li>
              <li><strong>Define horas:</strong> Especifica cuántas horas dedicarás a esa sesión</li>
              <li><strong>Guarda cambios:</strong> Haz clic en "Guardar Plan" para aplicar los cambios</li>
            </ol>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">✅ Sesiones Editables</h4>
              <p className="text-sm text-blue-800 mb-2">
                Solo puedes modificar sesiones con estado <strong>PENDIENTE</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-blue-700 text-sm ml-2">
                <li>Aparecen con colores normales de bloque</li>
                <li>Tienen botón ✕ para eliminar</li>
                <li>Se pueden mover a otros días</li>
                <li>Se guardan al hacer clic en "Guardar Plan"</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-300">
              <h4 className="font-semibold text-gray-900 mb-3">🔒 Sesiones Bloqueadas</h4>
              <p className="text-sm text-gray-700 mb-2">
                Las sesiones <strong>COMPLETADAS</strong>, <strong>EN PROGRESO</strong> o <strong>SALTADAS</strong> no son editables:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-2">
                <li>Aparecen en gris con opacidad reducida</li>
                <li>Muestran badge de estado (✅ ⏸️ ⏭️)</li>
                <li>Tienen icono 🔒 en lugar de botón eliminar</li>
                <li>Preservan tu historial de estudio</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-semibold text-yellow-900 mb-2">💡 Qué puedes hacer</h4>
            <ul className="space-y-2 text-yellow-800 text-sm">
              <li><strong>✅ Sustituir un tema:</strong> Elimina una sesión pendiente y arrastra otro tema al mismo día</li>
              <li><strong>✅ Añadir temas extra:</strong> Arrastra nuevos temas a días con capacidad disponible</li>
              <li><strong>✅ Eliminar sesiones:</strong> Quita sesiones pendientes que ya no necesites</li>
              <li><strong>✅ Reorganizar fechas:</strong> Mueve sesiones pendientes a otros días</li>
            </ul>
          </div>

          <div className="bg-amber-50 p-4 rounded-lg">
            <h4 className="font-semibold text-amber-900 mb-2">⚠️ Importante</h4>
            <ul className="list-disc list-inside space-y-1 text-amber-800 text-sm">
              <li>Al guardar, se eliminan todas las sesiones pendientes y se crean las nuevas</li>
              <li>Las sesiones completadas/en progreso/saltadas <strong>NO</strong> se ven afectadas</li>
              <li>El sistema respeta tu horario semanal al validar cambios</li>
              <li>Si necesitas añadir/quitar temas, crea un nuevo plan en su lugar</li>
            </ul>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg">
            <h4 className="font-semibold text-indigo-900 mb-3">🎯 Ejemplo de uso</h4>
            <div className="space-y-2 text-indigo-800 text-sm">
              <div className="bg-white p-3 rounded border border-indigo-200">
                <p className="font-semibold mb-1">Escenario:</p>
                <p>Tienes un imprevisto el martes y necesitas mover 2 sesiones al miércoles.</p>
              </div>
              <div className="bg-white p-3 rounded border border-indigo-200">
                <p className="font-semibold mb-1">Solución:</p>
                <ol className="list-decimal list-inside space-y-1 ml-2">
                  <li>Accede al planificador manual</li>
                  <li>Las sesiones del martes aparecen en su día</li>
                  <li>Elimina las 2 sesiones del martes (botón ✕)</li>
                  <li>Arrastra los mismos temas al miércoles</li>
                  <li>Ajusta las horas según tu disponibilidad</li>
                  <li>Guarda el plan</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'tips',
      title: 'Consejos y Mejores Prácticas',
      content: (
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary-600">Consejos para Aprovechar al Máximo la Aplicación</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-5 rounded-lg border-l-4 border-blue-500">
              <h3 className="font-semibold text-blue-900 mb-3">🎯 Planificación</h3>
              <ul className="space-y-2 text-blue-800 text-sm">
                <li>✅ Sé realista con tu disponibilidad horaria</li>
                <li>✅ Deja margen para imprevistos (10-15% de tiempo extra)</li>
                <li>✅ Revisa tu plan semanalmente y ajusta si es necesario</li>
                <li>✅ Prioriza calidad sobre cantidad de horas</li>
              </ul>
            </div>

            <div className="bg-green-50 p-5 rounded-lg border-l-4 border-green-500">
              <h3 className="font-semibold text-green-900 mb-3">📚 Estudio Efectivo</h3>
              <ul className="space-y-2 text-green-800 text-sm">
                <li>✅ Sigue el orden sugerido por el calendario</li>
                <li>✅ No saltes repasos, son cruciales para retener</li>
                <li>✅ Toma notas durante las sesiones</li>
                <li>✅ Usa técnicas activas: esquemas, mapas mentales</li>
              </ul>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg border-l-4 border-purple-500">
              <h3 className="font-semibold text-purple-900 mb-3">⏰ Gestión del Tiempo</h3>
              <ul className="space-y-2 text-purple-800 text-sm">
                <li>✅ Estudia en bloques de 45-60 minutos</li>
                <li>✅ Descansa 10-15 minutos entre sesiones</li>
                <li>✅ Identifica tu momento del día más productivo</li>
                <li>✅ Evita estudiar hasta altas horas de la noche</li>
              </ul>
            </div>

            <div className="bg-orange-50 p-5 rounded-lg border-l-4 border-orange-500">
              <h3 className="font-semibold text-orange-900 mb-3">🔄 Repasos</h3>
              <ul className="space-y-2 text-orange-800 text-sm">
                <li>✅ Confía en el sistema de repasos espaciados</li>
                <li>✅ Repasa activamente, no solo leas</li>
                <li>✅ Autoevalúate con preguntas test</li>
                <li>✅ Relaciona temas nuevos con ya estudiados</li>
              </ul>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-5 rounded-lg border border-red-300">
            <h3 className="font-semibold text-red-900 mb-3">🚫 Errores Comunes a Evitar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold text-red-800 mb-2">❌ No Actualizar el Progreso</p>
                <p className="text-sm text-red-700">
                  Marca las sesiones como completadas para que las estadísticas sean precisas
                </p>
              </div>
              <div>
                <p className="font-semibold text-red-800 mb-2">❌ Saltar Muchas Sesiones</p>
                <p className="text-sm text-red-700">
                  Esto descompensa el plan. Si tienes imprevistos, ajusta el horario semanal
                </p>
              </div>
              <div>
                <p className="font-semibold text-red-800 mb-2">❌ Ignorar las Recomendaciones</p>
                <p className="text-sm text-red-700">
                  El algoritmo sugiere sesiones por algo: prioridades y equilibrio
                </p>
              </div>
              <div>
                <p className="font-semibold text-red-800 mb-2">❌ Sobrecarga Inicial</p>
                <p className="text-sm text-red-700">
                  No intentes estudiar 8 horas diarias desde el día 1, aumenta gradualmente
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-5 rounded-lg">
            <h3 className="font-semibold text-amber-900 mb-3">💪 Mantén la Motivación</h3>
            <ul className="space-y-2 text-amber-800">
              <li>🎯 Celebra pequeños logros: cada tema completado cuenta</li>
              <li>📊 Revisa tus estadísticas para ver cuánto has avanzado</li>
              <li>👥 Comparte tu progreso con compañeros de estudio</li>
              <li>🎉 Date recompensas al cumplir objetivos semanales</li>
              <li>🧘 Cuida tu salud: duerme bien, haz ejercicio, come saludable</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'faq',
      title: 'Preguntas Frecuentes',
      content: (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-primary-600">Preguntas Frecuentes (FAQ)</h2>
          
          <div className="space-y-3">
            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Puedo tener varios planes activos a la vez?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                No, solo puedes tener un plan activo a la vez. Si necesitas cambiar de plan, debes
                finalizar o archivar el actual. Esto ayuda a mantener el foco y evitar confusiones.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Qué pasa si salto varias sesiones?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Las sesiones saltadas se reprograman automáticamente al siguiente día con capacidad disponible.
                El sistema respeta tu horario semanal y evita sobrecargar días específicos. Sin embargo, si saltas
                muchas sesiones, el plan puede acumular más carga al final. Es mejor ajustar tu horario semanal
                si ves que no puedes cumplir consistentemente con las sesiones programadas.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Puedo modificar el calendario una vez creado?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                ¡Sí! Puedes modificar tu calendario de varias formas:
              </p>
              <ul className="mt-2 text-gray-600 text-sm list-disc list-inside space-y-1 ml-3">
                <li><strong>Planificador Manual:</strong> Reorganiza sesiones pendientes arrastrando temas a diferentes días.
                Las sesiones completadas o en progreso no se pueden editar para preservar tu historial.</li>
                <li><strong>Rebalanceo Manual:</strong> Desde tu perfil, puedes rebalancear el calendario completo
                para redistribuir las sesiones pendientes de forma óptima.</li>
                <li><strong>Marcar Estados:</strong> Cambia el estado de sesiones (completada, en progreso, saltada)
                según tu avance real.</li>
              </ul>
              <p className="mt-2 text-gray-600 text-sm">
                <strong>Nota:</strong> Si necesitas cambios grandes (añadir/quitar temas), considera crear un nuevo plan.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Cómo decide el algoritmo cuántas veces estudiar cada tema?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                El algoritmo considera la complejidad del tema (baja/media/alta) y el tiempo disponible
                hasta el examen. Los temas más complejos reciben más sesiones. También aplica el
                principio de repaso espaciado para optimizar la retención.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Qué significa "distribución equitativa"?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Significa que el algoritmo distribuye las sesiones de todos los temas de forma proporcional
                a lo largo del tiempo, evitando que algunos temas se estudien demasiado pronto y otros
                demasiado tarde. Así todos reciben atención balanceada.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Puedo añadir temas después de crear el plan?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Por ahora no. Si necesitas añadir o quitar temas, deberás crear un nuevo plan. Esto
                asegura que el algoritmo recalcule correctamente la distribución con todos los temas.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Mis datos están seguros?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Sí. Tu información se almacena de forma segura. Las contraseñas están encriptadas y
                solo tú tienes acceso a tu cuenta. No compartimos datos con terceros.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Qué hago si no puedo cumplir con el horario planificado?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Si es temporal, marca sesiones como saltadas y continúa cuando puedas. Si es un cambio
                permanente, crea un nuevo plan con un horario semanal más realista ajustado a tu
                nueva disponibilidad.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿El sistema funciona en móvil?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                Sí, la aplicación es responsive y funciona en cualquier dispositivo: ordenador, tablet
                o smartphone. Puedes consultar tu agenda y marcar sesiones desde cualquier lugar.
              </p>
            </details>

            <details className="bg-white p-4 rounded-lg shadow-sm border">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                ❓ ¿Hay algún costo por usar la aplicación?
              </summary>
              <p className="mt-2 text-gray-600 text-sm">
                [Ajusta según tu modelo] Actualmente la aplicación es gratuita para usuarios registrados.
                Futuras funcionalidades premium podrían tener costo, pero las funciones básicas
                permanecerán gratuitas.
              </p>
            </details>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white p-8 rounded-lg shadow-lg mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/30 rounded-lg text-white transition-all duration-200 shadow-sm hover:shadow-md font-medium backdrop-blur-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Inicio
            </button>
          </div>
          <h1 className="text-4xl font-bold mb-3">📖 Guía Completa de Plan de Estudio</h1>
          <p className="text-primary-100 text-lg">
            Todo lo que necesitas saber para dominar tu preparación de oposiciones
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-4">
              <h2 className="font-semibold text-gray-800 mb-4 text-lg">📑 Índice</h2>
              <nav className="space-y-1">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      activeSection === section.id
                        ? 'bg-primary-100 text-primary-700 font-semibold'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {section.title}
                  </button>
                ))}
              </nav>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="bg-blue-50 p-3 rounded text-xs text-blue-800">
                  <p className="font-semibold mb-1">💡 Consejo</p>
                  <p>Lee cada sección con calma para aprovechar todas las funcionalidades</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-8">
              {sections.find((s) => s.id === activeSection)?.content}
              
              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex((s) => s.id === activeSection);
                    if (currentIndex > 0) {
                      setActiveSection(sections[currentIndex - 1].id);
                    }
                  }}
                  disabled={sections.findIndex((s) => s.id === activeSection) === 0}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => {
                    const currentIndex = sections.findIndex((s) => s.id === activeSection);
                    if (currentIndex < sections.length - 1) {
                      setActiveSection(sections[currentIndex + 1].id);
                    }
                  }}
                  disabled={sections.findIndex((s) => s.id === activeSection) === sections.length - 1}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente →
                </button>
              </div>
            </div>

            {/* Footer Help */}
            <div className="mt-6 bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border border-green-200">
              <h3 className="font-semibold text-green-900 mb-2">¿Necesitas más ayuda?</h3>
              <p className="text-green-800 text-sm mb-3">
                Si tienes dudas que no están cubiertas en esta guía, no dudes en contactarnos.
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href="mailto:soporte@planestudio.com"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  📧 Contactar Soporte
                </a>
                <button className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded-md hover:bg-green-50 transition-colors text-sm">
                  💬 Chat en Vivo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuidePage;
