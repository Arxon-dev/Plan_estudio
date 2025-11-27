import React from 'react';
import { WeeklyPatternEditor } from './WeeklyPatternEditor';
import type { WeeklyPattern } from './WeeklyPatternEditor';
import { TimeValidator } from './TimeValidator';
import type { ThemeInput } from '../services/studyPlanService';
import { format } from 'date-fns';

interface BlockConfiguratorProps {
    blockNumber: number;
    startDate: Date;
    endDate: Date;
    pattern: WeeklyPattern;
    onPatternChange: (pattern: WeeklyPattern) => void;
    themes: ThemeInput[];
    availableDailyMinutes: number;
    onApplyToRemaining: () => void;
    isLastBlock: boolean;
}

export const BlockConfigurator: React.FC<BlockConfiguratorProps> = ({
    blockNumber,
    startDate,
    endDate,
    pattern,
    onPatternChange,
    themes,
    availableDailyMinutes,
    onApplyToRemaining,
    isLastBlock
}) => {
    // Calculate average daily usage for validator (simplified)
    const avgUsage = Object.values(pattern).reduce((acc, day) => acc + day.totalMinutes, 0) / 7;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Configuración del Bloque {blockNumber}</h2>
                    <p className="text-sm text-gray-500">
                        {format(startDate, 'dd/MM/yyyy')} - {format(endDate, 'dd/MM/yyyy')}
                    </p>
                </div>

                {!isLastBlock && (
                    <button
                        onClick={onApplyToRemaining}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
                    >
                        <span>📋</span> Aplicar este patrón a los siguientes bloques
                    </button>
                )}
            </div>

            <TimeValidator
                usedMinutes={Math.round(avgUsage)}
                availableMinutes={availableDailyMinutes}
            />

            <WeeklyPatternEditor
                pattern={pattern}
                onChange={onPatternChange}
                themes={themes}
                availableDailyMinutes={availableDailyMinutes}
            />
        </div>
    );
};
