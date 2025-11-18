// Script simple para probar el algoritmo de distribución
// Simula la lógica de multiplicadores sin depender de modelos

function detectarMultiplicadorTema(themeName) {
  const nm = themeName.toLowerCase();
  
  let reviewMultiplier = 1;
  let testMultiplier = 1;
  let reduceSessions = false;
  
  // Temas extensos que necesitan MÁS sesiones
  if (nm.includes('ley 39/2007') && nm.includes('carrera militar')) {
    console.log(`🎯 Tema prioritario detectado: ${themeName} - DUPLICANDO SESIONES`);
    reviewMultiplier = 2;
    testMultiplier = 2;
  } else if (nm.includes('ley 39/2015') && nm.includes('procedimiento administrativo')) {
    console.log(`🎯🎯🎯 Tema SUPER-prioritario detectado: ${themeName} - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
  } else if (nm.includes('1150/2021') && nm.includes('estrategia de seguridad')) {
    console.log(`🎯 Tema prioritario detectado: ${themeName} - DUPLICANDO SESIONES`);
    reviewMultiplier = 2;
    testMultiplier = 2;
  } else if (nm.includes('pdc-01') && nm.includes('doctrina')) {
    console.log(`🎯🎯🎯 Tema MEGA-prioritario detectado: ${themeName} - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
  }
  // **TEMÁTICAS EXTENSAS** - Nuevos temas que requieren más sesiones
  else if (nm.includes('instrucción 14/2021') && nm.includes('et')) {
    console.log(`🎯 TEMA EXTENSO detectado: ${themeName} - DUPLICANDO SESIONES`);
    reviewMultiplier = 2;
    testMultiplier = 2;
  } else if (nm.includes('instrucción 6/2025') && nm.includes('ea')) {
    console.log(`🎯 TEMA EXTENSO detectado: ${themeName} - DUPLICANDO SESIONES`);
    reviewMultiplier = 2;
    testMultiplier = 2;
  } else if (nm.includes('españa') && nm.includes('misiones internacionales')) {
    console.log(`🎯 TEMA EXTENSO detectado: ${themeName} - DUPLICANDO SESIONES`);
    reviewMultiplier = 2;
    testMultiplier = 2;
  }
  // Temas que necesitan MENOS sesiones
  else if (nm.includes('ley 8/2006') && nm.includes('tropa y marinería')) {
    console.log(`⚠️ Tema con MUY baja prioridad detectado: ${themeName} - REDUCIENDO MASIVAMENTE SESIONES`);
    reduceSessions = true;
    reviewMultiplier = 0.2; // 80% menos
    testMultiplier = 0.2;
  } else if (nm.includes('ley 36/2015') && nm.includes('seguridad nacional') && !nm.includes('1150/2021')) {
    console.log(`⚠️ Tema con MUY baja prioridad detectado: ${themeName} - REDUCIENDO MUCHO SESIONES`);
    reduceSessions = true;
    reviewMultiplier = 0.25; // 1/4 de lo normal
    testMultiplier = 0.25;
  } else if (nm.includes('instrucción 15/2021') && nm.includes('armada')) {
    console.log(`⚠️ Tema con MUY baja prioridad detectado: ${themeName} - REDUCIENDO MUCHO SESIONES`);
    reduceSessions = true;
    reviewMultiplier = 0.25; // 1/4 de lo normal
    testMultiplier = 0.25;
  }
  
  return { reviewMultiplier, testMultiplier, reduceSessions };
}

// Datos de prueba
const temasPrueba = [
  // Temas extensos que deben tener más sesiones
  "Parte 2: Instrucción 14/2021, ET.",
  "Parte 4: Instrucción 6/2025, EA.",
  "Parte 2: Ley 39/2007 de la Carrera Militar.",
  "Tema 8. Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas.",
  "Parte 2: Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021.",
  "Tema 2. PDC-01(B) Doctrina para el empleo de las FAS.",
  "Tema 7. España y su participación en Misiones Internacionales.",
  
  // Temas con menos prioridad (que deben tener menos sesiones)
  "Parte 1: Ley 8/2006, Tropa y Marinería",
  "Parte 1: Ley 36/2015, Seguridad Nacional",
  "Parte 3: Instrucción 15/2021, ARMADA",
  
  // Temas normales
  "Constitución Española de 1978",
  "Ley Orgánica 5/2005",
  "Real Decreto 96/2009",
  "Ley Orgánica 9/2011"
];

console.log('🚀 Probando detección de temas extensos...\n');

const resultados = {
  extensos: [],
  bajaPrioridad: [],
  normales: []
};

console.log('📊 ANÁLISIS DE MULTIPLICADORES:');
console.log('='.repeat(60));

temasPrueba.forEach(tema => {
  const { reviewMultiplier, testMultiplier, reduceSessions } = detectarMultiplicadorTema(tema);
  
  if (reviewMultiplier > 1) {
    resultados.extensos.push({ tema, multiplicador: reviewMultiplier });
  } else if (reduceSessions || reviewMultiplier < 1) {
    resultados.bajaPrioridad.push({ tema, multiplicador: reviewMultiplier });
  } else {
    resultados.normales.push({ tema, multiplicador: reviewMultiplier });
  }
});

console.log('\n📈 RESUMEN:');
console.log('='.repeat(30));
console.log(`🎯 Temas extensos detectados: ${resultados.extensos.length}`);
resultados.extensos.forEach(({ tema, multiplicador }) => {
  console.log(`  - ${tema}: ${multiplicador}x`);
});

console.log(`\n⚠️  Temas de baja prioridad: ${resultados.bajaPrioridad.length}`);
resultados.bajaPrioridad.forEach(({ tema, multiplicador }) => {
  console.log(`  - ${tema}: ${multiplicador}x`);
});

console.log(`\n📚 Temas normales: ${resultados.normales.length}`);
resultados.normales.forEach(({ tema, multiplicador }) => {
  console.log(`  - ${tema}: ${multiplicador}x`);
});

// Verificar que los temas extensos mencionados estén detectados
const temasExtensosRequeridos = [
  "Parte 2: Instrucción 14/2021, ET.",
  "Parte 4: Instrucción 6/2025, EA.",
  "Parte 2: Ley 39/2007 de la Carrera Militar.",
  "Tema 8. Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas.",
  "Parte 2: Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021.",
  "Tema 2. PDC-01(B) Doctrina para el empleo de las FAS.",
  "Tema 7. España y su participación en Misiones Internacionales."
];

console.log('\n✅ VERIFICACIÓN DE TEMAS EXTENSOS:');
console.log('='.repeat(40));

let todosDetectados = true;
temasExtensosRequeridos.forEach(tema => {
  const detectado = resultados.extensos.some(e => e.tema === tema);
  if (detectado) {
    console.log(`✅ ${tema}`);
  } else {
    console.log(`❌ ${tema} - NO DETECTADO`);
    todosDetectados = false;
  }
});

if (todosDetectados) {
  console.log('\n🎉 ¡ÉXITO! Todos los temas extensos fueron detectados correctamente.');
} else {
  console.log('\n⚠️  Algunos temas extensos no fueron detectados.');
}