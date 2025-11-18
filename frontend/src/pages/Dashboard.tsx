import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { studyPlanService } from '../services/studyPlanService';
import type { StudyPlan, PlanProgress, StudySession } from '../services/studyPlanService';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Helper para formatear horas de manera más legible
const formatHours = (hours: number | string): string => {
  // Convertir a número si es string
  const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
  
  if (isNaN(numHours)) {
    return '0 min';
  }
  
  if (numHours >= 1) {
    return numHours % 1 === 0 ? `${numHours}h` : `${numHours.toFixed(1)}h`;
  } else {
    const minutes = Math.round(numHours * 60);
    return `${minutes} min`;
  }
};

export const Dashboard: React.FC = () => {
  const [plan, setPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<PlanProgress | null>(null);
  const [todaySessions, setTodaySessions] = useState<StudySession[]>([]);
  const [generationStatus, setGenerationStatus] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Calcular información del buffer
  const calculateBufferInfo = () => {
    if (!plan) return null;
    
    const bufferDays = 30;
    const examDate = new Date(plan.examDate);
    const bufferStartDate = new Date(examDate);
    bufferStartDate.setDate(bufferStartDate.getDate() - bufferDays);
    
    const today = new Date();
    const daysUntilBuffer = Math.ceil((bufferStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      bufferStartDate,
      daysUntilBuffer: Math.max(0, daysUntilBuffer),
      isInBufferPeriod: today >= bufferStartDate,
      bufferDays
    };
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const activePlan = await studyPlanService.getActivePlan();
      setPlan(activePlan);

      let planProgress: PlanProgress | null = null;
      let sessions: StudySession[] = [];

      try {
        planProgress = await studyPlanService.getPlanProgress(activePlan.id);
        setProgress(planProgress);
      } catch {}

      try {
        sessions = await studyPlanService.getPlanSessions(activePlan.id);
      } catch {}

      const today = format(new Date(), 'yyyy-MM-dd');
      const todaySessionsFiltered = sessions.filter((session: StudySession) =>
        format(new Date(session.scheduledDate), 'yyyy-MM-dd') === today
      );
      setTodaySessions(todaySessionsFiltered);

      if (!sessions || sessions.length === 0) {
        try {
          const status = await studyPlanService.getGenerationStatus(activePlan.id);
          setGenerationStatus(status);
        } catch {
          setGenerationStatus(null);
        }
      } else {
        setGenerationStatus(null);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        setPlan(null);
        setProgress(null);
      } else {
        setGenerationStatus({ generationCompleted: false, totalSessions: 0 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  // Mostrar mensaje cuando no hay plan activo
  if (!plan || !progress) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Plan de Estudio</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                ¡Hola, {user?.firstName}!
              </span>
              <button onClick={handleLogout} className="btn-secondary text-sm">
                Cerrar Sesión
              </button>
            </div>
          </div>
        </header>

        {/* No Plan Message */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-primary-100 rounded-full mb-6">
              <span className="text-5xl">📚</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Aún no tienes un plan de estudio
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Crea tu primer plan de estudio personalizado con nuestro Calendario Inteligente.
              <br />
              Te ayudaremos a organizar tu tiempo y maximizar tu aprendizaje.
            </p>
            <button
              onClick={() => navigate('/smart-calendar')}
              className="btn-primary text-lg px-8 py-3"
            >
              🧠 Crear Mi Calendario Inteligente
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Plan de Estudio</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              ¡Hola, {user?.firstName}!
            </span>
            <button
              onClick={() => navigate('/today')}
              className="px-3 py-1.5 text-sm bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors font-medium"
              title="Ver agenda de hoy"
            >
              📅 Agenda de Hoy
            </button>
            <button 
              onClick={() => navigate('/profile')} 
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
              title="Ver mi perfil"
            >
              👤 Mi Perfil
            </button>
            <button onClick={handleLogout} className="btn-secondary text-sm">
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {generationStatus && !generationStatus.generationCompleted && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
            <p className="text-blue-800 text-sm">
              🧠 Generación en curso: creando sesiones del plan.
              {typeof generationStatus.totalSessions === 'number' && (
                <> Total creadas: {generationStatus.totalSessions}.</>
              )}
            </p>
          </div>
        )}

        {/* Buffer Information */}
        {(() => {
          const bufferInfo = calculateBufferInfo();
          if (!bufferInfo) return null;
          
          if (bufferInfo.isInBufferPeriod) {
            return (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start">
                  <span className="text-yellow-600 text-xl mr-3">⚠️</span>
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800 mb-1">📅 Período de Preparación Libre</h3>
                    <p className="text-sm text-yellow-700 mb-2">
                      Estás en el período de preparación final (últimos 30 días antes del examen). 
                      Aprovecha para repasar temas clave, hacer simulacros y consolidar conocimientos.
                    </p>
                    <p className="text-xs text-yellow-600">
                      📅 Examen: {format(new Date(plan.examDate), 'dd/MM/yyyy')} • 
                      🎯 Días restantes: {bufferInfo.daysUntilBuffer} días
                    </p>
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start">
                  <span className="text-blue-600 text-xl mr-3">ℹ️</span>
                  <div>
                    <h3 className="text-sm font-medium text-blue-800 mb-1">📅 Tiempo para preparación final</h3>
                    <p className="text-sm text-blue-700 mb-2">
                      Las sesiones programadas terminan el {format(bufferInfo.bufferStartDate, 'dd/MM/yyyy')} 
                      (30 días antes del examen) para que puedas preparar los temas que necesites y hacer simulacros.
                    </p>
                    <p className="text-xs text-blue-600">
                      📅 Quedan {bufferInfo.daysUntilBuffer} días hasta el período de preparación libre
                    </p>
                  </div>
                </div>
              </div>
            );
          }
        })()}
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Progreso General</h3>
            <div className="flex items-end gap-2">
              <p className="text-3xl font-bold text-primary-600">{progress.progressPercentage}%</p>
              <p className="text-sm text-gray-500 mb-1">completado</p>
            </div>
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full"
                style={{ width: `${progress.progressPercentage}%` }}
              ></div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Días Restantes</h3>
            <p className="text-3xl font-bold text-gray-900">{progress.daysRemaining}</p>
            <p className="text-sm text-gray-500 mt-1">
              hasta el {format(new Date(plan.examDate), 'dd/MM/yyyy')}
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Sesiones Completadas</h3>
            <p className="text-3xl font-bold text-green-600">{progress.completedSessions}</p>
            <p className="text-sm text-gray-500 mt-1">
              de {progress.totalSessions} sesiones
            </p>
          </div>

          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Horas de Estudio</h3>
            <p className="text-3xl font-bold text-gray-900">{progress.totalHoursCompleted.toFixed(1)}h</p>
            <p className="text-sm text-gray-500 mt-1">
              de {progress.totalHoursScheduled.toFixed(1)}h totales
            </p>
          </div>
        </div>

        {/* Today's Sessions */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">📅 Sesiones de Hoy</h2>
            <span className="text-sm text-gray-500">
              {format(new Date(), "EEEE, d 'de' MMMM", { locale: es })}
            </span>
          </div>

          {todaySessions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No tienes sesiones programadas para hoy</p>
              <p className="text-sm mt-2">¡Disfruta tu día de descanso! 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-4 rounded-lg border-2 ${
                    session.status === 'COMPLETED'
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{displayTitle(session)}</h3>
                      <p className="text-sm text-gray-500 mt-1">
                        {formatHours(session.scheduledHours)}
                        {session.sessionType === 'TEST' && (session.notes || '').toLowerCase().includes('fuera de horario') && (
                          <span className="text-red-600 font-medium"> (fuera de horario)</span>
                        )}
                        {' '}• Bloque: {session.theme?.block}
                      </p>
                      {session.notes && (
                        <p className="text-sm text-gray-600 mt-2 italic">{session.notes}</p>
                      )}
                    </div>
                    {session.status === 'COMPLETED' ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✓ Completada
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                        Pendiente
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/sessions')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📚 Ver Todas las Sesiones</h3>
            <p className="text-sm text-gray-600">Consulta tu calendario completo de estudio</p>
          </button>

          <button
            onClick={() => navigate('/themes')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-left"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📖 Ver Temas</h3>
            <p className="text-sm text-gray-600">Revisa el contenido de los 21 temas</p>
          </button>


          <button
            onClick={() => navigate(`/manual-planner?planId=${plan.id}`)}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-left bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">✏️ Editar Manualmente</h3>
            <p className="text-sm text-gray-600">Organiza tus sesiones a tu manera</p>
          </button>
          
          <button
            onClick={() => navigate('/smart-calendar')}
            className="card hover:shadow-lg transition-shadow cursor-pointer text-left bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🧠 Calendario Inteligente</h3>
            <p className="text-sm text-gray-600">Genera un plan con rotación de temas y repetición espaciada</p>
          </button>
        </div>
      </main>
    </div>
  );
};
  const displayTitle = (s: any): string => {
    const base = s.theme?.title || `Tema ${s.themeId}`;
    const n = (s.notes || '').toString();
    const idx = n.indexOf('— Parte');
    if (idx > -1) {
      const part = n.substring(idx);
      return `${base} ${part}`;
    }
    return base;
  };
