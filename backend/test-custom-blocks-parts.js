const { CustomBlocksService } = require('./src/services/CustomBlocksService');
const { Theme } = require('./src/models');

// Mock Theme model
Theme.findAll = async ({ where }) => {
    const ids = where.id;
    const themes = [
        { id: 6, title: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA' },
        { id: 7, title: 'Tema 1. Parte 1: Ley 8/2006, Tropa y Marinería' }
    ];
    return themes.filter(t => ids.includes(t.id));
};

async function testMultiPartThemes() {
    console.log('🧪 Testing Multi-part Themes...');

    const blocksConfig = [
        {
            blockNumber: 1,
            startDate: '2025-01-01',
            endDate: '2025-01-30',
            weeklyPattern: {
                monday: {
                    activities: [
                        { themeId: '6-1', type: 'study', duration: 60 }, // Multi-part
                        { themeId: 7, type: 'study', duration: 60 }      // Single
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

    try {
        const sessions = await CustomBlocksService.generateSessionsFromBlocks(1, blocksConfig, themesList);

        console.log(`Generated ${sessions.length} sessions.`);

        const partSession = sessions.find(s => s.notes.includes('Parte 1: Instrucción 55/2021'));

        if (partSession) {
            console.log('✅ Found session for multi-part theme:');
            console.log('   Theme ID:', partSession.themeId);
            console.log('   SubTheme Label:', partSession.subThemeLabel);
            console.log('   Notes:', partSession.notes);

            if (partSession.themeId === 6 && partSession.subThemeLabel === 'Tema 6. Instrucciones EMAD... Parte 1: Instrucción 55/2021') {
                console.log('✅ SUCCESS: Theme ID parsed correctly and label stored.');
            } else {
                console.error('❌ FAILURE: Incorrect ID or Label.');
            }
        } else {
            console.error('❌ FAILURE: Session for multi-part theme not found.');
        }

    } catch (error) {
        console.error('❌ Error during test:', error);
    }
}

testMultiPartThemes();
