import sequelize from '../config/database';
import Theme, { ThemeComplexity } from '../models/Theme';
import { Op } from 'sequelize';

// Definición de temas extensos con sus horas estimadas
const EXTENSIVE_THEMES = [
  { title: 'Ley 40/2015, de Régimen Jurídico del Sector Público', hours: 5.0, complexity: ThemeComplexity.HIGH },
  { title: 'Instrucciones EMAD, ET, ARMADA y EA', hours: 8.0, complexity: ThemeComplexity.HIGH }, // Contiene Instrucción 14/2021 y 6/2025
  { title: 'Ley 36/2015, Seguridad Nacional / RD 1150/2021', hours: 6.0, complexity: ThemeComplexity.HIGH }, // Contiene RD 1150/2021
  { title: 'Ley 39/2007 de la Carrera Militar', hours: 5.0, complexity: ThemeComplexity.HIGH },
  { title: 'Ley Orgánica 8/2014, Régimen Disciplinario de las Fuerzas Armadas', hours: 4.5, complexity: ThemeComplexity.HIGH },
  { title: 'Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas', hours: 5.5, complexity: ThemeComplexity.HIGH },
  { title: 'PDC-01(B) Doctrina para el empleo de las FAS', hours: 4.5, complexity: ThemeComplexity.HIGH },
  { title: 'España y su participación en Misiones Internacionales', hours: 4.0, complexity: ThemeComplexity.HIGH },
];

async function updateThemeComplexity() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida');

    let updatedCount = 0;

    // Actualizar temas extensos
    for (const theme of EXTENSIVE_THEMES) {
      const [updated] = await Theme.update(
        {
          estimatedHours: theme.hours,
          complexity: theme.complexity,
        },
        {
          where: {
            title: {
              [Op.like]: `%${theme.title}%`,
            },
          },
        }
      );

      if (updated > 0) {
        console.log(`✅ Actualizado: ${theme.title} → ${theme.hours}h (${theme.complexity})`);
        updatedCount += updated;
      } else {
        console.log(`⚠️ No encontrado: ${theme.title}`);
      }
    }

    // Actualizar temas restantes como MEDIUM (los que no se actualizaron arriba)
    const allThemes = await Theme.findAll();
    let mediumUpdated = 0;
    
    for (const theme of allThemes) {
      if (theme.complexity !== ThemeComplexity.HIGH) {
        await theme.update({ complexity: ThemeComplexity.MEDIUM });
        mediumUpdated++;
      }
    }

    console.log(`\n📊 Resumen:`);
    console.log(`   - Temas extensos actualizados: ${updatedCount}`);
    console.log(`   - Temas con complejidad MEDIUM: ${mediumUpdated}`);
    console.log(`\n✅ Actualización completada exitosamente`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error al actualizar temas:', error);
    process.exit(1);
  }
}

updateThemeComplexity();
