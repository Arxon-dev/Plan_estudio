import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/AdminSidebar';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    PencilSquareIcon,
    TrashIcon,
    PlusIcon,
    CheckCircleIcon,
    XCircleIcon
} from '@heroicons/react/24/outline';

interface SubscriptionPlan {
    id: number;
    name: string;
    price: number;
    features: string[];
    isFeatured: boolean;
    isActive: boolean;
    order: number;
    buttonText: string;
    stripePriceId?: string;
}

interface MarketingSection {
    id: number;
    page: string;
    sectionId: string;
    content: any;
}

export const MarketingSettings: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'content' | 'plans'>('content');
    const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
    const [sections, setSections] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(true);
    const [editingPlan, setEditingPlan] = useState<Partial<SubscriptionPlan> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            const [plansRes, sectionsRes] = await Promise.all([
                axios.get(`${import.meta.env.VITE_API_URL}/admin/marketing/plans`, { headers }),
                axios.get(`${import.meta.env.VITE_API_URL}/admin/marketing/sections?page=pricing`, { headers })
            ]);

            setPlans(plansRes.data);

            const sectionsMap = sectionsRes.data.reduce((acc: any, section: MarketingSection) => {
                acc[section.sectionId] = section.content;
                return acc;
            }, {});
            setSections(sectionsMap);

        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Error al cargar datos');
        } finally {
            setLoading(false);
        }
    };

    const handleSectionChange = (sectionId: string, field: string, value: string) => {
        setSections(prev => ({
            ...prev,
            [sectionId]: {
                ...prev[sectionId],
                [field]: value
            }
        }));
    };

    const saveSection = async (sectionId: string) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/marketing/sections/pricing/${sectionId}`,
                { content: sections[sectionId] },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success('Sección actualizada');
        } catch (error) {
            toast.error('Error al guardar sección');
        }
    };

    const handlePlanSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingPlan) return;

        try {
            const token = localStorage.getItem('token');
            const headers = { Authorization: `Bearer ${token}` };

            if (editingPlan.id) {
                await axios.put(`${import.meta.env.VITE_API_URL}/admin/marketing/plans/${editingPlan.id}`, editingPlan, { headers });
                toast.success('Plan actualizado');
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/admin/marketing/plans`, editingPlan, { headers });
                toast.success('Plan creado');
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            toast.error('Error al guardar plan');
        }
    };

    const deletePlan = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este plan?')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${import.meta.env.VITE_API_URL}/admin/marketing/plans/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Plan eliminado');
            fetchData();
        } catch (error) {
            toast.error('Error al eliminar plan');
        }
    };

    const togglePlanStatus = async (plan: SubscriptionPlan) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/marketing/plans/${plan.id}`,
                { isActive: !plan.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchData();
        } catch (error) {
            toast.error('Error al actualizar estado');
        }
    };

    return (
        <div className="flex h-screen bg-gray-100 overflow-hidden">
            <AdminSidebar />

            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="bg-white shadow-sm z-10 p-4 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-800">Marketing y Precios</h1>
                    <p className="text-sm text-gray-500">Gestiona el contenido de la página de precios y planes</p>
                </header>

                <main className="flex-1 overflow-y-auto p-6">
                    {/* Tabs */}
                    <div className="flex space-x-4 mb-6 border-b border-gray-200">
                        <button
                            className={`pb-2 px-4 font-medium ${activeTab === 'content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('content')}
                        >
                            Contenido General
                        </button>
                        <button
                            className={`pb-2 px-4 font-medium ${activeTab === 'plans' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                            onClick={() => setActiveTab('plans')}
                        >
                            Planes de Suscripción
                        </button>
                    </div>

                    {loading ? (
                        <div className="text-center py-10">Cargando...</div>
                    ) : (
                        <>
                            {activeTab === 'content' && (
                                <div className="space-y-8 max-w-4xl">
                                    {/* Hero Section */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Sección Hero (Principal)</h3>
                                            <button onClick={() => saveSection('hero')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Guardar</button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Badge / Etiqueta</label>
                                                <input
                                                    type="text"
                                                    value={sections.hero?.badge || ''}
                                                    onChange={(e) => handleSectionChange('hero', 'badge', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Título Principal</label>
                                                <input
                                                    type="text"
                                                    value={sections.hero?.title || ''}
                                                    onChange={(e) => handleSectionChange('hero', 'title', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                                                <textarea
                                                    value={sections.hero?.subtitle || ''}
                                                    onChange={(e) => handleSectionChange('hero', 'subtitle', e.target.value)}
                                                    rows={3}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Features Intro */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Introducción Características</h3>
                                            <button onClick={() => saveSection('features_intro')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Guardar</button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                                <input
                                                    type="text"
                                                    value={sections.features_intro?.title || ''}
                                                    onChange={(e) => handleSectionChange('features_intro', 'title', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                                                <textarea
                                                    value={sections.features_intro?.subtitle || ''}
                                                    onChange={(e) => handleSectionChange('features_intro', 'subtitle', e.target.value)}
                                                    rows={2}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Final CTA */}
                                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-semibold text-gray-800">Llamada a la Acción Final</h3>
                                            <button onClick={() => saveSection('final_cta')} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Guardar</button>
                                        </div>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Título</label>
                                                <input
                                                    type="text"
                                                    value={sections.final_cta?.title || ''}
                                                    onChange={(e) => handleSectionChange('final_cta', 'title', e.target.value)}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700">Subtítulo</label>
                                                <textarea
                                                    value={sections.final_cta?.subtitle || ''}
                                                    onChange={(e) => handleSectionChange('final_cta', 'subtitle', e.target.value)}
                                                    rows={2}
                                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'plans' && (
                                <div className="space-y-6">
                                    <div className="flex justify-end">
                                        <button
                                            onClick={() => {
                                                setEditingPlan({
                                                    name: '',
                                                    price: 0,
                                                    features: [],
                                                    isActive: true,
                                                    isFeatured: false,
                                                    buttonText: 'Suscribirse',
                                                    stripePriceId: ''
                                                });
                                                setIsModalOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <PlusIcon className="h-5 w-5" />
                                            Nuevo Plan
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {plans.map(plan => (
                                            <div key={plan.id} className={`bg-white rounded-xl shadow-sm border-2 p-6 relative ${plan.isFeatured ? 'border-blue-500 ring-4 ring-blue-50' : 'border-gray-200'}`}>
                                                {plan.isFeatured && (
                                                    <span className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-bl-lg">
                                                        DESTACADO
                                                    </span>
                                                )}

                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                                                        <p className="text-2xl font-bold text-gray-700">€{plan.price}<span className="text-sm font-normal text-gray-500">/mes</span></p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => {
                                                                setEditingPlan(plan);
                                                                setIsModalOpen(true);
                                                            }}
                                                            className="p-1 text-gray-400 hover:text-blue-600"
                                                        >
                                                            <PencilSquareIcon className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => deletePlan(plan.id)}
                                                            className="p-1 text-gray-400 hover:text-red-600"
                                                        >
                                                            <TrashIcon className="h-5 w-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="space-y-2 mb-6">
                                                    {(Array.isArray(plan.features) ? plan.features : []).slice(0, 4).map((feature, idx) => (
                                                        <div key={idx} className="flex items-center text-sm text-gray-600">
                                                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                                                            <span className="truncate">{feature}</span>
                                                        </div>
                                                    ))}
                                                    {(Array.isArray(plan.features) ? plan.features : []).length > 4 && (
                                                        <p className="text-xs text-gray-400 italic">+{(Array.isArray(plan.features) ? plan.features : []).length - 4} más...</p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${plan.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                        {plan.isActive ? 'Activo' : 'Inactivo'}
                                                    </span>
                                                    <button
                                                        onClick={() => togglePlanStatus(plan)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        {plan.isActive ? 'Desactivar' : 'Activar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </main>

                {/* Edit Plan Modal */}
                {isModalOpen && editingPlan && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                                <h3 className="text-xl font-bold text-gray-900">
                                    {editingPlan.id ? 'Editar Plan' : 'Nuevo Plan'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <XCircleIcon className="h-6 w-6" />
                                </button>
                            </div>

                            <form onSubmit={handlePlanSubmit} className="p-6 space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        Nombre del Plan
                                        <span className="text-gray-400 text-xs" title="Nombre visible para los usuarios">[?]</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ej: Premium Mensual"
                                        value={editingPlan.name || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">El nombre que verán los usuarios en la página de precios.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Precio (€)
                                            <span className="text-gray-400 text-xs" title="Precio mensual en euros">[?]</span>
                                        </label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            required
                                            placeholder="9.99"
                                            value={editingPlan.price || 0}
                                            onChange={e => setEditingPlan({ ...editingPlan, price: parseFloat(e.target.value) })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">Precio en euros (sin símbolo).</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                            Stripe Price ID
                                            <span className="text-gray-400 text-xs" title="ID del precio en Stripe Dashboard">[?]</span>
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="price_1234567890abcdef"
                                            value={editingPlan.stripePriceId || ''}
                                            onChange={e => setEditingPlan({ ...editingPlan, stripePriceId: e.target.value })}
                                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        />
                                        <p className="mt-1 text-xs text-gray-500">ID del precio desde Stripe Dashboard (Productos).</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        Texto Botón
                                        <span className="text-gray-400 text-xs" title="Texto del botón de suscripción">[?]</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ej: Suscribirse Ahora"
                                        value={editingPlan.buttonText || ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, buttonText: e.target.value })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Texto que aparecerá en el botón de acción.</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                                        Características
                                        <span className="text-gray-400 text-xs" title="Lista de beneficios del plan">[?]</span>
                                    </label>
                                    <textarea
                                        rows={5}
                                        value={Array.isArray(editingPlan.features) ? editingPlan.features.join('\n') : ''}
                                        onChange={e => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n').filter(line => line.trim() !== '') })}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
                                        placeholder="Acceso a todos los tests&#10;Estadísticas avanzadas&#10;..."
                                    />
                                    <p className="mt-1 text-xs text-gray-500">Una característica por línea.</p>
                                </div>

                                <div className="flex items-center gap-6 pt-2 bg-gray-50 p-4 rounded-lg">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.isFeatured || false}
                                            onChange={e => setEditingPlan({ ...editingPlan, isFeatured: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 block">Destacado</span>
                                            <span className="text-xs text-gray-500">Marcar para resaltar este plan</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editingPlan.isActive ?? true}
                                            onChange={e => setEditingPlan({ ...editingPlan, isActive: e.target.checked })}
                                            className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 border-gray-300"
                                        />
                                        <div>
                                            <span className="text-sm font-medium text-gray-700 block">Activo</span>
                                            <span className="text-xs text-gray-500">Visible para los usuarios</span>
                                        </div>
                                    </label>
                                </div>

                                <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm"
                                    >
                                        Guardar Plan
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
