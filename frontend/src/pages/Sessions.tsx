import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlanService } from '../services/studyPlanService';
import { sessionService } from '../services/sessionService';
import type { StudySession } from '../services/studyPlanService';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isSameDay, startOfMonth, endOfMonth, addMonths, subMonths, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';

// Helper para formatear horas de manera más legible
const formatHours = (hours: number | string): string => {
  // Convertir a número si es string
  const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  
  if (isNaN(numHours)) {
    return '0 min';
  }
  
  if (numHours >= 1) {
    // Si es 1 hora o más, mostrar como horas con 1 decimal
    return numHours % 1 === 0 ? `${numHours}h` : `${numHours.toFixed(1)}h`;
  } else {
    // Si es menos de 1 hora, convertir a minutos
    const minutes = Math.round(numHours * 60);
    return `${minutes} min`;
  }
};

// Helper para determinar el tipo de sesión
const tagFor = (notes?: string, sessionType?: string): string => {
  // Primero intentar por sessionType (más confiable)
  if (sessionType === 'TEST') return 'Test';
  if (sessionType === 'SIMULATION') return 'Simulacro';
  if (sessionType === 'REVIEW') return 'Repaso';
  if (sessionType === 'STUDY') return 'Estudio';
  
  // Fallback a las notas si no hay sessionType
  const n = (notes || '').toUpperCase();
  if (n.includes('REVIEW') || n.includes('REPASO')) return 'Repaso';
  if (n.includes('SIMULATION') || n.includes('SIMULACRO')) return 'Simulacro';
  if (n.includes('TEST')) return 'Test';
  return 'Estudio';
};

export const Sessions: React.FC = () => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<StudySession[]>([]);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'SKIPPED' | 'IN_PROGRESS'>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showInProgressModal, setShowInProgressModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<StudySession | null>(null);
  const [completionData, setCompletionData] = useState({
    hours: '',
    difficulty: 3,
    notes: '',
    keyPoints: '',
  });
  const [inProgressData, setInProgressData] = useState({
    hours: '',
    notes: '',
  });
  const [showDayDetailsModal, setShowDayDetailsModal] = useState(false);
  const [selectedDaySessions, setSelectedDaySessions] = useState<StudySession[]>([]);
  const [selectedDayDate, setSelectedDayDate] = useState<Date | null>(null);
  const navigate = useNavigate();

  const displayTitle = (s: StudySession): string => {
    if ((s as any).subThemeLabel) {
      return (s as any).subThemeLabel as string;
    }
    const base = s.theme?.title || `Tema ${s.themeId}`;
    const n = (s.notes || '').toString();
    const idx = n.indexOf('— Parte');
    if (idx > -1) {
      const part = n.substring(idx);
      return `${base} ${part}`;
    }
    return base;
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, currentWeek, currentMonth, viewMode, filterStatus]);

  const loadData = async () => {
    try {
      const activePlan = await studyPlanService.getActivePlan();
      const planSessions = await studyPlanService.getPlanSessions(activePlan.id);
      setSessions(planSessions);
    } catch (error) {
      toast.error('Error al cargar las sesiones');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = sessions;

    // Filter by date range depending on view mode
    if (viewMode === 'list') {
      // Vista de lista: filtrar por semana
      const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.scheduledDate);
        return sessionDate >= weekStart && sessionDate <= weekEnd;
      });
    } else {
      // Vista de calendario: filtrar por mes (incluyendo días del mes anterior/siguiente visibles)
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
      const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
      
      filtered = filtered.filter((session) => {
        const sessionDate = new Date(session.scheduledDate);
        return sessionDate >= calendarStart && sessionDate <= calendarEnd;
      });
    }

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((session) => session.status === filterStatus);
    }

    setFilteredSessions(filtered);
  };

  const handleCompleteSession = async (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setSelectedSession(session);
    setCompletionData({
      hours: session.scheduledHours.toString(),
      difficulty: 3,
      notes: '',
      keyPoints: '',
    });
    setShowCompleteModal(true);
  };

  const submitCompleteSession = async () => {
    if (!selectedSession) return;

    try {
      const hours = parseFloat(completionData.hours);
      if (isNaN(hours) || hours <= 0) {
        toast.error('Por favor ingresa un número válido de horas');
        return;
      }

      await sessionService.completeSession(selectedSession.id, {
        completedHours: hours,
        difficulty: completionData.difficulty,
        notes: completionData.notes || undefined,
        keyPoints: completionData.keyPoints || undefined,
      });

      toast.success('¡Sesión completada!');
      setShowCompleteModal(false);
      setSelectedSession(null);
      loadData();
    } catch (error) {
      toast.error('Error al completar la sesión');
    }
  };

  const handleSkipSession = async (sessionId: number) => {
    try {
      if (!confirm('¿Estás seguro de que quieres saltar esta sesión?')) return;
      
      await sessionService.skipSession(sessionId);
      toast.success('Sesión saltada');
      loadData();
    } catch (error) {
      toast.error('Error al saltar la sesión');
    }
  };

  const handleMarkInProgress = async (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setSelectedSession(session);
    setInProgressData({
      hours: '',
      notes: '',
    });
    setShowInProgressModal(true);
  };

  const submitInProgress = async () => {
    if (!selectedSession) return;

    try {
      const hours = parseFloat(inProgressData.hours);
      if (isNaN(hours) || hours <= 0) {
        toast.error('Por favor ingresa un número válido de horas');
        return;
      }

      if (hours >= selectedSession.scheduledHours) {
        toast.error(`Las horas parciales deben ser menores a ${formatHours(selectedSession.scheduledHours)}. Usa "Completar" si terminaste.`);
        return;
      }

      await sessionService.markInProgress(selectedSession.id, hours, inProgressData.notes || undefined);
      toast.success('¡Sesión marcada en progreso!');
      setShowInProgressModal(false);
      setSelectedSession(null);
      loadData();
    } catch (error) {
      toast.error('Error al marcar la sesión en progreso');
    }
  };

  const handleContinueSession = async (sessionId: number) => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    setSelectedSession(session);
    setCompletionData({
      hours: (session.scheduledHours - (session.completedHours || 0)).toString(),
      difficulty: 3,
      notes: session.notes || '',
      keyPoints: '',
    });
    setShowCompleteModal(true);
  };

  const groupSessionsByDay = () => {
    const grouped: { [key: string]: StudySession[] } = {};
    
    filteredSessions.forEach((session) => {
      const dateKey = format(new Date(session.scheduledDate), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(session);
    });

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  };

  const getCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  };

  const getSessionsForDay = (date: Date) => {
    return filteredSessions.filter(session => 
      isSameDay(new Date(session.scheduledDate), date)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'IN_PROGRESS':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'SKIPPED':
        return 'bg-gray-100 border-gray-300 text-gray-600';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const groupedSessions = groupSessionsByDay();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Volver al Dashboard
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Calendario de Sesiones</h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Sessions List */}
        {viewMode === 'list' ? (
          filteredSessions.length === 0 ? (
            <div className="card text-center py-12">
              <p className="text-gray-500 text-lg">No hay sesiones programadas para esta semana</p>
            </div>
          ) : (
            <div className="space-y-6">
              {groupedSessions.map(([dateKey, daySessions]) => {
              const date = new Date(dateKey);
              const isToday = isSameDay(date, new Date());

              return (
                <div key={dateKey} className="card">
                  <div className={`flex items-center gap-2 mb-4 pb-3 border-b ${isToday ? 'border-primary-200' : 'border-gray-200'}`}>
                    <h2 className={`text-lg font-bold ${isToday ? 'text-primary-600' : 'text-gray-900'}`}>
                      {format(date, "EEEE, d 'de' MMMM", { locale: es })}
                    </h2>
                    {isToday && (
                      <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                        HOY
                      </span>
                    )}
                  </div>

                  <div className="space-y-3">
                    {daySessions.map((session) => (
                      <div
                        key={session.id}
                        className={`p-4 rounded-lg border-2 ${
                          session.status === 'COMPLETED'
                            ? 'border-green-200 bg-green-50'
                            : session.status === 'SKIPPED'
                            ? 'border-gray-300 bg-gray-100'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{displayTitle(session)}</h3>
                              <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                                {tagFor(session.notes, session.sessionType)}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                              <span>📚 Bloque: {session.theme?.block.replace('_', ' ')}</span>
                              <span>
                                ⏱️ {formatHours(session.scheduledHours)} programadas
                                {session.sessionType === 'TEST' && (session.notes || '').toLowerCase().includes('fuera de horario') && (
                                  <span className="text-red-600 font-medium"> (fuera de horario)</span>
                                )}
                              </span>
                              {session.completedHours && (
                                <span className="text-green-600 font-medium">
                                  ✓ {formatHours(session.completedHours)} completadas
                                </span>
                              )}
                            </div>
                            
                            {/* Dificultad */}
                            {session.status === 'COMPLETED' && (session as any).difficulty && (
                              <div className="flex items-center gap-2 mt-2">
                                <span className="text-sm text-gray-600">🎯 Dificultad:</span>
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} className="text-yellow-500">
                                      {star <= (session as any).difficulty ? '⭐' : '☆'}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Puntos Clave */}
                            {session.status === 'COMPLETED' && (session as any).keyPoints && (
                              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <p className="text-sm font-medium text-blue-900 mb-1">📝 Puntos clave aprendidos:</p>
                                <p className="text-sm text-blue-800 whitespace-pre-line">{(session as any).keyPoints}</p>
                              </div>
                            )}
                            
                            {/* Notas */}
                            {session.notes && (
                              <p className="text-sm text-gray-600 mt-2 italic">💬 {session.notes}</p>
                            )}
                          </div>

                          <div className="flex flex-col gap-2">
                            {session.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleCompleteSession(session.id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  ✓ Completar
                                </button>
                                <button
                                  onClick={() => handleMarkInProgress(session.id)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  ⏸️ En Progreso
                                </button>
                                <button
                                  onClick={() => handleSkipSession(session.id)}
                                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Saltar
                                </button>
                              </>
                            )}
                            {session.status === 'IN_PROGRESS' && (
                              <>
                                <div className="px-4 py-2 bg-blue-100 rounded-lg">
                                  <p className="text-xs text-blue-800 font-medium text-center">⏸️ En Progreso</p>
                                  <p className="text-xs text-blue-600 text-center mt-1">
                                    {formatHours(session.completedHours || 0)} / {formatHours(session.scheduledHours)}
                                  </p>
                                </div>
                                <button
                                  onClick={() => handleContinueSession(session.id)}
                                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                  ▶️ Continuar
                                </button>
                              </>
                            )}
                            {session.status === 'COMPLETED' && (
                              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
                                ✓ Completada
                              </span>
                            )}
                            {session.status === 'SKIPPED' && (
                              <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center">
                                Saltada
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
          )
        ) : (
          /* Vista de Calendario Mensual */
          <div className="card">
            {/* Encabezados de días */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
                <div key={day} className="text-center font-semibold text-gray-700 text-sm py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Grid de días del mes */}
            <div className="grid grid-cols-7 gap-2">
              {getCalendarDays().map((day, idx) => {
                const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                const isToday = isSameDay(day, new Date());
                const daySessions = getSessionsForDay(day);

                return (
                  <div
                    key={idx}
                    className={`min-h-[120px] p-2 rounded-lg border ${
                      isToday
                        ? 'border-primary-500 bg-primary-50'
                        : isCurrentMonth
                        ? 'border-gray-200 bg-white'
                        : 'border-gray-100 bg-gray-50'
                    }`}
                  >
                    <div className={`text-sm font-medium mb-1 ${
                      isToday ? 'text-primary-700' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1">
                      {daySessions.slice(0, 3).map((session) => (
                        <div
                          key={session.id}
                          onClick={() => {
                            if (session.status === 'PENDING') {
                              handleCompleteSession(session.id);
                            } else if (session.status === 'IN_PROGRESS') {
                              handleContinueSession(session.id);
                            }
                          }}
                          className={`text-xs p-1.5 rounded border cursor-pointer hover:shadow-sm transition-shadow ${
                            getStatusColor(session.status)
                          }`}
                        >
                          <div className="font-medium truncate" title={displayTitle(session)}>
                            {displayTitle(session)}
                          </div>
                          <div className="text-[10px] opacity-75">
                            {tagFor(session.notes, session.sessionType)} • {formatHours(session.scheduledHours)}
                          </div>
                        </div>
                      ))}  {daySessions.length > 3 && (
                        <button
                          onClick={() => {
                            setSelectedDaySessions(daySessions);
                            setSelectedDayDate(day);
                            setShowDayDetailsModal(true);
                          }}
                          className="text-[10px] text-primary-600 hover:text-primary-700 font-medium text-center w-full py-1 hover:bg-primary-50 rounded transition-colors cursor-pointer"
                        >
                          +{daySessions.length - 3} más 👁️
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation - Replica of top controls */}
      <div className="bg-white border-t shadow-lg sticky bottom-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="card mb-0">
            <div className="flex flex-col gap-4">
              {/* View Mode Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    📝 Vista de Lista
                  </button>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      viewMode === 'calendar'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    🗓️ Vista de Calendario
                  </button>
                </div>
              </div>

              {/* Navigation: Week or Month */}
              {viewMode === 'list' ? (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                    className="btn-secondary"
                  >
                    ← Semana Anterior
                  </button>
                  <span className="font-semibold text-gray-900">
                    {format(startOfWeek(currentWeek, { weekStartsOn: 1 }), "d 'de' MMM", { locale: es })} -{' '}
                    {format(endOfWeek(currentWeek, { weekStartsOn: 1 }), "d 'de' MMM yyyy", { locale: es })}
                  </span>
                  <button
                    onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                    className="btn-secondary"
                  >
                    Semana Siguiente →
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4">
                  <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="btn-secondary"
                  >
                    ← Mes Anterior
                  </button>
                  <span className="font-semibold text-gray-900 text-lg">
                    {format(currentMonth, "MMMM yyyy", { locale: es })}
                  </span>
                  <button
                    onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                    className="btn-secondary"
                  >
                    Mes Siguiente →
                  </button>
                </div>
              )}

              {/* Status Filter */}
              <div className="flex gap-2 flex-wrap justify-center">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'ALL'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Todas
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'PENDING'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Pendientes
                </button>
                <button
                  onClick={() => setFilterStatus('IN_PROGRESS')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'IN_PROGRESS'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  En Progreso
                </button>
                <button
                  onClick={() => setFilterStatus('COMPLETED')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filterStatus === 'COMPLETED'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  Completadas
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Completar Sesión */}
      {showCompleteModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ✅ Completar Sesión
              </h2>

              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900">{displayTitle(selectedSession)}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  📚 Bloque: {selectedSession.theme?.block.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-4">
                {/* Horas Completadas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⏱️ ¿Cuántas horas estudiaste?
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={completionData.hours}
                    onChange={(e) => setCompletionData({ ...completionData, hours: e.target.value })}
                    className="input-field"
                    placeholder="Ej: 2.5"
                  />
                </div>

                {/* Dificultad */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🎯 ¿Qué tan difícil fue?
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setCompletionData({ ...completionData, difficulty: star })}
                        className="text-3xl transition-transform hover:scale-110"
                      >
                        {star <= completionData.difficulty ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-gray-600">
                      {completionData.difficulty === 1 && 'Muy fácil'}
                      {completionData.difficulty === 2 && 'Fácil'}
                      {completionData.difficulty === 3 && 'Normal'}
                      {completionData.difficulty === 4 && 'Difícil'}
                      {completionData.difficulty === 5 && 'Muy difícil'}
                    </span>
                  </div>
                </div>

                {/* Puntos Clave */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📝 Puntos clave aprendidos (opcional)
                  </label>
                  <textarea
                    value={completionData.keyPoints}
                    onChange={(e) => setCompletionData({ ...completionData, keyPoints: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Ej: Estructura de las Fuerzas Armadas, cadena de mando..."
                  />
                </div>

                {/* Notas Adicionales */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={completionData.notes}
                    onChange={(e) => setCompletionData({ ...completionData, notes: e.target.value })}
                    className="input-field"
                    rows={2}
                    placeholder="Ej: Necesito repasar la sección 3..."
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowCompleteModal(false);
                    setSelectedSession(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitCompleteSession}
                  className="flex-1 btn-primary"
                >
                  ✅ Completar Sesión
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Marcar En Progreso */}
      {showInProgressModal && selectedSession && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                ⏸️ Marcar como En Progreso
              </h2>

              <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-200">
                <h3 className="font-semibold text-gray-900">{displayTitle(selectedSession)}</h3>
                <p className="text-sm text-blue-600 mt-1">
                  📚 Bloque: {selectedSession.theme?.block.replace('_', ' ')}
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  ⏱️ Total programado: {formatHours(selectedSession.scheduledHours)}
                </p>
              </div>

              <div className="space-y-4">
                {/* Horas Estudiadas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ⏱️ ¿Cuántas horas has estudiado hasta ahora?
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max={selectedSession.scheduledHours}
                    value={inProgressData.hours}
                    onChange={(e) => setInProgressData({ ...inProgressData, hours: e.target.value })}
                    className="input-field"
                    placeholder="Ej: 1.5"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Máximo: {formatHours(selectedSession.scheduledHours)}. Si completaste todo, usa "Completar" en su lugar.
                  </p>
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💬 Notas sobre el progreso (opcional)
                  </label>
                  <textarea
                    value={inProgressData.notes}
                    onChange={(e) => setInProgressData({ ...inProgressData, notes: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Ej: Completé las primeras secciones, necesito continuar mañana..."
                  />
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-4">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> Podrás continuar con esta sesión después usando el botón "▶️ Continuar".
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowInProgressModal(false);
                    setSelectedSession(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={submitInProgress}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                >
                  ⏸️ Marcar En Progreso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalles del Día */}
      {showDayDetailsModal && selectedDayDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  📅 {format(selectedDayDate, "EEEE, d 'de' MMMM yyyy", { locale: es })}
                </h2>
                <button
                  onClick={() => {
                    setShowDayDetailsModal(false);
                    setSelectedDaySessions([]);
                    setSelectedDayDate(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="mb-4 flex items-center gap-2 text-sm text-gray-600">
                <span>📋 {selectedDaySessions.length} sesiones programadas</span>
                <span>•</span>
                <span>⏱️ {formatHours(selectedDaySessions.reduce((sum, s) => sum + s.scheduledHours, 0))} totales</span>
              </div>

              <div className="space-y-3">
                {selectedDaySessions.map((session) => (
                  <div
                    key={session.id}
                    className={`p-4 rounded-lg border-2 ${
                      session.status === 'COMPLETED'
                        ? 'border-green-200 bg-green-50'
                        : session.status === 'IN_PROGRESS'
                        ? 'border-blue-200 bg-blue-50'
                        : session.status === 'SKIPPED'
                        ? 'border-gray-300 bg-gray-100'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-gray-900">{displayTitle(session)}</h3>
                        <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                          {tagFor(session.notes, session.sessionType)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>📚 Bloque: {session.theme?.block.replace('_', ' ')}</span>
                        <span>⏱️ {formatHours(session.scheduledHours)}</span>
                        {session.completedHours && (
                          <span className="text-green-600 font-medium">
                            ✓ {formatHours(session.completedHours)} completadas
                          </span>
                        )}
                      </div>
                        {session.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">💬 {session.notes}</p>
                        )}
                      </div>

                      <div className="flex flex-col gap-2">
                        {session.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                setShowDayDetailsModal(false);
                                handleCompleteSession(session.id);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              ✓ Completar
                            </button>
                            <button
                              onClick={() => {
                                setShowDayDetailsModal(false);
                                handleMarkInProgress(session.id);
                              }}
                              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              ⏸️ En Progreso
                            </button>
                          </>
                        )}
                        {session.status === 'IN_PROGRESS' && (
                          <>
                            <div className="px-4 py-2 bg-blue-100 rounded-lg">
                              <p className="text-xs text-blue-800 font-medium text-center">⏸️ En Progreso</p>
                              <p className="text-xs text-blue-600 text-center mt-1">
                                {formatHours(session.completedHours || 0)} / {formatHours(session.scheduledHours)}
                              </p>
                            </div>
                            <button
                              onClick={() => {
                                setShowDayDetailsModal(false);
                                handleContinueSession(session.id);
                              }}
                              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                              ▶️ Continuar
                            </button>
                          </>
                        )}
                        {session.status === 'COMPLETED' && (
                          <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
                            ✓ Completada
                          </span>
                        )}
                        {session.status === 'SKIPPED' && (
                          <span className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium text-center">
                            Saltada
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowDayDetailsModal(false);
                    setSelectedDaySessions([]);
                    setSelectedDayDate(null);
                  }}
                  className="btn-secondary"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
