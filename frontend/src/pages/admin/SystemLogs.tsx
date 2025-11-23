import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    MagnifyingGlassIcon,
    ArrowDownTrayIcon,
    ChevronLeftIcon,
    ChevronRightIcon
} from '@heroicons/react/24/outline';

interface SystemLog {
    id: number;
    adminName: string;
    action: string;
    resource: string;
    details: any;
    ipAddress: string;
    createdAt: string;
}

export const SystemLogs: React.FC = () => {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalLogs, setTotalLogs] = useState(0);

    // Filters
    const [search, setSearch] = useState('');
    const [actionFilter, setActionFilter] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        fetchLogs();
    }, [page, actionFilter, startDate, endDate]); // Search triggers manually or with debounce (simplified here)

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const params: any = { page, limit: 20 };
            if (search) params.search = search;
            if (actionFilter) params.action = actionFilter;
            if (startDate) params.startDate = startDate;
            if (endDate) params.endDate = endDate;

            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/system/logs`, {
                headers: { Authorization: `Bearer ${token}` },
                params
            });

            setLogs(response.data.logs);
            setTotalPages(response.data.totalPages);
            setTotalLogs(response.data.total);
        } catch (error) {
            console.error('Error fetching logs:', error);
            toast.error('Error al cargar logs');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchLogs();
    };

    const exportLogs = () => {
        // Simple CSV export logic
        const headers = ['ID', 'Admin', 'Acción', 'Recurso', 'Detalles', 'IP', 'Fecha'];
        const csvContent = [
            headers.join(','),
            ...logs.map(log => [
                log.id,
                `"${log.adminName || 'Sistema'}"`,
                `"${log.action}"`,
                `"${log.resource}"`,
                `"${JSON.stringify(log.details).replace(/"/g, '""')}"`,
                log.ipAddress,
                new Date(log.createdAt).toLocaleString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `system_logs_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Logs del Sistema</h1>
                        <p className="text-sm text-gray-500">Auditoría y registro de actividad administrativa</p>
                    </div>
                    <button
                        onClick={exportLogs}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                        Exportar CSV
                    </button>
                </header>

                <div className="p-4 bg-white border-b border-gray-200 space-y-4">
                    <form onSubmit={handleSearch} className="flex flex-wrap gap-4 items-end">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Buscar</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Buscar por detalle, recurso o usuario..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
                            </div>
                        </div>

                        <div className="w-48">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Acción</label>
                            <select
                                value={actionFilter}
                                onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="">Todas</option>
                                <option value="CREATE">Crear</option>
                                <option value="UPDATE">Actualizar</option>
                                <option value="DELETE">Eliminar</option>
                                <option value="LOGIN">Login</option>
                            </select>
                        </div>

                        <div className="w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Desde</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={e => { setStartDate(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div className="w-40">
                            <label className="block text-xs font-medium text-gray-500 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={e => { setEndDate(e.target.value); setPage(1); }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            Filtrar
                        </button>
                    </form>
                </div>

                <main className="flex-1 overflow-y-auto p-6">
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acción</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recurso</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Detalles</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            Cargando logs...
                                        </td>
                                    </tr>
                                ) : logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                                            No se encontraron registros
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(log.createdAt).toLocaleString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {log.adminName || 'Sistema'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${log.action === 'CREATE' ? 'bg-green-100 text-green-800' :
                                                        log.action === 'DELETE' ? 'bg-red-100 text-red-800' :
                                                            log.action === 'UPDATE' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {log.resource}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate" title={JSON.stringify(log.details, null, 2)}>
                                                {JSON.stringify(log.details)}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{(page - 1) * 20 + 1}</span> a <span className="font-medium">{Math.min(page * 20, totalLogs)}</span> de <span className="font-medium">{totalLogs}</span> resultados
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronLeftIcon className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm disabled:opacity-50 hover:bg-gray-50"
                            >
                                <ChevronRightIcon className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};
