const axios = require('axios');

const API_URL = 'http://localhost:8080/api';

// Datos de prueba con temas extensos
const testData = {
  name: "Plan de Prueba - Temas Extensos",
  startDate: "2025-11-18",
  examDate: "2026-10-22",
  weeklySchedule: {
    monday: 4,
    tuesday: 4,
    wednesday: 4,
    thursday: 4,
    friday: 4,
    saturday: 2,
    sunday: 2
  },
  themes: [
    // Temas extensos que deben tener más sesiones
    { id: 1, name: "Parte 2: Instrucción 14/2021, ET.", hours: 8, priority: 1, complexity: "HIGH" },
    { id: 2, name: "Parte 4: Instrucción 6/2025, EA.", hours: 8, priority: 1, complexity: "HIGH" },
    { id: 3, name: "Parte 2: Ley 39/2007 de la Carrera Militar.", hours: 12, priority: 1, complexity: "HIGH" },
    { id: 4, name: "Tema 8. Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas.", hours: 10, priority: 1, complexity: "HIGH" },
    { id: 5, name: "Parte 2: Real Decreto 1150/2021, Estrategia de Seguridad Nacional 2021.", hours: 8, priority: 1, complexity: "HIGH" },
    { id: 6, name: "Tema 2. PDC-01(B) Doctrina para el empleo de las FAS.", hours: 10, priority: 1, complexity: "HIGH" },
    { id: 7, name: "Tema 7. España y su participación en Misiones Internacionales.", hours: 8, priority: 1, complexity: "HIGH" },
    
    // Temas con menos prioridad (que deben tener menos sesiones)
    { id: 8, name: "Parte 1: Ley 8/2006, Tropa y Marinería", hours: 6, priority: 3, complexity: "LOW" },
    { id: 9, name: "Parte 1: Ley 36/2015, Seguridad Nacional", hours: 6, priority: 3, complexity: "MEDIUM" },
    { id: 10, name: "Parte 3: Instrucción 15/2021, ARMADA", hours: 6, priority: 3, complexity: "MEDIUM" },
    
    // Temas normales
    { id: 11, name: "Constitución Española de 1978", hours: 6, priority: 2, complexity: "MEDIUM" },
    { id: 12, name: "Ley Orgánica 5/2005", hours: 6, priority: 2, complexity: "MEDIUM" },
    { id: 13, name: "Real Decreto 96/2009", hours: 5, priority: 2, complexity: "LOW" },
    { id: 14, name: "Ley Orgánica 9/2011", hours: 5, priority: 2, complexity: "LOW" }
  ]
};

async function crearPlanDePrueba() {
  try {
    console.log('🚀 Creando plan de prueba con temas extensos...');
    console.log('📚 Temas extensos que deberían tener más sesiones:');
    testData.themes.slice(0, 7).forEach(theme => {
      console.log(`  - ${theme.name} (${theme.hours}h)`);
    });
    
    console.log('\n⚠️  Temas con baja prioridad que deberían tener menos sesiones:');
    testData.themes.slice(7, 10).forEach(theme => {
      console.log(`  - ${theme.name} (${theme.hours}h)`);
    });

    console.log('\n📤 Enviando datos al servidor...');
    
    const response = await axios.post(`${API_URL}/study-plans`, testData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Plan creado exitosamente!');
    console.log(`📊 ID del plan: ${response.data.id}`);
    console.log(`📅 Período: ${response.data.startDate} hasta ${response.data.examDate}`);
    console.log(`📚 Total de sesiones generadas: ${response.data.totalSessions}`);
    
    // Esperar un momento para que se procese
    console.log('\n⏳ Esperando 3 segundos para que se complete el procesamiento...');
    
    setTimeout(async () => {
      try {
        console.log('\n🔍 Obteniendo detalles del calendario...');
        const calendarResponse = await axios.get(`${API_URL}/study-plans/${response.data.id}/calendar`);
        
        console.log('\n📅 Calendario generado:');
        console.log(`📊 Total de sesiones: ${calendarResponse.data.length}`);
        
        // Analizar distribución por temas
        const distribucion = {};
        calendarResponse.data.forEach(session => {
          const themeName = session.themeName;
          if (!distribucion[themeName]) {
            distribucion[themeName] = 0;
          }
          distribucion[themeName]++;
        });
        
        console.log('\n📊 Distribución por temas:');
        console.log('='.repeat(60));
        
        // Ordenar por número de sesiones (descendente)
        const temasOrdenados = Object.entries(distribucion)
          .sort(([,a], [,b]) => b - a);
        
        temasOrdenados.forEach(([tema, sesiones]) => {
          const esExtenso = testData.themes.slice(0, 7).some(t => tema.includes(t.name.split('.')[0]));
          const esBajaPrioridad = testData.themes.slice(7, 10).some(t => tema.includes(t.name.split(',')[0]));
          
          let indicador = '';
          if (esExtenso) indicador = '🎯'; // Tema extenso
          else if (esBajaPrioridad) indicador = '⚠️'; // Baja prioridad
          else indicador = '📚'; // Normal
          
          console.log(`${indicador} ${tema}: ${sesiones} sesiones`);
        });
        
        // Resumen
        const temasExtensosCount = temasOrdenados
          .filter(([tema]) => testData.themes.slice(0, 7).some(t => tema.includes(t.name.split('.')[0])))
          .reduce((sum, [,count]) => sum + count, 0);
          
        const temasBajaPrioridadCount = temasOrdenados
          .filter(([tema]) => testData.themes.slice(7, 10).some(t => tema.includes(t.name.split(',')[0])))
          .reduce((sum, [,count]) => sum + count, 0);
          
        const temasNormalesCount = temasOrdenados
          .filter(([tema]) => !testData.themes.slice(0, 10).some(t => 
            tema.includes(t.name.split('.')[0]) || tema.includes(t.name.split(',')[0])
          ))
          .reduce((sum, [,count]) => sum + count, 0);
        
        console.log('\n📈 RESUMEN:');
        console.log('='.repeat(30));
        console.log(`🎯 Temas extensos: ${temasExtensosCount} sesiones`);
        console.log(`⚠️  Temas baja prioridad: ${temasBajaPrioridadCount} sesiones`);
        console.log(`📚 Temas normales: ${temasNormalesCount} sesiones`);
        console.log(`📊 Total: ${calendarResponse.data.length} sesiones`);
        
        // Verificar si el algoritmo funcionó correctamente
        console.log('\n✅ ANÁLISIS DEL ALGORITMO:');
        console.log('='.repeat(40));
        
        const promedioExtensos = temasExtensosCount / 7;
        const promedioBajaPrioridad = temasBajaPrioridadCount / 3;
        const promedioNormales = temasNormalesCount / 4;
        
        console.log(`📊 Promedio sesiones por tema extenso: ${promedioExtensos.toFixed(1)}`);
        console.log(`📊 Promedio sesiones por tema baja prioridad: ${promedioBajaPrioridad.toFixed(1)}`);
        console.log(`📊 Promedio sesiones por tema normal: ${promedioNormales.toFixed(1)}`);
        
        if (promedioExtensos > promedioNormales * 1.5) {
          console.log('✅ ÉXITO: Los temas extensos tienen significativamente más sesiones');
        } else {
          console.log('⚠️  ADVERTENCIA: Los temas extensos no tienen muchas más sesiones que los normales');
        }
        
        if (promedioBajaPrioridad < promedioNormales * 0.8) {
          console.log('✅ ÉXITO: Los temas de baja prioridad tienen menos sesiones');
        } else {
          console.log('⚠️  ADVERTENCIA: Los temas de baja prioridad no tienen significativamente menos sesiones');
        }
        
      } catch (error) {
        console.error('❌ Error al obtener el calendario:', error.response?.data || error.message);
      }
      
    }, 3000);
    
  } catch (error) {
    console.error('❌ Error al crear el plan:', error.response?.data || error.message);
  }
}

// Ejecutar
console.log('🚀 Iniciando prueba de temas extensos...\n');
crearPlanDePrueba();