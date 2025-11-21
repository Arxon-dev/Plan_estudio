import TestQuestion, { QuestionDifficulty, QuestionSource } from '../models/TestQuestion';
import Theme from '../models/Theme';

export default {
  up: async (): Promise<void> => {
    console.log('🌱 Seeding preguntas de ejemplo...');
    
    // Obtener algunos temas de la BD
    const themes = await Theme.findAll({ limit: 5 });
    
    if (themes.length === 0) {
      console.log('⚠️  No hay temas en la BD. Carga temas primero.');
      return;
    }
    
    const questions = [
      // TEMA 1 - EASY
      {
        themeId: themes[0].id,
        question: '¿En qué año se aprobó la Constitución Española vigente?',
        options: [
          '1975',
          '1978',
          '1982',
          '1986',
        ],
        correctAnswer: 1,
        explanation: 'La Constitución Española fue aprobada en referéndum el 6 de diciembre de 1978 y entró en vigor el 29 de diciembre del mismo año. Las otras fechas son: 1975 (muerte de Franco), 1982 (victoria del PSOE), 1986 (entrada en la CEE).',
        difficulty: QuestionDifficulty.EASY,
        source: QuestionSource.MANUAL,
        tags: ['constitución', 'fechas', 'legislación'],
      },
      {
        themeId: themes[0].id,
        question: '¿Cuántos artículos tiene la Constitución Española de 1978?',
        options: [
          '139 artículos',
          '169 artículos',
          '179 artículos',
          '189 artículos',
        ],
        correctAnswer: 1,
        explanation: 'La Constitución Española consta de 169 artículos, distribuidos en un Título Preliminar y 10 Títulos. Además, tiene 4 Disposiciones Adicionales, 9 Transitorias, 1 Derogatoria y 1 Final.',
        difficulty: QuestionDifficulty.EASY,
        source: QuestionSource.MANUAL,
        tags: ['constitución', 'estructura'],
      },
      
      // TEMA 1 - MEDIUM
      {
        themeId: themes[0].id,
        question: '¿Qué artículo de la Constitución establece que la soberanía nacional reside en el pueblo español?',
        options: [
          'Artículo 1.1',
          'Artículo 1.2',
          'Artículo 2',
          'Artículo 3',
        ],
        correctAnswer: 1,
        explanation: 'El artículo 1.2 de la Constitución establece que "La soberanía nacional reside en el pueblo español, del que emanan los poderes del Estado". El artículo 1.1 define España como Estado social y democrático de Derecho.',
        difficulty: QuestionDifficulty.MEDIUM,
        source: QuestionSource.MANUAL,
        tags: ['constitución', 'soberanía', 'artículos'],
      },
      {
        themeId: themes[0].id,
        question: 'Según el artículo 8 de la Constitución, ¿cuál es la misión de las Fuerzas Armadas?',
        options: [
          'Defender la frontera terrestre nacional',
          'Garantizar la soberanía e independencia de España y defender su integridad territorial',
          'Apoyar a las Fuerzas y Cuerpos de Seguridad del Estado',
          'Colaborar con las misiones de la OTAN',
        ],
        correctAnswer: 1,
        explanation: 'El artículo 8.1 establece que "Las Fuerzas Armadas, constituidas por el Ejército de Tierra, la Armada y el Ejército del Aire, tienen como misión garantizar la soberanía e independencia de España, defender su integridad territorial y el ordenamiento constitucional".',
        difficulty: QuestionDifficulty.MEDIUM,
        source: QuestionSource.MANUAL,
        tags: ['constitución', 'fuerzas armadas', 'misión'],
      },
      
      // TEMA 1 - HARD
      {
        themeId: themes[0].id,
        question: '¿Cuál de las siguientes afirmaciones sobre la reforma constitucional es INCORRECTA según el Título X?',
        options: [
          'La iniciativa de reforma puede partir del Gobierno, del Congreso, del Senado o de las Asambleas Legislativas',
          'Para aprobar una reforma se requiere mayoría de 3/5 en ambas Cámaras',
          'En caso de desacuerdo, se creará una Comisión Mixta paritaria',
          'La reforma del Título Preliminar requiere referéndum obligatorio en todos los casos',
        ],
        correctAnswer: 3,
        explanation: 'La afirmación incorrecta es la D. Según el artículo 167, solo si se solicita por 1/10 parte de cualquiera de las Cámaras es obligatorio el referéndum en reformas del procedimiento ordinario. La reforma del Título Preliminar sigue el procedimiento del artículo 168 (agravado), que sí requiere referéndum obligatorio.',
        difficulty: QuestionDifficulty.HARD,
        source: QuestionSource.MANUAL,
        tags: ['constitución', 'reforma', 'procedimiento'],
      },
    ];
    
    // Solo añadir más preguntas si hay más temas
    if (themes.length >= 2) {
      questions.push(
        // TEMA 2 - EASY
        {
          themeId: themes[1].id,
          question: '¿Cuál es la edad mínima para alistarse voluntariamente en las Fuerzas Armadas?',
          options: [
            '16 años',
            '18 años',
            '21 años',
            '25 años',
          ],
          correctAnswer: 1,
          explanation: 'Según la Ley de la Carrera Militar, la edad mínima para el ingreso en las Fuerzas Armadas es de 18 años, pudiendo llegar a los 29 años según el cuerpo y escala.',
          difficulty: QuestionDifficulty.EASY,
          source: QuestionSource.MANUAL,
          tags: ['ingreso', 'requisitos', 'edad'],
        },
        {
          themeId: themes[1].id,
          question: '¿Qué significa el acrónimo FAS?',
          options: [
            'Fuerzas Armadas Superiores',
            'Fuerzas Aéreas y Submarinas',
            'Fuerzas Armadas',
            'Función de Apoyo y Seguridad',
          ],
          correctAnswer: 2,
          explanation: 'FAS es el acrónimo de Fuerzas Armadas, que engloba al Ejército de Tierra, la Armada y el Ejército del Aire y del Espacio.',
          difficulty: QuestionDifficulty.EASY,
          source: QuestionSource.MANUAL,
          tags: ['nomenclatura', 'organización'],
        },
        
        // TEMA 2 - MEDIUM
        {
          themeId: themes[1].id,
          question: '¿Quién es el Jefe Supremo de las Fuerzas Armadas según la Constitución?',
          options: [
            'El Presidente del Gobierno',
            'El Ministro de Defensa',
            'El Rey',
            'El Jefe de Estado Mayor de la Defensa (JEMAD)',
          ],
          correctAnswer: 2,
          explanation: 'Según el artículo 62.h de la Constitución, el Rey es el Jefe Supremo de las Fuerzas Armadas. El JEMAD es el máximo mando militar bajo la autoridad del Ministro de Defensa.',
          difficulty: QuestionDifficulty.MEDIUM,
          source: QuestionSource.MANUAL,
          tags: ['jerarquía', 'constitución', 'mando'],
        },
      );
    }
    
    if (themes.length >= 3) {
      questions.push(
        // TEMA 3 - EASY
        {
          themeId: themes[2].id,
          question: '¿Cuál es el documento de identidad militar obligatorio para todo militar?',
          options: [
            'DNI',
            'Tarjeta Militar',
            'Cartilla Militar',
            'Pasaporte Militar',
          ],
          correctAnswer: 1,
          explanation: 'La Tarjeta Militar es el documento de identidad militar que acredita la condición de militar y es obligatorio para todos los miembros de las Fuerzas Armadas.',
          difficulty: QuestionDifficulty.EASY,
          source: QuestionSource.MANUAL,
          tags: ['documentación', 'identidad'],
        },
        
        // TEMA 3 - MEDIUM
        {
          themeId: themes[2].id,
          question: '¿Qué Ley regula la Carrera Militar en España?',
          options: [
            'Ley 8/2006',
            'Ley 39/2007',
            'Ley 40/2015',
            'Ley 17/1999',
          ],
          correctAnswer: 1,
          explanation: 'La Ley 39/2007, de 19 de noviembre, de la Carrera Militar es la norma que regula la carrera profesional de los militares de las Fuerzas Armadas.',
          difficulty: QuestionDifficulty.MEDIUM,
          source: QuestionSource.MANUAL,
          tags: ['legislación', 'carrera militar'],
        },
      );
    }
    
    // Insertar preguntas
    await TestQuestion.bulkCreate(questions);
    
    console.log(`✅ ${questions.length} preguntas de ejemplo creadas exitosamente`);
  },

  down: async (): Promise<void> => {
    console.log('🗑️  Eliminando preguntas de ejemplo...');
    await TestQuestion.destroy({ where: { source: QuestionSource.MANUAL } });
    console.log('✅ Preguntas eliminadas');
  },
};
