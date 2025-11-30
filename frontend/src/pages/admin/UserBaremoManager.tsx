import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import {
    ClipboardDocumentCheckIcon,
    AcademicCapIcon,
    BriefcaseIcon,
    ArrowPathIcon
} from '@heroicons/react/24/outline';

import MilitaryDataForm from '../baremo/components/MilitaryDataForm';
import AcademicMeritsForm from '../baremo/components/AcademicMeritsForm';
import ProfessionalMeritsForm from '../baremo/components/ProfessionalMeritsForm';
import type { BaremoData } from '../../services/baremoService';

interface Props {
    userId: number;
}

export const UserBaremoManager: React.FC<Props> = ({ userId }) => {
    const [data, setData] = useState<BaremoData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'military' | 'academic' | 'professional'>('military');

    useEffect(() => {
        fetchBaremo();
    }, [userId]);

    const fetchBaremo = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/admin/users/${userId}/baremo`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching baremo:', error);
            toast.error('Error al cargar el baremo del usuario');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!data) return;
        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `${import.meta.env.VITE_API_URL}/admin/users/${userId}/baremo`,
                data,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setData(response.data);
            toast.success('Baremo actualizado correctamente');
        } catch (error) {
            console.error('Error updating baremo:', error);
            toast.error('Error al guardar cambios');
        } finally {
            setSaving(false);
        }
    };

    const handleChange = (updates: Partial<BaremoData>) => {
        setData(prev => prev ? { ...prev, ...updates } : null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <ArrowPathIcon className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    if (!data) {
        return <div className="text-center text-gray-500 p-8">No hay datos disponibles</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header Actions */}
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div>
                    <h3 className="text-lg font-medium text-gray-900">Gestión de Baremo</h3>
                    <p className="text-sm text-gray-500">Edita los méritos y datos militares del usuario</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                    {saving && <ArrowPathIcon className="h-4 w-4 animate-spin" />}
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Total Concurso</p>
                    <p className="text-2xl font-bold text-blue-600">{Number(data.puntosConcurso || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Méritos Académicos</p>
                    <p className="text-lg font-semibold text-gray-800">{Number(data.puntosMeritosAcademicos || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Méritos Profesionales</p>
                    <p className="text-lg font-semibold text-gray-800">{Number(data.puntosMeritosProfesionales || 0).toFixed(2)}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <p className="text-xs text-gray-500 uppercase">Nota Informes</p>
                    <p className="text-lg font-semibold text-gray-800">{Number(data.puntosInformesCalificacion || 0).toFixed(2)}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    <button
                        onClick={() => setActiveTab('military')}
                        className={`${
                            activeTab === 'military'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <ClipboardDocumentCheckIcon className="h-5 w-5" />
                        Datos Militares
                    </button>
                    <button
                        onClick={() => setActiveTab('academic')}
                        className={`${
                            activeTab === 'academic'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <AcademicCapIcon className="h-5 w-5" />
                        Méritos Académicos
                    </button>
                    <button
                        onClick={() => setActiveTab('professional')}
                        className={`${
                            activeTab === 'professional'
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
                    >
                        <BriefcaseIcon className="h-5 w-5" />
                        Méritos Profesionales
                    </button>
                </nav>
            </div>

            {/* Content */}
            <div className="mt-6">
                {activeTab === 'military' && (
                    <MilitaryDataForm data={data} onChange={handleChange} />
                )}
                {activeTab === 'academic' && (
                    <AcademicMeritsForm data={data} onChange={handleChange} />
                )}
                {activeTab === 'professional' && (
                    <ProfessionalMeritsForm data={data} onChange={handleChange} />
                )}
            </div>
        </div>
    );
};
