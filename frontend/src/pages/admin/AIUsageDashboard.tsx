import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    CpuChipIcon,
    CurrencyDollarIcon,
    UserGroupIcon,
    ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';

interface TopUser {
    queriesCount: number;
    user: {
        id: number;
        firstName: string;
        lastName: string;
        email: string;
    };
}

interface AIStats {
    month: string;
    stats: {
        totalQueries: number;
        activeUsers: number;
        prevTotalQueries: number;
        estimatedCost: number;
    };
    topUsers: TopUser[];
}

export const AIUsageDashboard: React.FC = () => {
    const [data, setData] = useState<AIStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/ai-usage/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching AI stats:', error);
            toast.error('Error al cargar estadísticas de IA');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-100 overflow-hidden">
                <AdminSidebar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-6">Uso de Inteligencia Artificial</h1>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Consultas (Mes Actual)</h3>
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                        <div className="flex items-baseline">
                            <span className="text-2xl font-bold text-gray-900">{data?.stats.totalQueries}</span>
                            {data && data.stats.prevTotalQueries > 0 && (
                                <span className={`ml-2 text-sm font-medium ${
                                    data.stats.totalQueries > data.stats.prevTotalQueries 
                                    ? 'text-red-600' 
                                    : 'text-green-600'
                                }`}>
                                    {data.stats.totalQueries > data.stats.prevTotalQueries ? '↑' : '↓'} vs mes anterior
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Usuarios Activos</h3>
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <UserGroupIcon className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">{data?.stats.activeUsers}</span>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Coste Estimado</h3>
                            <div className="p-2 bg-green-50 rounded-lg">
                                <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                        <span className="text-2xl font-bold text-gray-900">${data?.stats.estimatedCost.toFixed(2)}</span>
                        <p className="text-xs text-gray-400 mt-1">Base: $0.005/query</p>
                    </div>

                     <div className="bg-white rounded-xl shadow-sm p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-500 text-sm font-medium">Modelo</h3>
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <CpuChipIcon className="w-6 h-6 text-orange-600" />
                            </div>
                        </div>
                        <span className="text-lg font-bold text-gray-900">GPT-4o / Claude 3.5</span>
                    </div>
                </div>

                {/* Top Users Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Top Usuarios (Consumo)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consultas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coste Est.</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {data?.topUsers.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {item.user.firstName} {item.user.lastName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {item.user.email}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.queriesCount}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            ${(item.queriesCount * 0.005).toFixed(3)}
                                        </td>
                                    </tr>
                                ))}
                                {data?.topUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                                            No hay datos de uso este mes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
