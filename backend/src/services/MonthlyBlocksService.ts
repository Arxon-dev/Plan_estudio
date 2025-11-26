import { StudySession } from '../models';
import { addDays, startOfDay, differenceInDays } from 'date-fns';

interface TopicInfo {
    id: string; // Puede ser '6-1', '12', etc.
    name: string;
    parts?: number;
}

interface MonthlyBlocksConfig {
    startDate: Date;
    examDate: Date;
    weeklySchedule: {
        [key: string]: { start: string; end: string }[];
    };
    selectedTopics: TopicInfo[];
    topicsPerDay: number;
}

interface MonthBlock {
    newTopics: TopicInfo[];           // Phase 1: Study (60% or 55%)
    reviewTopics: TopicInfo[];        // Phase 2: Review (30% or 28%) - Month N-1
    testTopics: TopicInfo[];          // Phase 3: Test (10%) - Month N-3
    flashReviewTopics: TopicInfo[];   // Phase 4: Flash Review (7%) - Topics consolidated >3 months ago
}

export class MonthlyBlocksService {
    private static readonly MAX_TOPICS_PER_MONTH = 3;
    private static readonly DAYS_PER_MONTH = 30;

    /**
     * Genera el plan de estudio completo usando metodología de bloques mensuales con ciclos de repaso
     */
    public static async generateMonthlyBlocksPlan(
        config: MonthlyBlocksConfig,
        studyPlanId: number
    ): Promise<any[]> {
        const sessions: any[] = [];
        const orderedTopics = config.selectedTopics;

        // 1. Calcular meses disponibles
        const totalDays = differenceInDays(config.examDate, config.startDate);
        const totalMonths = Math.floor(totalDays / this.DAYS_PER_MONTH);

        // 2. Calcular MINUTOS disponibles por día
        const dailyMinutes = this.calculateDailyMinutes(config.weeklySchedule);

        // 3. Dividir temas en bloques mensuales con ciclos (Study -> Review -> Test -> Flash)
        // Restamos 1 mes para el repaso general final
        const monthlyBlocks = this.createMonthlyBlocksWithCycles(orderedTopics, Math.max(1, totalMonths - 1));

        // 4. Generar sesiones mes por mes
        let currentDate = startOfDay(config.startDate);

        for (let monthIndex = 0; monthIndex < monthlyBlocks.length; monthIndex++) {
            const block = monthlyBlocks[monthIndex];

            const monthSessions = this.generateMonthSessions(
                block,
                currentDate,
                dailyMinutes,
                config.topicsPerDay,
                studyPlanId,
                monthIndex
            );

            sessions.push(...monthSessions);
            currentDate = addDays(currentDate, this.DAYS_PER_MONTH);
        }

        // 5. Último mes: repaso general de TODOS los temas
        const reviewSessions = this.generateFinalReviewMonth(
            orderedTopics,
            currentDate,
            config.examDate,
            dailyMinutes,
            config.topicsPerDay,
            studyPlanId
        );
        sessions.push(...reviewSessions);

        return sessions;
    }

    /**
     * Crea los bloques mensuales distribuyendo los temas en las 4 fases del ciclo
     */
    private static createMonthlyBlocksWithCycles(
        topics: TopicInfo[],
        totalMonths: number
    ): MonthBlock[] {
        const blocks: MonthBlock[] = [];
        let topicIndex = 0;

        // Array auxiliar para rastrear en qué mes se introdujo cada tema
        // topicIntroductionMonth[topicId] = monthIndex
        const topicIntroductionMonth: { [key: string]: number } = {};

        for (let month = 0; month < totalMonths; month++) {
            const block: MonthBlock = {
                newTopics: [],
                reviewTopics: [],
                testTopics: [],
                flashReviewTopics: []
            };

            // 1. Fase ESTUDIO (Nuevos temas)
            for (let i = 0; i < this.MAX_TOPICS_PER_MONTH && topicIndex < topics.length; i++) {
                const topic = topics[topicIndex];
                block.newTopics.push(topic);
                topicIntroductionMonth[topic.id] = month;
                topicIndex++;
            }

            // 2. Fase REPASO (Temas del mes anterior N-1)
            if (month > 0) {
                block.reviewTopics = [...blocks[month - 1].newTopics];
            }

            // 3. Fase TEST (Temas del mes N-3)
            if (month >= 3) {
                block.testTopics = [...blocks[month - 3].newTopics];
            }

            // 4. Fase FLASH REVIEW (Temas consolidados, mes N+4 en adelante)
            // Un tema entra en flash review si se introdujo hace 4 meses o más
            // y NO está en fase de test este mes (aunque la lógica de N-3 ya lo separa)
            topics.slice(0, topicIndex).forEach(topic => {
                const introMonth = topicIntroductionMonth[topic.id];
                // Si se introdujo hace 4 o más meses
                if (introMonth !== undefined && (month - introMonth) >= 4) {
                    block.flashReviewTopics.push(topic);
                }
            });

            blocks.push(block);
        }

        return blocks;
    }

    /**
     * Genera las sesiones para un bloque mensual específico aplicando pesos
     */
    private static generateMonthSessions(
        block: MonthBlock,
        startDate: Date,
        dailyMinutes: Map<string, number>,
        topicsPerDay: number,
        studyPlanId: number,
        monthIndex: number
    ): any[] {
        const sessions: any[] = [];
        let currentDate = startDate;
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        // Determinar pesos según si hay Flash Review
        // Determinar qué fases están activas en este bloque
        const hasStudy = block.newTopics.length > 0;
        const hasReview = block.reviewTopics.length > 0;
        const hasTest = block.testTopics.length > 0;
        const hasFlash = block.flashReviewTopics.length > 0;

        // Definir pesos base (importancia relativa)
        // Usamos la distribución ideal completa como base: 55/28/10/7
        const baseWeights = {
            study: 55,
            review: 28,
            test: 10,
            flash: 7
        };

        // Calcular peso total de las fases activas
        let totalWeight = 0;
        if (hasStudy) totalWeight += baseWeights.study;
        if (hasReview) totalWeight += baseWeights.review;
        if (hasTest) totalWeight += baseWeights.test;
        if (hasFlash) totalWeight += baseWeights.flash;

        // Normalizar pesos para que sumen 1.0
        const weights = {
            study: hasStudy ? baseWeights.study / totalWeight : 0,
            review: hasReview ? baseWeights.review / totalWeight : 0,
            test: hasTest ? baseWeights.test / totalWeight : 0,
            flash: hasFlash ? baseWeights.flash / totalWeight : 0
        };

        // Calcular días laborables aproximados para distribución uniforme de Flash Review
        // Asumimos 5 días a la semana * 4 semanas = 20 días aprox
        const workDaysInMonth = 20;

        for (let day = 0; day < this.DAYS_PER_MONTH; day++) {
            const dayName = daysOfWeek[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
            const totalMinutes = dailyMinutes.get(dayName) || 0;

            if (totalMinutes === 0) {
                currentDate = addDays(currentDate, 1);
                continue;
            }

            // Calcular minutos por fase para este día
            const minutesForStudy = Math.floor(totalMinutes * weights.study);
            const minutesForReview = Math.floor(totalMinutes * weights.review);
            const minutesForTest = Math.floor(totalMinutes * weights.test);
            // Los minutos de Flash se acumulan/distribuyen de otra forma, pero reservamos el tiempo
            const minutesForFlash = Math.floor(totalMinutes * weights.flash);

            // --- Generar Sesiones de ESTUDIO ---
            if (block.newTopics.length > 0) {
                this.createPhaseSessions(
                    sessions, block.newTopics, minutesForStudy, 'STUDY', 30,
                    currentDate, studyPlanId, monthIndex, 'Estudio'
                );
            }

            // --- Generar Sesiones de REPASO ---
            if (block.reviewTopics.length > 0) {
                this.createPhaseSessions(
                    sessions, block.reviewTopics, minutesForReview, 'REVIEW', 20,
                    currentDate, studyPlanId, monthIndex, 'Repaso'
                );
            }

            // --- Generar Sesiones de TEST ---
            if (block.testTopics.length > 0) {
                this.createPhaseSessions(
                    sessions, block.testTopics, minutesForTest, 'TEST', 15,
                    currentDate, studyPlanId, monthIndex, 'Test de consolidación'
                );
            }

            // --- Generar Sesiones de FLASH REVIEW ---
            if (hasFlash) {
                // Distribuimos los temas flash a lo largo del mes, no todos cada día.
                // Pero para simplificar la implementación diaria y asegurar que se hagan,
                // asignaremos una "Flash Session" si toca según la distribución uniforme.
                // O más simple: Usamos el tiempo reservado hoy para avanzar en la cola de Flash Topics.

                // Estrategia: Rotar temas flash día a día
                // Cuántos temas flash caben hoy?
                const minFlashDuration = 10;
                const numFlashSessionsToday = Math.floor(minutesForFlash / minFlashDuration);

                if (numFlashSessionsToday > 0) {
                    // Seleccionar temas flash rotativamente basado en el día del mes
                    // Esto asegura que se vean todos a lo largo del mes
                    for (let i = 0; i < numFlashSessionsToday; i++) {
                        const topicIndex = (day * numFlashSessionsToday + i) % block.flashReviewTopics.length;
                        const topic = block.flashReviewTopics[topicIndex];

                        this.addSession(
                            sessions, topic, currentDate, minFlashDuration, 'REVIEW', // Usamos REVIEW como base
                            studyPlanId, monthIndex, null,
                            `Repaso flash: ${topic.name} - Revisar esquema y puntos clave` // Nota específica para identificarlo
                        );
                    }
                }
            }

            currentDate = addDays(currentDate, 1);
        }

        return sessions;
    }

    /**
     * Helper para crear sesiones de una fase específica (Study, Review, Test)
     */
    private static createPhaseSessions(
        sessions: any[],
        topics: TopicInfo[],
        totalMinutes: number,
        type: 'STUDY' | 'REVIEW' | 'TEST',
        minDuration: number,
        date: Date,
        studyPlanId: number,
        monthIndex: number,
        notePrefix: string
    ) {
        if (totalMinutes < minDuration) return;

        const minutesPerTopic = Math.floor(totalMinutes / topics.length);

        // Si el tiempo por tema es muy poco, rotamos o priorizamos (simple: filtramos)
        // O mejor: si no cabe para todos, asignamos al menos minDuration a los que quepan
        if (minutesPerTopic < minDuration) {
            const numTopicsThatFit = Math.floor(totalMinutes / minDuration);
            for (let i = 0; i < numTopicsThatFit; i++) {
                // Rotación simple basada en el día del mes para variar qué temas se tocan si no caben todos
                const topicIndex = (date.getDate() + i) % topics.length;
                this.addSession(
                    sessions, topics[topicIndex], date, minDuration, type,
                    studyPlanId, monthIndex, null, `${notePrefix} - Bloque Mensual ${monthIndex + 1}`
                );
            }
        } else {
            // Caben todos
            topics.forEach(topic => {
                this.addSession(
                    sessions, topic, date, minutesPerTopic, type,
                    studyPlanId, monthIndex, null, `${notePrefix} - Bloque Mensual ${monthIndex + 1}`
                );
            });
        }
    }

    /**
     * Helper para añadir una sesión individual al array
     */
    private static addSession(
        sessions: any[],
        topic: TopicInfo,
        date: Date,
        minutes: number,
        type: 'STUDY' | 'REVIEW' | 'TEST',
        studyPlanId: number,
        monthIndex: number,
        subThemeIndex: number | null,
        notes: string
    ) {
        const parsedId = topic.id.toString().includes('-')
            ? parseInt(topic.id.split('-')[0])
            : parseInt(topic.id);

        const parsedSubThemeIndex = subThemeIndex !== null ? subThemeIndex : (
            topic.id.toString().includes('-') ? parseInt(topic.id.split('-')[1]) : null
        );

        const scheduledHours = parseFloat((minutes / 60).toFixed(2));

        sessions.push({
            studyPlanId,
            themeId: parsedId,
            scheduledDate: new Date(date),
            scheduledHours: scheduledHours,
            sessionType: type,
            status: 'PENDING',
            subThemeIndex: parsedSubThemeIndex,
            subThemeLabel: (() => {
                if (!topic.name) return parsedSubThemeIndex ? `Parte ${parsedSubThemeIndex}` : null;
                return topic.name.replace('Instrucciones EMAD, ET, ARMADA y EA — ', '');
            })(),
            notes: notes
        });
    }

    private static calculateDailyMinutes(weeklySchedule: {
        [key: string]: { start: string; end: string }[];
    }): Map<string, number> {
        const minutes = new Map<string, number>();
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

        daysOfWeek.forEach(day => {
            // @ts-ignore
            const schedule = weeklySchedule[day] || [];
            // @ts-ignore
            const totalMinutes = schedule.reduce((sum, slot) => {
                // @ts-ignore
                const [startHour, startMin] = slot.start.split(':').map(Number);
                // @ts-ignore
                const [endHour, endMin] = slot.end.split(':').map(Number);
                const mins = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                return sum + mins;
            }, 0);

            minutes.set(day, totalMinutes);
        });

        return minutes;
    }

    private static generateFinalReviewMonth(
        allTopics: TopicInfo[],
        startDate: Date,
        examDate: Date,
        dailyMinutes: Map<string, number>,
        topicsPerDay: number,
        studyPlanId: number
    ): any[] {
        const sessions: any[] = [];
        let currentDate = startDate;
        const daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        const daysUntilExam = differenceInDays(examDate, startDate);

        let globalTopicIndex = 0;

        for (let day = 0; day < daysUntilExam; day++) {
            const dayName = daysOfWeek[currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1];
            const totalMinutes = dailyMinutes.get(dayName) || 0;

            if (totalMinutes === 0) {
                currentDate = addDays(currentDate, 1);
                continue;
            }

            const safeTopicsPerDay = Math.max(1, topicsPerDay);
            const minutesPerTopic = Math.floor(totalMinutes / safeTopicsPerDay);

            if (minutesPerTopic < 30) {
                currentDate = addDays(currentDate, 1);
                continue;
            }

            if (allTopics.length === 0) {
                currentDate = addDays(currentDate, 1);
                continue;
            }

            const isLastWeek = day >= daysUntilExam - 7;
            const sessionType = isLastWeek ? 'TEST' : 'REVIEW';

            for (let i = 0; i < safeTopicsPerDay; i++) {
                const topic = allTopics[globalTopicIndex % allTopics.length];
                this.addSession(
                    sessions, topic, currentDate, minutesPerTopic, sessionType,
                    studyPlanId, 999, null, // 999 as monthIndex for final review
                    `Repaso Final - ${isLastWeek ? 'Semana de Tests' : 'Repaso General'}`
                );
                globalTopicIndex++;
            }

            currentDate = addDays(currentDate, 1);
        }

        return sessions;
    }
}
