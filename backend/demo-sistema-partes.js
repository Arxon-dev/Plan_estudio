// Demo del nuevo sistema de temas por partes
console.log('🎯 Demostración del Sistema de Temas por Partes');
console.log('=' .repeat(50));

// Simular los temas con partes confirmados
const temasConPartes = [
  {
    id: 6,
    title: 'Instrucciones EMAD, ET, ARMADA y EA',
    parts: 4,
    partes: [
      'Parte 1: Instrucción 55/2021, EMAD',
      'Parte 2: Instrucción 14/2021, ET', 
      'Parte 3: Instrucción 15/2021, ARMADA',
      'Parte 4: Instrucción 6/2025, EA'
    ]
  },
  {
    id: 7,
    title: 'Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar',
    parts: 2,
    partes: [
      'Parte 1: Ley 8/2006, Tropa y Marinería',
      'Parte 2: Ley 39/2007 de la Carrera Militar'
    ]
  },
  {
    id: 15,
    title: 'Ley 36/2015, Seguridad Nacional / Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021',
    parts: 2,
    partes: [
      'Parte 1: Ley 36/2015, Seguridad Nacional',
      'Parte 2: Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021'
    ]
  }
];

// Simular el nuevo algoritmo de distribución
function distribuirSesionesPorPartes(temas, diasDisponibles = 10) {
  const sesiones = [];
  const progresoPorTema = new Map();
  
  console.log('📚 Algoritmo de Distribución de Sesiones por Partes');
  console.log('─'.repeat(50));
  
  for (let dia = 1; dia <= diasDisponibles; dia++) {
    console.log(`\n📅 Día ${dia}:`);
    
    // Seleccionar 2-3 temas por día
    const temasSeleccionados = temas.slice(0, Math.min(3, temas.length));
    
    temasSeleccionados.forEach(tema => {
      // Obtener progreso actual del tema
      const progresoActual = progresoPorTema.get(tema.id) || 0;
      const siguienteParte = (progresoActual % tema.parts) + 1;
      
      // Crear sesión para la siguiente parte
      const sesion = {
        dia: dia,
        temaId: tema.id,
        temaNombre: `${tema.title} — Parte ${siguienteParte}`,
        parte: siguienteParte,
        etiquetaParte: tema.partes[siguienteParte - 1],
        tipo: dia % 3 === 0 ? 'TEST' : (dia % 2 === 0 ? 'REVIEW' : 'STUDY')
      };
      
      sesiones.push(sesion);
      
      // Actualizar progreso
      progresoPorTema.set(tema.id, progresoActual + 1);
      
      console.log(`   📖 ${sesion.temaNombre}`);
      console.log(`      ${sesion.etiquetaParte} (${sesion.tipo})`);
    });
  }
  
  return sesiones;
}

// Ejecutar demo
const sesionesGeneradas = distribuirSesionesPorPartes(temasConPartes);

// Análisis final
console.log('\n' + '='.repeat(50));
console.log('📊 ANÁLISIS DE DISTRIBUCIÓN');
console.log('='.repeat(50));

const resumenPorTema = {};
sesionesGeneradas.forEach(sesion => {
  if (!resumenPorTema[sesion.temaId]) {
    resumenPorTema[sesion.temaId] = {
      nombre: sesion.temaNombre.split(' — ')[0],
      partes: new Set()
    };
  }
  resumenPorTema[sesion.temaId].partes.add(sesion.parte);
});

Object.keys(resumenPorTema).forEach(temaId => {
  const info = resumenPorTema[temaId];
  console.log(`\n📚 ${info.nombre}:`);
  console.log(`   ✅ Partes cubiertas: ${Array.from(info.partes).join(', ')}`);
  console.log(`   📈 Total sesiones: ${info.partes.size}`);
});

console.log('\n✅ VENTAJAS DEL NUEVO SISTEMA:');
console.log('   • Cada parte aparece como sesión individual completa');
console.log('   • Progresión secuencial a través de todas las partes');
console.log('   • Tracking preciso del avance por tema');
console.log('   • Etiquetas claras "Parte X" en cada sesión');
console.log('   • Distribución equitativa del tiempo de estudio');

console.log('\n🎯 RESULTADO: Los temas con partes ahora generan sesiones');
console.log('   individuales completas en lugar de rotar entre partes!');