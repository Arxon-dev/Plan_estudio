import { StudySession, Theme, StudyPlan, WeeklySchedule } from '../models';
import { addDays, differenceInDays, format, startOfDay } from 'date-fns';
import { Op } from 'sequelize';

export interface BlockConfig {
    blockNumber: number;
    startDate: string; // ISO Date string
    endDate: string;   // ISO Date string
    weeklyPattern: WeeklyPattern;
    customDays?: Record<string, DayConfig>; // 'YYYY-MM-DD': DayConfig
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

export interface DayConfig {
    activities: ActivityConfig[];
    totalMinutes: number;
}

export interface ActivityConfig {
    themeId: number | string;
    type: 'study' | 'review' | 'flash_review' | 'test' | 'mock_exam';
    duration: number; // minutes
}

export class CustomBlocksService {

    /**
     * Calcula los bloques de 30 días entre fecha inicio y examen
     */
    static calculateBlocks(startDate: Date, examDate: Date): { blockNumber: number; startDate: Date; endDate: Date }[] {
        const blocks: { blockNumber: number; startDate: Date; endDate: Date }[] = [];
        let currentDate = startOfDay(startDate);
        const examDay = startOfDay(examDate);
        let blockNum = 1;

        while (currentDate < examDay) {
            let blockEnd = addDays(currentDate, 29); // 30 días (start + 29)

            // Si el bloque termina después del examen, cortarlo en el examen
            if (blockEnd > examDay) {
                blockEnd = examDay;
            }

            blocks.push({
                blockNumber: blockNum++,
                startDate: new Date(currentDate),
                endDate: new Date(blockEnd)
            });

            currentDate = addDays(blockEnd, 1);
        }

        return blocks;
    }

    /**
     * Valida la configuración de un bloque
     */
    static validateBlockConfig(block: BlockConfig, availableDailyMinutes: number): { valid: boolean; errors: string[] } {
        const errors: string[] = [];
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // Validar patrón semanal
        days.forEach(day => {
            // @ts-ignore
            const dayConfig: DayConfig = block.weeklyPattern[day];
            if (dayConfig.totalMinutes > availableDailyMinutes) {
                errors.push(`El tiempo total del ${day} (${dayConfig.totalMinutes}m) excede el disponible (${availableDailyMinutes}m)`);
            }
            if (dayConfig.activities.length > 10) {
                errors.push(`El ${day} tiene demasiadas actividades (máx 10)`);
            }
        });

        // Validar días personalizados
        if (block.customDays) {
            Object.entries(block.customDays).forEach(([dateStr, dayConfig]) => {
                if (dayConfig.totalMinutes > availableDailyMinutes) {
                    errors.push(`El día ${dateStr} excede el tiempo disponible`);
                }
                if (dayConfig.activities.length > 10) {
                    errors.push(`El día ${dateStr} tiene demasiadas actividades`);
                }
            });
        }

        return { valid: errors.length === 0, errors };
    }

    /**
     * Valida que todos los temas tengan al menos una actividad asignada
     */
    static validateThemeCoverage(blocks: BlockConfig[], allThemes: Theme[]): { covered: boolean; missingThemes: string[] } {
        const coveredThemeIds = new Set<number>();

        blocks.forEach(block => {
            // Check weekly pattern
            Object.values(block.weeklyPattern).forEach((day: any) => {
                day.activities.forEach((act: ActivityConfig) => {
                    const id = typeof act.themeId === 'string' ? parseInt(act.themeId.split('-')[0]) : act.themeId;
                    coveredThemeIds.add(id);
                });
            });

            // Check custom days
            if (block.customDays) {
                Object.values(block.customDays).forEach((day: any) => {
                    day.activities.forEach((act: ActivityConfig) => {
                        const id = typeof act.themeId === 'string' ? parseInt(act.themeId.split('-')[0]) : act.themeId;
                        coveredThemeIds.add(id);
                    });
                });
            }
        });

        const missingThemes = allThemes
            .filter(t => !coveredThemeIds.has(t.id))
            .map(t => t.title);

        return {
            covered: missingThemes.length === 0,
            missingThemes
        };
    }

    /**
     * Genera las sesiones de estudio basadas en la configuración de bloques
     */
    static async generateSessionsFromBlocks(studyPlanId: number, blocks: BlockConfig[], themesList?: any[]): Promise<any[]> {
        const sessions: any[] = [];

        // Obtener nombres de temas para las notas
        const themeIds = new Set<number>();
        blocks.forEach(b => {
            Object.values(b.weeklyPattern).forEach((d: any) => d.activities.forEach((a: any) => {
                const id = typeof a.themeId === 'string' ? parseInt(a.themeId.split('-')[0]) : a.themeId;
                themeIds.add(id);
            }));
            if (b.customDays) {
                Object.values(b.customDays).forEach((d: any) => d.activities.forEach((a: any) => {
                    const id = typeof a.themeId === 'string' ? parseInt(a.themeId.split('-')[0]) : a.themeId;
                    themeIds.add(id);
                }));
            }
        });

        const dbThemes = await Theme.findAll({
            where: { id: Array.from(themeIds) },
            attributes: ['id', 'title']
        });
        const themeMap = new Map(dbThemes.map(t => [t.id, t.title]));

        // Mapa para nombres de partes específicas
        const partNamesMap = new Map<string, string>();
        if (themesList) {
            themesList.forEach(t => {
                if (typeof t.id === 'string' && t.id.includes('-')) {
                    partNamesMap.set(t.id, t.name);
                }
            });
        }

        for (const block of blocks) {
            let currentDate = new Date(block.startDate);
            const endDate = new Date(block.endDate);
            const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

            while (currentDate <= endDate) {
                const dateStr = format(currentDate, 'yyyy-MM-dd');
                const dayName = daysOfWeek[currentDate.getDay()];

                // Determinar configuración del día (custom o patrón)
                let dayConfig: DayConfig;
                if (block.customDays && block.customDays[dateStr]) {
                    dayConfig = block.customDays[dateStr];
                } else {
                    // @ts-ignore
                    dayConfig = block.weeklyPattern[dayName];
                }

                // Generar sesiones para el día
                if (dayConfig && dayConfig.activities.length > 0) {
                    dayConfig.activities.forEach(activity => {
                        let themeId = activity.themeId;
                        let subThemeLabel = undefined;
                        let themeName = '';

                        if (typeof themeId === 'string' && themeId.includes('-')) {
                            // Es un tema dividido (ej: "6-1")
                            const parts = themeId.split('-');
                            const baseId = parseInt(parts[0]);

                            // Intentar obtener el nombre específico de la parte
                            const specificName = partNamesMap.get(themeId);

                            themeId = baseId;
                            subThemeLabel = specificName; // Guardar el nombre completo de la parte
                            themeName = specificName || themeMap.get(baseId) || 'Tema';
                        } else {
                            themeId = typeof themeId === 'string' ? parseInt(themeId) : themeId;
                            themeName = themeMap.get(themeId) || 'Tema';
                        }

                        sessions.push({
                            studyPlanId,
                            themeId: themeId,
                            subThemeLabel: subThemeLabel,
                            scheduledDate: new Date(currentDate),
                            scheduledHours: parseFloat((activity.duration / 60).toFixed(2)),
                            sessionType: this.mapActivityTypeToSessionType(activity.type),
                            status: 'PENDING',
                            notes: `${this.getActivityLabel(activity.type)}: ${themeName}`
                        });
                    });
                }

                currentDate = addDays(currentDate, 1);
            }
        }

        return sessions;
    }

    private static mapActivityTypeToSessionType(type: string): string {
        switch (type) {
            case 'study': return 'STUDY';
            case 'review': return 'REVIEW';
            case 'flash_review': return 'REVIEW';
            case 'test': return 'TEST';
            case 'mock_exam': return 'SIMULATION'; // Asumiendo que existe, si no TEST
            default: return 'STUDY';
        }
    }

    private static getActivityLabel(type: string): string {
        switch (type) {
            case 'study': return '📚 Estudio';
            case 'review': return '📖 Repaso';
            case 'flash_review': return '⚡ Repaso Flash';
            case 'test': return '🧪 Test';
            case 'mock_exam': return '🏆 Simulacro';
            default: return 'Actividad';
        }
    }
}
