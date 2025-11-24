import React from 'react';
import type { BaremoData } from '../../../services/baremoService';
import { SPECIALTIES } from '../../../constants/militaryData';

interface Props {
    data: BaremoData;
    onChange: (data: Partial<BaremoData>) => void;
}

const MilitaryDataForm: React.FC<Props> = ({ data, onChange }) => {
    const handleChange = (field: keyof BaremoData, value: any) => {
        onChange({ [field]: value });
    };

    const getSpecialties = () => {
        if (!data.ejercito || !data.agrupacionEspecialidad) return [];
        // @ts-ignore
        return SPECIALTIES[data.ejercito]?.[data.agrupacionEspecialidad] || [];
    };

    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Datos Militares</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Ejército */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuerpo / Ejército</label>
                    <select
                        value={data.ejercito || ''}
                        onChange={(e) => {
                            handleChange('ejercito', e.target.value);
                            handleChange('especialidadFundamental', ''); // Reset specialty on army change
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="TIERRA">Ejército de Tierra</option>
                        <option value="ARMADA">Armada</option>
                        <option value="AIRE_Y_ESPACIO">Ejército del Aire y del Espacio</option>
                    </select>
                </div>

                {/* Empleo */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Empleo</label>
                    <select
                        value={data.empleo || ''}
                        onChange={(e) => handleChange('empleo', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="CABO">Cabo</option>
                        <option value="CABO_PRIMERO">Cabo Primero</option>
                    </select>
                </div>

                {/* Agrupación de Especialidades */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Agrupación</label>
                    <select
                        value={data.agrupacionEspecialidad || ''}
                        onChange={(e) => {
                            handleChange('agrupacionEspecialidad', e.target.value);
                            handleChange('especialidadFundamental', ''); // Reset specialty on grouping change
                        }}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="OPERATIVAS">Especialidades Operativas</option>
                        <option value="TECNICAS">Especialidades Técnicas</option>
                    </select>
                </div>

                {/* Especialidad Fundamental */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Especialidad Fundamental</label>
                    <select
                        value={data.especialidadFundamental || ''}
                        onChange={(e) => handleChange('especialidadFundamental', e.target.value)}
                        disabled={!data.ejercito || !data.agrupacionEspecialidad}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border disabled:bg-gray-100 disabled:text-gray-400"
                    >
                        <option value="">Seleccionar...</option>
                        {getSpecialties().map((spec: string) => (
                            <option key={spec} value={spec}>{spec}</option>
                        ))}
                    </select>
                </div>

                {/* Fecha Ingreso */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Ingreso</label>
                    <input
                        type="date"
                        value={data.fechaIngreso ? new Date(data.fechaIngreso).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleChange('fechaIngreso', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                {/* Fecha Antigüedad */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Antigüedad en el Empleo</label>
                    <input
                        type="date"
                        value={data.fechaAntiguedad ? new Date(data.fechaAntiguedad).toISOString().split('T')[0] : ''}
                        onChange={(e) => handleChange('fechaAntiguedad', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                </div>

                {/* Sexo (Para pruebas físicas) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sexo (para baremo físico)</label>
                    <select
                        value={data.sexo || ''}
                        onChange={(e) => handleChange('sexo', e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    >
                        <option value="">Seleccionar...</option>
                        <option value="H">Hombre</option>
                        <option value="M">Mujer</option>
                    </select>
                </div>
            </div>

            <h4 className="text-md font-medium text-gray-900 border-b pb-2 pt-4">Tiempos de Servicio (Meses completos)</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unidades Preferentes</label>
                    <input
                        type="number"
                        min="0"
                        value={data.tiempoServiciosUnidadesPreferentes || 0}
                        onChange={(e) => handleChange('tiempoServiciosUnidadesPreferentes', parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.08 puntos/mes</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Otras Unidades</label>
                    <input
                        type="number"
                        min="0"
                        value={data.tiempoServiciosOtrasUnidades || 0}
                        onChange={(e) => handleChange('tiempoServiciosOtrasUnidades', parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.04 puntos/mes</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Operaciones en el Extranjero</label>
                    <input
                        type="number"
                        min="0"
                        max="24"
                        value={data.tiempoOperacionesExtranjero || 0}
                        onChange={(e) => handleChange('tiempoOperacionesExtranjero', parseInt(e.target.value) || 0)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2 border"
                    />
                    <p className="text-xs text-gray-500 mt-1">0.1 puntos/mes (Máx 24)</p>
                </div>
            </div>
        </div>
    );
};

export default MilitaryDataForm;
