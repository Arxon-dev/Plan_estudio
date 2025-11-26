import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlanService } from '../services/studyPlanService';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { MethodologySelector } from '../components/MethodologySelector';

interface Theme {
  id: number | string;
  name: string;
  hours: number;
  priority: number;
}

interface PredefinedTheme {
  id: string;
  block: string;
  name: string;
  defaultHours: number;
}

interface WeeklySchedule {
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  sunday: number;
}

// Temas predefinidos del examen de permanencia
const PREDEFINED_THEMES: PredefinedTheme[] = [
  // Bloque 1 – Organización (IDs de BD: 1-6)
  { id: '1', block: 'Bloque 1 – Organización', name: 'Tema 1. Constitución Española de 1978. Títulos III, IV, V, VI y VIII', defaultHours: 4 },
  { id: '2', block: 'Bloque 1 – Organización', name: 'Tema 2. Ley Orgánica 5/2005, de la Defensa Nacional', defaultHours: 4 },
  { id: '3', block: 'Bloque 1 – Organización', name: 'Tema 3. Ley 40/2015, de Régimen Jurídico del Sector Público', defaultHours: 7 },
  { id: '4', block: 'Bloque 1 – Organización', name: 'Tema 4. Real Decreto 205/2024, Ministerio de Defensa', defaultHours: 8 },
  { id: '5', block: 'Bloque 1 – Organización', name: 'Tema 5. Real Decreto 521/2020, Organización Básica de las Fuerzas Armadas', defaultHours: 5 },
  { id: '6-1', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 1: Instrucción 55/2021, EMAD', defaultHours: 11.25 },
  { id: '6-2', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 2: Instrucción 14/2021, ET', defaultHours: 11.25 },
  { id: '6-3', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 3: Instrucción 15/2021, ARMADA', defaultHours: 11.25 },
  { id: '6-4', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 4: Instrucción 6/2025, EA', defaultHours: 11.25 },

  // Bloque 2 – Jurídico-Social (IDs de BD: 7-14)
  { id: '7-1', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 1. Parte 1: Ley 8/2006, Tropa y Marinería', defaultHours: 8 },
  { id: '7-2', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 1. Parte 2: Ley 39/2007 de la Carrera Militar', defaultHours: 8 },
  { id: '8', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 2. Real Decreto 96/2009, Reales Ordenanzas para las Fuerzas Armadas', defaultHours: 8 },
  { id: '9', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 3. Ley Orgánica 9/2011, Derechos y Deberes FAS', defaultHours: 7 },
  { id: '10', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 4. Ley Orgánica 8/2014, Régimen Disciplinario de las Fuerzas Armadas', defaultHours: 9 },
  { id: '11', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 5. Real Decreto 176/2014, Iniciativas y Quejas', defaultHours: 3 },
  { id: '12', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 6. Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres', defaultHours: 8 },
  { id: '13', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 7. Observatorio militar para la igualdad entre mujeres y hombres en las Fuerzas Armadas', defaultHours: 8 },
  { id: '14', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 8. Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas', defaultHours: 12 },

  // Bloque 3 – Seguridad Nacional (IDs de BD: 15-21)
  { id: '15-1', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 1. Parte 1: Ley 36/2015, Seguridad Nacional', defaultHours: 8.5 },
  { id: '15-2', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 1. Parte 2: RD 1150/2021, Estrategia de Seguridad Nacional 2021', defaultHours: 8.5 },
  { id: '16', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 2. PDC-01(B) Doctrina para el empleo de las FAS', defaultHours: 12 },
  { id: '17', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 3. Organización de las Naciones Unidas (ONU)', defaultHours: 8 },
  { id: '18', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 4. Organización del Tratado del Atlántico Norte (OTAN)', defaultHours: 8 },
  { id: '19', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 5. Organización para la Seguridad y Cooperación en Europa (OSCE)', defaultHours: 6 },
  { id: '20', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 6. Unión Europea (UE)', defaultHours: 8 },
  { id: '21', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 7. España y su participación en Misiones Internacionales', defaultHours: 11 },
];

// Orden de complejidad para Bloques Mensuales (de menor a mayor dificultad/prioridad)
const COMPLEXITY_ORDER = [
  '1', '2', '3', '4', '5',
  '6-1', '6-2', '6-3', '6-4',
  '7-1', '7-2', '8', '9', '10', '11', '12', '13', '14',
  '15-1', '15-2', '16', '17', '18', '19', '20', '21'
];

const SmartCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: 2,
    tuesday: 2,
    wednesday: 2,
    thursday: 2,
    friday: 2,
    saturday: 4,
    sunday: 0
  });
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set(PREDEFINED_THEMES.map(t => t.id)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bufferWarning, setBufferWarning] = useState<any>(null);
  const [methodology, setMethodology] = useState<'rotation' | 'monthly-blocks' | null>(null);
  const [topicsPerDay, setTopicsPerDay] = useState<number>(3);

  // Tour de bienvenida
  useEffect(() => {
    const driverObj = driver({
      showProgress: true,
      steps: [
        { element: '#tour-methodology', popover: { title: 'Metodología', description: 'Elige cómo quieres estudiar: Rotación (variedad diaria) o Bloques (enfoque mensual).' } },
        { element: '#tour-start-date', popover: { title: 'Fecha de Inicio', description: '¿Cuándo quieres empezar a estudiar?' } },
        { element: '#tour-exam-date', popover: { title: 'Fecha de Examen', description: '¿Cuándo es tu examen? Calcularemos el tiempo disponible.' } },
        { element: '#tour-topics-slider', popover: { title: 'Temas por Día', description: 'Ajusta cuántos temas diferentes quieres ver cada día (solo para Bloques Mensuales).' } },
        { element: '#tour-weekly-total', popover: { title: 'Resumen', description: 'Aquí verás si tienes tiempo suficiente para cubrir todo el temario.' } },
        { element: '#tour-generate-btn', popover: { title: 'Generar', description: 'Crea tu plan de estudio personalizado.' } }
      ]
    });
    // Solo iniciar si ya se seleccionó metodología para no bloquear la vista inicial
    if (methodology) {
      driverObj.drive();
    }
  }, [methodology]);

  const handleScheduleChange = (day: keyof WeeklySchedule, value: string) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: parseFloat(value) || 0
    });
  };

  const toggleTheme = (themeId: string) => {
    const newSelected = new Set(selectedThemes);
    if (newSelected.has(themeId)) {
      newSelected.delete(themeId);
    } else {
      newSelected.add(themeId);
    }
    setSelectedThemes(newSelected);
  };

  const toggleBlock = (block: string) => {
    const blockThemes = PREDEFINED_THEMES.filter(t => t.block === block);
    const allSelected = blockThemes.every(t => selectedThemes.has(t.id));

    const newSelected = new Set(selectedThemes);

    blockThemes.forEach(theme => {
      if (allSelected) {
        newSelected.delete(theme.id);
      } else {
        newSelected.add(theme.id);
      }
    });

    setSelectedThemes(newSelected);
  };

  const validateForm = (): boolean => {
    if (!startDate || !examDate) {
      setError('Por favor complete las fechas de inicio y examen');
      return false;
    }

    if (new Date(startDate) >= new Date(examDate)) {
      setError('La fecha de inicio debe ser anterior a la fecha del examen');
      return false;
    }

    const totalHours = Object.values(weeklySchedule).reduce((sum, hours) => sum + hours, 0);
    if (totalHours === 0) {
      setError('Debe asignar al menos 1 hora de estudio semanal');
      return false;
    }

    if (selectedThemes.size === 0) {
      setError('Debe seleccionar al menos un tema de estudio');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Convertir temas seleccionados al formato esperado
      let themesToSend: Theme[] = Array.from(selectedThemes).map((themeId, index) => {
        const predefinedTheme = PREDEFINED_THEMES.find(t => t.id === themeId);
        const baseId = parseInt(themeId.split('-')[0]);
        return {
          id: baseId,
          name: predefinedTheme?.name || '',
          hours: predefinedTheme?.defaultHours || 5,
          priority: index + 1
        };
      });

      // Si es bloques mensuales, ordenar por complejidad
      if (methodology === 'monthly-blocks') {
        themesToSend = Array.from(selectedThemes)
          .sort((a, b) => {
            const indexA = COMPLEXITY_ORDER.indexOf(a);
            const indexB = COMPLEXITY_ORDER.indexOf(b);
            return indexA - indexB;
          })
          .map((themeId, index) => {
            const predefinedTheme = PREDEFINED_THEMES.find(t => t.id === themeId);
            // NO parsear baseId aquí para mantener el ID compuesto (ej. '6-1')
            // Esto permite que el backend identifique las partes correctamente
            return {
              id: themeId,
              name: predefinedTheme?.name || '',
              hours: predefinedTheme?.defaultHours || 5,
              priority: index + 1
            };
          });
      }

      const response = await studyPlanService.createSmartPlan({
        startDate: new Date(startDate),
        examDate: new Date(examDate),
        weeklySchedule,
        themes: themesToSend,
        methodology: methodology || 'rotation',
        topicsPerDay: topicsPerDay
      });

      console.log('📅 Respuesta del backend:', response);
      if (response.bufferWarning) {
        setBufferWarning(response.bufferWarning);
      }

      if (response.plan && response.plan.id) {
        // Esperar un momento para que la generación asíncrona comience
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/dashboard');
      } else {
        throw new Error('No se recibió el plan creado');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || 'Error al crear el plan. Por favor intente nuevamente.';
      setError(errorMessage);
      console.error('Error al crear plan:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular totales
  const totalWeeklyHours = Object.values(weeklySchedule).reduce((sum, hours) => sum + hours, 0);
  const totalThemeHours = Array.from(selectedThemes).reduce((sum, themeId) => {
    const theme = PREDEFINED_THEMES.find(t => t.id === themeId);
    return sum + (theme?.defaultHours || 0);
  }, 0);

  const requiredHoursWithReviews = totalThemeHours * 2.2; // 120% para múltiples repasos programados

  const daysAvailable = startDate && examDate
    ? Math.ceil((new Date(examDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const weeksAvailable = daysAvailable / 7;
  const totalHoursAvailable = weeksAvailable * totalWeeklyHours;
  const monthsAvailable = daysAvailable / 30;
  const isTimeAdequate = monthsAvailable >= 8 && monthsAvailable <= 15;

  // Cálculo de tiempo estimado por tema para Bloques Mensuales
  const estimatedTimePerTopic = topicsPerDay > 0 ? (totalWeeklyHours / topicsPerDay).toFixed(1) : '0';

  if (!methodology) {
    return <MethodologySelector onSelect={setMethodology} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMethodology(null)}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cambiar Metodología
            </button>
            <h1 className="text-3xl font-bold text-gray-900">🧠 Calendario de Estudio Inteligente</h1>
          </div>
          <div className="mt-2 ml-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {methodology === 'rotation' ? '🔄 Rotación Inteligente' : '📅 Bloques Mensuales'}
            </span>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded shadow-sm">
            <div className="flex items-center">
              <span className="text-xl mr-2">⚠️</span>
              <p className="font-medium">{error}</p>
            </div>
          </div>
        )}

        {bufferWarning && (
          <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700 rounded shadow-sm">
            <div className="flex items-start">
              <span className="text-xl mr-2 mt-1">⚠️</span>
              <div>
                <h3 className="font-bold text-lg">{bufferWarning.title}</h3>
                <p className="mt-1">{bufferWarning.message}</p>
                <div className="mt-2 text-sm bg-yellow-100 p-2 rounded">
                  <p>📅 Última sesión programada: {new Date(bufferWarning.bufferStartDate).toLocaleDateString()}</p>
                  <p>📅 Fecha del examen: {new Date(bufferWarning.examDate).toLocaleDateString()}</p>
                  <p>⏱️ Días de preparación libre: <strong>{bufferWarning.bufferDays} días</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fechas */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Fechas del Plan</h2>
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              📅 <strong>Tiempo recomendado:</strong> Para una preparación óptima de oposiciones, se recomienda un período de <strong>8 a 12 meses</strong>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Inicio
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  id="tour-start-date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Examen
                </label>
                <input
                  type="date"
                  value={examDate}
                  onChange={(e) => setExamDate(e.target.value)}
                  id="tour-exam-date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          </div>

          {/* Configuración de Temas por Día (Solo Bloques Mensuales) */}
          {methodology === 'monthly-blocks' && (
            <div className="bg-white rounded-lg shadow p-6" id="tour-topics-slider">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuración de Sesiones Diarias</h2>
              <p className="text-gray-600 mb-4">
                Ajusta cuántos temas diferentes quieres estudiar cada día. Esto afectará la duración de cada sesión.
              </p>

              <div className="mb-6">
                <label htmlFor="topics-range" className="block text-sm font-medium text-gray-700 mb-2">
                  Temas por día: <span className="text-blue-600 font-bold text-lg">{topicsPerDay}</span>
                </label>
                <input
                  id="topics-range"
                  type="range"
                  min="1"
                  max="6"
                  step="1"
                  value={topicsPerDay}
                  onChange={(e) => setTopicsPerDay(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>1 tema (Foco total)</span>
                  <span>6 temas (Alta variedad)</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full text-blue-600">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-blue-800 font-medium">Estimación de tiempo por tema:</p>
                  <p className="text-2xl font-bold text-blue-900">~{estimatedTimePerTopic} horas</p>
                  <p className="text-xs text-blue-600">Basado en tu disponibilidad semanal total ({totalWeeklyHours}h)</p>
                </div>
              </div>
            </div>
          )}

          {/* Horario Semanal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Disponibilidad Semanal</h2>
            <p className="text-gray-600 mb-2">
              Ingrese las horas que puede dedicar al estudio cada día de la semana.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
              {[
                { day: 'Lunes', key: 'monday' },
                { day: 'Martes', key: 'tuesday' },
                { day: 'Miércoles', key: 'wednesday' },
                { day: 'Jueves', key: 'thursday' },
                { day: 'Viernes', key: 'friday' },
                { day: 'Sábado', key: 'saturday' },
                { day: 'Domingo', key: 'sunday' }
              ].map(({ day, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {day}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    value={weeklySchedule[key as keyof WeeklySchedule]}
                    onChange={(e) => handleScheduleChange(key as keyof WeeklySchedule, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg text-right">
              <p className="text-gray-800 font-medium">
                ⏱️ Total semanal: <span className="text-blue-600 font-bold">{totalWeeklyHours.toFixed(1)}h</span>
              </p>
            </div>
          </div>

          {/* Temas de Estudio */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Temas de Estudio</h2>
            <p className="text-gray-600 mb-4">
              Seleccione los temas que necesita estudiar.
            </p>

            <div className="space-y-6">
              {['Bloque 1 – Organización', 'Bloque 2 – Jurídico-Social', 'Bloque 3 – Seguridad Nacional'].map(blockName => (
                <div key={blockName} className="border border-gray-300 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{blockName}</h3>
                    <button
                      type="button"
                      onClick={() => toggleBlock(blockName)}
                      className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                    >
                      {PREDEFINED_THEMES.filter(t => t.block === blockName).every(t => selectedThemes.has(t.id))
                        ? '✖ Deseleccionar todos'
                        : '✓ Seleccionar todos'}
                    </button>
                  </div>
                  <div className="space-y-2">
                    {PREDEFINED_THEMES.filter(t => t.block === blockName).map(theme => (
                      <div key={theme.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded transition-colors">
                        <input
                          type="checkbox"
                          id={theme.id}
                          checked={selectedThemes.has(theme.id)}
                          onChange={() => toggleTheme(theme.id)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer"
                        />
                        <label htmlFor={theme.id} className="flex-1 text-sm text-gray-700 cursor-pointer select-none">
                          {theme.name}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Resumen Final */}
            <div id="tour-weekly-total" className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-bold text-blue-900 mb-4">Resumen del Plan</h3>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-blue-800 mb-2">
                    📊 Temas seleccionados: <strong>{selectedThemes.size}</strong> de {PREDEFINED_THEMES.length}
                  </p>
                  <p className="text-blue-800 mb-2">
                    📝 Horas de estudio base: <strong>{totalThemeHours.toFixed(1)}h</strong>
                  </p>
                  <p className="text-blue-800 mb-2">
                    🔄 Horas con repasos (x2.2): <strong>{requiredHoursWithReviews.toFixed(1)}h</strong>
                  </p>
                </div>

                {startDate && examDate && (
                  <div>
                    <p className="text-blue-800 mb-2">
                      📅 Tiempo disponible: <strong>{monthsAvailable.toFixed(1)} meses</strong> ({daysAvailable} días)
                    </p>
                    <p className="text-blue-800 mb-2">
                      ⏱️ Horas totales disponibles: <strong>{totalHoursAvailable.toFixed(1)}h</strong>
                    </p>
                  </div>
                )}
              </div>

              {startDate && examDate && selectedThemes.size > 0 && totalHoursAvailable > 0 && (
                <div className={`mt-4 p-4 rounded-lg border ${totalHoursAvailable >= requiredHoursWithReviews && isTimeAdequate
                    ? 'bg-green-100 border-green-300 text-green-800'
                    : totalHoursAvailable >= requiredHoursWithReviews
                      ? 'bg-yellow-100 border-yellow-300 text-yellow-800'
                      : 'bg-red-100 border-red-300 text-red-800'
                  }`}>
                  {totalHoursAvailable >= requiredHoursWithReviews && isTimeAdequate ? (
                    <p>✅ <strong>¡Plan Óptimo!</strong> Tienes tiempo suficiente y estás en el rango ideal de preparación.</p>
                  ) : totalHoursAvailable >= requiredHoursWithReviews ? (
                    <p>⚠️ <strong>Atención:</strong> Tienes horas suficientes, pero el plazo en meses podría no ser el ideal.</p>
                  ) : (
                    <p>❌ <strong>Tiempo Insuficiente:</strong> Necesitas más horas semanales o extender la fecha del examen.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              id="tour-generate-btn"
              className={`px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generando Plan...
                </span>
              ) : 'Generar Calendario Inteligente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartCalendar;