import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
const TEST_EMAIL = 'carlos.opomelilla@gmail.com';
const TEST_PASSWORD = 'password123';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

async function runUnlockTest() {
  log('\n🧪 PRUEBA EN VIVO: SISTEMA DE DESBLOQUEO DE TESTS\n', colors.magenta);
  log('='.repeat(70), colors.magenta);

  let authToken = '';
  let userId = 0;
  let planId = 0;
  let sessionToComplete: any = null;
  let themeId = 0;

  try {
    // PASO 1: Login
    log('\n📝 PASO 1: Iniciando sesión...', colors.cyan);
    const loginRes = await axios.post(`${API_URL}/auth/login`, {
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    authToken = loginRes.data.token;
    userId = loginRes.data.user.id;
    log(`✅ Login exitoso - Usuario ID: ${userId}`, colors.green);

    // PASO 2: Obtener plan activo
    log('\n📝 PASO 2: Obteniendo plan activo...', colors.cyan);
    try {
      const planRes = await axios.get(`${API_URL}/study-plans/active`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      planId = planRes.data.id;
      log(`✅ Plan activo encontrado - Plan ID: ${planId}`, colors.green);
    } catch (planError: any) {
      log('⚠️  No hay plan activo. Esto es normal si no has creado uno.', colors.yellow);
      log('   Para la prueba de desbloqueo, necesitas tener un plan activo primero.', colors.yellow);
      log('   Ve a http://localhost:5173/smart-calendar y crea uno.', colors.yellow);
      return;
    }

    // PASO 3: Verificar estado ANTES en /tests/themes
    log('\n📝 PASO 3: Verificando estado ANTES del desbloqueo...', colors.cyan);
    const themesBeforeRes = await axios.get(`${API_URL}/tests/themes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    const lockedThemes = themesBeforeRes.data.filter((t: any) => t.progress.level === 'LOCKED');
    log(`   📊 Temas LOCKED: ${lockedThemes.length}`, colors.yellow);
    
    if (lockedThemes.length > 0) {
      const firstLocked = lockedThemes[0];
      log(`   🔒 Ejemplo: "${firstLocked.title}" - Nivel: ${firstLocked.progress.level}`, colors.yellow);
    }

    // PASO 4: Buscar una sesión de STUDY pendiente
    log('\n📝 PASO 4: Buscando sesión de STUDY para completar...', colors.cyan);
    const today = new Date().toISOString().split('T')[0];
    const sessionsRes = await axios.get(`${API_URL}/sessions`, {
      params: { 
        planId,
        startDate: '2025-11-19',
        endDate: '2025-11-30'
      },
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const studySessions = sessionsRes.data.sessions.filter(
      (s: any) => s.status === 'PENDING' && s.sessionType === 'STUDY'
    );

    if (studySessions.length === 0) {
      log('❌ No hay sesiones de STUDY pendientes. Creando una...', colors.red);
      
      // Crear una sesión de prueba
      const createRes = await axios.post(
        `${API_URL}/sessions/agenda/add`,
        {
          planId,
          themeId: 1, // Tema 1: Constitución Española
          date: today,
          hours: 1,
          type: 'STUDY',
          note: 'Sesión de prueba para desbloqueo'
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      
      sessionToComplete = createRes.data.session;
      log(`✅ Sesión creada - ID: ${sessionToComplete.id}`, colors.green);
    } else {
      sessionToComplete = studySessions[0];
      log(`✅ Sesión encontrada - ID: ${sessionToComplete.id}`, colors.green);
    }

    themeId = sessionToComplete.themeId;
    const themeName = sessionToComplete.theme?.title || `Tema ${themeId}`;
    log(`   📚 Tema: "${themeName}" (ID: ${themeId})`, colors.blue);
    log(`   📅 Fecha: ${new Date(sessionToComplete.scheduledDate).toLocaleDateString()}`, colors.blue);

    // PASO 5: Completar la sesión
    log('\n📝 PASO 5: Completando sesión de STUDY...', colors.cyan);
    const completeRes = await axios.put(
      `${API_URL}/sessions/${sessionToComplete.id}/complete`,
      {
        completedHours: sessionToComplete.scheduledHours,
        difficulty: 3,
        notes: 'Sesión completada para prueba de desbloqueo',
        keyPoints: ['Prueba de desbloqueo exitosa']
      },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );

    log('✅ Sesión completada exitosamente', colors.green);

    // PASO 6: Esperar un momento para que se procese
    log('\n⏳ Esperando procesamiento...', colors.cyan);
    await new Promise(resolve => setTimeout(resolve, 1000));

    // PASO 7: Verificar estado DESPUÉS en /tests/themes
    log('\n📝 PASO 6: Verificando estado DESPUÉS del desbloqueo...', colors.cyan);
    const themesAfterRes = await axios.get(`${API_URL}/tests/themes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });

    const unlockedTheme = themesAfterRes.data.find((t: any) => t.id === themeId);
    
    if (unlockedTheme) {
      log(`   📊 Tema "${unlockedTheme.title}":`, colors.blue);
      log(`      Nivel: ${unlockedTheme.progress.level}`, colors.blue);
      log(`      Tests realizados: ${unlockedTheme.progress.totalTests}`, colors.blue);
      log(`      Sesiones de estudio: ${unlockedTheme.progress.studySessionsCompleted || 0}`, colors.blue);
      
      if (unlockedTheme.progress.level === 'BRONZE') {
        log('\n🎉 ¡ÉXITO! El tema fue desbloqueado correctamente', colors.green);
        log(`   ${unlockedTheme.progress.level === 'LOCKED' ? '🔒' : '🥉'} ${unlockedTheme.progress.level}`, colors.green);
      } else if (unlockedTheme.progress.level === 'LOCKED') {
        log('\n⚠️  El tema sigue LOCKED - puede que necesites actualizar', colors.yellow);
      } else {
        log(`\n✅ El tema ya estaba desbloqueado: ${unlockedTheme.progress.level}`, colors.green);
      }
    }

    // PASO 8: Intentar iniciar un test
    log('\n📝 PASO 7: Intentando iniciar test del tema desbloqueado...', colors.cyan);
    try {
      const startTestRes = await axios.post(
        `${API_URL}/tests/start`,
        {
          themeId,
          testType: 'PRACTICE',
          questionCount: 5,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      log('✅ Test iniciado correctamente', colors.green);
      log(`   🆔 Attempt ID: ${startTestRes.data.attemptId}`, colors.blue);
      log(`   📝 Preguntas: ${startTestRes.data.questions.length}`, colors.blue);
      
      log('\n🎉 PRUEBA COMPLETADA EXITOSAMENTE', colors.green);
      log('   El sistema de desbloqueo funciona perfectamente!', colors.green);

    } catch (testError: any) {
      if (testError.response?.data?.message?.includes('completar al menos una sesión de estudio')) {
        log('❌ ERROR: El tema no se desbloqueó correctamente', colors.red);
        log(`   Mensaje: ${testError.response.data.message}`, colors.red);
      } else {
        log(`⚠️  Error al iniciar test: ${testError.response?.data?.message || testError.message}`, colors.yellow);
      }
    }

    log('\n' + '='.repeat(70), colors.magenta);
    log('📊 RESUMEN DE LA PRUEBA', colors.magenta);
    log('='.repeat(70), colors.magenta);
    log(`✓ Usuario: ${TEST_EMAIL} (ID: ${userId})`, colors.green);
    log(`✓ Plan: ${planId}`, colors.green);
    log(`✓ Sesión completada: ${sessionToComplete.id}`, colors.green);
    log(`✓ Tema desbloqueado: ${themeId} - "${themeName}"`, colors.green);
    log(`✓ Nivel actual: ${unlockedTheme?.progress.level}`, colors.green);

  } catch (error: any) {
    log('\n❌ ERROR EN LA PRUEBA:', colors.red);
    console.error(error.response?.data || error.message);
  }
}

// Ejecutar prueba
runUnlockTest().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
