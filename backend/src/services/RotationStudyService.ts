import { Theme } from '../models';
import { WeeklyScheduleData } from './StudyPlanService';
import { addDays, format } from 'date-fns';

/**
 * SISTEMA DE ROTACIÓN DE TEMAS CON DISTRIBUCIÓN ESPACIADA
 * 
 * Este sistema reemplaza el método tradicional de "bloques completos"
 * con un sistema de rotación que mantiene múltiples temas activos simultáneamente,
 * optimizando la retención a largo plazo y reduciendo el abandono.
 */

export interface RotationConfig {
  intensity: 'LIGHT' | 'MEDIUM' | 'INTENSIVE';  // Intensidad de rotación
  rotationCycle: number;                           // Días por ciclo de rotación (recomendado: 3-7)
  maxSimultaneousThemes: number;                   // Máximos temas simultáneos por bloque
  minSessionTime: number;                          // Tiempo mínimo por sesión (horas)
  maxSessionTime: number;                          // Tiempo máximo por sesión (horas)
}

export interface RotationSession {
  themeId: number;
  themeName: string;
  sessionType: 'STUDY' | 'REVIEW' | 'TEST';
  hours: number;
  priority: number;
  lastStudied?: Date;
  nextReview?: Date;
  subThemeIndex?: number;
  subThemeLabel?: string;
}

export class RotationStudyService {
  
  private static readonly DEFAULT_CONFIG: RotationConfig = {
    intensity: 'MEDIUM',
    rotationCycle: 5,           // 5 días por ciclo
    maxSimultaneousThemes: 3,   // Máx 3 temas activos por bloque
    minSessionTime: 0.5,        // 30 minutos mínimo
    maxSessionTime: 3.0         // 3 horas máximo
  };

  /**
   * Calcula la configuración óptima según las horas disponibles del usuario
   */
  static calculateOptimalConfig(weeklyHours: number): RotationConfig {
    if (weeklyHours < 5) {
      // Poco tiempo: micro-rotaciones rápidas
      return {
        intensity: 'LIGHT',
        rotationCycle: 3,           // Cambiar cada 3 días
        maxSimultaneousThemes: 2,   // Solo 2 temas simultáneos
        minSessionTime: 0.5,        // 30 min mínimo
        maxSessionTime: 1.5         // 1.5h máximo
      };
    } else if (weeklyHours < 15) {
      // Tiempo medio: rotación estándar
      return {
        intensity: 'MEDIUM',
        rotationCycle: 5,           // Cambiar cada 5 días
        maxSimultaneousThemes: 3,   // 3 temas simultáneos
        minSessionTime: 1.0,        // 1h mínimo
        maxSessionTime: 2.5         // 2.5h máximo
      };
    } else {
      // Mucho tiempo: rotación profunda
      return {
        intensity: 'INTENSIVE',
        rotationCycle: 7,           // Cambiar cada 7 días
        maxSimultaneousThemes: 4,   // 4 temas simultáneos
        minSessionTime: 1.5,        // 1.5h mínimo
        maxSessionTime: 3.0         // 3h máximo
      };
    }
  }

  /**
   * Organiza los temas en bloques rotativos manteniendo variedad constante
   */
  static createRotationGroups(
    themes: Theme[],
    weeklySchedule: WeeklyScheduleData,
    startDate: Date,
    examDate: Date,
    config: RotationConfig = this.DEFAULT_CONFIG
  ): RotationSession[][] {
    
    // IMPORTANTE: Resetear contadores al iniciar nueva generación
    this.themeSessionCounters.clear();
    console.log('🔄 Contadores de sesiones reseteados para nueva generación');
    
    const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const totalWeeks = Math.ceil(totalDays / 7);
    const weeklyHours = this.calculateWeeklyHours(weeklySchedule);
    
    console.log(`🎯 SISTEMA DE ROTACIÓN - CONFIGURACIÓN:`);
    console.log(`   - Intensidad: ${config.intensity}`);
    console.log(`   - Horas semanales: ${weeklyHours}h`);
    console.log(`   - Ciclo de rotación: ${config.rotationCycle} días`);
    console.log(`   - Temas simultáneos: ${config.maxSimultaneousThemes}`);
    console.log(`   - Total semanas: ${totalWeeks}`);
    
    const expandedThemes = this.expandThemeParts(themes);
    const themeBlocks = this.groupThemesByBlock(expandedThemes);
    const rotationPlan: RotationSession[][] = [];
    
    // Crear plan semanal con rotación
    for (let week = 0; week < totalWeeks; week++) {
      const weekStartDate = addDays(startDate, week * 7);
      const weekSessions = this.createWeekRotation(
        themeBlocks,
        weeklySchedule,
        weekStartDate,
        config,
        weeklyHours
      );
      
      rotationPlan.push(weekSessions);
    }
    
    return rotationPlan;
  }

  /**
   * Agrupa temas por bloques (Parte 1, Parte 2, Parte 3)
   */
  private static groupThemesByBlock(themes: Theme[]): Map<string, Theme[]> {
    const blocks = new Map<string, Theme[]>();
    themes.forEach(theme => {
      const blockName = (theme as any).block || 'ORGANIZACION';
      if (!blocks.has(blockName)) {
        blocks.set(blockName, []);
      }
      blocks.get(blockName)!.push(theme);
    });
    return blocks;
  }

  private static expandThemeParts(themes: Theme[]): any[] {
    const partsLabelsById: Record<number, string[]> = {
      6: [
        'Parte 1: Instrucción 55/2021, EMAD',
        'Parte 2: Instrucción 14/2021, ET',
        'Parte 3: Instrucción 15/2021, ARMADA',
        'Parte 4: Instrucción 6/2025, EA'
      ],
      7: [
        'Parte 1: Ley 8/2006, Tropa y Marinería',
        'Parte 2: Ley 39/2007 de la Carrera Militar'
      ],
      15: [
        'Parte 1: Ley 36/2015, Seguridad Nacional',
        'Parte 2: RD 1150/2021, Estrategia de Seguridad Nacional 2021'
      ]
    };
    const result: any[] = [];
    themes.forEach(theme => {
      const labels = partsLabelsById[(theme as any).id];
      if (labels && labels.length > 1) {
        labels.forEach((label, idx) => {
          result.push({
            id: (theme as any).id,
            block: (theme as any).block,
            themeNumber: (theme as any).themeNumber,
            title: (theme as any).title,
            complexity: (theme as any).complexity,
            subThemeIndex: idx + 1,
            subThemeLabel: label
          });
        });
      } else {
        result.push(theme as any);
      }
    });
    return result;
  }

  /**
   * Extrae el nombre del bloque del tema (Parte 1, Parte 2, Parte 3)
   */
  private static extractBlockName(themeTitle: string): string {
    const normalized = themeTitle.toLowerCase();
    
    if (normalized.includes('parte 1') || normalized.includes('parte1')) {
      return 'Parte 1';
    } else if (normalized.includes('parte 2') || normalized.includes('parte2')) {
      return 'Parte 2';
    } else if (normalized.includes('parte 3') || normalized.includes('parte3')) {
      return 'Parte 3';
    } else {
      return 'Parte 1'; // Por defecto
    }
  }

  // Mapa global para rastrear el número de sesión de cada tema
  private static themeSessionCounters: Map<number, number> = new Map();

  /**
   * Crea la rotación semanal manteniendo variedad constante
   */
  private static createWeekRotation(
    themeBlocks: Map<string, Theme[]>,
    weeklySchedule: WeeklyScheduleData,
    weekStartDate: Date,
    config: RotationConfig,
    weeklyHours: number
  ): RotationSession[] {
    
    const weekSessions: RotationSession[] = [];
    const dailyHours = this.calculateDailyHours(weeklySchedule, weeklyHours);
    
    // Seleccionar bloque activo para esta semana (rotación por bloques)
    const blockNames = Array.from(themeBlocks.keys());
    const activeBlockIndex = Math.floor((weekStartDate.getTime() / (1000 * 60 * 60 * 24)) / config.rotationCycle) % blockNames.length;
    const activeBlock = blockNames[activeBlockIndex];
    const activeThemes = themeBlocks.get(activeBlock) || [];
    
    console.log(`📅 Semana del ${format(weekStartDate, 'dd/MM')}: Bloque activo ${activeBlock} (${activeThemes.length} temas)`);
    
    // Seleccionar temas simultáneos para esta semana
    const dynamicMax = activeBlock === 'SEGURIDAD_NACIONAL' && activeThemes.length >= 6
      ? Math.max(config.maxSimultaneousThemes, 4)
      : config.maxSimultaneousThemes;
    const selectedThemes = this.selectSimultaneousThemes(activeThemes, dynamicMax, weekStartDate);
    const pinnedIds = new Set([17, 18]);
    const pinnedThemes = activeThemes.filter(t => pinnedIds.has((t as any).id));
    const nonPinnedSelected = selectedThemes.filter(t => !pinnedIds.has((t as any).id));
    const ensuredSelection: Theme[] = [];
    pinnedThemes.forEach(t => { if (ensuredSelection.length < dynamicMax) ensuredSelection.push(t); });
    for (const t of nonPinnedSelected) {
      if (ensuredSelection.length >= dynamicMax) break;
      ensuredSelection.push(t);
    }
    console.log(`   selección asegurada: ${ensuredSelection.map((t:any)=>t.id).join(', ')}`);
    
    // Distribuir horas entre temas seleccionados
    const hoursPerTheme = this.distributeHoursAmongThemes(selectedThemes, dailyHours, config);
    
    // Crear sesiones para cada día
    for (let day = 0; day < 7; day++) {
      const dayDate = addDays(weekStartDate, day);
      const dayHours = dailyHours[dayDate.getDay()];
      if (dayHours === 0) continue; // Saltar días sin estudio
      const dayName = format(dayDate, 'EEEE');
      
      console.log(`   ${dayName}: ${dayHours}h disponibles`);
      
      // Crear sesiones rotativas para este día
      const daySessions = this.createDayRotationSessions(
        ensuredSelection,
        dayHours,
        dayDate,
        config
      );
      
      weekSessions.push(...daySessions);
    }
    
    return weekSessions;
  }

  /**
   * Selecciona temas simultáneos manteniendo variedad
   */
  private static selectSimultaneousThemes(
    themes: Theme[],
    maxSimultaneous: number,
    weekStartDate: Date
  ): Theme[] {
    if (themes.length <= maxSimultaneous) {
      return themes;
    }

    const pinnedIds = new Set([17, 18]);
    const pinned = themes.filter(t => pinnedIds.has((t as any).id));
    const others = themes.filter(t => !pinnedIds.has((t as any).id));

    console.log(`   pinned=${pinned.map((t:any)=>t.id).join(', ')} others=${others.map((t:any)=>t.id).join(', ')}`);

    const offset = others.length > 0
      ? Math.floor(weekStartDate.getTime() / (1000 * 60 * 60 * 24)) % others.length
      : 0;
    const rotatedOthers = others.length > 0
      ? [...others.slice(offset), ...others.slice(0, offset)]
      : [];

    const selection: Theme[] = [];
    pinned.forEach(t => {
      if (selection.length < maxSimultaneous) selection.push(t);
    });
    for (const t of rotatedOthers) {
      if (selection.length >= maxSimultaneous) break;
      selection.push(t);
    }
    console.log(`   selected=${selection.map((t:any)=>t.id).join(', ')}`);
    return selection.slice(0, maxSimultaneous);
  }

  /**
   * Distribuye horas diarias entre temas
   */
  private static distributeHoursAmongThemes(
    themes: Theme[],
    dailyHours: number[],
    config: RotationConfig
  ): Map<number, number> {
    
    const distribution = new Map<number, number>();
    const totalWeekHours = dailyHours.reduce((sum, h) => sum + h, 0);
    const hoursPerTheme = totalWeekHours / themes.length;
    
    themes.forEach(theme => {
      // Aplicar multiplicadores personalizados por tema
      const multiplier = this.getThemeMultiplier(theme.title);
      const adjustedHours = hoursPerTheme * multiplier;
      distribution.set(theme.id, Math.max(config.minSessionTime, Math.min(adjustedHours, config.maxSessionTime)));
    });
    
    return distribution;
  }

  /**
   * Obtiene el multiplicador personalizado por tema (igual que el sistema anterior)
   */
  private static getThemeMultiplier(themeName: string): number {
    const nm = themeName.toLowerCase();
    
    // Aplicar los mismos multiplicadores que ya implementamos
    if (nm.includes('unión europea') || nm.includes('ue')) {
      return 3.0; // 3x más
    } else if (nm.includes('españa') && nm.includes('misiones internacionales') && !nm.includes('176/2014')) {
      return 3.0; // 3x más
    } else if (nm.includes('176/2014') && nm.includes('iniciativas y quejas')) {
      return 0.1; // 90% menos
    } else if (nm.includes('ley orgánica 3/2007') && nm.includes('igualdad efectiva')) {
      return 0.1; // 90% menos
    }
    
    return 1.0; // Normal
  }

  /**
   * Crea sesiones rotativas para un día específico
   */
  private static createDayRotationSessions(
    themes: Theme[],
    dayHours: number,
    dayDate: Date,
    config: RotationConfig
  ): RotationSession[] {
    
    const sessions: RotationSession[] = [];
    let remainingHours = dayHours;
    
    // Rotar el orden de temas cada día para mantener variedad
    const rotatedThemes = this.rotateThemes(themes, dayDate);
    
    // Crear sesiones con tiempos variables
    rotatedThemes.forEach((theme, index) => {
      if (remainingHours <= 0) return;
      
      // Calcular tiempo para este tema (más tiempo al primero, menos al último)
      const baseTime = remainingHours / (rotatedThemes.length - index);
      const sessionTime = Math.max(config.minSessionTime, Math.min(baseTime, config.maxSessionTime));
      
      // Obtener el ID único del tema (considerando subThemeIndex para temas compuestos)
      const themeId = (theme as any).id;
      const subIndex = (theme as any).subThemeIndex || 0;
      const uniqueThemeKey = subIndex > 0 ? themeId * 1000 + subIndex : themeId;
      
      // Incrementar contador de sesiones para este tema
      const sessionCount = (this.themeSessionCounters.get(uniqueThemeKey) || 0) + 1;
      this.themeSessionCounters.set(uniqueThemeKey, sessionCount);
      
      // Determinar tipo de sesión según el contador de sesiones del tema
      const sessionType = this.determineSessionType(dayDate, theme, sessionCount);
      
      // Log de tracking para debugging
      const themeName = (theme as any).title || 'Tema sin nombre';
      const subLabel = (theme as any).subThemeLabel ? ` - ${(theme as any).subThemeLabel}` : '';
      console.log(`      └─ ${themeName}${subLabel}: Sesión #${sessionCount} → ${sessionType} (${sessionTime.toFixed(1)}h)`);
      
      sessions.push({
        themeId: (theme as any).id,
        themeName: (theme as any).title,
        sessionType,
        hours: sessionTime,
        priority: index + 1,
        lastStudied: dayDate,
        subThemeIndex: (theme as any).subThemeIndex,
        subThemeLabel: (theme as any).subThemeLabel
      });
      
      remainingHours -= sessionTime;
    });
    
    return sessions;
  }

  /**
   * Rota los temas para mantener variedad diaria
   */
  private static rotateThemes(themes: Theme[], date: Date): Theme[] {
    const dayOfYear = Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
    const rotationOffset = dayOfYear % themes.length;
    
    return [...themes.slice(rotationOffset), ...themes.slice(0, rotationOffset)];
  }

  /**
   * Determina el tipo de sesión según patrón de repetición espaciada
   * @param date - Fecha de la sesión
   * @param theme - Tema de la sesión
   * @param sessionCount - Número de sesión del tema (1, 2, 3, ...)
   * 
   * Patrón implementado:
   * - Sesión 1: STUDY (primera vez que se ve el tema)
   * - Sesión 2: REVIEW (primer repaso)
   * - Sesión 3: REVIEW (segundo repaso)
   * - Sesión 4: TEST (primera evaluación)
   * - Sesión 5: REVIEW (tercer repaso)
   * - Sesión 6: REVIEW (cuarto repaso)
   * - Sesión 7: TEST (segunda evaluación)
   * - Sesión 8+: Repite el ciclo desde sesión 2 (REVIEW, REVIEW, TEST, ...)
   */
  private static determineSessionType(date: Date, theme: Theme, sessionCount: number): 'STUDY' | 'REVIEW' | 'TEST' {
    // Primera sesión siempre es STUDY
    if (sessionCount === 1) {
      return 'STUDY';
    }
    
    // Para sesiones posteriores, usar ciclo de 6 (2-7 se repite)
    // Patrón: STUDY(1) → REVIEW(2) → REVIEW(3) → TEST(4) → REVIEW(5) → REVIEW(6) → TEST(7) → ciclo
    const cycle = ((sessionCount - 2) % 6) + 2; // Normaliza a rango 2-7
    
    // TEST en posiciones 4 y 7 del ciclo
    if (cycle === 4 || cycle === 7) {
      return 'TEST';
    }
    
    // REVIEW en todas las demás posiciones
    return 'REVIEW';
  }

  /**
   * Calcula las horas semanales totales del usuario
   */
  private static calculateWeeklyHours(weeklySchedule: WeeklyScheduleData): number {
    return weeklySchedule.monday + weeklySchedule.tuesday + weeklySchedule.wednesday + 
           weeklySchedule.thursday + weeklySchedule.friday + weeklySchedule.saturday + 
           weeklySchedule.sunday;
  }

  /**
   * Calcula las horas por día de la semana
   */
  private static calculateDailyHours(weeklySchedule: WeeklyScheduleData, totalWeeklyHours: number): number[] {
    return [
      weeklySchedule.sunday,    // Índice 0 = Domingo
      weeklySchedule.monday,    // Índice 1 = Lunes
      weeklySchedule.tuesday,   // Índice 2 = Martes
      weeklySchedule.wednesday, // Índice 3 = Miércoles
      weeklySchedule.thursday,  // Índice 4 = Jueves
      weeklySchedule.friday,    // Índice 5 = Viernes
      weeklySchedule.saturday   // Índice 6 = Sábado
    ];
  }
}