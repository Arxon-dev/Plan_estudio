import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { studyPlanService } from '../services/studyPlanService';
import { sessionService } from '../services/sessionService';
import { Header } from '../components/Header';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../contexts/AuthContext';

interface AgendaData {
  date: string;
  capacityHours: number;
  usedHours: number;
  freeHours: number;
  sessions: any[];
  recommendations: any[];
}

interface ThemeStat {
  themeId: number;
  easeFactor: number;
  successRate: number;
  intervalDays: number;
  theme?: { id: number; title: string };
}

const tagFor = (notes?: string, sessionType?: string) => {
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

// Guía para el selector de dificultad (0–5)
const DIFFICULTY_INFO: Record<number, string> = {
  0: 'No recuerdo nada / muy difícil',
  1: 'Recuerdo muy limitado / muy difícil',
  2: 'Recuerdo parcial / costó bastante',
  3: 'Correcto / razonable',
  4: 'Bien / con soltura',
  5: 'Perfecto / muy fluido',
};

export const Today: React.FC = () => {
  const [agenda, setAgenda] = useState<AgendaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [planId, setPlanId] = useState<number | null>(null);
  const [themeStats, setThemeStats] = useState<ThemeStat[]>([]);
  const [difficultyBySession, setDifficultyBySession] = useState<Record<number, number>>({});
  const navigate = useNavigate();
  const { user } = useAuth();
  const isPremium = user?.isPremium;

  const todayStr = format(new Date(), 'yyyy-MM-dd');

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

  const loadAgenda = async () => {
    try {
      const activePlan = await studyPlanService.getActivePlan();
      setPlanId(activePlan.id);
      const data = await sessionService.getAgenda(activePlan.id, todayStr);
      setAgenda(data);
      const stats = await studyPlanService.getThemeStats(activePlan.id);
      setThemeStats(stats);
    } catch (error) {
      toast.error('No se pudo cargar la agenda de hoy');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAgenda();
  }, []);

  const handleAddRecommendation = async (rec: any) => {
    if (!planId) return;
    try {
      await sessionService.addAgendaRecommendation(planId, todayStr, rec.themeId, rec.recommendedHours);
      toast.success('Sesión añadida a la agenda');
      setIsLoading(true);
      await loadAgenda();
    } catch (e) {
      toast.error('No se pudo añadir la recomendación');
    }
  };

  const statForTheme = (themeId: number): ThemeStat | undefined => themeStats.find(s => s.themeId === themeId);
  const masteryBadge = (stat?: ThemeStat) => {
    if (!stat) return { label: 'sin datos', color: 'bg-gray-200 text-gray-700' };
    const ef = Number(stat.easeFactor || 2.5);
    const sr = Number(stat.successRate || 1.0);
    // Semáforo simple basado en EF y éxito
    if (ef >= 2.3 && sr >= 0.8) return { label: 'alto dominio', color: 'bg-green-100 text-green-700' };
    if (ef >= 1.8 && sr >= 0.6) return { label: 'medio', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'refuerzo', color: 'bg-red-100 text-red-700' };
  };

  const dueBadge = (session: any) => {
    const isReview = (session.notes || '').toUpperCase().includes('REVIEW');
    if (!isReview) return null;
    const dayStart = new Date(agenda?.date || todayStr);
    dayStart.setHours(0, 0, 0, 0);
    const due = session.dueDate ? new Date(session.dueDate) : dayStart;
    due.setHours(0, 0, 0, 0);
    if (due < dayStart) return <span className="inline-block px-2 py-1 text-xs rounded bg-red-100 text-red-700">vencido</span>;
    if (due.getTime() === dayStart.getTime()) return <span className="inline-block px-2 py-1 text-xs rounded bg-orange-100 text-orange-700">hoy</span>;
    return <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">pronto</span>;
  };

  const handleDifficultyChange = (sessionId: number, value: string) => {
    const num = Math.max(0, Math.min(5, Number(value)));
    setDifficultyBySession(prev => ({ ...prev, [sessionId]: num }));
  };

  const handleCompleteQuick = async (session: any) => {
    try {
      const diff = difficultyBySession[session.id] ?? 3;
      await sessionService.completeSession(session.id, { completedHours: session.scheduledHours, difficulty: diff });
      toast.success('Sesión completada');
      setIsLoading(true);
      await loadAgenda();
    } catch (e) {
      toast.error('No se pudo completar la sesión');
    }
  };

  const handleSkipQuick = async (session: any) => {
    try {
      await sessionService.skipSession(session.id, 'Saltada desde Agenda');
      toast.success('Sesión saltada');
      setIsLoading(true);
      await loadAgenda();
    } catch (e) {
      toast.error('No se pudo saltar la sesión');
    }
  };

  const handleInProgressQuick = async (session: any) => {
    try {
      await sessionService.markInProgress(session.id, Math.min(0.5, Number(session.scheduledHours || 0)), 'Marcada en progreso desde Agenda');
      toast.success('Sesión en progreso');
      setIsLoading(true);
      await loadAgenda();
    } catch (e) {
      toast.error('No se pudo marcar en progreso');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!agenda) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Agenda de Hoy</h1>
        <p className="text-gray-600">No hay datos disponibles.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Agenda de Hoy" showBack={true} backPath="/dashboard">
        <div className="flex items-center gap-4">
          <div className="text-sm text-gray-600 hidden md:block">{agenda ? format(new Date(agenda.date), 'PPP', { locale: es }) : ''}</div>
          <button
            onClick={() => navigate('/profile')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all duration-200 font-medium flex items-center gap-2 ${isPremium
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-md hover:shadow-lg hover:-translate-y-0.5'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            title="Ver mi perfil"
          >
            {isPremium ? (
              <>
                <SparklesIcon className="w-4 h-4 text-amber-100" />
                Mi Perfil
              </>
            ) : (
              '👤 Mi Perfil'
            )}
          </button>
        </div>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Resumen de capacidad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Capacidad</h3>
            <p className="text-2xl font-bold text-gray-900">{agenda.capacityHours.toFixed(1)}h</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Ocupado</h3>
            <p className="text-2xl font-bold text-blue-700">{agenda.usedHours.toFixed(1)}h</p>
          </div>
          <div className="card">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Libre</h3>
            <p className="text-2xl font-bold text-green-600">{agenda.freeHours.toFixed(1)}h</p>
          </div>
        </div>

        {/* Sesiones del día */}
        <div className="card mb-8">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Sesiones de hoy</h2>
            <button onClick={loadAgenda} className="btn-secondary">↻ Actualizar</button>
          </div>
          <div className="space-y-2">
            {agenda.sessions.length === 0 ? (
              <p className="text-gray-600">No hay sesiones programadas para hoy.</p>
            ) : (
              agenda.sessions.map((s, idx) => {
                const stat = statForTheme(s.themeId);
                const badge = masteryBadge(stat);
                const isReview = (s.notes || '').toUpperCase().includes('REVIEW');
                const nextReviewDate = isReview && stat ? addDays(new Date(agenda.date), Number(stat.intervalDays || 1)) : null;
                return (
                  <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="inline-block px-2 py-1 text-xs rounded bg-gray-100">
                        {tagFor(s.notes, s.sessionType)}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs rounded ${badge.color}`}>{badge.label}</span>
                      {dueBadge(s)}
                      <span className="font-medium">{displayTitle(s)}</span>
                      <span className="text-gray-500 ml-2">
                        • {typeof s.scheduledHours === 'number' ? `${s.scheduledHours.toFixed(1)}h` : s.scheduledHours}
                        {s.sessionType === 'TEST' && (s.notes || '').toLowerCase().includes('fuera de horario') && (
                          <span className="text-red-600 font-medium"> (fuera de horario)</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="relative group">
                        <label className="text-sm text-gray-700">Dificultad</label>
                        <span className="ml-1 inline-block w-5 h-5 text-xs bg-gray-200 rounded-full text-gray-700 text-center align-middle cursor-help">?</span>
                        <div className="hidden group-hover:block absolute z-10 mt-1 p-2 bg-white border rounded shadow text-xs w-64">
                          <p className="font-semibold mb-1">Guía de valores</p>
                          {([0, 1, 2, 3, 4, 5] as number[]).map(v => (
                            <div key={v} className="flex gap-2">
                              <span className="font-medium w-4">{v}</span>
                              <span className="text-gray-700">{DIFFICULTY_INFO[v]}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <select
                        className="px-2 py-1 border rounded text-sm"
                        value={difficultyBySession[s.id] ?? 3}
                        onChange={e => handleDifficultyChange(s.id, e.target.value)}
                      >
                        {[0, 1, 2, 3, 4, 5].map(v => (
                          <option key={v} value={v}>{v}</option>
                        ))}
                      </select>
                      <button className="btn-secondary" onClick={() => handleInProgressQuick(s)}>⏳ En progreso</button>
                      <button className="btn-primary" onClick={() => handleCompleteQuick(s)}>✅ Completar</button>
                      <button className="px-3 py-1.5 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg" onClick={() => handleSkipQuick(s)}>⏭️ Saltar</button>
                    </div>
                    {isReview && nextReviewDate && (
                      <div className="mt-2 text-xs text-blue-700">
                        Próximo repaso estimado: {format(nextReviewDate, 'dd/MM/yyyy', { locale: es })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recomendaciones para rellenar huecos */}
        <div className="card">
          <h2 className="text-lg font-semibold mb-3">Sugerencias para rellenar huecos</h2>
          {agenda.recommendations.length === 0 ? (
            <p className="text-gray-600">No hay sugerencias. Tu día está completo.</p>
          ) : (
            <div className="space-y-2">
              {agenda.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="inline-block px-2 py-1 text-xs rounded bg-green-100 mr-2">Sugerencia</span>
                    <span className="font-medium">{rec.title}</span>
                    <span className="text-gray-500 ml-2">• {rec.recommendedHours.toFixed(1)}h</span>
                    <div className="text-sm text-gray-500">{rec.note}</div>
                  </div>
                  <button className="btn-primary" onClick={() => handleAddRecommendation(rec)}>Añadir</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Today;