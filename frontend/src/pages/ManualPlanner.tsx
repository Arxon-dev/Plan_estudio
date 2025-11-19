import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays, startOfWeek, isSameDay } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import apiClient from '../services/api';

interface Theme {
  id: number;
  block: string;
  themeNumber: number;
  title: string;
  estimatedHours: number;
}

interface SessionAssignment {
  date: Date;
  themes: Array<{
    theme: Theme;
    hours: number;
    status: string;
    isEditable: boolean;
  }>;
}

export const ManualPlanner: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = searchParams.get('planId');

  const [themes, setThemes] = useState<Theme[]>([]);
  const [sessions, setSessions] = useState<SessionAssignment[]>([]);
  const [draggedTheme, setDraggedTheme] = useState<Theme | null>(null);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [hoursInput, setHoursInput] = useState(1);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [themesRes, sessionsRes] = await Promise.all([
        apiClient.get('/themes'),
        apiClient.get(`/study-plans/${planId}/sessions`),
      ]);

      setThemes(themesRes.data.themes || themesRes.data);
      
      // Convertir sesiones existentes a formato de asignaciones
      const assignments: SessionAssignment[] = [];
      const sessionsList = sessionsRes.data.sessions || [];
      
      sessionsList.forEach((session: any) => {
        const sessionDate = new Date(session.scheduledDate);
        let assignment = assignments.find(a => isSameDay(a.date, sessionDate));
        
        if (!assignment) {
          assignment = { date: sessionDate, themes: [] };
          assignments.push(assignment);
        }
        
        // Solo sesiones PENDING son editables
        const isEditable = session.status === 'PENDING';
        
        assignment.themes.push({
          theme: session.theme,
          hours: session.scheduledHours,
          status: session.status,
          isEditable: isEditable,
        });
      });

      setSessions(assignments);
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      toast.error(error.response?.data?.error || 'Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const handleDragStart = (theme: Theme) => {
    setDraggedTheme(theme);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (date: Date) => {
    if (!draggedTheme) return;

    setSelectedTheme(draggedTheme);
    setSelectedDate(date);
    setDraggedTheme(null);
  };

  const addThemeToDate = () => {
    if (!selectedTheme || !selectedDate || hoursInput <= 0) {
      toast.error('Selecciona un tema y número de horas válido');
      return;
    }

    setSessions(prev => {
      const newSessions = [...prev];
      let assignment = newSessions.find(s => isSameDay(s.date, selectedDate));

      if (!assignment) {
        assignment = { date: selectedDate, themes: [] };
        newSessions.push(assignment);
      }

      assignment.themes.push({
        theme: selectedTheme,
        hours: hoursInput,
        status: 'PENDING',
        isEditable: true,
      });

      return newSessions;
    });

    toast.success('Tema agregado');
    
    // Cerrar modal y resetear
    setSelectedTheme(null);
    setSelectedDate(null);
    setHoursInput(1);
  };

  const removeThemeFromDate = (date: Date, themeIndex: number) => {
    setSessions(prev => {
      const newSessions = [...prev];
      const assignment = newSessions.find(s => isSameDay(s.date, date));
      
      if (assignment) {
        const themeToRemove = assignment.themes[themeIndex];
        
        // Solo permitir eliminar sesiones editables (PENDING)
        if (!themeToRemove.isEditable) {
          toast.error('No puedes eliminar sesiones ya completadas o en progreso');
          return prev;
        }
        
        assignment.themes.splice(themeIndex, 1);
        if (assignment.themes.length === 0) {
          return newSessions.filter(s => !isSameDay(s.date, date));
        }
      }

      return newSessions;
    });

    toast.success('Tema eliminado');
  };

  const savePlan = async () => {
    try {
      // Convertir asignaciones a formato de sesiones
      // Solo guardar sesiones editables (PENDING)
      const sessionsData = sessions.flatMap(assignment =>
        assignment.themes
          .filter(item => item.isEditable) // Solo sesiones PENDING
          .map(({ theme, hours }) => ({
            themeId: theme.id,
            scheduledDate: assignment.date.toISOString(),
            scheduledHours: hours,
          }))
      );

      await apiClient.post(`/sessions/manual-plan/${planId}`, { sessions: sessionsData });
      toast.success('Plan guardado exitosamente');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar el plan');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { icon: '✅', label: 'Completada', color: 'bg-green-100 text-green-800' };
      case 'IN_PROGRESS':
        return { icon: '⏸️', label: 'En progreso', color: 'bg-blue-100 text-blue-800' };
      case 'SKIPPED':
        return { icon: '⏭️', label: 'Saltada', color: 'bg-yellow-100 text-yellow-800' };
      default:
        return null;
    }
  };
  
  const getBlockColor = (block: string) => {
    switch (block) {
      case 'ORGANIZACION':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'JURIDICO_SOCIAL':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'SEGURIDAD_NACIONAL':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-primary-500 hover:text-primary-600 transition-all duration-200 shadow-sm hover:shadow-md font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Inicio
            </button>
            <h1 className="text-2xl font-bold text-gray-900">📅 Planificación Manual</h1>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4">
        {/* Info */}
        <div className="mb-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-blue-900 font-medium mb-2">
              📝 Arrastra los temas a los días que deseas estudiarlos
            </p>
            <p className="text-blue-700 text-sm">
              ℹ️ Las sesiones ya completadas, en progreso o saltadas aparecerán bloqueadas y no se pueden editar.
              Solo puedes modificar las sesiones pendientes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Panel de Temas */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">📚 Temas Disponibles</h2>
              
              {themes.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-sm">No hay temas disponibles</p>
                  <p className="text-xs mt-2">Verifica que los temas estén cargados en la base de datos</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {themes.map(theme => (
                    <div
                      key={theme.id}
                      draggable
                      onDragStart={() => handleDragStart(theme)}
                      className={`p-3 rounded-lg border cursor-move hover:shadow-md transition-all ${getBlockColor(theme.block)}`}
                    >
                      <div className="font-semibold text-sm">Tema {theme.themeNumber}</div>
                      <div className="text-xs mt-1 line-clamp-2">{theme.title}</div>
                      <div className="text-xs mt-1 opacity-75">
                        ⏱️ ~{theme.estimatedHours}h
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Calendario Semanal */}
          <div className="lg:col-span-3">
            <div className="card">
              {/* Navegación de Semanas */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => setCurrentWeek(addDays(currentWeek, -7))}
                  className="btn-secondary"
                >
                  ← Semana anterior
                </button>
                <h3 className="text-lg font-semibold text-gray-900">
                  Semana del {format(getWeekDays()[0], 'dd MMM', { locale: es })}
                </h3>
                <button
                  onClick={() => setCurrentWeek(addDays(currentWeek, 7))}
                  className="btn-secondary"
                >
                  Semana siguiente →
                </button>
              </div>

              {/* Grid de Días */}
              <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                {getWeekDays().map(date => {
                  const assignment = sessions.find(s => isSameDay(s.date, date));
                  const totalHours = assignment?.themes.reduce((sum, t) => sum + t.hours, 0) || 0;

                  return (
                    <div
                      key={date.toISOString()}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(date)}
                      className="border-2 border-dashed border-gray-300 rounded-lg p-3 min-h-[200px] hover:border-primary-400 transition-colors"
                    >
                      {/* Encabezado del Día */}
                      <div className="text-center mb-3">
                        <div className="text-xs font-medium text-gray-500 uppercase">
                          {format(date, 'EEE', { locale: es })}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {format(date, 'dd')}
                        </div>
                        {totalHours > 0 && (
                          <div className="text-xs text-primary-600 font-medium mt-1">
                            {totalHours}h total
                          </div>
                        )}
                      </div>

                      {/* Temas Asignados */}
                      <div className="space-y-2">
                        {assignment?.themes.map((item, idx) => {
                          const statusBadge = getStatusBadge(item.status);
                          const isEditable = item.isEditable;
                          
                          return (
                            <div
                              key={idx}
                              className={`p-2 rounded border text-xs ${
                                isEditable 
                                  ? getBlockColor(item.theme.block)
                                  : 'bg-gray-50 border-gray-300 opacity-75'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-1">
                                <div className="flex-1">
                                  <div className="font-semibold">T{item.theme.themeNumber}</div>
                                  <div className="line-clamp-2 opacity-90">{item.theme.title}</div>
                                  <div className="mt-1 font-medium">{item.hours}h</div>
                                  
                                  {/* Mostrar estado si no es editable */}
                                  {!isEditable && statusBadge && (
                                    <div className={`mt-1 inline-block px-2 py-0.5 rounded text-xs ${
                                      statusBadge.color
                                    }`}>
                                      {statusBadge.icon} {statusBadge.label}
                                    </div>
                                  )}
                                </div>
                                
                                {/* Botón eliminar solo para sesiones editables */}
                                {isEditable ? (
                                  <button
                                    onClick={() => removeThemeFromDate(date, idx)}
                                    className="text-red-600 hover:text-red-800 transition-colors"
                                    title="Eliminar sesión"
                                  >
                                    ✕
                                  </button>
                                ) : (
                                  <div className="text-gray-400" title="No se puede eliminar">
                                    🔒
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Botones de Acción */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={savePlan}
                  className="flex-1 btn-primary"
                >
                  💾 Guardar Plan
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Agregar Horas */}
        {selectedTheme && selectedDate && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Agregar Tema al {format(selectedDate, 'dd/MM/yyyy')}
              </h3>
              
              <div className="mb-4">
                <div className={`p-3 rounded-lg border ${getBlockColor(selectedTheme.block)}`}>
                  <div className="font-semibold">Tema {selectedTheme.themeNumber}</div>
                  <div className="text-sm mt-1">{selectedTheme.title}</div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ¿Cuántas horas dedicarás?
                </label>
                <input
                  type="number"
                  min="0.5"
                  max="12"
                  step="0.5"
                  value={hoursInput}
                  onChange={(e) => setHoursInput(parseFloat(e.target.value))}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTheme(null);
                    setSelectedDate(null);
                  }}
                  className="flex-1 btn-secondary"
                >
                  Cancelar
                </button>
                <button
                  onClick={addThemeToDate}
                  className="flex-1 btn-primary"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
