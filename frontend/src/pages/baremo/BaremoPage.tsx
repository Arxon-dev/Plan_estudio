import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { baremoService, type BaremoData } from '../../services/baremoService';
import MilitaryDataForm from './components/MilitaryDataForm';
import ProfessionalMeritsForm from './components/ProfessionalMeritsForm';
import AcademicMeritsForm from './components/AcademicMeritsForm';
import ScoreSummary from './components/ScoreSummary';

import { Header } from '../../components/Header';
import { generateBaremoPDF } from '../../utils/generateBaremoPDF';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const BaremoPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'military' | 'professional' | 'academic' | 'summary'>('military');
    const [loading, setLoading] = useState(true);
    const [baremoData, setBaremoData] = useState<BaremoData>({});

    useEffect(() => {
        loadBaremo();
    }, []);

    const loadBaremo = async () => {
        try {
            setLoading(true);
            const data = await baremoService.getBaremo();
            setBaremoData(data);
        } catch (error) {
            console.error('Error loading baremo:', error);
            toast.error('Error al cargar los datos del baremo');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const updated = await baremoService.updateBaremo(baremoData);
            setBaremoData(updated);
            toast.success('Datos guardados correctamente');
        } catch (error) {
            console.error('Error saving baremo:', error);
            toast.error('Error al guardar los datos');
        }
    };

    const handleDownloadPDF = () => {
        try {
            generateBaremoPDF(baremoData);
            toast.success('Informe PDF descargado');
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error('Error al generar el PDF');
        }
    };

    const handleDataChange = (newData: Partial<BaremoData>) => {
        setBaremoData(prev => ({ ...prev, ...newData }));
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header title="Mi Baremo / Oposición" showBack={true} backPath="/dashboard">
                <button
                    onClick={handleDownloadPDF}
                    className="px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-md hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center gap-2 text-sm font-medium"
                >
                    <ArrowDownTrayIcon className="h-5 w-5" />
                    Descargar PDF
                </button>
                <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-sm font-medium"
                >
                    Guardar Cambios
                </button>
            </Header>

            <div className="container mx-auto px-4 py-8">

                {/* Tabs */}
                <div className="border-b border-gray-200 mb-6">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        <button
                            onClick={() => setActiveTab('military')}
                            className={`${activeTab === 'military'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Datos Militares
                        </button>
                        <button
                            onClick={() => setActiveTab('professional')}
                            className={`${activeTab === 'professional'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Méritos Profesionales
                        </button>
                        <button
                            onClick={() => setActiveTab('academic')}
                            className={`${activeTab === 'academic'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Méritos Académicos
                        </button>
                        <button
                            onClick={() => setActiveTab('summary')}
                            className={`${activeTab === 'summary'
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            Resumen y Puntuación
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="mt-6">
                    {activeTab === 'military' && (
                        <MilitaryDataForm data={baremoData} onChange={handleDataChange} />
                    )}
                    {activeTab === 'professional' && (
                        <ProfessionalMeritsForm data={baremoData} onChange={handleDataChange} />
                    )}
                    {activeTab === 'academic' && (
                        <AcademicMeritsForm data={baremoData} onChange={handleDataChange} />
                    )}
                    {activeTab === 'summary' && (
                        <ScoreSummary data={baremoData} onChange={handleDataChange} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default BaremoPage;
