import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
    ChartBarIcon,
    AcademicCapIcon,
    LightBulbIcon,
    ArrowTrendingUpIcon,
    LockClosedIcon,
    SparklesIcon,
    ArrowPathIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface PremiumDashboardProps {
    isPremium: boolean;
}

interface AIAnalysis {
    examReadinessScore: number;
    weakAreas: Array<{
        name: string;
        score: number;
        type: 'theme' | 'block';
    }>;
    strongAreas: Array<{
        name: string;
        score: number;
    }>;
    recommendations: Array<{
        type: string;
        message: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    predictedScore: {
        optimistic: number;
        realistic: number;
        pessimistic: number;
    };
}

const PremiumAnalysisDashboard: React.FC<PremiumDashboardProps> = ({ isPremium }) => {
    const navigate = useNavigate();
    const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateAnalysis = async () => {
        try {
            setIsGenerating(true);
            setError(null);
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/tests/analysis`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAnalysis(response.data);
            setLastUpdated(new Date());
        } catch (error) {
            console.error('Error fetching AI analysis:', error);
            setError('No se pudo generar el análisis. Por favor, intenta de nuevo.');
        } finally {
            setIsGenerating(false);
        }
    };

    // Componente de "Contenido Bloqueado" para usuarios Free
    if (!isPremium) {
        return (
            <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg border border-gray-200 p-8 mb-8">
                {/* Fondo desenfocado simulando contenido */}
                <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center text-center p-6">
                    <div className="bg-gradient-to-br from-amber-100 to-orange-100 p-4 rounded-full mb-4 shadow-inner">
                        <LockClosedIcon className="w-12 h-12 text-amber-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                        Análisis Avanzado con IA
                    </h3>
                    <p className="text-gray-600 max-w-md mb-6">
                        Desbloquea predicciones de nota, detección automática de debilidades y recomendaciones personalizadas para acelerar tu aprobado.
                    </p>
                    <button
                        onClick={() => navigate('/premium')}
                        className="px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
                    >
                        Desbloquear Premium
                    </button>
                </div>

                {/* Contenido "fake" de fondo para dar efecto visual */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-20 filter blur-sm pointer-events-none">
                    <div className="bg-gray-100 h-48 rounded-xl"></div>
                    <div className="bg-gray-100 h-48 rounded-xl"></div>
                    <div className="bg-gray-100 h-48 rounded-xl"></div>
                    <div className="bg-gray-100 h-32 rounded-xl col-span-3"></div>
                </div>
            </div>
        );
    }

    // Estado Inicial (Sin Análisis)
    if (!analysis && !isGenerating && !error) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
                <div className="text-center">
                    <SparklesIcon className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Centro de Rendimiento IA
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        Genera un análisis personalizado basado en tus últimos tests.
                        La IA evaluará tu preparación y detectará áreas de mejora.
                    </p>
                    <button
                        onClick={generateAnalysis}
                        disabled={isGenerating}
                        className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        <SparklesIcon className="w-5 h-5" />
                        Generar Análisis con IA
                    </button>
                </div>
            </div>
        );
    }

    // Estado de Carga Inicial (solo si no hay análisis previo)
    if (isGenerating && !analysis) {
        return (
            <div className="animate-pulse bg-white rounded-2xl shadow p-8 mb-8 h-64 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-blue-200 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-32 mx-auto"></div>
                </div>
            </div>
        );
    }

    // Si es premium pero no hay datos suficientes (usuario nuevo)
    if (analysis && (!analysis.examReadinessScore && !analysis.weakAreas?.length)) {
        return (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 mb-8 border border-blue-100">
                <div className="flex items-start gap-4">
                    <div className="p-3 bg-blue-100 rounded-xl">
                        <AcademicCapIcon className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            La IA está analizando tu perfil...
                        </h3>
                        <p className="text-gray-600">
                            Necesitamos que completes al menos <strong>3 tests</strong> para generar tu primera predicción de nota y detectar tus puntos débiles con precisión.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-10 space-y-6">
            {/* Header con Timestamp y Botón de Actualizar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <AcademicCapIcon className="w-8 h-8 text-indigo-600" />
                    Centro de Rendimiento IA
                </h2>
                <div className="flex items-center gap-3">
                    {lastUpdated && (
                        <span className="text-xs text-gray-500 hidden sm:inline-block">
                            📊 Actualizado {formatDistanceToNow(lastUpdated, {
                                addSuffix: true,
                                locale: es
                            })}
                        </span>
                    )}
                    <button
                        onClick={generateAnalysis}
                        disabled={isGenerating}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 disabled:opacity-50 transition-colors"
                    >
                        <ArrowPathIcon className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                        {isGenerating ? 'Actualizando...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            {/* Mensaje de Error (si existe) */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg flex items-start gap-3">
                    <ExclamationTriangleIcon className="w-6 h-6 text-red-500 flex-shrink-0" />
                    <div className="flex-grow">
                        <p className="text-red-700 font-medium">{error}</p>
                    </div>
                    <button
                        onClick={generateAnalysis}
                        className="text-sm font-bold text-red-700 hover:text-red-900 underline"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tarjeta 1: Predicción de Nota */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <ArrowTrendingUpIcon className="w-5 h-5" />
                                Predicción de Examen
                            </div>
                            <div className="flex items-baseline gap-2 mb-2">
                                <span className="text-5xl font-black text-gray-900 tracking-tight">
                                    {analysis.predictedScore.realistic.toFixed(1)}
                                </span>
                                <span className="text-xl text-gray-400 font-medium">/ 10</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">
                                Basado en tu consistencia y dificultad de preguntas.
                            </p>

                            {/* Mini gráfico de rangos */}
                            <div className="flex justify-between text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                                <span>Pesimista: <strong className="text-gray-600">{analysis.predictedScore.pessimistic.toFixed(1)}</strong></span>
                                <span>Optimista: <strong className="text-green-600">{analysis.predictedScore.optimistic.toFixed(1)}</strong></span>
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 3: Recomendaciones (Consejo del Mentor) */}
                    <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="relative z-10 h-full flex flex-col">
                            <div className="flex items-center gap-2 mb-4 text-indigo-100 text-sm font-bold uppercase tracking-wider">
                                <LightBulbIcon className="w-5 h-5" />
                                Consejo del Mentor
                            </div>

                            <div className="flex-grow">
                                <p className="text-lg font-medium leading-relaxed italic opacity-95">
                                    "{analysis.recommendations[0]?.message || "Sigue practicando para desbloquear consejos personalizados."}"
                                </p>
                            </div>

                            <div className="mt-6 flex items-center gap-2 text-xs text-indigo-200 font-medium">
                                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                Actualizado ahora mismo
                            </div>
                        </div>
                    </div>

                    {/* Tarjeta 2: Foco de Estudio (Debilidades) */}
                    <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-red-50 rounded-full -mr-20 -mt-20 z-0"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-6 text-gray-500 text-sm font-medium uppercase tracking-wider">
                                <ChartBarIcon className="w-5 h-5" />
                                Foco de Estudio
                            </div>

                            <div className="space-y-4">
                                {analysis.weakAreas.slice(0, 3).map((area, idx) => (
                                    <div key={idx} className="group">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-medium text-gray-700 truncate pr-4" title={area.name}>
                                                {area.name}
                                            </span>
                                            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-md">
                                                {area.score}%
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className="bg-red-400 h-2 rounded-full transition-all duration-500 group-hover:bg-red-500"
                                                style={{ width: `${area.score}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <button
                                onClick={() => navigate('/test-session', { state: { mode: 'weakness' } })}
                                className="w-full mt-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <ArrowTrendingUpIcon className="w-5 h-5" />
                                Practicar Debilidades
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PremiumAnalysisDashboard;
