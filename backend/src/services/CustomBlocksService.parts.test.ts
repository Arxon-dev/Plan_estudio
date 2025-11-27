import { CustomBlocksService, BlockConfig } from './CustomBlocksService';

// Mock models
jest.mock('../models', () => ({
    Theme: {
        findAll: jest.fn().mockImplementation(async ({ where }: any) => {
            const ids = where.id;
            const themes = [
                { id: 6, title: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA' },
                { id: 7, title: 'Tema 1. Parte 1: Ley 8/2006, Tropa y Marinería' }
            ];
            // Handle both number and string IDs in filter if needed, though service converts to number for DB lookup
            return themes.filter((t: any) => ids.includes(t.id));
        })
    },
    StudySession: {},
    StudyPlan: {},
    WeeklySchedule: {}
}));

describe('CustomBlocksService Multi-part Themes', () => {
    it('should correctly parse multi-part themes and set subThemeLabel', async () => {
        const blocksConfig: BlockConfig[] = [
            {
                blockNumber: 1,
                startDate: '2025-01-01',
                endDate: '2025-01-30',
                weeklyPattern: {
                    monday: {
                        activities: [
                            { themeId: '6-1', type: 'study', duration: 60 },
                            { themeId: 7, type: 'study', duration: 60 }
                        ],
                        totalMinutes: 120
                    },
                    tuesday: { activities: [], totalMinutes: 0 },
                    wednesday: { activities: [], totalMinutes: 0 },
                    thursday: { activities: [], totalMinutes: 0 },
                    friday: { activities: [], totalMinutes: 0 },
                    saturday: { activities: [], totalMinutes: 0 },
                    sunday: { activities: [], totalMinutes: 0 }
                }
            }
        ];

        const themesList = [
            { id: '6-1', name: 'Tema 6. Instrucciones EMAD... Parte 1: Instrucción 55/2021' },
            { id: 7, name: 'Tema 1. Parte 1: Ley 8/2006' }
        ];

        const sessions = await CustomBlocksService.generateSessionsFromBlocks(1, blocksConfig, themesList);

        const partSession = sessions.find(s => s.notes.includes('Parte 1: Instrucción 55/2021'));

        expect(partSession).toBeDefined();
        if (partSession) {
            expect(partSession.themeId).toBe(6);
            expect(partSession.subThemeLabel).toBe('Tema 6. Instrucciones EMAD... Parte 1: Instrucción 55/2021');
        }
    });
});
