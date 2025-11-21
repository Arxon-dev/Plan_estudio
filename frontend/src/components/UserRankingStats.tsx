import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface UserRanking {
    currentUser: {
        userId: number;
        examReadinessScore: number;
        userRank: number;
        topPercentile: number;
        userName: string;
    };
    nearbyUsers: Array<{
        userId: number;
        userName: string;
        examReadinessScore: number;
        userRank: number;
        topPercentile: number;
    }>;
    averageStats: {
        avgReadinessScore: number;
        avgSuccessRate: number;
        totalUsers: number;
    };
}

export const UserRankingStats: React.FC = () => {
    const [ranking, setRanking] = useState<UserRanking | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchRanking();
    }, []);

    const fetchRanking = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/tests/ranking`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setRanking(response.data);
            setError(null);
        } catch (err) {
            console.error('Error al cargar ranking:', err);
            setError('No se pudo cargar la información del ranking');
        } finally {
            setLoading(false);
        }
    };

    const formatNumber = (value: number | string | undefined | null, decimals: number = 0): string => {
        if (value === undefined || value === null) return '0';
        const num = typeof value === 'string' ? parseFloat(value) : value;
        return isNaN(num) ? '0' : num.toFixed(decimals);
    };

    if (loading) {
        return (
            <div className="animate-pulse space-y-4 p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
                <p>{error}</p>
                <button
                    onClick={fetchRanking}
                    className="mt-2 text-sm underline hover:text-red-800"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (!ranking) return null;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="text-4xl font-bold text-blue-600 mb-1">#{ranking.currentUser.userRank}</div>
                    <div className="text-gray-600 font-medium">Tu posición</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-4xl font-bold text-green-600 mb-1">
                        {formatNumber(ranking.currentUser.topPercentile, 1)}%
                    </div>
                    <div className="text-gray-600 font-medium">Percentil Superior</div>
                    <div className="text-xs text-gray-500 mt-1">Mejor que el {formatNumber(ranking.currentUser.topPercentile, 1)}%</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="text-4xl font-bold text-purple-600 mb-1">
                        {formatNumber(ranking.averageStats.avgReadinessScore, 0)}%
                    </div>
                    <div className="text-gray-600 font-medium">Promedio General</div>
                    <div className="text-xs text-gray-500 mt-1">Puntuación media de usuarios</div>
                </div>
            </div>

            {/* Usuarios cercanos en el ranking */}
            <div className="mt-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Usuarios cercanos en el ranking:</h3>
                <div className="space-y-2">
                    {ranking.nearbyUsers.map((user) => (
                        <div
                            key={user.userId}
                            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${user.userId === ranking.currentUser.userId
                                    ? 'bg-blue-100 border-l-4 border-blue-500 shadow-sm'
                                    : 'bg-gray-50 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-lg w-8 text-center ${user.userId === ranking.currentUser.userId ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                    #{user.userRank}
                                </span>
                                <span className={user.userId === ranking.currentUser.userId ? 'font-semibold text-blue-900' : 'text-gray-700'}>
                                    {user.userName} {user.userId === ranking.currentUser.userId && '(Tú)'}
                                </span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`font-bold ${user.userId === ranking.currentUser.userId ? 'text-blue-700' : 'text-gray-600'
                                    }`}>
                                    {formatNumber(user.examReadinessScore, 0)}%
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
