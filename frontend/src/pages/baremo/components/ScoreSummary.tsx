import React from 'react';
import type { BaremoData } from '../../../services/baremoService';

interface Props {
    data: BaremoData;
    onChange: (data: Partial<BaremoData>) => void;
}

const ScoreSummary: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof BaremoData, value: any) => {
        onChange({ [field]: value });
    };

    return (
        <div className="space-y-6">
            {/* Pruebas Físicas */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Pruebas Físicas</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flexiones Tronco (Reps)</label>
                        <input
                            type="number"
                            value={data.flexionesTronco || ''}
                            onChange={(e) => handleChange('flexionesTronco', parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Flexiones Brazos (Reps)</label>
                        <input
                            type="number"
                            value={data.flexionesBrazos || ''}
                            onChange={(e) => handleChange('flexionesBrazos', parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Carrera 2000m</label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="Min"
                                    value={Math.floor((data.tiempoCarrera || 0) / 60) || ''}
                                    onChange={(e) => {
                                        const mins = parseInt(e.target.value) || 0;
                                        const secs = (data.tiempoCarrera || 0) % 60;
                                        handleChange('tiempoCarrera', mins * 60 + secs);
                                    }}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                                <span className="text-xs text-gray-500">Minutos</span>
                            </div>
                            <div className="flex-1">
                                <input
                                    type="number"
                                    min="0"
                                    max="59"
                                    placeholder="Seg"
                                    value={(data.tiempoCarrera || 0) % 60 || ''}
                                    onChange={(e) => {
                                        const secs = parseInt(e.target.value) || 0;
                                        const mins = data.tiempoCarrera ? Math.floor(data.tiempoCarrera / 60) : 0;
                                        handleChange('tiempoCarrera', mins * 60 + secs);
                                    }}
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                                />
                                <span className="text-xs text-gray-500">Segundos</span>
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Circuito Agilidad (Seg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.circuitoAgilidad || ''}
                            onChange={(e) => handleChange('circuitoAgilidad', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>
            </div>

            {/* Fase de Oposición */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Fase de Oposición (Examen)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preguntas Acertadas</label>
                        <input
                            type="number"
                            value={data.pruebaAcertadas || ''}
                            onChange={(e) => handleChange('pruebaAcertadas', parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preguntas Erróneas</label>
                        <input
                            type="number"
                            value={data.pruebaErroneas || ''}
                            onChange={(e) => handleChange('pruebaErroneas', parseInt(e.target.value) || 0)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        />
                    </div>
                </div>
            </div>

            {/* Resumen de Puntuación */}
            <div className="bg-indigo-50 p-6 rounded-lg border border-indigo-100">
                <h3 className="text-xl font-bold text-indigo-900 mb-6 text-center">Resumen de Puntuación</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Méritos Profesionales</p>
                        <p className="text-2xl font-bold text-gray-800">{data.puntosMeritosProfesionales || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Méritos Académicos</p>
                        <p className="text-2xl font-bold text-gray-800">{data.puntosMeritosAcademicos || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Informes (IPEC)</p>
                        <p className="text-2xl font-bold text-gray-800">{data.puntosInformesCalificacion || 0}</p>
                    </div>
                    <div className="bg-white p-4 rounded shadow-sm">
                        <p className="text-xs text-gray-500 uppercase font-semibold">Pruebas Físicas</p>
                        <p className="text-2xl font-bold text-gray-800">{data.puntosPruebasFisicas || 0}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-indigo-200 pt-6">
                    <div className="text-center">
                        <p className="text-sm text-indigo-700 font-medium">Fase de Concurso</p>
                        <p className="text-3xl font-bold text-indigo-900">{data.puntosConcurso || 0}</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-indigo-700 font-medium">Fase de Oposición</p>
                        <p className="text-3xl font-bold text-indigo-900">{data.puntosOposicion || 0}</p>
                    </div>
                    <div className="text-center bg-indigo-600 rounded-lg p-2 text-white shadow-lg transform scale-105">
                        <p className="text-sm font-medium opacity-90">PUNTUACIÓN TOTAL</p>
                        <p className="text-4xl font-extrabold">{data.puntosTotal || 0}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ScoreSummary;
