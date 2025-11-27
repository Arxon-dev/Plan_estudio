import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, AlertTriangle, Calendar, Clock, BookOpen } from 'lucide-react';
import type { ThemeInput } from '../services/studyPlanService';

interface PreviewPlanProps {
    blocksConfig: any[];
    themes: ThemeInput[];
    onConfirm: () => void;
    onEdit: () => void;
    loading: boolean;
}

export const PreviewPlan: React.FC<PreviewPlanProps> = ({
    blocksConfig,
    themes,
    onConfirm,
    onEdit,
    loading
}) => {
    // Calculate stats
    const totalBlocks = blocksConfig.length;
    const startDate = new Date(blocksConfig[0].startDate);
    const endDate = new Date(blocksConfig[totalBlocks - 1].endDate);

    // Calculate covered themes
    const coveredThemeIds = new Set<string>();
    let totalStudyHours = 0;

    blocksConfig.forEach(block => {
        Object.values(block.weeklyPattern).forEach((day: any) => {
            day.activities.forEach((activity: any) => {
                coveredThemeIds.add(String(activity.themeId));
                totalStudyHours += activity.duration / 60;
            });
        });
    });

    const coveredCount = coveredThemeIds.size;
    const totalCount = themes.length;
    const coveragePercentage = Math.round((coveredCount / totalCount) * 100);
    const missingThemes = themes.filter(t => !coveredThemeIds.has(String(t.id)));

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <h2 className="text-2xl font-bold mb-2">Vista Previa del Plan</h2>
                    <p className="opacity-90">Revisa los detalles antes de generar tu calendario final</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Key Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Calendar className="w-5 h-5 text-blue-600" />
                                <span className="font-semibold text-blue-900">Duración</span>
                            </div>
                            <p className="text-2xl font-bold text-blue-700">{totalBlocks} Bloques</p>
                            <p className="text-sm text-blue-600">
                                {format(startDate, "d MMM yyyy", { locale: es })} - {format(endDate, "d MMM yyyy", { locale: es })}
                            </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                            <div className="flex items-center gap-3 mb-2">
                                <BookOpen className="w-5 h-5 text-green-600" />
                                <span className="font-semibold text-green-900">Cobertura</span>
                            </div>
                            <p className="text-2xl font-bold text-green-700">{coveragePercentage}% Temario</p>
                            <p className="text-sm text-green-600">
                                {coveredCount} de {totalCount} temas cubiertos
                            </p>
                        </div>

                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                            <div className="flex items-center gap-3 mb-2">
                                <Clock className="w-5 h-5 text-purple-600" />
                                <span className="font-semibold text-purple-900">Carga Total</span>
                            </div>
                            <p className="text-2xl font-bold text-purple-700">
                                {Math.round(totalStudyHours)}h
                            </p>
                            <p className="text-sm text-purple-600">
                                Horas de estudio estimadas
                            </p>
                        </div>
                    </div>

                    {/* Warnings */}
                    {missingThemes.length > 0 && (
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                                <div>
                                    <h3 className="text-sm font-medium text-yellow-800">
                                        Atención: Hay {missingThemes.length} temas sin asignar
                                    </h3>
                                    <p className="mt-1 text-sm text-yellow-700">
                                        Los siguientes temas no se han incluido en ningún bloque:
                                    </p>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {missingThemes.slice(0, 5).map(t => (
                                            <span key={t.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {t.name}
                                            </span>
                                        ))}
                                        {missingThemes.length > 5 && (
                                            <span className="text-xs text-yellow-600 self-center">
                                                y {missingThemes.length - 5} más...
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Block Summary List */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Desglose por Bloques</h3>
                        <div className="border rounded-lg divide-y">
                            {blocksConfig.map((block) => {
                                const blockHours = Object.values(block.weeklyPattern).reduce((acc: number, day: any) =>
                                    acc + (day.totalMinutes / 60), 0) * 4; // Approx 4 weeks

                                return (
                                    <div key={block.blockNumber} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Bloque {block.blockNumber}</span>
                                            <p className="font-medium text-gray-900">
                                                {format(new Date(block.startDate), "d MMM", { locale: es })} - {format(new Date(block.endDate), "d MMM", { locale: es })}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                ~{Math.round(blockHours)}h estudio
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-4 pt-4 border-t">
                        <button
                            onClick={onEdit}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            ← Volver a Editar
                        </button>
                        <button
                            onClick={onConfirm}
                            disabled={loading}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <CheckCircle2 className="w-5 h-5" />
                                    Confirmar y Generar
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
