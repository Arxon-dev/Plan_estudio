import React from 'react';
import type { BaremoData } from '../../../services/baremoService';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
    data: BaremoData;
    onChange: (data: Partial<BaremoData>) => void;
}

const TITULACIONES_LIST = [
    { name: 'MECES 4/Doctor', points: 6 },
    { name: 'MECES 3/Máster/Licenciado, Ingeniero o Arquitecto', points: 5 },
    { name: 'MECES 2/Grado', points: 4 },
    { name: 'Diplomado Universitario, Arquitecto Técnico o Ingeniero Técnico', points: 3.5 },
];

const IDIOMAS_LIST = [
    { name: 'SLP 3.3.3.3. o superior (Inglés)', idioma: 'Inglés', nivel: 'SLP 3.3.3.3', points: 5 },
    { name: 'SLP 2.2.2.2. o superior (Inglés)', idioma: 'Inglés', nivel: 'SLP 2.2.2.2', points: 3 },
    { name: 'SLP 3.3.3.3. o superior (Otros)', idioma: 'Otros', nivel: 'SLP 3.3.3.3', points: 4 },
    { name: 'SLP 2.2.2.2. o superior (Otros)', idioma: 'Otros', nivel: 'SLP 2.2.2.2', points: 2 },
];

const AcademicMeritsForm: React.FC<Props> = ({ data, onChange }) => {
    const idiomas = data.idiomas || [];
    const cursosMilitares = data.cursosMilitares || [];
    const titulacion = data.titulacion || { nivel: '', puntos: 0 };

    // Titulación handlers
    const handleTitulacionChange = (field: string, value: any) => {
        if (field === 'nivel') {
            const selected = TITULACIONES_LIST.find(t => t.name === value);
            onChange({
                titulacion: {
                    ...titulacion,
                    nivel: value,
                    puntos: selected ? selected.points : 0
                }
            });
        } else {
            onChange({ titulacion: { ...titulacion, [field]: value } });
        }
    };

    // Idiomas handlers
    const handleAddIdioma = () => {
        onChange({ idiomas: [...idiomas, { idioma: '', nivel: '', puntos: 0 }] });
    };

    const handleRemoveIdioma = (index: number) => {
        onChange({ idiomas: idiomas.filter((_, i) => i !== index) });
    };

    const handleIdiomaChange = (index: number, field: string, value: any) => {
        const newIdiomas = [...idiomas];

        if (field === 'idioma') {
            const selected = IDIOMAS_LIST.find(i => i.name === value);
            if (selected) {
                newIdiomas[index] = {
                    ...newIdiomas[index],
                    idioma: selected.idioma,
                    nivel: selected.nivel,
                    puntos: selected.points
                };
            } else {
                newIdiomas[index] = { ...newIdiomas[index], idioma: value, puntos: 0 };
            }
        } else {
            newIdiomas[index] = { ...newIdiomas[index], [field]: value };
        }

        onChange({ idiomas: newIdiomas });
    };

    // Cursos Militares handlers
    const handleAddCurso = () => {
        // Default to ESPECIALIZACION with 2 points
        onChange({ cursosMilitares: [...cursosMilitares, { nombreCurso: '', tipo: 'ESPECIALIZACION', puntos: 2 }] });
    };

    const handleRemoveCurso = (index: number) => {
        onChange({ cursosMilitares: cursosMilitares.filter((_, i) => i !== index) });
    };

    const handleCursoChange = (index: number, field: string, value: any) => {
        const newCursos = [...cursosMilitares];

        if (field === 'tipo') {
            // Update points based on type
            const points = value === 'ESPECIALIZACION' ? 2 : 0.5;
            newCursos[index] = {
                ...newCursos[index],
                tipo: value,
                puntos: points
            };
        } else {
            newCursos[index] = { ...newCursos[index], [field]: value };
        }

        onChange({ cursosMilitares: newCursos });
    };

    return (
        <div className="space-y-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Méritos Académicos</h3>

            {/* Titulación */}
            <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Titulación Académica (Máxima aportada)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-md border border-gray-200">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-700 mb-1">Nombre de la Titulación</label>
                        <select
                            value={titulacion.nivel || ''}
                            onChange={(e) => handleTitulacionChange('nivel', e.target.value)}
                            className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border"
                        >
                            <option value="">Seleccionar...</option>
                            {TITULACIONES_LIST.map((t) => (
                                <option key={t.name} value={t.name}>{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Puntos</label>
                        <input
                            type="number"
                            value={titulacion.puntos || 0}
                            readOnly
                            className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border cursor-not-allowed"
                        />
                    </div>
                </div>
            </div>

            {/* Idiomas */}
            <div>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h4 className="text-md font-medium text-gray-900">Idiomas (SLP)</h4>
                    <button
                        onClick={handleAddIdioma}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Añadir Idioma
                    </button>
                </div>
                {idiomas.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No has añadido ningún idioma.</p>
                ) : (
                    <div className="space-y-4">
                        {idiomas.map((idioma, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Idioma / Nivel</label>
                                    <select
                                        value={IDIOMAS_LIST.find(i => i.idioma === idioma.idioma && i.nivel === idioma.nivel)?.name || ''}
                                        onChange={(e) => handleIdiomaChange(index, 'idioma', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {IDIOMAS_LIST.map((i) => (
                                            <option key={i.name} value={i.name}>{i.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Puntos</label>
                                    <input
                                        type="number"
                                        value={idioma.puntos || 0}
                                        readOnly
                                        className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border cursor-not-allowed"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveIdioma(index)}
                                    className="text-red-600 hover:text-red-800 p-2 flex justify-center md:col-start-4 md:justify-end"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cursos Militares */}
            <div>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h4 className="text-md font-medium text-gray-900">Cursos Militares</h4>
                    <button
                        onClick={handleAddCurso}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Añadir Curso
                    </button>
                </div>
                {cursosMilitares.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No has añadido ningún curso militar.</p>
                ) : (
                    <div className="space-y-4">
                        {cursosMilitares.map((curso, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="md:col-span-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                                    <select
                                        value={curso.tipo || 'ESPECIALIZACION'}
                                        onChange={(e) => handleCursoChange(index, 'tipo', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border"
                                    >
                                        <option value="ESPECIALIZACION">Especialización (2 pts)</option>
                                        <option value="INFORMATIVO">Informativo (0.5 pts)</option>
                                    </select>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre del Curso</label>
                                    <input
                                        type="text"
                                        value={curso.nombreCurso || ''}
                                        onChange={(e) => handleCursoChange(index, 'nombreCurso', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border"
                                        placeholder="Nombre del curso..."
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1">
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Puntos</label>
                                        <input
                                            type="number"
                                            value={curso.puntos || 0}
                                            readOnly
                                            className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border cursor-not-allowed"
                                        />
                                    </div>
                                    <button
                                        onClick={() => handleRemoveCurso(index)}
                                        className="text-red-600 hover:text-red-800 p-2 mb-0.5"
                                    >
                                        <TrashIcon className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AcademicMeritsForm;
