/**
 * Script de prueba para el nuevo sistema de etiquetas de dificultad
 */

import { GiftParser } from './src/utils/GiftParser';
import * as fs from 'fs';
import * as path from 'path';

async function testDifficultyLabels() {
    console.log('🧪 Probando sistema de etiquetas de dificultad\n');
    console.log('='.repeat(60));

    // Leer archivo de ejemplo
    const examplePath = path.join(__dirname, 'ejemplo_preguntas_con_niveles.gift');

    if (!fs.existsSync(examplePath)) {
        console.error('❌ No se encontró el archivo de ejemplo');
        return;
    }

    const content = fs.readFileSync(examplePath, 'utf-8');

    // Parsear preguntas
    console.log('\n📖 Parseando preguntas...\n');
    const questions = GiftParser.parse(content);

    console.log(`✅ Se parsearon ${questions.length} preguntas\n`);
    console.log('='.repeat(60));

    // Mostrar resultados
    questions.forEach((q, index) => {
        console.log(`\n📝 Pregunta ${index + 1}:`);
        console.log(`   Texto: ${q.question.substring(0, 80)}...`);
        console.log(`   Dificultad: ${q.difficulty}`);
        console.log(`   Origen: ${q.difficultySource === 'manual' ? '🏷️  Manual (etiqueta)' : '🤖 Automático (fallback)'}`);
        console.log(`   Opciones: ${q.options.length}`);
        console.log(`   Tags: ${q.tags.join(', ')}`);
    });

    console.log('\n' + '='.repeat(60));

    // Estadísticas
    const manualCount = questions.filter(q => q.difficultySource === 'manual').length;
    const autoCount = questions.filter(q => q.difficultySource === 'auto').length;

    const easyCount = questions.filter(q => q.difficulty === 'EASY').length;
    const mediumCount = questions.filter(q => q.difficulty === 'MEDIUM').length;
    const hardCount = questions.filter(q => q.difficulty === 'HARD').length;

    console.log('\n📊 Estadísticas:');
    console.log(`   Total preguntas: ${questions.length}`);
    console.log(`   Con etiqueta manual: ${manualCount} (${((manualCount / questions.length) * 100).toFixed(1)}%)`);
    console.log(`   Detección automática: ${autoCount} (${((autoCount / questions.length) * 100).toFixed(1)}%)`);
    console.log('');
    console.log(`   Nivel FÁCIL: ${easyCount} (${((easyCount / questions.length) * 100).toFixed(1)}%)`);
    console.log(`   Nivel MEDIO: ${mediumCount} (${((mediumCount / questions.length) * 100).toFixed(1)}%)`);
    console.log(`   Nivel DIFÍCIL: ${hardCount} (${((hardCount / questions.length) * 100).toFixed(1)}%)`);

    console.log('\n' + '='.repeat(60));
    console.log('\n✅ Prueba completada exitosamente\n');
}

// Ejecutar prueba
testDifficultyLabels().catch(error => {
    console.error('❌ Error en la prueba:', error);
    process.exit(1);
});
