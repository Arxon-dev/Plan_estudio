import React, { useState } from 'react';
import type { ThemeInput } from '../services/studyPlanService';

export interface ActivityConfig {
    themeId: number | string;
    type: 'study' | 'review' | 'flash_review' | 'test' | 'mock_exam';
    duration: number; // minutes
}

export interface DayConfig {
    activities: ActivityConfig[];
    totalMinutes: number;
}

export interface WeeklyPattern {
    monday: DayConfig;
    tuesday: DayConfig;
    wednesday: DayConfig;
    thursday: DayConfig;
    friday: DayConfig;
    saturday: DayConfig;
    sunday: DayConfig;
}

interface WeeklyPatternEditorProps {
    pattern: WeeklyPattern;
    onChange: (pattern: WeeklyPattern) => void;
    themes: ThemeInput[];
    availableDailyMinutes: number;
}

const DAYS = [
    { key: 'monday', label: 'Lunes' },
    { key: 'tuesday', label: 'Martes' },
    { key: 'wednesday', label: 'Miércoles' },
    { key: 'thursday', label: 'Jueves' },
    { key: 'friday', label: 'Viernes' },
    { key: 'saturday', label: 'Sábado' },
    { key: 'sunday', label: 'Domingo' },
];

const ACTIVITY_TYPES = [
    { value: 'study', label: '📚 Estudio' },
    { value: 'review', label: '📖 Repaso' },
    { value: 'flash_review', label: '⚡ Repaso Flash' },
    { value: 'test', label: '🧪 Test' },
    { value: 'mock_exam', label: '🏆 Simulacro' },
];

export const WeeklyPatternEditor: React.FC<WeeklyPatternEditorProps> = ({
    pattern,
    onChange,
    themes,
    availableDailyMinutes
}) => {
    const [selectedDay, setSelectedDay] = useState<keyof WeeklyPattern>('monday');
    const [newActivity, setNewActivity] = useState<Partial<ActivityConfig>>({
        type: 'study',
        duration: 60
    });

    const currentDayConfig = pattern[selectedDay];

    const handleAddActivity = () => {
        if (!newActivity.themeId || !newActivity.type || !newActivity.duration) return;

        if (currentDayConfig.activities.length >= 10) {
            alert('Máximo 10 actividades por día');
            return;
        }

        if (currentDayConfig.totalMinutes + newActivity.duration > availableDailyMinutes) {
            alert('Excedes el tiempo disponible para este día');
            return;
        }

        const updatedDay = {
            ...currentDayConfig,
            activities: [...currentDayConfig.activities, newActivity as ActivityConfig],
            totalMinutes: currentDayConfig.totalMinutes + newActivity.duration
        };

        onChange({
            ...pattern,
            [selectedDay]: updatedDay
        });

        // Reset form but keep type/duration for convenience
        setNewActivity(prev => ({ ...prev, themeId: undefined }));
    };

    const handleRemoveActivity = (index: number) => {
        const activityToRemove = currentDayConfig.activities[index];
        const updatedDay = {
            ...currentDayConfig,
            activities: currentDayConfig.activities.filter((_, i) => i !== index),
            totalMinutes: currentDayConfig.totalMinutes - activityToRemove.duration
        };

        onChange({
            ...pattern,
            [selectedDay]: updatedDay
        });
    };

    const getThemeName = (id: number | string) => themes.find(t => t.id == id)?.name || 'Tema desconocido';

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Patrón Semanal</h3>

            {/* Day Selector */}
            <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
                {DAYS.map(day => (
                    <button
                        key={day.key}
                        onClick={() => setSelectedDay(day.key as keyof WeeklyPattern)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedDay === day.key
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                    >
                        {day.label}
                        <span className="ml-2 text-xs opacity-75">
                            ({pattern[day.key as keyof WeeklyPattern].totalMinutes}m)
                        </span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Activity List */}
                <div className="lg:col-span-2 space-y-4">
                    <h4 className="font-medium text-gray-700 flex justify-between">
                        Actividades para {DAYS.find(d => d.key === selectedDay)?.label}
                        <span className={currentDayConfig.totalMinutes > availableDailyMinutes ? 'text-red-500' : 'text-gray-500'}>
                            {currentDayConfig.totalMinutes} / {availableDailyMinutes} min
                        </span>
                    </h4>

                    {currentDayConfig.activities.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                            <p className="text-gray-500">No hay actividades configuradas para este día</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {currentDayConfig.activities.map((activity, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl">
                                            {ACTIVITY_TYPES.find(t => t.value === activity.type)?.label.split(' ')[0]}
                                        </span>
                                        <div>
                                            <p className="font-medium text-gray-900">{getThemeName(activity.themeId)}</p>
                                            <p className="text-xs text-gray-500">
                                                {ACTIVITY_TYPES.find(t => t.value === activity.type)?.label.split(' ').slice(1).join(' ')} • {activity.duration} min
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveActivity(idx)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Activity Form */}
                <div className="bg-gray-50 p-4 rounded-lg h-fit">
                    <h4 className="font-medium text-gray-900 mb-4">Añadir Actividad</h4>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tema</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                value={newActivity.themeId || ''}
                                onChange={e => {
                                    const val = e.target.value;
                                    // Keep as string if it contains a dash (multi-part), otherwise convert to number
                                    const id = val.includes('-') ? val : Number(val);
                                    setNewActivity({ ...newActivity, themeId: id });
                                }}
                            >
                                <option value="">Seleccionar tema...</option>
                                {themes.map(theme => (
                                    <option key={theme.id} value={theme.id}>
                                        {theme.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                value={newActivity.type}
                                onChange={e => setNewActivity({ ...newActivity, type: e.target.value as any })}
                            >
                                {ACTIVITY_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Duración (min)</label>
                            <input
                                type="number"
                                min="10"
                                step="5"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                value={newActivity.duration}
                                onChange={e => setNewActivity({ ...newActivity, duration: Number(e.target.value) })}
                            />
                        </div>

                        <button
                            onClick={handleAddActivity}
                            disabled={!newActivity.themeId}
                            className="w-full btn-primary py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Añadir
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
