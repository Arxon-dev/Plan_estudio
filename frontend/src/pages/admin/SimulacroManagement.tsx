import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon
} from '@heroicons/react/24/outline';

interface Simulacro {
    id: number;
    title: string;
    description: string;
    questionIds: number[];
    timeLimit: number;
    active: boolean;
    createdAt: string;
}

interface Theme {
    id: number;
    title: string;
    block: string;
}

export const SimulacroManagement: React.FC = () => {
    const [simulacros, setSimulacros] = useState<Simulacro[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form States
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState(60);
    const [active, setActive] = useState(true);
    const [questionIds, setQuestionIds] = useState<number[]>([]);
    
    // Generation States
    const [themes, setThemes] = useState<Theme[]>([]);
    const [selectedThemes, setSelectedThemes] = useState<number[]>([]);
    const [generateCount, setGenerateCount] = useState(50);
    const [generationMode, setGenerationMode] = useState<'manual' | 'auto'>('auto');

    useEffect(() => {
        fetchSimulacros();
        fetchThemes();
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

    const fetchThemes = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/themes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setThemes(response.data);
        } catch (error) {
            console.error('Error fetching themes:', error);
        }
    };

    const handleGenerateQuestions = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/simulacros/generate-questions`, {
                themeIds: selectedThemes,
                count: generateCount
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setQuestionIds(response.data.questionIds);
            toast.success(`Se han generado ${response.data.count} preguntas.`);
        } catch (error) {
            console.error('Error generating questions:', error);
            toast.error('Error al generar preguntas');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (questionIds.length === 0) {
            toast.error('El simulacro debe tener al menos una pregunta.');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const payload = {
                title,
                description,
                timeLimit,
                active,
                questionIds
            };

            if (editingId) {
                await axios.put(`${import.meta.env.VITE_API_URL}/simulacros/${editingId}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Simulacro actualizado');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/simulacros`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success('Simulacro creado');
            }

            setIsModalOpen(false);
            resetForm();
            fetchSimulacros();
        } catch (error) {
            console.error('Error saving simulacro:', error);
            toast.error('Error al guardar simulacro');
        }
    };

    const handleEdit = (simulacro: Simulacro) => {
        setEditingId(simulacro.id);
        setTitle(simulacro.title);
        setDescription(simulacro.description || '');
        setTimeLimit(simulacro.timeLimit);
        setActive(simulacro.active);
        setQuestionIds(simulacro.questionIds);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('¿Estás seguro de eliminar este simulacro?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/simulacros/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Simulacro eliminado');
            fetchSimulacros();
        } catch (error) {
            console.error('Error deleting simulacro:', error);
            toast.error('Error al eliminar simulacro');
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setTitle('');
        setDescription('');
        setTimeLimit(60);
        setActive(true);
        setQuestionIds([]);
        setSelectedThemes([]);
        setGenerationMode('auto');
    };

    const toggleTheme = (themeId: number) => {
        setSelectedThemes(prev => 
            prev.includes(themeId) ? prev.filter(id => id !== themeId) : [...prev, themeId]
        );
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />
            <div className="flex-1 overflow-y-auto p-8">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Gestión de Simulacros</h1>
                    <button
                        onClick={() => { resetForm(); setIsModalOpen(true); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Nuevo Simulacro
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center mt-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Título</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preguntas</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiempo</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {simulacros.map((simulacro) => (
                                    <tr key={simulacro.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{simulacro.title}</div>
                                            <div className="text-sm text-gray-500 truncate max-w-xs">{simulacro.description}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {simulacro.questionIds.length}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {simulacro.timeLimit} min
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {simulacro.active ? (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                    Activo
                                                </span>
                                            ) : (
                                                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                                    Inactivo
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleEdit(simulacro)}
                                                className="text-blue-600 hover:text-blue-900 mr-4"
                                            >
                                                <PencilSquareIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(simulacro.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                        <h2 className="text-xl font-bold mb-4">{editingId ? 'Editar Simulacro' : 'Nuevo Simulacro'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Título</label>
                                    <input
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                        rows={3}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Tiempo (minutos)</label>
                                        <input
                                            type="number"
                                            required
                                            value={timeLimit}
                                            onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <label className="flex items-center space-x-3">
                                            <input
                                                type="checkbox"
                                                checked={active}
                                                onChange={(e) => setActive(e.target.checked)}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Activo</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="border-t pt-4 mt-4">
                                    <h3 className="text-lg font-medium mb-2">Preguntas</h3>
                                    <div className="flex space-x-4 mb-4">
                                        <button
                                            type="button"
                                            onClick={() => setGenerationMode('auto')}
                                            className={`px-3 py-1 rounded-md ${generationMode === 'auto' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                                        >
                                            Generador Automático
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setGenerationMode('manual')}
                                            className={`px-3 py-1 rounded-md ${generationMode === 'manual' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}
                                        >
                                            Manual (IDs)
                                        </button>
                                    </div>

                                    {generationMode === 'auto' ? (
                                        <div className="space-y-4 bg-gray-50 p-4 rounded-lg">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Temas (Dejar vacío para todos)</label>
                                                <div className="max-h-40 overflow-y-auto border rounded-md bg-white p-2">
                                                    {themes.map(theme => (
                                                        <div key={theme.id} className="flex items-center mb-1">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedThemes.includes(theme.id)}
                                                                onChange={() => toggleTheme(theme.id)}
                                                                className="mr-2"
                                                            />
                                                            <span className="text-sm">{theme.block} - Tema {theme.title}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Cantidad de Preguntas</label>
                                                <input
                                                    type="number"
                                                    value={generateCount}
                                                    onChange={(e) => setGenerateCount(parseInt(e.target.value))}
                                                    className="mt-1 block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                />
                                            </div>
                                            <button
                                                type="button"
                                                onClick={handleGenerateQuestions}
                                                className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                                            >
                                                Generar Preguntas
                                            </button>
                                        </div>
                                    ) : (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700">IDs de Preguntas (separados por coma)</label>
                                            <textarea
                                                value={questionIds.join(', ')}
                                                onChange={(e) => setQuestionIds(e.target.value.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))}
                                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm border p-2"
                                                rows={3}
                                            />
                                        </div>
                                    )}

                                    <div className="mt-4">
                                        <p className="text-sm text-gray-600">
                                            Preguntas seleccionadas: <span className="font-bold">{questionIds.length}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
