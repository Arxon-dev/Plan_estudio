import React, { useState, useEffect } from 'react';
import { studyPlanService } from '../services/studyPlanService';

interface EquitableDistributionProps {
  planId: number;
}

export const EquitableDistribution: React.FC<EquitableDistributionProps> = ({ planId }) => {
  const [distributionData, setDistributionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDistributionData();
  }, [planId]);

  const loadDistributionData = async () => {
    try {
      setLoading(true);
      const [distributionResponse, partsStatsResponse] = await Promise.all([
        studyPlanService.getEquitableDistribution(planId),
        studyPlanService.getThemePartsStats(planId)
      ]);
      
      // Combinar ambas respuestas en un solo objeto
      const combinedData = {
        ...distributionResponse,
        partsStatsData: partsStatsResponse
      };
      
      setDistributionData(combinedData);
      setError(null);
    } catch (err) {
      console.error('Error al cargar distribución equitativa:', err);
      setError('No se pudo cargar la información de distribución');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Distribución por Rotación de Temas</h3>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Distribución por Rotación de Temas</h3>
        <div className="text-red-600 bg-red-50 p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!distributionData) {
    return null;
  }

  const { distributionByComplexity, stats } = distributionData;
  
  // Función para obtener estadísticas de partes de un tema
  const getThemePartsStats = (themeId: number) => {
    if (!distributionData.partsStatsData || !distributionData.partsStatsData.themePartsStats) return null;
    return distributionData.partsStatsData.themePartsStats.find((theme: any) => theme.themeId === themeId);
  };

  // Función para determinar el bloque al que pertenece un tema
  const getThemeBlock = (themeId: number) => {
    // Bloque 1 – Organización (temas 1-6)
    if (themeId >= 1 && themeId <= 6) return 'BLOQUE_1';
    
    // Bloque 2 – Jurídico-Social (temas 7-14)
    if (themeId >= 7 && themeId <= 14) return 'BLOQUE_2';
    
    // Bloque 3 – Seguridad Nacional (temas 15-21)
    if (themeId >= 15 && themeId <= 21) return 'BLOQUE_3';
    
    return 'BLOQUE_1'; // Por defecto
  };

  // Función para obtener el nombre del bloque
  const getBlockName = (block: string) => {
    switch (block) {
      case 'BLOQUE_1': return 'Bloque 1 – Organización';
      case 'BLOQUE_2': return 'Bloque 2 – Jurídico-Social';
      case 'BLOQUE_3': return 'Bloque 3 – Seguridad Nacional';
      default: return 'Bloque Desconocido';
    }
  };

  // Función para obtener el color del bloque
  const getBlockColor = (block: string) => {
    switch (block) {
      case 'BLOQUE_1': return { border: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-800' };
      case 'BLOQUE_2': return { border: 'border-green-500', bg: 'bg-green-50', text: 'text-green-800' };
      case 'BLOQUE_3': return { border: 'border-purple-500', bg: 'bg-purple-50', text: 'text-purple-800' };
      default: return { border: 'border-gray-500', bg: 'bg-gray-50', text: 'text-gray-800' };
    }
  };
  
  // Validar que los datos necesarios existan
  if (!distributionByComplexity || !stats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">📊 Distribución Equitativa por Bloques</h3>
        <div className="text-yellow-600 bg-yellow-50 p-4 rounded-lg">
          <p>Datos de distribución incompletos</p>
        </div>
      </div>
    );
  }

  // Agrupar temas por bloques
  const groupThemesByBlock = () => {
    const blocks = {
      BLOQUE_1: [] as any[],
      BLOQUE_2: [] as any[],
      BLOQUE_3: [] as any[]
    };

    // Combinar todos los temas de todas las complejidades
    const allThemes = [
      ...(distributionByComplexity.LOW || []),
      ...(distributionByComplexity.MEDIUM || []),
      ...(distributionByComplexity.HIGH || [])
    ];

    allThemes.forEach((theme: any) => {
      const block = getThemeBlock(theme.theme.id);
      blocks[block as keyof typeof blocks].push(theme);
    });

    return blocks;
  };

  const themesByBlock = groupThemesByBlock();

  // Determinar si la distribución es equitativa por bloque
  const isEquitable = (block: string) => {
    const themesInBlock = themesByBlock[block as keyof typeof themesByBlock];
    if (!themesInBlock || themesInBlock.length === 0) return true;
    
    const sessions = themesInBlock.map((td: any) => td.totalSessions).filter(Boolean);
    if (sessions.length === 0) return true;
    
    const maxDifference = Math.max(...sessions) - Math.min(...sessions);
    
    return maxDifference <= 15; // Consideramos equitativo si la diferencia máxima es ≤ 15 sesiones
  };

  const getEquityColor = (block: string) => {
    return isEquitable(block) ? 'text-green-600' : 'text-orange-600';
  };

  const getEquityIcon = (block: string) => {
    return isEquitable(block) ? '✅' : '⚠️';
  };

  const BlockSection = ({ block }: any) => {
    const themes = themesByBlock[block as keyof typeof themesByBlock] || [];
    const blockName = getBlockName(block);
    const blockColor = getBlockColor(block);

    if (themes.length === 0) {
      return (
        <div className={`border-l-4 ${blockColor.border} pl-4 opacity-50`}>
          <h4 className={`text-lg font-semibold ${blockColor.text} mb-3`}>{blockName}</h4>
          <p className="text-gray-500 text-sm">No hay temas en este bloque</p>
        </div>
      );
    }

    // Calcular estadísticas del bloque
    const totalThemes = themes.length;
    const avgSessions = themes.reduce((sum: number, theme: any) => sum + theme.totalSessions, 0) / totalThemes;
    const totalHours = themes.reduce((sum: number, theme: any) => sum + theme.totalHours, 0);

    return (
      <div className={`border-l-4 ${blockColor.border} pl-4`}>
        <div className="flex items-center justify-between mb-3">
          <h4 className={`text-lg font-semibold ${blockColor.text}`}>{blockName}</h4>
          <span className={`text-sm font-medium ${getEquityColor(block)}`}>
            {getEquityIcon(block)} {isEquitable(block) ? 'Equitativo' : 'Desigual'}
          </span>
        </div>
        
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 mb-4`}>
          <div className={`${blockColor.bg} p-3 rounded-lg`}>
            <p className={`text-sm ${blockColor.text} opacity-80`}>Total de temas</p>
            <p className={`text-2xl font-bold ${blockColor.text}`}>{totalThemes}</p>
          </div>
          <div className={`${blockColor.bg} p-3 rounded-lg`}>
            <p className={`text-sm ${blockColor.text} opacity-80`}>Sesiones promedio</p>
            <p className={`text-2xl font-bold ${blockColor.text}`}>{avgSessions.toFixed(1)}</p>
          </div>
          <div className={`${blockColor.bg} p-3 rounded-lg`}>
            <p className={`text-sm ${blockColor.text} opacity-80`}>Total de horas</p>
            <p className={`text-lg font-bold ${blockColor.text}`}>{totalHours.toFixed(1)}h</p>
          </div>
        </div>

        <div className="space-y-2">
          {themes.map((td: any) => {
            const themeParts = getThemePartsStats(td.theme.id);
            const hasMultipleParts = themeParts && themeParts.parts && themeParts.parts.length > 1;
            
            return (
              <div key={td.theme.id}>
                {/* Tema principal con partes desglosadas */}
                {hasMultipleParts ? (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-blue-800">
                        {td.theme.title}
                      </span>
                      <div className="flex items-center space-x-3 text-xs flex-shrink-0">
                        <span className="text-blue-600">📚 {td.totalSessions}</span>
                        <span className="text-purple-600">🔄 {td.reviewSessions}</span>
                        <span className="text-orange-600">⏱️ {typeof td.totalHours === 'number' ? td.totalHours.toFixed(1) : '0.0'}h</span>
                      </div>
                    </div>
                    <div className="ml-4 space-y-1 border-l-2 border-blue-200 pl-3">
                      {themeParts.parts.map((part: any) => (
                        <div key={part.partIndex} className="flex items-center justify-between py-1">
                          <span className="text-xs text-blue-700 truncate flex-1 mr-2">
                            Parte {part.partIndex}: {part.partLabel}
                          </span>
                          <div className="flex items-center space-x-2 text-xs flex-shrink-0">
                            <span className="text-blue-600">📚 {part.totalSessions}</span>
                            <span className="text-purple-600">🔄 {part.reviewSessions}</span>
                            <span className="text-orange-600">⏱️ {typeof part.totalHours === 'number' ? part.totalHours.toFixed(1) : '0.0'}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Tema sin partes - mostrar como antes */
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-700 truncate flex-1 mr-2">
                      {td.theme.title}
                    </span>
                    <div className="flex items-center space-x-3 text-xs md:text-sm flex-shrink-0">
                      <span className="text-blue-600">📚 {td.totalSessions}</span>
                      <span className="text-purple-600">🔄 {td.reviewSessions}</span>
                      <span className="text-orange-600">⏱️ {typeof td.totalHours === 'number' ? td.totalHours.toFixed(1) : '0.0'}h</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">📊 Distribución por Rotación de Temas</h3>
        <button 
          onClick={loadDistributionData}
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
        >
          🔄 Actualizar
        </button>
      </div>
      
      <div className="space-y-8">
        <BlockSection block="BLOQUE_1" />
        <BlockSection block="BLOQUE_2" />
        <BlockSection block="BLOQUE_3" />
      </div>

      {/* Leyenda y explicación */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h5 className="font-medium text-blue-900 mb-2">ℹ️ ¿Cómo funciona la rotación de temas?</h5>
        <div className="text-sm text-blue-800 space-y-1">
          <p><strong>Bloque 1 – Organización:</strong> Marco legal y estructural de las Fuerzas Armadas</p>
          <p><strong>Bloque 2 – Jurídico-Social:</strong> Legislación laboral y derechos del personal</p>
          <p><strong>Bloque 3 – Seguridad Nacional:</strong> Defensa, seguridad y relaciones internacionales</p>
          <p><strong>🔄 Rotación activa:</strong> Múltiples temas estudiados simultáneamente para mejor retención</p>
          <p><strong>📊 Distribución equitativa:</strong> Diferencia ≤ 15 sesiones entre temas del mismo bloque</p>
        </div>
      </div>
    </div>
  );
};