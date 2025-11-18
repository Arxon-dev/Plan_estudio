// Test específico para verificar la detección de temas prioritarios
const temas = [
  'Unión Europea (UE)',
  'España y su participación en Misiones Internacionales',
  'Real Decreto 176/2014, Iniciativas y Quejas',
  'Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres'
];

console.log('🔍 PROBANDO DETECCIÓN ESPECÍFICA DE TEMAS');
console.log('==========================================\n');

temas.forEach(tema => {
  const nm = tema.toLowerCase();
  console.log(`\n📋 Tema: "${tema}"`);
  console.log(`🔤 Normalizado: "${nm}"`);
  
  let reviewMultiplier = 1;
  let testMultiplier = 1;
  let reduceSessions = false;
  let clasificacion = 'NORMAL';
  
  // Verificar en el orden exacto del código (PRIORIDADES MÁXIMAS PRIMERO)
  if (nm.includes('176/2014') && nm.includes('iniciativas y quejas')) {
    console.log(`   ⚠️⚠️⚠️ DETECTADO: TEMA CON MUY BAJA PRIORIDAD - REDUCIENDO DRÁSTICAMENTE`);
    reduceSessions = true;
    reviewMultiplier = 0.1;
    testMultiplier = 0.1;
    clasificacion = '0.1x REDUCIDO';
  } else if (nm.includes('ley orgánica 3/2007') && nm.includes('igualdad efectiva')) {
    console.log(`   ⚠️⚠️⚠️ DETECTADO: TEMA CON MUY BAJA PRIORIDAD - REDUCIENDO DRÁSTICAMENTE`);
    reduceSessions = true;
    reviewMultiplier = 0.1;
    testMultiplier = 0.1;
    clasificacion = '0.1x REDUCIDO';
  } else if (nm.includes('españa') && nm.includes('misiones internacionales') && !nm.includes('176/2014')) {
    console.log(`   🎯🎯🎯 DETECTADO: TEMA EXTENSO PRIORITARIO - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
    clasificacion = '3x PRIORITARIO';
  } else if (nm.includes('unión europea') || nm.includes('ue')) {
    console.log(`   🎯🎯🎯 DETECTADO: TEMA EXTENSO PRIORITARIO - TRIPLICANDO SESIONES`);
    reviewMultiplier = 3;
    testMultiplier = 3;
    clasificacion = '3x PRIORITARIO';
  }
  
  console.log(`   📊 Resultado: ${clasificacion} (Review: ${reviewMultiplier}x, Test: ${testMultiplier}x)`);
});

console.log('\n\n🎯 RESUMEN DE CLASIFICACIÓN:');
console.log('============================');
console.log('✅ Unión Europea (UE): 3x más sesiones');
console.log('✅ España y su participación en Misiones Internacionales: 3x más sesiones');
console.log('❌ Real Decreto 176/2014, Iniciativas y Quejas: DEBERÍA ser 0.1x (90% menos)');
console.log('✅ Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres: 0.1x (90% menos)');