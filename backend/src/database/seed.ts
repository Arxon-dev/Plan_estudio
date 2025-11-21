import { Theme, ThemeBlock, ThemeComplexity } from '../models';
import testQuestionsSeed from '../seeders/20251119000001-test-questions-seed';

const themesData = [
  // BLOQUE 1 - ORGANIZACIÓN
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 1,
    title: 'Constitución Española de 1978. Títulos III, IV, V, VI y VIII',
    content: '',
    parts: 1,
    estimatedHours: 8,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 2,
    title: 'Ley Orgánica 5/2005, de la Defensa Nacional',
    content: '',
    parts: 1,
    estimatedHours: 6,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 3,
    title: 'Ley 40/2015, de Régimen Jurídico del Sector Público',
    content: '',
    parts: 1,
    estimatedHours: 5,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 4,
    title: 'Real Decreto 205/2024, Ministerio de Defensa',
    content: '',
    parts: 1,
    estimatedHours: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 5,
    title: 'Real Decreto 521/2020, Organización Básica de las Fuerzas Armadas',
    content: '',
    parts: 1,
    estimatedHours: 6,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.ORGANIZACION,
    themeNumber: 6,
    title: 'Instrucciones EMAD, ET, ARMADA y EA',
    content: 'Parte 1: Instrucción 55/2021, EMAD.\nParte 2: Instrucción 14/2021, ET.\nParte 3: Instrucción 15/2021, ARMADA.\nParte 4: Instrucción 6/2025, EA.',
    parts: 4,
    estimatedHours: 8,
    complexity: ThemeComplexity.HIGH,
  },

  // BLOQUE 2 - JURÍDICO-SOCIAL
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 1,
    title: 'Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar',
    content: 'Parte 1: Ley 8/2006, Tropa y Marinería.\nParte 2: Ley 39/2007 de la Carrera Militar.',
    parts: 2,
    estimatedHours: 5,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 2,
    title: 'Real Decreto 96/2009, Reales Ordenanzas para las Fuerzas Armadas',
    content: '',
    parts: 1,
    estimatedHours: 6,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 3,
    title: 'Ley Orgánica 9/2011, Derechos y Deberes FAS',
    content: '',
    parts: 1,
    estimatedHours: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 4,
    title: 'Ley Orgánica 8/2014, Régimen Disciplinario de las Fuerzas Armadas',
    content: '',
    parts: 1,
    estimatedHours: 4.5,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 5,
    title: 'Real Decreto 176/2014, Iniciativas y Quejas',
    content: '',
    parts: 1,
    estimatedHours: 4,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 6,
    title: 'Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres',
    content: '',
    parts: 1,
    estimatedHours: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 7,
    title: 'Observatorio militar para la igualdad entre mujeres y hombres en las Fuerzas Armadas',
    content: '',
    parts: 1,
    estimatedHours: 4,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.JURIDICO_SOCIAL,
    themeNumber: 8,
    title: 'Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas',
    content: '',
    parts: 1,
    estimatedHours: 5.5,
    complexity: ThemeComplexity.HIGH,
  },

  // BLOQUE 3 - SEGURIDAD NACIONAL
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 1,
    title: 'Ley 36/2015, Seguridad Nacional / RD 1150/2021, Estrategia de Seguridad Nacional 2021',
    content: 'Parte 1: Ley 36/2015, Seguridad Nacional.\nParte 2: Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021.',
    parts: 2,
    estimatedHours: 6,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 2,
    title: 'PDC-01(B) Doctrina para el empleo de las FAS',
    content: '',
    parts: 1,
    estimatedHours: 4.5,
    complexity: ThemeComplexity.HIGH,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 3,
    title: 'Organización de las Naciones Unidas (ONU)',
    content: '',
    parts: 1,
    estimatedHours: 4,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 4,
    title: 'Organización del Tratado del Atlántico Norte (OTAN)',
    content: '',
    parts: 1,
    estimatedHours: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 5,
    title: 'Organización para la Seguridad y Cooperación en Europa (OSCE)',
    content: '',
    parts: 1,
    estimatedHours: 4,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 6,
    title: 'Unión Europea (UE)',
    content: '',
    parts: 1,
    estimatedHours: 5,
    complexity: ThemeComplexity.MEDIUM,
  },
  {
    block: ThemeBlock.SEGURIDAD_NACIONAL,
    themeNumber: 7,
    title: 'España y su participación en Misiones Internacionales',
    content: '',
    parts: 1,
    estimatedHours: 4,
    complexity: ThemeComplexity.HIGH,
  },
];

export async function seedThemes() {
  try {
    console.log('🌱 Iniciando seed de temas...');
    
    for (const themeData of themesData) {
      await Theme.findOrCreate({
        where: {
          block: themeData.block,
          themeNumber: themeData.themeNumber,
        },
        defaults: themeData,
      });
    }
    
    console.log('✅ Seed de temas completado exitosamente');
    console.log(`📚 Total de temas: ${themesData.length}`);
  } catch (error) {
    console.error('❌ Error en seed de temas:', error);
    throw error;
  }
}

// Ejecutar seed si es llamado directamente
if (require.main === module) {
  (async () => {
    try {
      await seedThemes();
      await testQuestionsSeed.up();
      process.exit(0);
    } catch (error) {
      console.error('❌ Error en seed:', error);
      process.exit(1);
    }
  })();
}
