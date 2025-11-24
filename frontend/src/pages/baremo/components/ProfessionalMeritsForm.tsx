import React from 'react';
import type { BaremoData } from '../../../services/baremoService';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Props {
    data: BaremoData;
    onChange: (data: Partial<BaremoData>) => void;
}

const REWARDS_LIST = [
    { name: 'Cruz Laureada de San Fernando', points: 10 },
    { name: 'Medalla Militar', points: 8 },
    { name: 'Cruz de Guerra', points: 7 },
    { name: 'Medallas del Ejército, Naval y Aérea (individuales)', points: 6 },
    { name: 'Cruz al Mérito Militar, Naval o Aeronáutico con distintivo Rojo', points: 5 },
    { name: 'Cruz al Mérito Militar, Naval o Aeronáutico con distintivo Azul o amarillo', points: 4 },
    { name: 'Cruz al Mérito Militar, Naval o Aeronáutico con distintivo Blanco', points: 3 },
    { name: 'Citación como distinguido en la Orden General de los Ejércitos y Armada', points: 2.5 },
    { name: 'Cruz de la Real y Militar Orden de San Hermenegildo', points: 3 },
    { name: 'Mención Honorífica', points: 1 },
    { name: 'Felicitaciones individuales anotadas en la Hoja de Servicios', points: 0.5 },
    { name: 'Condecoraciones extranjeras (Mérito individual en conflictos armados)', points: 3 },
    { name: 'Condecoraciones extranjeras (recompensas militares concedidas por organización u organismo internacional)', points: 0.25 },
    { name: 'Valor reconocido', points: 0.5 },
];

const ProfessionalMeritsForm: React.FC<Props> = ({ data, onChange }) => {
    const recompensas = data.recompensas || [];

    const handleAddRecompensa = () => {
        const newRecompensa = { tipo: '', puntos: 0, fecha: new Date().toISOString() };
        onChange({ recompensas: [...recompensas, newRecompensa] });
    };

    const handleRemoveRecompensa = (index: number) => {
        const newRecompensas = recompensas.filter((_, i) => i !== index);
        onChange({ recompensas: newRecompensas });
    };

    const handleRecompensaChange = (index: number, field: string, value: any) => {
        const newRecompensas = [...recompensas];

        if (field === 'tipo') {
            const selectedReward = REWARDS_LIST.find(r => r.name === value);
            newRecompensas[index] = {
                ...newRecompensas[index],
                tipo: value,
                puntos: selectedReward ? selectedReward.points : 0
            };
        } else {
            newRecompensas[index] = { ...newRecompensas[index], [field]: value };
        }

        onChange({ recompensas: newRecompensas });
    };

    const handleInformeChange = (value: number) => {
        onChange({ notaMediaInformes: value });
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Méritos Profesionales</h3>

            {/* Informes Personales */}
            <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Informes Personales de Calificación (IPEC)</h4>
                <div className="max-w-xs">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nota Media de Informes</label>
                    <input
                        type="number"
                        min="0"
                        max="10"
                        step="0.01"
                        value={data.notaMediaInformes || ''}
                        onChange={(e) => handleInformeChange(parseFloat(e.target.value))}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                        placeholder="Ej: 8.5"
                    />
                    <p className="text-xs text-gray-500 mt-1">Se multiplica por 2.5 (Máx 25 puntos)</p>
                </div>
            </div>

            {/* Recompensas */}
            <div>
                <div className="flex justify-between items-center mb-4 border-b pb-2">
                    <h4 className="text-md font-medium text-gray-900">Condecoraciones y Recompensas</h4>
                    <button
                        onClick={handleAddRecompensa}
                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <PlusIcon className="h-4 w-4 mr-1" />
                        Añadir Recompensa
                    </button>
                </div>

                {recompensas.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">No has añadido ninguna recompensa.</p>
                ) : (
                    <div className="space-y-4">
                        {recompensas.map((recompensa, index) => (
                            <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-md border border-gray-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Condecoración / Recompensa</label>
                                    <select
                                        value={recompensa.tipo || ''}
                                        onChange={(e) => handleRecompensaChange(index, 'tipo', e.target.value)}
                                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border"
                                    >
                                        <option value="">Seleccionar...</option>
                                        {REWARDS_LIST.map((reward) => (
                                            <option key={reward.name} value={reward.name}>
                                                {reward.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Puntos</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={recompensa.puntos || 0}
                                        readOnly
                                        className="w-full rounded-md border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-xs p-2 border cursor-not-allowed"
                                    />
                                </div>
                                <button
                                    onClick={() => handleRemoveRecompensa(index)}
                                    className="mt-6 text-red-600 hover:text-red-800 p-1"
                                    title="Eliminar"
                                >
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfessionalMeritsForm;
