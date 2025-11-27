import React from 'react';

interface TimeValidatorProps {
    usedMinutes: number;
    availableMinutes: number;
}

export const TimeValidator: React.FC<TimeValidatorProps> = ({ usedMinutes, availableMinutes }) => {
    const percentage = Math.min(100, (usedMinutes / availableMinutes) * 100);
    const isOverLimit = usedMinutes > availableMinutes;

    // Color logic
    let colorClass = 'bg-green-500';
    if (percentage > 80) colorClass = 'bg-yellow-500';
    if (isOverLimit) colorClass = 'bg-red-500';

    return (
        <div className="w-full bg-gray-100 rounded-lg p-4 mb-4 border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Tiempo ocupado</span>
                <span className={`text-sm font-bold ${isOverLimit ? 'text-red-600' : 'text-gray-700'}`}>
                    {usedMinutes} / {availableMinutes} min
                </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                ></div>
            </div>

            {isOverLimit && (
                <p className="text-xs text-red-600 mt-2 font-medium">
                    ⚠️ Has excedido el tiempo disponible. Por favor reduce la duración de las actividades.
                </p>
            )}
        </div>
    );
};
