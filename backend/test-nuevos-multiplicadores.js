// Script para probar los nuevos multiplicadores

function detectarMultiplicadorTema(themeName) {
  const nm = themeName.toLowerCase();
  
  let reviewMultiplier = 1;
  let testMultiplier = 1;
  let reduceSessions = false;
  
  // **PRIORIDADES MÁXIMAS** - Temas que requieren control específico PRIMERO
  // **NUEVOS TEMAS CON MUY BAJA PRIORIDAD** (detectar ANTES que temas extensos)
  if (nm.includes('176/2014') && nm.includes('iniciativas y quejas')) {
    console.log(`⚠️⚠️⚠️ Tema con EXTREMADAMENTE baja prioridad detectado: ${themeName} - REDUCIENDO DRÁSTICAMENTE SESIONES`);
    reduceSessions = true;
    reviewMultiplier = 0.1; // 90% menos
    testMultiplier = 0.1;
  } else if (nm.includes('ley orgánica 3/2007') && nm.includes('igualdad efectiva')) {
    console.log(`⚠️⚠️⚠️ Tema con EXTREMADAMENTE baja prioridad detectado: ${themeName} - REDUCIENDO DRÁSTICAMENTE SESIONES`);
    reduceSessions = true;
    reviewMultiplier = 0.1; // 90% menos
    testMultiplier = 0.1;
  }
  // Temas que necesitan MÁS sesiones (3x)
  else if (nm.includes('ley 39/2015') && nm.includes('procedimiento administrativo')) {
    console.log(`🎯🎯🎯 Tema SUPER-prioritario detectado: ${themeName} - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
  } else if (nm.includes('pdc-01') && nm.includes('doctrina')) {
    console.log(`🎯🎯🎯 Tema MEGA-prioritario detectado: ${themeName} - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
  } else if (nm.includes('españa') && nm.includes('misiones internacionales') && !nm.includes('176/2014')) {
    console.log(`🎯🎯🎯 TEMA EXTENSO PRIORITARIO detectado: ${themeName} - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
  } else if (nm.includes('unión europea') || nm.includes('ue')) {
    console.log(`🎯🎯🎯 TEMA EXTENSO PRIORITARIO detectado: ${themeName} - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
  }
  
  return { reviewMultiplier, testMultiplier, reduceSessions };
}

// Temas de prueba según tu solicitud
const temasPrueba = [
  // Temas que deben tener 3x más sesiones
  "Unión Europea (UE)",
  "España y su participación en Misiones Internacionales",
  
  // Temas que deben tener significativamente menos sesiones
  "Real Decreto 176/2014, Iniciativas y Quejas",
  "Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres"
];

console.log('🚀 Probando nuevos multiplicadores...\n');

console.log('📊 ANÁLISIS DE MULTIPLICADORES:');
console.log('='.repeat(60));

const resultados = {
  triplicar: [],
  reducir: [],
  normales: []
};

temasPrueba.forEach(tema => {
  const { reviewMultiplier, testMultiplier, reduceSessions } = detectarMultiplicadorTema(tema);
  
  if (reviewMultiplier === 3) {
    resultados.triplicar.push({ tema, multiplicador: reviewMultiplier });
  } else if (reviewMultiplier === 0.1) {
    resultados.reducir.push({ tema, multiplicador: reviewMultiplier });
  } else {
    resultados.normales.push({ tema, multiplicador: reviewMultiplier });
  }
});

console.log('\n📈 RESUMEN:');
console.log('='.repeat(30));

console.log(`🎯 Temas con 3x más sesiones: ${resultados.triplicar.length}`);
resultados.triplicar.forEach(({ tema, multiplicador }) => {
  console.log(`  - ${tema}: ${multiplicador}x (300% más sesiones)`);
});

console.log(`\n⚠️  Temas con 90% menos sesiones: ${resultados.reducir.length}`);
resultados.reducir.forEach(({ tema, multiplicador }) => {
  console.log(`  - ${tema}: ${multiplicador}x (90% menos sesiones)`);
});

console.log(`\n📚 Temas normales: ${resultados.normales.length}`);
resultados.normales.forEach(({ tema, multiplicador }) => {
  console.log(`  - ${tema}: ${multiplicador}x (sesiones normales)`);
});

// Verificación final
const todosCorrectos = 
  resultados.triplicar.length === 2 && 
  resultados.reducir.length === 2 && 
  resultados.normales.length === 0;

console.log('\n✅ VERIFICACIÓN FINAL:');
console.log('='.repeat(40));

if (todosCorrectos) {
  console.log('🎉 ¡ÉXITO! Todos los temas fueron clasificados correctamente:');
  console.log('   - Unión Europea y España Misiones tendrán 3x más sesiones');
  console.log('   - RD 176/2014 y LO 3/2007 tendrán 90% menos sesiones');
  console.log('   - La redistribución de sesiones está optimizada');
} else {
  console.log('⚠️  Algunos temas no fueron clasificados correctamente');
}

// Explicación del impacto
console.log('\n📊 IMPACTO ESPERADO:');
console.log('='.repeat(30));
console.log('Si un tema normal tiene 10 sesiones de repaso y 5 tests:');
console.log('');
console.log('🎯 Temas 3x tendrán:');
resultados.triplicar.forEach(({ tema }) => {
  console.log(`   - ${tema}: 30 repasos + 15 tests`);
});
console.log('');
console.log('⚠️  Temas 0.1x tendrán:');
resultados.reducir.forEach(({ tema }) => {
  console.log(`   - ${tema}: 1 repaso + 0-1 tests`);
});