import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    MagnifyingGlassIcon,
    ChartBarIcon,
    ClockIcon,
    AcademicCapIcon,
    DocumentArrowDownIcon,
    UserIcon
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
}

interface ProgressData {
    stats: {
        totalTests: number;
        globalSuccessRate: number;
        totalTimeSpent: number;
        averageTestSpeed: number;
    } | null;
    blockStats: {
        [key: string]: {
            total: number;
            mastered: number;
            avgScore: number;
            count: number;
        };
    };
    recentTests: Array<{
        id: number;
        score: number;
        createdAt: string;
        timeSpent: number;
        theme?: {
            title: string;
        };
    }>;
    totalThemes: number;
    masteredThemes: number;
}

export const UserProgress: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [progress, setProgress] = useState<ProgressData | null>(null);
    const [loading, setLoading] = useState(false);

    // Search users
    useEffect(() => {
        const searchUsers = async () => {
            if (searchTerm.length < 2) {
                setSearchResults([]);
                return;
            }

            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users?search=${searchTerm}&limit=5`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearchResults(response.data.users);
            } catch (error) {
                console.error('Error searching users:', error);
            }
        };

        const timer = setTimeout(searchUsers, 300);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Fetch progress when user selected
    useEffect(() => {
        if (selectedUser) {
            fetchProgress(selectedUser.id);
            setSearchTerm('');
            setSearchResults([]);
        }
    }, [selectedUser]);

    const fetchProgress = async (userId: number) => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/progress`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProgress(response.data);
        } catch (error) {
            console.error('Error fetching progress:', error);
            toast.error('Error al cargar el progreso del usuario');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (minutes: number) => {
        const h = Math.floor(minutes / 60);
        const m = minutes % 60;
        return `${h}h ${m}m`;
    };

    const exportPDF = () => {
        if (!selectedUser || !progress) return;

        const doc = new jsPDF();

        // Header
        doc.setFontSize(20);
        doc.text('Informe de Progreso - OpoMelilla', 14, 22);

        doc.setFontSize(12);
        doc.text(`Usuario: ${selectedUser.firstName} ${selectedUser.lastName}`, 14, 32);
        doc.text(`Email: ${selectedUser.email}`, 14, 38);
        doc.text(`Fecha: ${new Date().toLocaleDateString()}`, 14, 44);

        // Global Stats
        const stats = [
            ['Tests Realizados', progress.stats?.totalTests || 0],
            ['Tasa de Acierto Global', `${progress.stats?.globalSuccessRate || 0}%`],
            ['Tiempo Total de Estudio', formatTime(progress.stats?.totalTimeSpent || 0)],
            ['Temas Dominados', `${progress.masteredThemes} / ${progress.totalThemes}`]
        ];

        autoTable(doc, {
            startY: 50,
            head: [['Métrica', 'Valor']],
            body: stats,
            theme: 'striped',
            headStyles: { fillColor: [41, 128, 185] }
        });

        // Block Stats
        const blockData = Object.entries(progress.blockStats).map(([block, data]) => [
            block,
            `${data.mastered} / ${data.total}`,
            `${data.avgScore}%`
        ]);

        doc.text('Progreso por Bloques', 14, (doc as any).lastAutoTable.finalY + 10);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Bloque', 'Temas Dominados', 'Nota Media']],
            body: blockData,
            theme: 'grid',
            headStyles: { fillColor: [46, 204, 113] }
        });

        // Recent Tests
        const testData = progress.recentTests.map(test => [
            new Date(test.createdAt).toLocaleDateString(),
            test.theme?.title || 'Test General',
            `${Number(test.score).toFixed(2)}`,
            `${Math.round(test.timeSpent / 60)} min`
        ]);

        doc.text('Últimos Tests Realizados', 14, (doc as any).lastAutoTable.finalY + 10);

        autoTable(doc, {
            startY: (doc as any).lastAutoTable.finalY + 15,
            head: [['Fecha', 'Tema', 'Puntuación', 'Tiempo']],
            body: testData,
            theme: 'striped'
        });

        doc.save(`progreso_${selectedUser.firstName}_${selectedUser.lastName}.pdf`);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Progreso de Alumnos</h1>
                            <p className="text-sm text-gray-500">Análisis detallado del rendimiento académico</p>
                        </div>
                        {progress && (
                            <button
                                onClick={exportPDF}
                                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <DocumentArrowDownIcon className="h-5 w-5" />
                                Exportar PDF
                            </button>
                        )}
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {/* User Search */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative z-20">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Alumno</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                placeholder="Buscar por nombre o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Search Results Dropdown */}
                        {searchResults.length > 0 && (
                            <div className="absolute mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm z-50 left-0">
                                {searchResults.map((user) => (
                                    <div
                                        key={user.id}
                                        className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-blue-50"
                                        onClick={() => setSelectedUser(user)}
                                    >
                                        <div className="flex items-center">
                                            <span className="font-normal block truncate">
                                                {user.firstName} {user.lastName} ({user.email})
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : progress ? (
                        <div className="space-y-6">
                            {/* KPI Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Tests Totales</h3>
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{progress.stats?.totalTests || 0}</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Nota Media Global</h3>
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <ChartBarIcon className="h-6 w-6 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{progress.stats?.globalSuccessRate || 0}%</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Tiempo de Estudio</h3>
                                        <div className="p-2 bg-purple-100 rounded-lg">
                                            <ClockIcon className="h-6 w-6 text-purple-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{formatTime(progress.stats?.totalTimeSpent || 0)}</p>
                                </div>

                                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-medium text-gray-500">Temas Dominados</h3>
                                        <div className="p-2 bg-yellow-100 rounded-lg">
                                            <UserIcon className="h-6 w-6 text-yellow-600" />
                                        </div>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900">{progress.masteredThemes} <span className="text-sm text-gray-500 font-normal">/ {progress.totalThemes}</span></p>
                                </div>
                            </div>

                            {/* Block Progress */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-6">Progreso por Bloques</h2>
                                <div className="space-y-6">
                                    {Object.entries(progress.blockStats).map(([block, data]) => (
                                        <div key={block}>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">{block.replace('_', ' ')}</span>
                                                <span className="text-sm font-medium text-gray-700">{data.avgScore}% (Media)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                                <div
                                                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                                    style={{ width: `${data.avgScore}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {data.mastered} temas dominados de {data.total} estudiados
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Activity */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="px-6 py-4 border-b border-gray-200">
                                    <h2 className="text-lg font-bold text-gray-800">Últimos Tests Realizados</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tema / Tipo</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puntuación</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {progress.recentTests.map((test) => (
                                                <tr key={test.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(test.createdAt).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                        {test.theme?.title || 'Test General'}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.score >= 5 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                            }`}>
                                                            {Number(test.score).toFixed(2)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {Math.round(test.timeSpent / 60)} min
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <UserIcon className="h-16 w-16 mb-4 text-gray-300" />
                            <p className="text-lg">Selecciona un alumno para ver su progreso</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};
