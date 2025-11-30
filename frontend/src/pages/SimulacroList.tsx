import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Header } from '../components/Header';
import {
    PlayIcon,
    TrophyIcon,
    ClockIcon,
    DocumentTextIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface Simulacro {
    id: number;
    title: string;
    description: string;
    questionIds: number[];
    timeLimit: number;
    active: boolean;
}

interface RankingEntry {
    id: number;
    score: number;
    timeSpent: number;
    user: {
        firstName: string;
        lastName: string;
        email: string;
    };
}

export const SimulacroList: React.FC = () => {
    const navigate = useNavigate();
    const [simulacros, setSimulacros] = useState<Simulacro[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Ranking Modal State
    const [selectedSimulacro, setSelectedSimulacro] = useState<Simulacro | null>(null);
    const [ranking, setRanking] = useState<RankingEntry[]>([]);
    const [rankingLoading, setRankingLoading] = useState(false);

    useEffect(() => {
        fetchSimulacros();
    }, []);

    const fetchSimulacros = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/simulacros`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSimulacros(response.data);
        } catch (error) {
            console.error('Error fetching simulacros:', error);
            toast.error('Error al cargar simulacros');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSimulacro = async (simulacro: Simulacro) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/tests/start`,
                {
                    simulacroId: simulacro.id,
                    testType: 'SIMULATION'
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            navigate('/test-session', {
                state: {
                    attemptId: response.data.attemptId,
                    questions: response.data.questions,
                    themeTitle: simulacro.title,
                    timeLimit: simulacro.timeLimit * 60 // Convert to seconds if needed, or TestSession handles it
                }
            });
        } catch (error: any) {
            console.error('Error starting simulacro:', error);
            toast.error(error.response?.data?.message || 'Error al iniciar el simulacro');
        }
    };

    const handleViewRanking = async (simulacro: Simulacro) => {
        setSelectedSimulacro(simulacro);
        setRankingLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/simulacros/${simulacro.id}/ranking`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setRanking(response.data);
        } catch (error) {
            console.error('Error fetching ranking:', error);
            toast.error('Error al cargar el ranking');
        } finally {
            setRankingLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Simulacros de Examen" showBack backPath="/dashboard" />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Simulacros Disponibles</h2>
                    <p className="text-gray-600">
                        Ponte a prueba con exámenes completos diseñados para simular la prueba real.
                        Compara tus resultados con otros opositores en el ranking global.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : simulacros.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl shadow-sm">
                        <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No hay simulacros disponibles</h3>
                        <p className="mt-1 text-sm text-gray-500">Vuelve más tarde para ver nuevos exámenes.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {simulacros.map((simulacro) => (
                            <div key={simulacro.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-gray-100">
                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-3 bg-indigo-100 rounded-lg">
                                            <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
                                        </div>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                            Activo
                                        </span>
                                    </div>
                                    
                                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2 h-14">
                                        {simulacro.title}
                                    </h3>
                                    <p className="text-sm text-gray-500 mb-4 line-clamp-3 h-10">
                                        {simulacro.description || 'Sin descripción'}
                                    </p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                                        <div className="flex items-center">
                                            <ClockIcon className="w-4 h-4 mr-1" />
                                            {simulacro.timeLimit} min
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium mr-1">{simulacro.questionIds.length}</span>
                                            preguntas
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => handleStartSimulacro(simulacro)}
                                            className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <PlayIcon className="w-4 h-4" />
                                            Comenzar
                                        </button>
                                        <button
                                            onClick={() => handleViewRanking(simulacro)}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 flex items-center justify-center transition-colors"
                                            title="Ver Ranking"
                                        >
                                            <TrophyIcon className="w-5 h-5 text-yellow-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Ranking Modal */}
            {selectedSimulacro && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Ranking Global</h3>
                                <p className="text-sm text-gray-500">{selectedSimulacro.title}</p>
                            </div>
                            <button 
                                onClick={() => setSelectedSimulacro(null)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            {rankingLoading ? (
                                <div className="flex justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                                </div>
                            ) : ranking.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    Aún no hay registros en el ranking. ¡Sé el primero!
                                </div>
                            ) : (
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="text-xs font-medium text-gray-500 uppercase tracking-wider border-b border-gray-100">
                                            <th className="px-4 py-2 text-left">Pos</th>
                                            <th className="px-4 py-2 text-left">Usuario</th>
                                            <th className="px-4 py-2 text-right">Puntuación</th>
                                            <th className="px-4 py-2 text-right">Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {ranking.map((entry, index) => (
                                            <tr key={index} className={`
                                                ${index === 0 ? 'bg-yellow-50' : ''}
                                                ${index === 1 ? 'bg-gray-50' : ''}
                                                ${index === 2 ? 'bg-orange-50' : ''}
                                            `}>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    {index === 0 && <span className="text-xl">🥇</span>}
                                                    {index === 1 && <span className="text-xl">🥈</span>}
                                                    {index === 2 && <span className="text-xl">🥉</span>}
                                                    {index > 2 && <span className="font-medium text-gray-500">#{index + 1}</span>}
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {entry.user.firstName} {entry.user.lastName.charAt(0)}.
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                        {entry.score.toFixed(1)}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm text-gray-500">
                                                    {formatTime(entry.timeSpent)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
