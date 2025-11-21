import React, { useState, useEffect } from 'react';
import { studyPlanService } from '../services/studyPlanService';
import { ArrowPathIcon, BookOpenIcon, ClockIcon, CheckCircleIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface ThemePartsStatsProps {
  planId: number;
}

interface PartStats {
  partIndex: number;
  partLabel: string;
  totalSessions: number;
  studySessions: number;
  reviewSessions: number;
  testSessions: number;
  totalHours: number;
  completedSessions: number;
  completionRate: number;
}

interface ThemeWithParts {
  themeId: number;
  themeName: string;
  complexity: string;
  parts: PartStats[];
}

const ThemePartsStats: React.FC<ThemePartsStatsProps> = ({ planId }) => {
  const [themePartsStats, setThemePartsStats] = useState<ThemeWithParts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchThemePartsStats();
  }, [planId]);

  const fetchThemePartsStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studyPlanService.getThemePartsStats(planId);
      setThemePartsStats(data.themePartsStats);
    } catch (err) {
      console.error('Error al obtener estadísticas por partes:', err);
      setError('Error al cargar las estadísticas por partes');
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'HIGH': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getComplexityLabel = (complexity: string) => {
    switch (complexity) {
      case 'LOW': return 'Tema Corto';
      case 'MEDIUM': return 'Tema Medio';
      case 'HIGH': return 'Tema Extenso';
      default: return 'Tema';
    }
  };

  // Función para determinar el bloque al que pertenece un tema
  const getThemeBlock = (themeId: number) => {
    if (themeId >= 1 && themeId <= 6) return 'BLOQUE_1';
    if (themeId >= 7 && themeId <= 14) return 'BLOQUE_2';
    if (themeId >= 15 && themeId <= 21) return 'BLOQUE_3';
    return 'BLOQUE_1';
  };

  const getBlockName = (block: string) => {
    switch (block) {
      case 'BLOQUE_1': return 'Bloque 1 – Organización';
      case 'BLOQUE_2': return 'Bloque 2 – Jurídico-Social';
      case 'BLOQUE_3': return 'Bloque 3 – Seguridad Nacional';
      default: return 'Bloque Desconocido';
    }
  };

  const getBlockColor = (block: string) => {
    switch (block) {
      case 'BLOQUE_1': return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' };
      case 'BLOQUE_2': return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800' };
      case 'BLOQUE_3': return { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800' };
      default: return { border: 'border-gray-500', bg: 'bg-gray-50', text: 'text-gray-800' };
    }
  };

  const BlockAccordion = ({ block, themes }: { block: string, themes: ThemeWithParts[] }) => {
    const [isOpen, setIsOpen] = useState(true);
    const blockName = getBlockName(block);
    const blockColor = getBlockColor(block);

    if (themes.length === 0) {
      return (
        <div className={`border-l-4 ${blockColor.border} pl-4 opacity-50 mb-6`}>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full flex items-center justify-between mb-3 focus:outline-none"
          >
            <h4 className={`text-lg font-semibold ${blockColor.text}`}>{blockName}</h4>
            <svg
              className={`w-5 h-5 ${blockColor.text} transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isOpen && <p className="text-gray-500 text-sm">No hay temas en este bloque</p>}
        </div>
      );
    }

    return (
      <div className={`border-l-4 ${blockColor.border} pl-4 mb-6`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between mb-3 focus:outline-none group"
        >
          <h4 className={`text-lg font-semibold ${blockColor.text}`}>{blockName}</h4>
          <svg
            className={`w-5 h-5 ${blockColor.text} transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="space-y-6 animate-fade-in">
            {themes.map((theme) => (
              <div key={theme.themeId} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-800">{theme.themeName}</h4>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getComplexityColor(theme.complexity)}`}>
                        {getComplexityLabel(theme.complexity)}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">Total de partes</div>
                      <div className="text-lg font-semibold text-gray-800">{theme.parts.length}</div>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200">
                  {theme.parts.map((part) => (
                    <div key={`${theme.themeId}-${part.partIndex}`} className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-medium text-gray-800">
                          {part.partLabel}
                        </h5>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center text-sm text-gray-500">
                            <CheckCircleIcon className={`h-4 w-4 mr-1 ${part.completionRate >= 70 ? 'text-green-500' : part.completionRate >= 40 ? 'text-yellow-500' : 'text-red-500'}`} />
                            {part.completionRate}% completado
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-3">
                          <div className="flex items-center text-blue-600 mb-1">
                            <BookOpenIcon className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Total Sesiones</span>
                          </div>
                          <div className="text-lg font-semibold text-blue-800">{part.totalSessions}</div>
                        </div>

                        <div className="bg-green-50 rounded-lg p-3">
                          <div className="flex items-center text-green-600 mb-1">
                            <ClockIcon className="h-4 w-4 mr-1" />
                            <span className="text-xs font-medium">Horas Totales</span>
                          </div>
                          <div className="text-lg font-semibold text-green-800">{part.totalHours}h</div>
                        </div>

                        <div className="bg-purple-50 rounded-lg p-3">
                          <div className="flex items-center text-purple-600 mb-1">
                            <div className="h-4 w-4 mr-1 rounded-full bg-purple-600"></div>
                            <span className="text-xs font-medium">Estudio</span>
                          </div>
                          <div className="text-lg font-semibold text-purple-800">{part.studySessions}</div>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-3">
                          <div className="flex items-center text-orange-600 mb-1">
                            <div className="h-4 w-4 mr-1 rounded-full bg-orange-600"></div>
                            <span className="text-xs font-medium">Repaso</span>
                          </div>
                          <div className="text-lg font-semibold text-orange-800">{part.reviewSessions}</div>
                        </div>
                      </div>

                      {part.testSessions > 0 && (
                        <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
                          <div className="flex items-center text-red-600 text-sm">
                            <div className="h-3 w-3 mr-1 rounded-full bg-red-600"></div>
                            <span>{part.testSessions} sesiones de prueba</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <ArrowPathIcon className="h-8 w-8 animate-spin text-blue-500" />
        <span className="ml-2 text-gray-600">Cargando estadísticas por partes...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchThemePartsStats}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (themePartsStats.length === 0) {
    return (
      <div className="text-center p-8 text-gray-500">
        <ChartBarIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No hay temas con partes disponibles</p>
      </div>
    );
  }

  // Agrupar temas por bloques
  const themesByBlock = {
    BLOQUE_1: themePartsStats.filter(t => getThemeBlock(t.themeId) === 'BLOQUE_1'),
    BLOQUE_2: themePartsStats.filter(t => getThemeBlock(t.themeId) === 'BLOQUE_2'),
    BLOQUE_3: themePartsStats.filter(t => getThemeBlock(t.themeId) === 'BLOQUE_3'),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center">
          <BookOpenIcon className="h-5 w-5 mr-2 text-blue-600" />
          Estadísticas por Partes de Temas
        </h3>
        <button
          onClick={fetchThemePartsStats}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          Actualizar
        </button>
      </div>

      <div className="space-y-2">
        <BlockAccordion block="BLOQUE_1" themes={themesByBlock.BLOQUE_1} />
        <BlockAccordion block="BLOQUE_2" themes={themesByBlock.BLOQUE_2} />
        <BlockAccordion block="BLOQUE_3" themes={themesByBlock.BLOQUE_3} />
      </div>
    </div>
  );
};

export default ThemePartsStats;