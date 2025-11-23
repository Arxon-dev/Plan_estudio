import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import { Tooltip } from '../../components/common/Tooltip';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    EyeIcon,
    EyeSlashIcon,
    PencilSquareIcon,
    ArrowPathIcon,
    QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';

interface GuideSection {
    id: number;
    sectionId: string;
    title: string;
    content: string;
    order: number;
    isVisible: boolean;
}

export const GuideEditor: React.FC = () => {
    const [sections, setSections] = useState<GuideSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSection, setSelectedSection] = useState<GuideSection | null>(null);
    const [formData, setFormData] = useState<Partial<GuideSection>>({});
    const [showPreview, setShowPreview] = useState(false);

    useEffect(() => {
        fetchSections();
    }, []);

    const fetchSections = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/guide`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSections(response.data);
            if (response.data.length > 0 && !selectedSection) {
                handleSelectSection(response.data[0]);
            }
        } catch (error) {
            console.error('Error fetching guide sections:', error);
            toast.error('Error al cargar las secciones de la guía');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectSection = (section: GuideSection) => {
        setSelectedSection(section);
        setFormData({
            title: section.title,
            content: section.content,
            order: section.order,
            isVisible: section.isVisible
        });
        setShowPreview(false);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleVisibility = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, isVisible: e.target.checked }));
    };

    const handleSave = async () => {
        if (!selectedSection) return;

        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/guide/${selectedSection.id}`,
                formData,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Sección actualizada correctamente');
            fetchSections();
        } catch (error) {
            console.error('Error updating section:', error);
            toast.error('Error al guardar los cambios');
        }
    };

    const handleToggleSectionVisibility = async (id: number) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/guide/${id}/toggle`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Visibilidad actualizada');
            fetchSections();
        } catch (error) {
            toast.error('Error al cambiar visibilidad');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Editor de Guía de Estudio</h1>
                        <p className="text-sm text-gray-500">Gestiona el contenido de la página "Guía de Estudio"</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchSections}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
                            title="Recargar"
                        >
                            <ArrowPathIcon className="h-5 w-5" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-hidden flex">
                    {/* Sidebar List */}
                    <div className="w-1/4 bg-white border-r border-gray-200 overflow-y-auto">
                        <div className="p-4 border-b border-gray-100 bg-gray-50">
                            <h3 className="font-semibold text-gray-700">Secciones</h3>
                        </div>
                        {loading ? (
                            <div className="p-4 text-center text-gray-500">Cargando...</div>
                        ) : (
                            <ul className="divide-y divide-gray-100">
                                {sections.map(section => (
                                    <li
                                        key={section.id}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${selectedSection?.id === section.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}
                                        onClick={() => handleSelectSection(section)}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h4 className={`font-medium ${selectedSection?.id === section.id ? 'text-blue-900' : 'text-gray-900'}`}>{section.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1">ID: {section.sectionId}</p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleToggleSectionVisibility(section.id);
                                                }}
                                                className={`p-1 rounded-full ${section.isVisible ? 'text-green-500 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-100'}`}
                                                title={section.isVisible ? 'Visible' : 'Oculto'}
                                            >
                                                {section.isVisible ? <EyeIcon className="h-4 w-4" /> : <EyeSlashIcon className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {/* Editor Area */}
                    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                        {selectedSection ? (
                            <div className="flex-1 flex flex-col h-full">
                                {/* Toolbar */}
                                <div className="bg-white p-4 border-b border-gray-200 flex justify-between items-center">
                                    <div className="flex items-center gap-4">
                                        <span className="text-sm font-medium text-gray-500">Editando: <span className="text-gray-900">{selectedSection.title}</span></span>
                                    </div>
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className={`px-3 py-1.5 rounded text-sm font-medium border ${showPreview ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                                        >
                                            {showPreview ? 'Editar Código' : 'Vista Previa'}
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            className="px-4 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 shadow-sm"
                                        >
                                            Guardar Cambios
                                        </button>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto p-6">
                                    <div className="max-w-4xl mx-auto space-y-6">

                                        {/* Metadata Fields */}
                                        <div className="grid grid-cols-12 gap-6">
                                            <div className="col-span-8">
                                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                                    Título
                                                    <Tooltip content="El título principal de esta sección">
                                                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </Tooltip>
                                                </label>
                                                <input
                                                    name="title"
                                                    value={formData.title || ''}
                                                    onChange={handleInputChange}
                                                    required
                                                    placeholder="Ej: Guía Completa para Oposiciones"
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Este título aparecerá en el índice de navegación.
                                                </p>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                                    Orden
                                                    <Tooltip content="Define la posición en el menú">
                                                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </Tooltip>
                                                </label>
                                                <input
                                                    type="number"
                                                    name="order"
                                                    value={formData.order || 0}
                                                    onChange={handleInputChange}
                                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Arrastra para reordenar (o usa el número)
                                                </p>
                                            </div>
                                            <div className="col-span-2 flex flex-col justify-end pb-2">
                                                <label className="flex items-center space-x-2 cursor-pointer mb-1">
                                                    <input
                                                        type="checkbox"
                                                        checked={formData.isVisible || false}
                                                        onChange={handleToggleVisibility}
                                                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                                                    />
                                                    <span className="text-sm font-medium text-gray-900">Visible</span>
                                                </label>
                                                <p className="text-xs text-gray-500 leading-tight">
                                                    Si desactivas, no aparecerá en la web pública
                                                </p>
                                            </div>
                                        </div>

                                        {/* Editor / Preview */}
                                        <div className="flex-1 min-h-[500px] bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                                                        {showPreview ? 'Vista Previa (Renderizado HTML)' : 'Contenido (HTML)'}
                                                    </label>
                                                    <Tooltip content="Usa el editor para formato rich-text. Añade títulos, listas, negritas, etc.">
                                                        <QuestionMarkCircleIcon className="h-4 w-4 text-gray-400 cursor-help" />
                                                    </Tooltip>
                                                </div>
                                                {!showPreview && (
                                                    <span className="text-xs text-gray-400">Soporta etiquetas HTML y clases de TailwindCSS</span>
                                                )}
                                            </div>

                                            {showPreview ? (
                                                <div
                                                    className="p-6 prose prose-blue max-w-none overflow-y-auto flex-1"
                                                    dangerouslySetInnerHTML={{ __html: formData.content || '' }}
                                                />
                                            ) : (
                                                <div className="flex-1 flex flex-col relative">
                                                    <textarea
                                                        name="content"
                                                        value={formData.content || ''}
                                                        onChange={handleInputChange}
                                                        placeholder="<p>Escribe aquí el contenido de la sección...</p>"
                                                        className="w-full h-full p-4 font-mono text-sm focus:ring-0 border-0 resize-none z-10 bg-transparent"
                                                        spellCheck={false}
                                                    />
                                                    {(!formData.content) && (
                                                        <div className="absolute inset-0 p-4 pointer-events-none text-gray-400 text-sm font-mono">
                                                            <p>Ejemplo de estructura:</p>
                                                            <p>&lt;h2&gt;Introducción&lt;/h2&gt;</p>
                                                            <p>&lt;p&gt;Texto de bienvenida que verán los usuarios...&lt;/p&gt;</p>
                                                            <br />
                                                            <p>&lt;h3&gt;Consejos&lt;/h3&gt;</p>
                                                            <p>&lt;ul&gt;</p>
                                                            <p>  &lt;li&gt;Recomendaciones y estrategias de estudio&lt;/li&gt;</p>
                                                            <p>&lt;/ul&gt;</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex-1 flex items-center justify-center text-gray-400">
                                <div className="text-center">
                                    <PencilSquareIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p>Selecciona una sección para editar</p>
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};
