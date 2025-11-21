import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import PremiumAnalysisDashboard from '../components/PremiumAnalysisDashboard';
import { Header } from '../components/Header';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

interface TestStats {
  totalTests: number;
  globalSuccessRate: number;
  examReadinessScore: number;
  monthlyPracticeTests: number;
}

interface ThemeProgress {
  id: number;
  title: string;
  block: string;
  themeNumber: number;
  progress: {
    level: 'LOCKED' | 'BRONZE' | 'SILVER' | 'GOLD' | 'DIAMOND';
    totalTests: number;
    averageScore: number;
    bestScore: number;
  };
}

interface RecentTest {
  id: number;
  testType: string;
  score: number | null;
  passed: boolean;
  createdAt: string;
  theme?: {
    id: number;
    title: string;
  };
}

// Definición de temas base con partes
const THEMES_BASE = [
  // BLOQUE 1 - ORGANIZACIÓN
  { id: 1, name: 'Constitución Española 1978', block: 'Organización', parts: 1 },
  { id: 2, name: 'Ley Orgánica 5/2005 Defensa Nacional', block: 'Organización', parts: 1 },
  { id: 3, name: 'Ley 40/2015 Régimen Jurídico Sector Público', block: 'Organización', parts: 1 },
  { id: 4, name: 'Real Decreto 205/2024 Ministerio de Defensa', block: 'Organización', parts: 1 },
  { id: 5, name: 'RD 521/2020 Organización Básica FAS', block: 'Organización', parts: 1 },
  {
    id: 6,
    name: 'Instrucciones EMAD, ET, ARMADA y EA',
    block: 'Organización',
    parts: 4,
    partNames: [
      'Instrucción 55/2021, EMAD',
      'Instrucción 14/2021, ET',
      'Instrucción 15/2021, ARMADA',
      'Instrucción 6/2025, EA'
    ]
  },

  // BLOQUE 2 - JURÍDICO-SOCIAL
  {
    id: 7,
    name: 'Ley 8/2006 Tropa / Ley 39/2007 Carrera Militar',
    block: 'Jurídico-Social',
    parts: 2,
    partNames: [
      'Ley 8/2006, Tropa y Marinería',
      'Ley 39/2007 de la Carrera Militar'
    ]
  },
  { id: 8, name: 'RD 96/2009 Reales Ordenanzas FAS', block: 'Jurídico-Social', parts: 1 },
  { id: 9, name: 'LO 9/2011 Derechos y Deberes FAS', block: 'Jurídico-Social', parts: 1 },
  { id: 10, name: 'LO 8/2014 Régimen Disciplinario FAS', block: 'Jurídico-Social', parts: 1 },
  { id: 11, name: 'RD 176/2014 Iniciativas y Quejas', block: 'Jurídico-Social', parts: 1 },
  { id: 12, name: 'LO 3/2007 Igualdad Efectiva Mujeres-Hombres', block: 'Jurídico-Social', parts: 1 },
  { id: 13, name: 'Observatorio Militar Igualdad FAS', block: 'Jurídico-Social', parts: 1 },
  { id: 14, name: 'Ley 39/2015 Procedimiento Administrativo Común', block: 'Jurídico-Social', parts: 1 },

  // BLOQUE 3 - SEGURIDAD NACIONAL
  {
    id: 15,
    name: 'Ley 36/2015 Seguridad / RD 1150/2021 Estrategia',
    block: 'Seguridad Nacional',
    parts: 2,
    partNames: [
      'Ley 36/2015, Seguridad Nacional',
      'Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021'
    ]
  },
  { id: 16, name: 'PDC-01(B) Doctrina Empleo FAS', block: 'Seguridad Nacional', parts: 1 },
  { id: 17, name: 'Organización de las Naciones Unidas (ONU)', block: 'Seguridad Nacional', parts: 1 },
  { id: 18, name: 'Organización del Tratado Atlántico Norte (OTAN)', block: 'Seguridad Nacional', parts: 1 },
  { id: 19, name: 'Organización Seguridad y Cooperación Europa (OSCE)', block: 'Seguridad Nacional', parts: 1 },
  { id: 20, name: 'Unión Europea (UE)', block: 'Seguridad Nacional', parts: 1 },
  { id: 21, name: 'España y Misiones Internacionales', block: 'Seguridad Nacional', parts: 1 },
];

// Helpers
const getBlockNumber = (block: string): number => {
  if (block === 'Organización') return 1;
  if (block === 'Jurídico-Social') return 2;
  if (block === 'Seguridad Nacional') return 3;
  return 0;
};

const getThemeNumber = (id: number): number => {
  const theme = THEMES_BASE.find(t => t.id === id);
  if (!theme) return id;

  // Calcular número de tema dentro del bloque
  const themesInBlock = THEMES_BASE.filter(t => t.block === theme.block);
  const index = themesInBlock.findIndex(t => t.id === id);
  return index + 1;
};

// Expandir temas con partes en opciones individuales
const expandThemes = () => {
  const expanded: Array<{
    id: string;
    themeId: number;
    name: string;
    block: string;
    part?: number;
  }> = [];

  THEMES_BASE.forEach(theme => {
    if (theme.parts === 1) {
      // Tema sin partes, añadir directamente
      expanded.push({
        id: theme.id.toString(),
        themeId: theme.id,
        name: `B${getBlockNumber(theme.block)}-T${getThemeNumber(theme.id)}: ${theme.name}`,
        block: theme.block
      });
    } else {
      // Tema con múltiples partes, expandir cada parte
      for (let partNum = 1; partNum <= theme.parts; partNum++) {
        const partName = theme.partNames ? theme.partNames[partNum - 1] : `Parte ${partNum}`;
        expanded.push({
          id: `${theme.id}-${partNum}`,
          themeId: theme.id,
          name: `B${getBlockNumber(theme.block)}-T${getThemeNumber(theme.id)}.${partNum}: ${partName}`,
          block: theme.block,
          part: partNum
        });
      }
    }
  });

  return expanded;
};

// Lista completa de temas expandidos
const THEMES_EXPANDED = expandThemes();

const Tests: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState<TestStats | null>(null);
  const [themes, setThemes] = useState<ThemeProgress[]>([]);
  const [recentTests, setRecentTests] = useState<RecentTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<string>('all');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Helper para formatear números de forma segura
  const formatNumber = (value: number | string | undefined | null, decimals: number = 0): string => {
    if (value === undefined || value === null) return '0';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return isNaN(num) ? '0' : num.toFixed(decimals);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (loading) return;
    const raw = localStorage.getItem('user');
    if (!raw) return;
    const id = JSON.parse(raw).id;
    const key = `onboarding:tests:v1:${id}`;
    const seen = localStorage.getItem(key);
    if (seen === 'done') return;

    const steps = [
      { element: '#premium-dashboard', popover: { title: 'Análisis Premium', description: 'Visualiza tu progreso detallado y recomendaciones de IA.' } },
      { element: '#stats-cards', popover: { title: 'Estadísticas Rápidas', description: 'Resumen de tu rendimiento global y preparación.' } },
      { element: '#recent-activity', popover: { title: 'Actividad Reciente', description: 'Historial de tus últimos tests realizados.' } },
      { element: '#btn-weakness-test', popover: { title: 'Practicar Debilidades', description: 'Genera tests personalizados basados en tus errores previos (Premium).' } },
      { element: '#theme-filters', popover: { title: 'Filtros por Bloque', description: 'Filtra los temas según el bloque de estudio.' } },
      { element: '#theme-cards', popover: { title: 'Temas Disponibles', description: 'Selecciona un tema para iniciar un test específico.' } },
    ];

    const d = driver({ steps, showProgress: true, allowClose: true });
    d.drive();
    localStorage.setItem(key, 'done');
  }, [loading]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, themesRes, dashboardRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/tests/stats`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/tests/themes`, { headers }),
        axios.get(`${import.meta.env.VITE_API_URL}/tests/dashboard`, { headers })
      ]);

      setStats(statsRes.data);
      setThemes(themesRes.data);
      setRecentTests(dashboardRes.data.recentTests || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startTest = (themeId: number, themePart: number | undefined, themeTitle: string) => {
    navigate('/test-session', { state: { themeId, themePart, themeTitle } });
  };

  const startWeaknessFocusedTest = async () => {
    if (!user?.isPremium) {
      setErrorMessage('Esta funcionalidad es exclusiva para usuarios Premium. Actualiza tu plan para acceder a tests personalizados con IA.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/tests/weakness-focused`,
        { questionCount: 10 },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
        }
      );

      navigate('/test-session', {
        state: {
          attemptId: response.data.attemptId,
          questions: response.data.questions,
          themeTitle: 'Test de Debilidades Personalizado'
        }
      });
    } catch (error: any) {
      console.error('Error al iniciar test de debilidades:', error);
      const message = error.response?.data?.message || error.message || 'Error desconocido';

      if (message.includes('No se encontraron preguntas')) {
        setErrorMessage('No tienes suficientes datos de errores previos para generar un test de debilidades. ¡Sigue practicando!');
      } else {
        setErrorMessage('Error al iniciar test de debilidades. Por favor, inténtalo de nuevo.');
      }
    }
  };

  // Combinar temas expandidos con datos de progreso del backend
  const themesWithProgress = THEMES_EXPANDED.map(expandedTheme => {
    // Buscar progreso del tema principal en los datos del backend
    const themeProgress = themes.find(t => t.id === expandedTheme.themeId);

    return {
      ...expandedTheme,
      progress: themeProgress?.progress || {
        level: 'LOCKED' as const,
        totalTests: 0,
        averageScore: 0,
        bestScore: 0
      },
      themeNumber: themeProgress?.themeNumber || expandedTheme.themeId
    };
  });

  // Filtrar por bloque seleccionado
  const filteredThemes = selectedBlock === 'all'
    ? themesWithProgress
    : themesWithProgress.filter(t => t.block === selectedBlock);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Centro de Tests" showBack={true} backPath="/dashboard">
        <button
          id="btn-weakness-test"
          onClick={startWeaknessFocusedTest}
          className="flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Practicar Debilidades
        </button>
      </Header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Premium (Nuevo) */}
        <div id="premium-dashboard">
          <PremiumAnalysisDashboard isPremium={!!user?.isPremium} />
        </div>

        {/* Estadísticas Rápidas */}
        <div id="stats-cards" className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Tests Realizados</div>
            <div className="text-3xl font-bold text-gray-900">{stats?.totalTests || 0}</div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Tasa de Acierto</div>
            <div className="text-3xl font-bold text-blue-600">
              {formatNumber(stats?.globalSuccessRate, 1)}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Nivel de Preparación</div>
            <div className="text-3xl font-bold text-green-600">
              {formatNumber(stats?.examReadinessScore, 1)}%
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="text-gray-500 text-sm font-medium mb-1">Tests este Mes</div>
            <div className="text-3xl font-bold text-purple-600">{stats?.monthlyPracticeTests || 0}</div>
          </div>
        </div>

        {/* Tests Recientes */}
        {recentTests.length > 0 && (
          <div id="recent-activity" className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Actividad Reciente</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tema</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentTests.map((test) => (
                      <tr key={test.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(test.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {test.testType === 'WEAKNESS_FOCUSED' ? 'Test de Debilidades' :
                            test.testType === 'PRACTICE' ? 'Práctica' : test.testType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={test.theme?.title || 'General'}>
                          {test.theme?.title || 'General'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                            {test.passed ? 'Aprobado' : 'Suspendido'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {test.score !== null ? formatNumber(test.score, 1) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Filtros de Bloque */}
        <div id="theme-filters" className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedBlock('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedBlock === 'all'
              ? 'bg-gray-900 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
          >
            Todos los Temas
          </button>
          {['BLOQUE_1', 'BLOQUE_2', 'BLOQUE_3'].map(block => (
            <button
              key={block}
              onClick={() => setSelectedBlock(block)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedBlock === block
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {block.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Lista de Temas */}
        <div id="theme-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredThemes.map((theme) => (
            <div key={theme.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                  Tema {theme.themeNumber}
                </span>
                {theme.progress.level !== 'LOCKED' && (
                  <span className={`px-2 py-1 text-xs font-bold rounded ${theme.progress.level === 'BRONZE' ? 'bg-orange-100 text-orange-800' :
                    theme.progress.level === 'SILVER' ? 'bg-gray-100 text-gray-800' :
                      theme.progress.level === 'GOLD' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                    {theme.progress.level}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">
                {theme.name}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Mejor Puntuación</span>
                  <span className="font-medium">{formatNumber(theme.progress.bestScore, 1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${theme.progress.averageScore >= 70 ? 'bg-green-500' :
                      theme.progress.averageScore >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                    style={{ width: `${theme.progress.averageScore}%` }}
                  ></div>
                </div>
              </div>

              <button
                onClick={() => startTest(theme.themeId, theme.part, theme.name)}
                className="w-full py-2 bg-white border-2 border-blue-600 text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Iniciar Test
              </button>
            </div>
          ))}
        </div>

        {/* Modal de Error */}
        {errorMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Aviso</h3>
              <p className="text-gray-600 text-center mb-6">{errorMessage}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setErrorMessage(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium"
                >
                  Cerrar
                </button>
                {errorMessage.includes('Premium') && (
                  <button
                    onClick={() => navigate('/premium')}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-lg hover:shadow-lg font-medium"
                  >
                    Ver Planes
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Tests;
