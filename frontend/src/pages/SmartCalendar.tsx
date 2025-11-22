import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlanService } from '../services/studyPlanService';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface Theme {
  id: number;
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

const SmartCalendar: React.FC = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [weeklySchedule, setWeeklySchedule] = useState<WeeklySchedule>({
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    sunday: 0
  });
  const [selectedThemes, setSelectedThemes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bufferWarning, setBufferWarning] = useState<any>(null);

  useEffect(() => {
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const id = JSON.parse(raw).id;
    const key = `onboarding:smart:v1:${id}`;
    const seen = localStorage.getItem(key);
    if (seen === 'done') return;
    const steps = [
      { element: '#tour-smart-back', popover: { title: 'Volver a inicio', description: 'Regresa al panel principal.' } },
      { element: '#tour-start-date', popover: { title: 'Fecha de inicio', description: 'Selecciona cuándo empiezas.' } },
      { element: '#tour-exam-date', popover: { title: 'Fecha de examen', description: 'Indica el día del examen.' } },
      { element: '#tour-block-toggle-1', popover: { title: 'Bloque 1', description: 'Selecciona o deselecciona todos los temas del bloque.' } },
      { element: '#tour-weekly-total', popover: { title: 'Horas semanales', description: 'Resumen de horas disponibles por semana.' } },
      { element: '#tour-generate-btn', popover: { title: 'Generar calendario', description: 'Crea el plan con rotación y repasos.' } },
    ];
    const d = driver({ steps, showProgress: true, allowClose: true });
    d.drive();
    localStorage.setItem(key, 'done');
  }, []);

  // Manejar cambios en el horario semanal
  const handleScheduleChange = (day: keyof WeeklySchedule, value: string) => {
    setWeeklySchedule({
      ...weeklySchedule,
      [day]: parseFloat(value) || 0
    });
  };

  // Toggle selección de tema
  const toggleTheme = (themeId: string) => {
    const newSelected = new Set(selectedThemes);
    if (newSelected.has(themeId)) {
      newSelected.delete(themeId);
    } else {
      newSelected.add(themeId);
    }
    setSelectedThemes(newSelected);
  };

  // Seleccionar/Deseleccionar todos los temas de un bloque
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

  // Validar formulario
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

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    setLoading(true);

    try {
      // Convertir temas seleccionados al formato esperado
      const themesToSend: Theme[] = Array.from(selectedThemes).map((themeId, index) => {
        const predefinedTheme = PREDEFINED_THEMES.find(t => t.id === themeId);
        const baseId = parseInt(themeId.split('-')[0]);
        return {
          id: baseId,
          name: predefinedTheme?.name || '',
          hours: predefinedTheme?.defaultHours || 5,
          priority: index + 1
        };
      });

      const response = await studyPlanService.createSmartPlan({
        startDate: new Date(startDate),
        examDate: new Date(examDate),
        weeklySchedule,
        themes: themesToSend
      });

      console.log('📅 Respuesta del backend:', response);

      // Capturar la advertencia del buffer si existe
      if (response.bufferWarning) {
        setBufferWarning(response.bufferWarning);
      }

      // Si llega aquí sin error, el plan se creó exitosamente
      // Pero necesitamos verificar si la generación fue exitosa
      if (response.plan && response.plan.id) {
        // Esperar un momento para que la generación asíncrona comience
        await new Promise(resolve => setTimeout(resolve, 2000));
        navigate('/dashboard');
      } else {
        throw new Error('No se recibió el plan creado');
      }
    } catch (err: any) {
      // Mostrar mensaje de error
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
  // Sistema de repasos mejorado: 120% extra para curva del olvido (Ebbinghaus)
  const requiredHoursWithReviews = totalThemeHours * 2.2; // 120% para múltiples repasos programados

  // Calcular días disponibles y validar tiempo suficiente
  const daysAvailable = startDate && examDate
    ? Math.ceil((new Date(examDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))
    : 0;
  const weeksAvailable = daysAvailable / 7;
  const totalHoursAvailable = weeksAvailable * totalWeeklyHours;
  const monthsAvailable = daysAvailable / 30;
  const isTimeAdequate = monthsAvailable >= 8 && monthsAvailable <= 15; // Rango óptimo 8-15 meses

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow mb-8">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              id="tour-smart-back"
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Inicio
            </button>
            <h1 className="text-3xl font-bold text-gray-900">🧠 Calendario de Estudio Inteligente</h1>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 pb-8">

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {bufferWarning && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <span className="text-yellow-600 text-xl">⚠️</span>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">{bufferWarning.title}</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>{bufferWarning.message}</p>
                  <div className="mt-2 text-xs text-yellow-600">
                    <p>📅 Última sesión programada: {new Date(bufferWarning.bufferStartDate).toLocaleDateString()}</p>
                    <p>📅 Fecha del examen: {new Date(bufferWarning.examDate).toLocaleDateString()}</p>
                    <p>⏱️ Días de preparación libre: {bufferWarning.bufferDays} días</p>
                  </div>
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
              📅 <strong>Tiempo recomendado:</strong> Para una preparación óptima de oposiciones, se recomienda un período de <strong>8 a 12 meses</strong> de estudio. Esto permite un aprendizaje sólido con múltiples repasos programados.
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

          {/* Horario Semanal */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Disponibilidad Semanal</h2>
            <p className="text-gray-600 mb-2">
              Ingrese las horas que puede dedicar al estudio cada día de la semana.
            </p>
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              🕒 <strong>Horas por día:</strong> Indique cuántas horas puede estudiar diariamente. El sistema usará esta información para distribuir las sesiones de estudio de forma óptima.
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
                    value={weeklySchedule[key as keyof WeeklySchedule] || ''}
                    onChange={(e) => handleScheduleChange(key as keyof WeeklySchedule, e.target.value)}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium">
                ⏱️ Total de horas disponibles por semana: {totalWeeklyHours.toFixed(1)}h
              </p>
            </div>
          </div>

          {/* Temas de Estudio */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Temas de Estudio</h2>

            <p className="text-gray-600 mb-2">
              Seleccione los temas que necesita estudiar para el examen de permanencia.
            </p>
            <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6">
              🔄 <strong>Rotación inteligente de temas:</strong> El sistema distribuirá múltiples temas activos simultáneamente para mantener tu mente fresca y evitar el olvido por inactividad. Cada semana estudiarás varios temas en sesiones rotativas, optimizando la retención a largo plazo.
            </p>

            <div className="space-y-6">
              {/* Bloque 1 */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Bloque 1 – Organización</h3>
                  <button
                    type="button"
                    onClick={() => toggleBlock('Bloque 1 – Organización')}
                    id="tour-block-toggle-1"
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md"
                  >
                    {PREDEFINED_THEMES.filter(t => t.block === 'Bloque 1 – Organización').every(t => selectedThemes.has(t.id))
                      ? '✖ Deseleccionar todos'
                      : '✓ Seleccionar todos'}
                  </button>
                </div>
                <div className="space-y-2">
                  {PREDEFINED_THEMES.filter(t => t.block === 'Bloque 1 – Organización').map(theme => (
                    <div key={theme.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={theme.id}
                        checked={selectedThemes.has(theme.id)}
                        onChange={() => toggleTheme(theme.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={theme.id} className="flex-1 text-sm text-gray-700 cursor-pointer">
                        {theme.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque 2 */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Bloque 2 – Jurídico-Social</h3>
                  <button
                    type="button"
                    onClick={() => toggleBlock('Bloque 2 – Jurídico-Social')}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md"
                  >
                    {PREDEFINED_THEMES.filter(t => t.block === 'Bloque 2 – Jurídico-Social').every(t => selectedThemes.has(t.id))
                      ? '✖ Deseleccionar todos'
                      : '✓ Seleccionar todos'}
                  </button>
                </div>
                <div className="space-y-2">
                  {PREDEFINED_THEMES.filter(t => t.block === 'Bloque 2 – Jurídico-Social').map(theme => (
                    <div key={theme.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={theme.id}
                        checked={selectedThemes.has(theme.id)}
                        onChange={() => toggleTheme(theme.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={theme.id} className="flex-1 text-sm text-gray-700 cursor-pointer">
                        {theme.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bloque 3 */}
              <div className="border border-gray-300 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Bloque 3 – Seguridad Nacional</h3>
                  <button
                    type="button"
                    onClick={() => toggleBlock('Bloque 3 – Seguridad Nacional')}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md"
                  >
                    {PREDEFINED_THEMES.filter(t => t.block === 'Bloque 3 – Seguridad Nacional').every(t => selectedThemes.has(t.id))
                      ? '✖ Deseleccionar todos'
                      : '✓ Seleccionar todos'}
                  </button>
                </div>
                <div className="space-y-2">
                  {PREDEFINED_THEMES.filter(t => t.block === 'Bloque 3 – Seguridad Nacional').map(theme => (
                    <div key={theme.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                      <input
                        type="checkbox"
                        id={theme.id}
                        checked={selectedThemes.has(theme.id)}
                        onChange={() => toggleTheme(theme.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <label htmlFor={theme.id} className="flex-1 text-sm text-gray-700 cursor-pointer">
                        {theme.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div id="tour-weekly-total" className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-1">
                📊 Temas seleccionados: {selectedThemes.size} de {PREDEFINED_THEMES.length}
              </p>
              <p className="text-blue-800 font-medium mb-1">
                📝 Total de horas de estudio inicial: {totalThemeHours.toFixed(1)}h
              </p>
              <p className="text-blue-700 mb-2">
                🔄 Horas con sistema de rotación y repasos (120% extra): {requiredHoursWithReviews.toFixed(1)}h
              </p>

              {startDate && examDate && selectedThemes.size > 0 && (
                <>
                  <div className="border-t border-blue-200 my-3"></div>
                  <p className="text-blue-800 font-medium mb-1">
                    📅 Tiempo disponible: {monthsAvailable.toFixed(1)} meses ({daysAvailable} días)
                  </p>
                  <p className="text-blue-800 font-medium mb-1">
                    ⏱️ Horas totales disponibles: {totalHoursAvailable.toFixed(1)}h
                  </p>

                  {totalHoursAvailable > 0 && (
                    <div className={`mt-3 p-3 rounded-lg border ${totalHoursAvailable >= requiredHoursWithReviews && isTimeAdequate
                        ? 'bg-green-50 border-green-200'
                        : totalHoursAvailable >= requiredHoursWithReviews
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-red-50 border-red-200'
                      }`}>
                      {totalHoursAvailable >= requiredHoursWithReviews && isTimeAdequate ? (
                        <p className="text-green-800 text-sm">
                          ✅ <strong>¡Perfecto!</strong> Tienes tiempo suficiente ({monthsAvailable.toFixed(1)} meses) y estás en el rango óptimo de preparación (8-12 meses). Margen: {(totalHoursAvailable - requiredHoursWithReviews).toFixed(1)}h para imprevistos.
                        </p>
                      ) : totalHoursAvailable >= requiredHoursWithReviews ? (
                        <p className="text-yellow-800 text-sm">
                          ⚠️ <strong>Atención:</strong> Tienes tiempo suficiente, pero {monthsAvailable < 8 ? 'es un período corto para oposiciones' : 'es un período muy largo'}. Se recomienda 8-12 meses para preparación óptima.
                        </p>
                      ) : (
                        <p className="text-red-800 text-sm">
                          ❌ <strong>Tiempo insuficiente:</strong> Necesitas {requiredHoursWithReviews.toFixed(1)}h pero solo tienes {totalHoursAvailable.toFixed(1)}h disponibles. Considera aumentar las horas diarias o extender la fecha del examen.
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}

              <p className="text-xs text-gray-600 mt-3 border-t border-blue-200 pt-2">
                El sistema distribuirá tus temas en rotación semanal, manteniendo varios temas activos simultáneamente. Aplicará la curva del olvido de Ebbinghaus y repasos espaciados para maximizar la retención a largo plazo.
              </p>
            </div>
          </div>

          {/* Botón de envío */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              id="tour-generate-btn"
              className={`px-6 py-3 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 ${loading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
            >
              {loading ? 'Generando Calendario...' : 'Generar Calendario Inteligente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SmartCalendar;