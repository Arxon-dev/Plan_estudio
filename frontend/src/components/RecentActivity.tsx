import React, { useState, useMemo } from 'react';
import { format, isToday, isYesterday, subDays, isAfter } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Interfaces
export interface RecentTest {
    id: number;
    testType: string;
    score: number | null;
    passed: boolean;
    createdAt: string;
    theme?: {
        id: number;
        title: string;
        block?: string;
    };
}

interface RecentActivityProps {
    recentTests: RecentTest[];
}

// Helper para formatear fecha relativa
const getRelativeDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) return `Hoy • ${format(date, 'HH:mm')}`;
    if (isYesterday(date)) return `Ayer • ${format(date, 'HH:mm')}`;
    if (isAfter(date, subDays(new Date(), 7))) return `Hace ${Math.floor((new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24))} días`;
    return format(date, 'dd MMM yyyy', { locale: es });
};

// Helper para iconos
const getTestIcon = (type: string) => {
    switch (type) {
        case 'PRACTICE': return '📝';
        case 'SIMULATION': return '🎯';
        case 'WEAKNESS_FOCUSED': return '🧠';
        default: return '📋';
    }
};

const getTestLabel = (type: string) => {
    switch (type) {
        case 'PRACTICE': return 'Práctica';
        case 'SIMULATION': return 'Simulacro';
        case 'WEAKNESS_FOCUSED': return 'Debilidades';
        default: return 'Test';
    }
};

export const RecentActivity: React.FC<RecentActivityProps> = ({ recentTests }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Estados del Modal
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [filterResult, setFilterResult] = useState('ALL');
    const [itemsPerPage] = useState(20);
    const [currentPage, setCurrentPage] = useState(1);

    // Filtrado de datos
    const filteredTests = useMemo(() => {
        return recentTests.filter(test => {
            const matchesSearch = (test.theme?.title || 'General').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesType = filterType === 'ALL' || test.testType === filterType;
            const matchesResult = filterResult === 'ALL' ||
                (filterResult === 'PASSED' && test.passed) ||
                (filterResult === 'FAILED' && !test.passed);

            return matchesSearch && matchesType && matchesResult;
        });
    }, [recentTests, searchTerm, filterType, filterResult]);

    // Paginación para el modal
    const paginatedTests = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredTests.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredTests, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredTests.length / itemsPerPage);

    // Exportar a PDF
    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text('Historial de Tests - OpoMelilla', 14, 15);

        const tableData = filteredTests.map(test => [
            format(new Date(test.createdAt), 'dd/MM/yyyy HH:mm'),
            getTestLabel(test.testType),
            test.theme?.title || 'General',
            test.passed ? 'Aprobado' : 'Suspendido',
            test.score !== null ? `${test.score.toFixed(1)}` : '-'
        ]);

        autoTable(doc, {
            head: [['Fecha', 'Tipo', 'Tema', 'Resultado', 'Nota']],
            body: tableData,
            startY: 20,
        });

        doc.save('historial_tests.pdf');
    };

    // Renderizado de Cards Compactas (últimos 4)
    const compactTests = recentTests.slice(0, 4);

    if (recentTests.length === 0) {
        return (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                <div className="text-4xl mb-4">📚</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">¡Aún no has realizado ningún test!</h3>
                <p className="text-gray-500 mb-6">Comienza tu preparación realizando tu primer test de práctica.</p>
                <button
                    onClick={() => document.getElementById('theme-cards')?.scrollIntoView({ behavior: 'smooth' })}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                >
                    Hacer mi primer test
                </button>
            </div>
        );
    }

    return (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Actividad Reciente</h2>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                    >
                        {isExpanded ? '▲ Ocultar' : '▼ Ver más'}
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 ml-2"
                    >
                        📈 Historial completo
                    </button>
                </div>
            </div>

            {/* Vista Compacta (Cards) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {compactTests.map(test => (
                    <div
                        key={test.id}
                        className={`relative p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 cursor-pointer group ${test.passed
                            ? 'bg-gradient-to-br from-green-50 to-white border-green-100 hover:border-green-200'
                            : 'bg-gradient-to-br from-red-50 to-white border-red-100 hover:border-red-200'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <span className="text-xl" title={getTestLabel(test.testType)}>
                                {getTestIcon(test.testType)}
                            </span>
                            <span className="text-xs font-medium text-gray-500">
                                {getRelativeDate(test.createdAt)}
                            </span>
                        </div>

                        <h4 className="font-medium text-gray-900 text-sm mb-3 line-clamp-2 h-10" title={test.theme?.title || 'General'}>
                            {test.theme?.title || 'General'}
                        </h4>

                        <div className="flex justify-between items-end">
                            <div className={`px-2 py-1 rounded text-xs font-bold ${test.passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                }`}>
                                {test.passed ? '✅ Aprobado' : '❌ Suspendido'}
                            </div>
                            <div className={`text-xl font-bold ${test.passed ? 'text-green-600' : 'text-red-600'
                                }`}>
                                {test.score !== null ? test.score.toFixed(1) : '-'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Vista Expandida (Accordion) */}
            <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}>
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tema</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resultado</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nota</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {recentTests.slice(0, 10).map(test => (
                                    <tr key={test.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {format(new Date(test.createdAt), 'dd/MM/yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {getTestLabel(test.testType)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                                            {test.theme?.title || 'General'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}>
                                                {test.passed ? 'Aprobado' : 'Suspendido'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-700">
                                            {test.score !== null ? test.score.toFixed(1) : '-'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="bg-gray-50 px-6 py-3 text-center border-t border-gray-200">
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Ver todo el historial ({recentTests.length} tests)
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal Historial Completo */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col animate-fade-in-up">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900">Historial Completo</h3>
                                <p className="text-sm text-gray-500">Total: {filteredTests.length} tests encontrados</p>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-200 rounded-full"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Filtros */}
                        <div className="p-4 border-b border-gray-200 grid grid-cols-1 md:grid-cols-4 gap-4 bg-white">
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Buscar por tema..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>

                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Todos los tipos</option>
                                <option value="PRACTICE">Práctica</option>
                                <option value="SIMULATION">Simulacro</option>
                                <option value="WEAKNESS_FOCUSED">Debilidades</option>
                            </select>

                            <select
                                value={filterResult}
                                onChange={(e) => setFilterResult(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="ALL">Todos los resultados</option>
                                <option value="PASSED">Aprobados</option>
                                <option value="FAILED">Suspendidos</option>
                            </select>

                            <button
                                onClick={exportToPDF}
                                className="w-full px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 flex items-center justify-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Exportar PDF
                            </button>
                        </div>

                        {/* Tabla Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                            <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50 sticky top-0">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tema</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resultado</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nota</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {paginatedTests.map(test => (
                                            <tr key={test.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {format(new Date(test.createdAt), 'dd/MM/yyyy HH:mm')}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    <span className="flex items-center gap-2">
                                                        {getTestIcon(test.testType)} {getTestLabel(test.testType)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate" title={test.theme?.title}>
                                                    {test.theme?.title || 'General'}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${test.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                        }`}>
                                                        {test.passed ? 'Aprobado' : 'Suspendido'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                                                    <span className={test.passed ? 'text-green-600' : 'text-red-600'}>
                                                        {test.score !== null ? test.score.toFixed(1) : '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                        {paginatedTests.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                    No se encontraron resultados con los filtros actuales.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer Paginación */}
                        <div className="p-4 border-t border-gray-200 bg-white rounded-b-xl flex justify-between items-center">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-gray-600">
                                Página {currentPage} de {totalPages || 1}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages || totalPages === 0}
                                className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                            >
                                Siguiente
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
