const fetch = require('node-fetch');

// Configuración - ACTUALIZA CON TU TOKEN REAL
const API_URL = 'http://localhost:3000/api';
const TEST_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzMzUwOTIxLCJleHAiOjE3NjM5NTU3MjF9.RGHxloiQjDc1M8CTCz7hN7zUTSodhvjhDW7eVYM_7O8';

// Datos de prueba
const testData = {
  startDate: '2025-01-01',
  examDate: '2025-10-22',
  weeklySchedule: {
    monday: 2,
    tuesday: 2,
    wednesday: 2,
    thursday: 2,
    friday: 2,
    saturday: 1,
    sunday: 1
  },
  themes: [
    { id: 1, name: 'Tema 1 - Estructura de las FAS', hours: 8, priority: 1 },
    { id: 2, name: 'Tema 2 - Organización del Ministerio de Defensa', hours: 6, priority: 1 },
    { id: 6, name: 'Tema 6 - Instrucciones EMAD, ET, ARMADA y EA', hours: 12, priority: 3 },
    { id: 7, name: 'Tema 7 - Ley 8/2006 y 39/2007', hours: 10, priority: 3 },
    { id: 15, name: 'Tema 15 - Seguridad Nacional', hours: 8, priority: 2 }
  ]
};

async function testPlanCreation() {
  console.log('🚀 Iniciando prueba de creación de plan...');
  console.log('📅 Fecha inicio:', testData.startDate);
  console.log('📅 Fecha examen:', testData.examDate);
  console.log('⏰ Horas semanales:', Object.values(testData.weeklySchedule).reduce((a, b) => a + b, 0));
  console.log('📚 Temas seleccionados:', testData.themes.length);
  
  // Verificar si el token fue actualizado
  if (TEST_TOKEN === 'ACTUALIZA_CON_TU_TOKEN_JWT_AQUI') {
    console.log('\n❌ ERROR: Debes actualizar el token JWT en el script');
    console.log('💡 Para obtener tu token:');
    console.log('   1. Abre el navegador y ve a la aplicación');
    console.log('   2. Abre las herramientas de desarrollo (F12)');
    console.log('   3. Ve a Application → Local Storage');
    console.log('   4. Busca la clave "token" y copia su valor');
    console.log('   5. Pégalo en la variable TEST_TOKEN de este script');
    return;
  }
  
  try {
    // 1. Crear plan
    console.log('\n📋 Creando plan de estudio...');
    const createResponse = await fetch(`${API_URL}/study-plans`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TEST_TOKEN}`
      },
      body: JSON.stringify(testData)
    });
    
    const createResult = await createResponse.json();
    console.log('✅ Respuesta creación:', JSON.stringify(createResult, null, 2));
    
    if (!createResult.plan) {
      console.log('❌ Error: No se creó el plan');
      console.log('📖 Mensaje de error:', createResult.error || 'Error desconocido');
      return;
    }
    
    const planId = createResult.plan.id;
    console.log(`\n📊 Plan creado con ID: ${planId}`);
    console.log('📊 Estado del plan:', createResult.plan.status);
    
    // 2. Esperar unos segundos para que se genere el calendario
    console.log('\n⏳ Esperando generación del calendario (10 segundos)...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // 3. Verificar estado de generación
    console.log('\n🔍 Verificando estado de generación...');
    const statusResponse = await fetch(`${API_URL}/study-plans/${planId}/generation-status`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    const statusResult = await statusResponse.json();
    console.log('📈 Estado de generación:', JSON.stringify(statusResult, null, 2));
    
    // 4. Obtener sesiones del plan
    console.log('\n📅 Obteniendo sesiones del plan...');
    const sessionsResponse = await fetch(`${API_URL}/study-plans/${planId}/sessions`, {
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });
    
    const sessionsResult = await sessionsResponse.json();
    console.log(`📊 Total de sesiones: ${sessionsResult.sessions?.length || 0}`);
    
    if (sessionsResult.sessions && sessionsResult.sessions.length > 0) {
      // Análisis de sesiones por tipo
      const sessionTypes = {};
      sessionsResult.sessions.forEach(session => {
        const type = session.sessionType || 'UNKNOWN';
        sessionTypes[type] = (sessionTypes[type] || 0) + 1;
      });
      
      console.log('📋 Distribución por tipos:', sessionTypes);
      
      // Análisis por tema
      const themeStats = {};
      sessionsResult.sessions.forEach(session => {
        const themeId = session.themeId;
        if (!themeStats[themeId]) {
          themeStats[themeId] = { study: 0, review: 0, test: 0, total: 0 };
        }
        
        const type = (session.sessionType || '').toLowerCase();
        if (type === 'study') themeStats[themeId].study++;
        else if (type === 'review') themeStats[themeId].review++;
        else if (type === 'test') themeStats[themeId].test++;
        themeStats[themeId].total++;
      });
      
      console.log('\n📊 Estadísticas por tema:');
      Object.entries(themeStats).forEach(([themeId, stats]) => {
        console.log(`  Tema ${themeId}: Estudio=${stats.study}, Repaso=${stats.review}, Test=${stats.test}, Total=${stats.total}`);
      });
      
      // Verificar distribución temporal
      const firstSession = sessionsResult.sessions[0];
      const lastSession = sessionsResult.sessions[sessionsResult.sessions.length - 1];
      
      console.log('\n📅 Primera sesión:', firstSession.scheduledDate, '-', firstSession.sessionType);
      console.log('📅 Última sesión:', lastSession.scheduledDate, '-', lastSession.sessionType);
      
      // Verificar si hay problemas con el buffer
      const examDate = new Date(testData.examDate);
      const lastSessionDate = new Date(lastSession.scheduledDate);
      const daysBeforeExam = Math.ceil((examDate - lastSessionDate) / (1000 * 60 * 60 * 24));
      
      console.log('\n📊 Análisis del buffer:');
      console.log('📅 Fecha del examen:', testData.examDate);
      console.log('📅 Última sesión programada:', lastSession.scheduledDate);
      console.log('📊 Días entre última sesión y examen:', daysBeforeExam);
      
      if (daysBeforeExam > 30) {
        console.log('⚠️ El buffer de 30 días está activo - las sesiones terminan 30 días antes del examen');
        console.log('💡 Esto es intencional para dejar tiempo de preparación final');
      }
      
    } else {
      console.log('⚠️ No se encontraron sesiones');
      console.log('🔍 Posibles causas:');
      console.log('   - Horas semanales insuficientes');
      console.log('   - Temas no válidos o inexistentes');
      console.log('   - Error en la generación del calendario');
      console.log('   - Problemas con el buffer de tiempo');
      console.log('   - Error en el servidor al procesar');
    }
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error);
    console.error('📖 Detalles del error:', error.message);
  }
}

// Ejecutar prueba
testPlanCreation().catch(console.error);