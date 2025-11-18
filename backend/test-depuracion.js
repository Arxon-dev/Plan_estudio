// Test de depuración para ver el flujo exacto
const tema = 'Real Decreto 176/2014, Iniciativas y Quejas';
const nm = tema.toLowerCase();

console.log('🔍 DEPURACIÓN DE DETECCIÓN PARA:', tema);
console.log('Normalizado:', nm);
console.log('');

// Verificar cada condición en orden
console.log('1. ¿Contiene "176/2014" y "iniciativas y quejas"?');
console.log('   - nm.includes("176/2014"):', nm.includes('176/2014'));
console.log('   - nm.includes("iniciativas y quejas"):', nm.includes('iniciativas y quejas'));
console.log('   - Ambas:', nm.includes('176/2014') && nm.includes('iniciativas y quejas'));

console.log('\n2. ¿Contiene "españa" y "misiones internacionales"?');
console.log('   - nm.includes("españa"):', nm.includes('españa'));
console.log('   - nm.includes("misiones internacionales"):', nm.includes('misiones internacionales'));
console.log('   - Ambas:', nm.includes('españa') && nm.includes('misiones internacionales'));
console.log('   - ¿Contiene "176/2014"?', nm.includes('176/2014'));

console.log('\n3. ¿Contiene "unión europea" o "ue"?');
console.log('   - nm.includes("unión europea"):', nm.includes('unión europea'));
console.log('   - nm.includes("ue"):', nm.includes('ue'));

// Ahora simular el flujo real
let reviewMultiplier = 1;
let testMultiplier = 1;
let reduceSessions = false;
let clasificacion = 'NORMAL';
let paso = 0;

// Flujo real del código
if (nm.includes('176/2014') && nm.includes('iniciativas y quejas')) {
  paso = 1;
  console.log('\n✅ PASÓ por el PASO 1: Tema con baja prioridad detectado');
  reduceSessions = true;
  reviewMultiplier = 0.1;
  testMultiplier = 0.1;
  clasificacion = '0.1x REDUCIDO';
} else if (nm.includes('españa') && nm.includes('misiones internacionales') && !nm.includes('176/2014')) {
  paso = 2;
  console.log('\n✅ PASÓ por el PASO 2: Tema extenso prioritario detectado');
  reviewMultiplier = 3;
  testMultiplier = 3;
  clasificacion = '3x PRIORITARIO';
} else if (nm.includes('unión europea') || nm.includes('ue')) {
  paso = 3;
  console.log('\n✅ PASÓ por el PASO 3: Unión Europea detectada');
  reviewMultiplier = 3;
  testMultiplier = 3;
  clasificacion = '3x PRIORITARIO';
}

console.log(`\n📊 Resultado final: ${clasificacion} (Paso ${paso})`);
console.log(`   Review: ${reviewMultiplier}x, Test: ${testMultiplier}x`);