import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    MegaphoneIcon,
    XCircleIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';

interface Announcement {
    id: number;
    content: string;
    type: 'info' | 'warning' | 'success' | 'error';
    link?: string;
    startDate?: string;
    endDate?: string;
    isActive: boolean;
    createdAt: string;
}

export const Announcements: React.FC = () => {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/announcements`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setAnnouncements(response.data);
        } catch (error) {
            console.error('Error fetching announcements:', error);
            toast.error('Error al cargar avisos');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAnnouncement) return;

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (editingAnnouncement.id) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/announcements/${editingAnnouncement.id}`, editingAnnouncement, { headers });
                toast.success('Aviso actualizado');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/announcements`, editingAnnouncement, { headers });
                toast.success('Aviso creado');
            }
            setIsModalOpen(false);
            fetchAnnouncements();
        } catch (error) {
            toast.error('Error al guardar aviso');
        }
    };

    const deleteAnnouncement = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este aviso?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/announcements/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Aviso eliminado');
            fetchAnnouncements();
        } catch (error) {
            toast.error('Error al eliminar aviso');
        }
    };

    const toggleStatus = async (announcement: Announcement) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/announcements/${announcement.id}`,
                { isActive: !announcement.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchAnnouncements();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'info': return 'bg-blue-500';
            case 'warning': return 'bg-yellow-500';
            case 'success': return 'bg-green-500';
            case 'error': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'info': return <InformationCircleIcon className="h-5 w-5" />;
            case 'warning': return <ExclamationTriangleIcon className="h-5 w-5" />;
            case 'success': return <CheckCircleIcon className="h-5 w-5" />;
            case 'error': return <XCircleIcon className="h-5 w-5" />;
            default: return <MegaphoneIcon className="h-5 w-5" />;
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Avisos Globales</h1>
                        <p className="text-sm text-gray-500">Gestiona los banners de anuncios de la web</p>
                    </div>
                    <button
                        onClick={() => {
                            setEditingAnnouncement({
                                content: '',
                                type: 'info',
                                isActive: true
                            });
                            setIsModalOpen(true);
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <PlusIcon className="h-5 w-5" />
                        Nuevo Aviso
                    </button>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="text-center py-10">Cargando...</div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map(announcement => (
                                <div key={announcement.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className={`p-2 rounded-full text-white ${getTypeColor(announcement.type)}`}>
                                            {getTypeIcon(announcement.type)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900">{announcement.content}</p>
                                            <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                                {announcement.link && (
                                                    <span className="flex items-center gap-1">
                                                        🔗 {announcement.link}
                                                    </span>
                                                )}
                                                {announcement.startDate && (
                                                    <span>📅 Inicio: {new Date(announcement.startDate).toLocaleDateString()}</span>
                                                )}
                                                {announcement.endDate && (
                                                    <span>🏁 Fin: {new Date(announcement.endDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 ml-4">
                                        <button
                                            onClick={() => toggleStatus(announcement)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium ${announcement.isActive
                                                ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                                }`}
                                        >
                                            {announcement.isActive ? 'Activo' : 'Inactivo'}
                                        </button>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingAnnouncement(announcement);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-1 text-gray-400 hover:text-blue-600"
                                            >
                                                <PencilSquareIcon className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => deleteAnnouncement(announcement.id)}
                                                className="p-1 text-gray-400 hover:text-red-600"
                                            >
                                                <TrashIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {announcements.length === 0 && (
                                <div className="text-center py-10 text-gray-500">
                                    No hay avisos creados
                                </div>
                            )}
                        </div>
                    )}
                </main>

                {/* Modal */}
                {isModalOpen && editingAnnouncement && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingAnnouncement.id ? 'Editar Aviso' : 'Nuevo Aviso'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                {/* Preview Section */}
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">
                                        Vista Previa en Tiempo Real
                                    </label>
                                    <div className={`rounded-md px-4 py-3 shadow-md flex items-center justify-between gap-4 transition-colors duration-300 ${getTypeColor(editingAnnouncement.type || 'info').replace('bg-', 'bg-').replace('500', '600')}`}>
                                        <div className="flex items-center gap-3 flex-1 text-white">
                                            <span className="flex-shrink-0 opacity-90">
                                                {getTypeIcon(editingAnnouncement.type || 'info')}
                                            </span>
                                            <div className="text-sm font-medium flex-1">
                                                {editingAnnouncement.content || 'Escribe un mensaje para ver la vista previa...'}
                                                {editingAnnouncement.link && (
                                                    <span className="ml-2 underline opacity-90 hover:opacity-100 cursor-pointer">
                                                        Más info &rarr;
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            className="flex-shrink-0 text-white opacity-70 hover:opacity-100 transition-opacity p-1"
                                        >
                                            <XMarkIcon className="h-5 w-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {/* Content Field */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Texto del Aviso <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <textarea
                                                required
                                                maxLength={150}
                                                rows={3}
                                                value={editingAnnouncement.content || ''}
                                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-3 border"
                                                placeholder="⚠️ Mantenimiento programado el 25/12"
                                            />
                                            <div className="absolute bottom-2 right-2 text-xs font-medium">
                                                <span className={`
                                                    ${(editingAnnouncement.content?.length || 0) > 140 ? 'text-red-600' :
                                                        (editingAnnouncement.content?.length || 0) > 100 ? 'text-yellow-600' : 'text-green-600'}
                                                `}>
                                                    {(editingAnnouncement.content?.length || 0)}/150
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Máximo 150 caracteres. Usa emojis para llamar la atención.
                                        </p>
                                    </div>

                                    {/* Type & Link */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Aviso</label>
                                            <select
                                                value={editingAnnouncement.type || 'info'}
                                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, type: e.target.value as any })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            >
                                                <option value="info">🔵 Información</option>
                                                <option value="warning">🟡 Advertencia</option>
                                                <option value="success">🟢 Éxito</option>
                                                <option value="error">🔴 Error</option>
                                            </select>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Define el color y el icono del banner.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Enlace (Opcional)</label>
                                            <input
                                                type="url"
                                                value={editingAnnouncement.link || ''}
                                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, link: e.target.value })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                placeholder="https://ejemplo.com/mas-info"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Déjalo vacío si no necesitas enlace externo.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                            <input
                                                type="datetime-local"
                                                value={editingAnnouncement.startDate ? new Date(editingAnnouncement.startDate).toISOString().slice(0, 16) : ''}
                                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, startDate: e.target.value })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Aparecerá desde esta fecha. Vacío = inmediato.
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                            <input
                                                type="datetime-local"
                                                value={editingAnnouncement.endDate ? new Date(editingAnnouncement.endDate).toISOString().slice(0, 16) : ''}
                                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, endDate: e.target.value })}
                                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Se ocultará automáticamente. Vacío = ocultar manual.
                                            </p>
                                        </div>

                                        {/* Date Validation & Countdown */}
                                        {(editingAnnouncement.startDate || editingAnnouncement.endDate) && (
                                            <div className="col-span-2 pt-2 border-t border-gray-200 mt-2">
                                                {editingAnnouncement.endDate && editingAnnouncement.startDate && new Date(editingAnnouncement.endDate) <= new Date(editingAnnouncement.startDate) ? (
                                                    <p className="text-xs text-red-600 flex items-center gap-1 font-medium">
                                                        <ExclamationTriangleIcon className="h-4 w-4" />
                                                        La fecha de fin debe ser posterior a la de inicio.
                                                    </p>
                                                ) : (
                                                    <div className="text-xs text-gray-500">
                                                        {editingAnnouncement.startDate && new Date(editingAnnouncement.startDate) > new Date() && (
                                                            <p>⏳ Se activará en: {Math.ceil((new Date(editingAnnouncement.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días</p>
                                                        )}
                                                        {editingAnnouncement.endDate && new Date(editingAnnouncement.endDate) > new Date() && (
                                                            <p>⏱️ Se desactivará en: {Math.ceil((new Date(editingAnnouncement.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} días</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                        <input
                                            type="checkbox"
                                            id="isActive"
                                            checked={editingAnnouncement.isActive ?? true}
                                            onChange={e => setEditingAnnouncement({ ...editingAnnouncement, isActive: e.target.checked })}
                                            className="mt-1 rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                                        />
                                        <div>
                                            <label htmlFor="isActive" className="text-sm font-medium text-gray-900 block">
                                                Estado del Aviso
                                            </label>
                                            <p className="text-xs text-gray-500">
                                                {editingAnnouncement.isActive ? 'Activo: visible en la web (si las fechas lo permiten)' : 'Inactivo: guardado como borrador, no visible'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            !editingAnnouncement.content ||
                                            editingAnnouncement.content.length > 150 ||
                                            (!!editingAnnouncement.endDate && !!editingAnnouncement.startDate && new Date(editingAnnouncement.endDate) <= new Date(editingAnnouncement.startDate))
                                        }
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Guardar Aviso
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
