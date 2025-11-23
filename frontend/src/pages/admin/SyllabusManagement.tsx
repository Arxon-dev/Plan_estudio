import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    FolderIcon,
    DocumentTextIcon,
    PlusIcon,
    PencilIcon,
    TrashIcon,
    ChevronRightIcon,
    ChevronDownIcon,
    ArrowUpIcon,
    ArrowDownIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon
} from '@heroicons/react/24/outline';
import { Tooltip } from '../../components/common/Tooltip';

// Simple Rich Text Editor (Textarea for now, can be upgraded to Quill/TinyMCE)
const RichTextEditor = ({ value, onChange }: { value: string, onChange: (val: string) => void }) => {
    return (
        <textarea
            className="w-full h-64 p-4 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="# Título del tema\n\nEscribe aquí el contenido en formato Markdown..."
        />
    );
};

interface Theme {
    id: number;
    title: string;
    themeNumber: number;
    estimatedHours: number;
    parts: number;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    content?: string;
}

interface Block {
    id: number;
    code: string;
    name: string;
    description: string;
    order: number;
    themes: Theme[];
}

export const SyllabusManagement: React.FC = () => {
    const [blocks, setBlocks] = useState<Block[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedBlocks, setExpandedBlocks] = useState<number[]>([]);

    // Modal States
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [showThemeModal, setShowThemeModal] = useState(false);
    const [editingBlock, setEditingBlock] = useState<Block | null>(null);
    const [editingTheme, setEditingTheme] = useState<Theme | null>(null);
    const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Delete Modal State
    const [deleteModal, setDeleteModal] = useState<{
        show: boolean;
        type: 'block' | 'theme';
        id: number;
        title: string;
        count?: number;
    }>({ show: false, type: 'block', id: 0, title: '' });

    // Form Data
    const [blockForm, setBlockForm] = useState({ code: '', name: '', description: '', order: 0 });
    const [themeForm, setThemeForm] = useState({
        title: '', themeNumber: 0, estimatedHours: 2, parts: 1, complexity: 'MEDIUM', content: ''
    });

    useEffect(() => {
        fetchSyllabus();
    }, []);

    const fetchSyllabus = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/syllabus`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlocks(response.data);
            // Expand all blocks by default
            setExpandedBlocks(response.data.map((b: Block) => b.id));
        } catch (error) {
            console.error('Error fetching syllabus:', error);
            toast.error('Error al cargar el temario');
        } finally {
            setLoading(false);
        }
    };

    const toggleBlock = (blockId: number) => {
        setExpandedBlocks(prev =>
            prev.includes(blockId)
                ? prev.filter(id => id !== blockId)
                : [...prev, blockId]
        );
    };

    // --- BLOCK ACTIONS ---

    const handleCreateBlock = () => {
        setEditingBlock(null);
        setBlockForm({ code: '', name: '', description: '', order: blocks.length + 1 });
        setShowBlockModal(true);
    };

    const handleEditBlock = (block: Block) => {
        setEditingBlock(block);
        setBlockForm({
            code: block.code,
            name: block.name,
            description: block.description,
            order: block.order
        });
        setShowBlockModal(true);
    };

    const confirmDeleteBlock = (block: Block) => {
        setDeleteModal({
            show: true,
            type: 'block',
            id: block.id,
            title: block.name,
            count: block.themes.length
        });
    };

    const confirmDeleteTheme = (theme: Theme) => {
        setDeleteModal({
            show: true,
            type: 'theme',
            id: theme.id,
            title: theme.title
        });
    };

    const executeDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            const endpoint = deleteModal.type === 'block'
                ? `/admin/syllabus/blocks/${deleteModal.id}`
                : `/admin/syllabus/themes/${deleteModal.id}`;

            await axios.delete(`${import.meta.env.VITE_API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success(`${deleteModal.type === 'block' ? 'Bloque' : 'Tema'} eliminado`);
            setDeleteModal({ ...deleteModal, show: false });
            fetchSyllabus();
        } catch (error) {
            toast.error(`Error al eliminar ${deleteModal.type === 'block' ? 'bloque' : 'tema'}`);
        }
    };

    const handleMoveBlock = async (index: number, direction: 'up' | 'down') => {
        if ((direction === 'up' && index === 0) || (direction === 'down' && index === blocks.length - 1)) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;

        // Swap visual order first for responsiveness
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);

        // Update backend
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            // Swap order values
            const blockA = newBlocks[index];
            const blockB = newBlocks[swapIndex];

            // We need to update both blocks with their new positions (assuming 'order' field exists and is used for sorting)
            // Ideally backend has a 'reorder' endpoint, but we'll update individually for now
            await Promise.all([
                axios.put(`${import.meta.env.VITE_API_URL}/admin/syllabus/blocks/${blockA.id}`, { ...blockA, order: swapIndex + 1 }, { headers }),
                axios.put(`${import.meta.env.VITE_API_URL}/admin/syllabus/blocks/${blockB.id}`, { ...blockB, order: index + 1 }, { headers })
            ]);

            fetchSyllabus(); // Refresh to ensure sync
        } catch (error) {
            toast.error('Error al reordenar bloques');
            fetchSyllabus(); // Revert on error
        }
    };

    const handleMoveTheme = async (blockIndex: number, themeIndex: number, direction: 'up' | 'down') => {
        const block = blocks[blockIndex];
        if ((direction === 'up' && themeIndex === 0) || (direction === 'down' && themeIndex === block.themes.length - 1)) return;

        const newThemes = [...block.themes];
        const swapIndex = direction === 'up' ? themeIndex - 1 : themeIndex + 1;

        [newThemes[themeIndex], newThemes[swapIndex]] = [newThemes[swapIndex], newThemes[themeIndex]];

        // Optimistic update
        const newBlocks = [...blocks];
        newBlocks[blockIndex] = { ...block, themes: newThemes };
        setBlocks(newBlocks);

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const themeA = newThemes[themeIndex];
            const themeB = newThemes[swapIndex];

            await Promise.all([
                axios.put(`${import.meta.env.VITE_API_URL}/admin/syllabus/themes/${themeA.id}`, { ...themeA, themeNumber: swapIndex + 1, blockId: block.id }, { headers }),
                axios.put(`${import.meta.env.VITE_API_URL}/admin/syllabus/themes/${themeB.id}`, { ...themeB, themeNumber: themeIndex + 1, blockId: block.id }, { headers })
            ]);

            fetchSyllabus();
        } catch (error) {
            toast.error('Error al reordenar temas');
            fetchSyllabus();
        }
    };

    const saveBlock = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (editingBlock) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/syllabus/blocks/${editingBlock.id}`, blockForm, { headers });
                toast.success('Bloque actualizado');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/syllabus/blocks`, blockForm, { headers });
                toast.success('Bloque creado');
            }
            setShowBlockModal(false);
            fetchSyllabus();
        } catch (error) {
            toast.error('Error al guardar bloque');
        }
    };

    // --- THEME ACTIONS ---

    const handleCreateTheme = (blockId: number) => {
        setSelectedBlockId(blockId);
        setEditingTheme(null);
        // Find next theme number
        const block = blocks.find(b => b.id === blockId);
        const nextNum = block && block.themes.length > 0
            ? Math.max(...block.themes.map(t => t.themeNumber)) + 1
            : 1;

        setThemeForm({
            title: '', themeNumber: nextNum, estimatedHours: 2, parts: 1, complexity: 'MEDIUM', content: ''
        });
        setShowThemeModal(true);
    };

    const handleEditTheme = async (theme: Theme, blockId: number) => {
        setSelectedBlockId(blockId);
        setEditingTheme(theme);

        // Fetch full content
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/themes/${theme.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setThemeForm({
                title: theme.title,
                themeNumber: theme.themeNumber,
                estimatedHours: theme.estimatedHours,
                parts: theme.parts,
                complexity: theme.complexity,
                content: res.data.theme.content || ''
            });
            setShowThemeModal(true);
        } catch (error) {
            toast.error('Error al cargar contenido del tema');
        }
    };



    const saveTheme = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };
            const payload = { ...themeForm, blockId: selectedBlockId };

            if (editingTheme) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/syllabus/themes/${editingTheme.id}`, payload, { headers });
                toast.success('Tema actualizado');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/syllabus/themes`, payload, { headers });
                toast.success('Tema creado');
            }
            setShowThemeModal(false);
            fetchSyllabus();
        } catch (error) {
            toast.error('Error al guardar tema');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Gestión de Temario</h1>
                        <p className="text-sm text-gray-500">Organiza bloques y temas del plan de estudio</p>
                    </div>
                    <button
                        onClick={handleCreateBlock}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nuevo Bloque
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="space-y-4 max-w-5xl mx-auto">
                            {blocks.map((block, blockIndex) => (
                                <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                    {/* Block Header */}
                                    <div className="bg-gray-50 p-4 flex items-center justify-between border-b border-gray-200">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer flex-1"
                                            onClick={() => toggleBlock(block.id)}
                                        >
                                            {expandedBlocks.includes(block.id) ? (
                                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                                            ) : (
                                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                                            )}
                                            <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                                                <FolderIcon className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{block.name}</h3>
                                                <p className="text-xs text-gray-500">{block.themes.length} temas</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-0.5 mr-2">
                                                <button
                                                    onClick={() => handleMoveBlock(blockIndex, 'up')}
                                                    disabled={blockIndex === 0}
                                                    className={`p-0.5 rounded hover:bg-gray-200 ${blockIndex === 0 ? 'text-gray-300' : 'text-gray-500'}`}
                                                >
                                                    <ArrowUpIcon className="h-3 w-3" />
                                                </button>
                                                <button
                                                    onClick={() => handleMoveBlock(blockIndex, 'down')}
                                                    disabled={blockIndex === blocks.length - 1}
                                                    className={`p-0.5 rounded hover:bg-gray-200 ${blockIndex === blocks.length - 1 ? 'text-gray-300' : 'text-gray-500'}`}
                                                >
                                                    <ArrowDownIcon className="h-3 w-3" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleCreateTheme(block.id)}
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-full" title="Añadir Tema"
                                            >
                                                <PlusIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => handleEditBlock(block)}
                                                className="p-2 text-gray-500 hover:bg-gray-100 rounded-full" title="Editar Bloque"
                                            >
                                                <PencilIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => confirmDeleteBlock(block)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-full" title="Eliminar Bloque"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Themes List */}
                                    {expandedBlocks.includes(block.id) && (
                                        <div className="divide-y divide-gray-100">
                                            {block.themes.length === 0 ? (
                                                <div className="p-8 text-center text-gray-400 text-sm">
                                                    No hay temas en este bloque.
                                                </div>
                                            ) : (
                                                block.themes.map((theme, themeIndex) => (
                                                    <div key={theme.id} className="p-4 pl-12 hover:bg-gray-50 flex items-center justify-between group">
                                                        <div className="flex items-center gap-4">
                                                            <div className="text-gray-400 font-mono text-sm w-8">
                                                                #{theme.themeNumber}
                                                            </div>
                                                            <div className="p-1.5 bg-gray-100 rounded text-gray-500">
                                                                <DocumentTextIcon className="h-5 w-5" />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-sm font-medium text-gray-900">{theme.title}</h4>
                                                                <div className="flex gap-2 mt-1">
                                                                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">
                                                                        {theme.estimatedHours}h
                                                                    </span>
                                                                    <span className={`text-xs px-2 py-0.5 rounded ${theme.complexity === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                                        theme.complexity === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                                            'bg-green-100 text-green-700'
                                                                        }`}>
                                                                        {theme.complexity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2">
                                                            <div className="flex flex-col gap-0.5 mr-2">
                                                                <button
                                                                    onClick={() => handleMoveTheme(blockIndex, themeIndex, 'up')}
                                                                    disabled={themeIndex === 0}
                                                                    className={`p-0.5 rounded hover:bg-gray-200 ${themeIndex === 0 ? 'text-gray-300' : 'text-gray-500'}`}
                                                                >
                                                                    <ArrowUpIcon className="h-3 w-3" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleMoveTheme(blockIndex, themeIndex, 'down')}
                                                                    disabled={themeIndex === block.themes.length - 1}
                                                                    className={`p-0.5 rounded hover:bg-gray-200 ${themeIndex === block.themes.length - 1 ? 'text-gray-300' : 'text-gray-500'}`}
                                                                >
                                                                    <ArrowDownIcon className="h-3 w-3" />
                                                                </button>
                                                            </div>
                                                            <button
                                                                onClick={() => handleEditTheme(theme, block.id)}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                                            >
                                                                Editar
                                                            </button>
                                                            <button
                                                                onClick={() => confirmDeleteTheme(theme)}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                                            >
                                                                Eliminar
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {/* Block Modal */}
                {showBlockModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-xl font-bold mb-4">{editingBlock ? 'Editar Bloque' : 'Nuevo Bloque'}</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Código (Único)</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                        value={blockForm.code}
                                        onChange={(e) => setBlockForm({ ...blockForm, code: e.target.value })}
                                        disabled={!!editingBlock}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                        value={blockForm.name}
                                        onChange={(e) => setBlockForm({ ...blockForm, name: e.target.value })}
                                        placeholder="Ej: Tema 1: Derecho Constitucional"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                    <textarea
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                        value={blockForm.description}
                                        onChange={(e) => setBlockForm({ ...blockForm, description: e.target.value })}
                                        placeholder="Resumen breve del contenido..."
                                        maxLength={200}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Resumen breve (opcional, 200 caracteres máx)</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                                    <input
                                        type="number"
                                        className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                        value={blockForm.order}
                                        onChange={(e) => setBlockForm({ ...blockForm, order: parseInt(e.target.value) })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Posición de visualización (1 = primero)</p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowBlockModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveBlock}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Theme Modal */}
                {showThemeModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-xl p-6 w-full max-w-4xl h-[90vh] flex flex-col">
                            <h2 className="text-xl font-bold mb-4">{editingTheme ? 'Editar Tema' : 'Nuevo Tema'}</h2>

                            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Número de Tema</label>
                                        <input
                                            type="number"
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            value={themeForm.themeNumber}
                                            onChange={(e) => setThemeForm({ ...themeForm, themeNumber: parseInt(e.target.value) })}
                                        />
                                        <p className="text-xs text-gray-500 mt-1">Posición dentro de su bloque</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                        <input
                                            type="text"
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            value={themeForm.title}
                                            onChange={(e) => setThemeForm({ ...themeForm, title: e.target.value })}
                                            placeholder="Ej: Artículo 14 - Principio de Igualdad"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Horas Estimadas</label>
                                        <input
                                            type="number"
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            value={themeForm.estimatedHours}
                                            onChange={(e) => setThemeForm({ ...themeForm, estimatedHours: parseFloat(e.target.value) })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Complejidad</label>
                                        <select
                                            className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border"
                                            value={themeForm.complexity}
                                            onChange={(e) => setThemeForm({ ...themeForm, complexity: e.target.value as any })}
                                        >
                                            <option value="LOW">Baja</option>
                                            <option value="MEDIUM">Media</option>
                                            <option value="HIGH">Alta</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex flex-col h-full min-h-[400px]">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex items-center gap-2">
                                            <label className="block text-sm font-medium text-gray-700">Contenido (Markdown)</label>
                                            <Tooltip content="Usa el editor rich-text para formato">
                                                <InformationCircleIcon className="h-4 w-4 text-gray-400" />
                                            </Tooltip>
                                        </div>
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className={`px-3 py-1 text-xs font-medium rounded border ${showPreview ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-600 border-gray-300'}`}
                                        >
                                            {showPreview ? 'Editar Código' : 'Vista Previa'}
                                        </button>
                                    </div>

                                    {showPreview ? (
                                        <div
                                            className="w-full h-64 p-4 border rounded-md overflow-y-auto prose prose-sm max-w-none bg-gray-50"
                                            dangerouslySetInnerHTML={{ __html: themeForm.content || '<p class="text-gray-400 italic">Sin contenido...</p>' }} // In real app use a markdown parser here
                                        />
                                    ) : (
                                        <RichTextEditor
                                            value={themeForm.content}
                                            onChange={(val) => setThemeForm({ ...themeForm, content: val })}
                                        />
                                    )}
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setShowThemeModal(false)}
                                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={saveTheme}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                >
                                    Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteModal.show && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[60]">
                        <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-2xl transform transition-all scale-100">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-red-100 rounded-full text-red-600 flex-shrink-0">
                                    <ExclamationTriangleIcon className="h-6 w-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                                        ¿Eliminar {deleteModal.type === 'block' ? 'Bloque' : 'Tema'}?
                                    </h3>
                                    <p className="text-sm text-gray-600 mb-4">
                                        Estás a punto de eliminar <span className="font-bold text-gray-800">"{deleteModal.title}"</span>.
                                        {deleteModal.type === 'block' && (deleteModal.count || 0) > 0 && (
                                            <span className="block mt-2 p-2 bg-red-50 text-red-800 rounded border border-red-100 font-medium">
                                                ⚠️ Se eliminarán también {deleteModal.count} temas asociados.
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500">Esta acción no se puede deshacer.</p>
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end gap-3">
                                <button
                                    onClick={() => setDeleteModal({ ...deleteModal, show: false })}
                                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={executeDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium shadow-sm"
                                >
                                    Eliminar Definitivamente
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
