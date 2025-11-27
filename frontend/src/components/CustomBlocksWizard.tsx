import React, { useState, useEffect } from 'react';
import { PREDEFINED_THEMES } from '../constants/themeDefinitions';
import { useNavigate } from 'react-router-dom';
import { studyPlanService } from '../services/studyPlanService';
import type { ThemeInput } from '../services/studyPlanService';
import { themeService } from '../services/themeService';
import { BlockConfigurator } from './BlockConfigurator';
import { BlocksProgress } from './BlocksProgress';
import type { WeeklyPattern } from './WeeklyPatternEditor';
import { addDays, differenceInDays, startOfDay } from 'date-fns';
import { Header } from './Header';
import { PreviewPlan } from './PreviewPlan';

interface BlockConfig {
    blockNumber: number;
    startDate: string;
    endDate: string;
    weeklyPattern: WeeklyPattern;
    customDays?: Record<string, any>;
}

export const CustomBlocksWizard: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<'setup' | 'blocks' | 'preview'>('setup');
    const [loading, setLoading] = useState(false);

    // Setup State
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [examDate, setExamDate] = useState('');
    const [dailyHours, setDailyHours] = useState(4);

    // Blocks State
    const [currentBlock, setCurrentBlock] = useState(1);
    const [blocksConfig, setBlocksConfig] = useState<BlockConfig[]>([]);
    const [themes, setThemes] = useState<ThemeInput[]>([]);

    // Initial Load
    useEffect(() => {
        loadThemes();
        checkDrafts();
    }, []);

    // Auto-save to localStorage
    useEffect(() => {
        if (step === 'blocks' && blocksConfig.length > 0) {
            const interval = setInterval(() => {
                const draft = {
                    startDate,
                    examDate,
                    dailyHours,
                    blocksConfig,
                    currentBlock,
                    timestamp: Date.now()
                };
                localStorage.setItem('customBlocksDraft', JSON.stringify(draft));
            }, 30000); // 30s

            return () => clearInterval(interval);
        }
    }, [step, blocksConfig, currentBlock, startDate, examDate, dailyHours]);

    const loadThemes = async () => {
        try {
            const themesData = await themeService.getAllThemes();
            const formattedThemes: ThemeInput[] = [];

            themesData.forEach((t: any) => {
                // Check if this theme has predefined parts
                const parts = PREDEFINED_THEMES.filter(pt => pt.id.startsWith(`${t.id}-`));

                if (parts.length > 0) {
                    // Add each part as a separate theme
                    parts.forEach(part => {
                        formattedThemes.push({
                            id: part.id, // String ID "6-1"
                            name: part.name,
                            hours: part.defaultHours,
                            priority: 1
                        });
                    });
                } else {
                    // Add original theme
                    formattedThemes.push({
                        id: t.id,
                        name: t.title,
                        hours: t.estimatedHours,
                        priority: 1
                    });
                }
            });

            setThemes(formattedThemes);
        } catch (error) {
            console.error('Error loading themes:', error);
        }
    };

    const checkDrafts = async () => {
        // Check local
        const localDraft = localStorage.getItem('customBlocksDraft');

        // Check remote
        try {
            const { draft } = await studyPlanService.getDraftPlan();

            if (draft) {
                // Logic to prompt user would go here (Modal)
                if (confirm('Tienes un borrador guardado en la nube. ¿Quieres recuperarlo?')) {
                    restoreDraft(draft.configuration);
                } else if (localDraft && confirm('Tienes un borrador local. ¿Quieres recuperarlo?')) {
                    restoreDraft(JSON.parse(localDraft));
                }
            } else if (localDraft) {
                if (confirm('Tienes un borrador local no guardado. ¿Quieres recuperarlo?')) {
                    restoreDraft(JSON.parse(localDraft));
                }
            }
        } catch (e) {
            if (localDraft && confirm('Tienes un borrador local. ¿Quieres recuperarlo?')) {
                restoreDraft(JSON.parse(localDraft));
            }
        }
    };

    const restoreDraft = (config: any) => {
        if (config.startDate) setStartDate(config.startDate);
        if (config.examDate) setExamDate(config.examDate);
        if (config.dailyHours) setDailyHours(config.dailyHours);
        if (config.blocksConfig) setBlocksConfig(config.blocksConfig);
        if (config.currentBlock) setCurrentBlock(config.currentBlock);
        setStep('blocks');
    };

    const calculateBlocks = () => {
        if (!startDate || !examDate) return;

        const start = startOfDay(new Date(startDate));
        const end = startOfDay(new Date(examDate));
        const days = differenceInDays(end, start);

        if (days <= 0) {
            alert('La fecha de examen debe ser posterior a la de inicio');
            return;
        }

        const blocks: BlockConfig[] = [];
        let current = start;
        let blockNum = 1;

        while (current < end) {
            let blockEnd = addDays(current, 29);
            if (blockEnd > end) blockEnd = end;

            blocks.push({
                blockNumber: blockNum++,
                startDate: current.toISOString(),
                endDate: blockEnd.toISOString(),
                weeklyPattern: createEmptyPattern()
            });

            current = addDays(blockEnd, 1);
        }

        setBlocksConfig(blocks);
        setStep('blocks');
    };

    const createEmptyPattern = (): WeeklyPattern => {
        const emptyDay = { activities: [], totalMinutes: 0 };
        return {
            monday: { ...emptyDay },
            tuesday: { ...emptyDay },
            wednesday: { ...emptyDay },
            thursday: { ...emptyDay },
            friday: { ...emptyDay },
            saturday: { ...emptyDay },
            sunday: { ...emptyDay },
        };
    };

    const handlePatternChange = (pattern: WeeklyPattern) => {
        const updatedBlocks = [...blocksConfig];
        updatedBlocks[currentBlock - 1].weeklyPattern = pattern;
        setBlocksConfig(updatedBlocks);
    };

    const handleApplyToRemaining = () => {
        const pattern = blocksConfig[currentBlock - 1].weeklyPattern;
        const updatedBlocks = blocksConfig.map((block, idx) => {
            if (idx >= currentBlock) {
                return { ...block, weeklyPattern: JSON.parse(JSON.stringify(pattern)) };
            }
            return block;
        });
        setBlocksConfig(updatedBlocks);
        alert('Patrón aplicado a los bloques restantes');
    };

    const handleSaveProgress = async () => {
        try {
            setLoading(true);
            await studyPlanService.saveCustomBlocksProgress({
                startDate,
                examDate,
                blocksConfig,
                currentBlock,
                weeklyPattern: blocksConfig[currentBlock - 1].weeklyPattern,
                totalBlocks: blocksConfig.length,
                availableDailyMinutes: dailyHours * 60,
                allThemes: []
            });
            alert('Progreso guardado correctamente');
        } catch (error) {
            alert('Error al guardar progreso');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = () => {
        setStep('preview');
    };

    const handleConfirmGeneration = async () => {
        try {
            setLoading(true);

            const coveredThemes = new Set();
            blocksConfig.forEach(b => {
                Object.values(b.weeklyPattern).forEach((d: any) => d.activities.forEach((a: any) => coveredThemes.add(a.themeId)));
            });

            if (coveredThemes.size < themes.length) {
                if (!confirm(`Hay temas sin asignar (${themes.length - coveredThemes.size}). ¿Continuar de todos modos?`)) {
                    setLoading(false);
                    return;
                }
            }

            await studyPlanService.generateCustomBlocksPlan({
                startDate,
                examDate,
                blocksConfig,
                totalHours: dailyHours * 7,
                themes // Pass the full theme list so backend can resolve names/parts
            });

            localStorage.removeItem('customBlocksDraft');
            navigate('/sessions');
        } catch (error) {
            console.error(error);
            alert('Error al generar el plan');
        } finally {
            setLoading(false);
        }
    };

    if (step === 'setup') {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <main className="max-w-3xl mx-auto py-12 px-4">
                    <div className="bg-white rounded-xl shadow-lg p-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-6">Configuración Inicial</h1>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Inicio</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={startDate}
                                    onChange={e => setStartDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Examen</label>
                                <input
                                    type="date"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={examDate}
                                    onChange={e => setExamDate(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Horas Diarias Disponibles</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="12"
                                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                                    value={dailyHours}
                                    onChange={e => setDailyHours(Number(e.target.value))}
                                />
                            </div>

                            <button
                                onClick={calculateBlocks}
                                disabled={!startDate || !examDate}
                                className="w-full btn-primary py-3 text-lg font-semibold disabled:opacity-50"
                            >
                                Comenzar Configuración
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (step === 'preview') {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <PreviewPlan
                    blocksConfig={blocksConfig}
                    themes={themes}
                    onConfirm={handleConfirmGeneration}
                    onEdit={() => setStep('blocks')}
                    loading={loading}
                />
            </div>
        );
    }

    const currentBlockConfig = blocksConfig[currentBlock - 1];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">Plan Personalizado</h1>
                    <div className="space-x-4">
                        <button
                            onClick={handleSaveProgress}
                            disabled={loading}
                            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Guardar Borrador
                        </button>
                        <button
                            onClick={handleGenerate}
                            disabled={loading}
                            className="btn-primary px-6 py-2"
                        >
                            {loading ? 'Generando...' : 'Generar Plan Final'}
                        </button>
                    </div>
                </div>

                <BlocksProgress
                    totalBlocks={blocksConfig.length}
                    currentBlock={currentBlock}
                    completedBlocks={blocksConfig.map(b => b.blockNumber).filter(n => n < currentBlock)}
                    blocksConfig={blocksConfig}
                />

                <div className="grid grid-cols-1 gap-8">
                    <BlockConfigurator
                        blockNumber={currentBlock}
                        startDate={new Date(currentBlockConfig.startDate)}
                        endDate={new Date(currentBlockConfig.endDate)}
                        pattern={currentBlockConfig.weeklyPattern}
                        onPatternChange={handlePatternChange}
                        themes={themes}
                        availableDailyMinutes={dailyHours * 60}
                        onApplyToRemaining={handleApplyToRemaining}
                        isLastBlock={currentBlock === blocksConfig.length}
                    />
                </div>

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
                    <div className="max-w-7xl mx-auto flex justify-between">
                        <button
                            onClick={() => setCurrentBlock(prev => Math.max(1, prev - 1))}
                            disabled={currentBlock === 1}
                            className="px-6 py-2 text-gray-600 font-medium disabled:opacity-50"
                        >
                            ← Anterior
                        </button>

                        <span className="text-gray-500 font-medium self-center">
                            Bloque {currentBlock} de {blocksConfig.length}
                        </span>

                        <button
                            onClick={() => setCurrentBlock(prev => Math.min(blocksConfig.length, prev + 1))}
                            disabled={currentBlock === blocksConfig.length}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400"
                        >
                            Siguiente →
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};
