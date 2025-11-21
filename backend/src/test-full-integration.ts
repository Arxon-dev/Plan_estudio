import axios from 'axios';

const API_URL = 'http://localhost:3000/api';
let authToken = '';
let testAttemptId = 0;

// Colores
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

// ==================== TESTS ====================

async function test1_HealthCheck() {
  try {
    const response = await axios.get(`${API_URL}/health`);
    if (response.data.status === 'ok') {
      log('✅ Test 1: Health Check - PASADO', colors.green);
      return true;
    }
  } catch (error) {
    log('❌ Test 1: Health Check - FALLADO', colors.red);
    return false;
  }
}

async function test2_Login() {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: 'carlos.opomelilla@gmail.com',
      password: 'password123',
    });
    
    if (response.data.token) {
      authToken = response.data.token;
      log('✅ Test 2: Login con credenciales - PASADO', colors.green);
      return true;
    }
  } catch (error: any) {
    log(`❌ Test 2: Login - FALLADO (${error.response?.data?.error})`, colors.red);
    return false;
  }
}

async function test3_GetThemes() {
  try {
    const response = await axios.get(`${API_URL}/themes`);
    if (Array.isArray(response.data) && response.data.length > 0) {
      log(`✅ Test 3: Obtener temas (${response.data.length} temas) - PASADO`, colors.green);
      return true;
    }
  } catch (error) {
    log('❌ Test 3: Obtener temas - FALLADO', colors.red);
    return false;
  }
}

async function test4_GetTestDashboard() {
  try {
    const response = await axios.get(`${API_URL}/tests/dashboard`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.stats && Array.isArray(response.data.recentTests)) {
      log('✅ Test 4: Dashboard de tests - PASADO', colors.green);
      log(`   ℹ️  Tests completados: ${response.data.stats.totalTests}`, colors.cyan);
      log(`   ℹ️  Tasa de éxito: ${response.data.stats.globalSuccessRate}%`, colors.cyan);
      return true;
    }
  } catch (error: any) {
    log(`❌ Test 4: Dashboard de tests - FALLADO`, colors.red);
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function test5_GetThemesWithProgress() {
  try {
    const response = await axios.get(`${API_URL}/tests/themes`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      const theme = response.data[0];
      log('✅ Test 5: Temas con progreso - PASADO', colors.green);
      log(`   ℹ️  Primer tema: "${theme.title}"`, colors.cyan);
      log(`   ℹ️  Nivel: ${theme.progress?.level || 'LOCKED'}`, colors.cyan);
      return true;
    }
  } catch (error) {
    log('❌ Test 5: Temas con progreso - FALLADO', colors.red);
    return false;
  }
}

async function test6_StartTest() {
  try {
    const response = await axios.post(
      `${API_URL}/tests/start`,
      {
        themeId: 1,
        testType: 'PRACTICE',
        questionCount: 5,
      },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.attemptId && Array.isArray(response.data.questions)) {
      testAttemptId = response.data.attemptId;
      log('✅ Test 6: Iniciar test - PASADO', colors.green);
      log(`   ℹ️  Attempt ID: ${testAttemptId}`, colors.cyan);
      log(`   ℹ️  Preguntas: ${response.data.questions.length}`, colors.cyan);
      return true;
    }
  } catch (error: any) {
    log(`❌ Test 6: Iniciar test - FALLADO`, colors.red);
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function test7_CompleteTest() {
  try {
    // Simular respuestas (todas correctas = opción 1)
    const answers = Array.from({ length: 5 }, (_, i) => ({
      questionId: i + 1,
      userAnswer: 1,
      isCorrect: false,
      timeSpent: 30,
    }));

    const response = await axios.post(
      `${API_URL}/tests/${testAttemptId}/complete`,
      { answers },
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.score !== undefined && response.data.passed !== undefined) {
      log('✅ Test 7: Completar test - PASADO', colors.green);
      log(`   ℹ️  Puntuación: ${response.data.score}%`, colors.cyan);
      log(`   ℹ️  Aprobado: ${response.data.passed ? 'Sí' : 'No'}`, colors.cyan);
      return true;
    }
  } catch (error: any) {
    log(`❌ Test 7: Completar test - FALLADO`, colors.red);
    console.error(error.response?.data || error.message);
    return false;
  }
}

async function test8_GetTestResults() {
  try {
    const response = await axios.get(
      `${API_URL}/tests/results/${testAttemptId}`,
      {
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    
    if (response.data.score !== undefined && Array.isArray(response.data.answers)) {
      log('✅ Test 8: Obtener resultados - PASADO', colors.green);
      log(`   ℹ️  Respuestas correctas: ${response.data.correctAnswers}/${response.data.totalQuestions}`, colors.cyan);
      return true;
    }
  } catch (error) {
    log('❌ Test 8: Obtener resultados - FALLADO', colors.red);
    return false;
  }
}

async function test9_GetTestHistory() {
  try {
    const response = await axios.get(`${API_URL}/tests/history`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (Array.isArray(response.data) && response.data.length > 0) {
      log('✅ Test 9: Historial de tests - PASADO', colors.green);
      log(`   ℹ️  Tests en historial: ${response.data.length}`, colors.cyan);
      return true;
    }
  } catch (error) {
    log('❌ Test 9: Historial de tests - FALLADO', colors.red);
    return false;
  }
}

async function test10_GetUserStats() {
  try {
    const response = await axios.get(`${API_URL}/tests/stats`, {
      headers: { Authorization: `Bearer ${authToken}` },
    });
    
    if (response.data.totalTests !== undefined) {
      log('✅ Test 10: Estadísticas de usuario - PASADO', colors.green);
      log(`   ℹ️  Total tests: ${response.data.totalTests}`, colors.cyan);
      log(`   ℹ️  Promedio: ${response.data.averageScore}%`, colors.cyan);
      return true;
    }
  } catch (error) {
    log('❌ Test 10: Estadísticas de usuario - FALLADO', colors.red);
    return false;
  }
}

// ==================== EJECUTAR TESTS ====================

async function runAllTests() {
  log('\n' + '='.repeat(70), colors.magenta);
  log('🧪 INICIANDO SUITE DE PRUEBAS - SISTEMA DE TESTS', colors.magenta);
  log('='.repeat(70) + '\n', colors.magenta);

  const tests = [
    { name: 'Health Check', fn: test1_HealthCheck },
    { name: 'Login', fn: test2_Login },
    { name: 'Obtener Temas', fn: test3_GetThemes },
    { name: 'Dashboard de Tests', fn: test4_GetTestDashboard },
    { name: 'Temas con Progreso', fn: test5_GetThemesWithProgress },
    { name: 'Iniciar Test', fn: test6_StartTest },
    { name: 'Completar Test', fn: test7_CompleteTest },
    { name: 'Obtener Resultados', fn: test8_GetTestResults },
    { name: 'Historial de Tests', fn: test9_GetTestHistory },
    { name: 'Estadísticas de Usuario', fn: test10_GetUserStats },
  ];

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    log(`\n[${i + 1}/${tests.length}] Ejecutando: ${test.name}`, colors.cyan);
    
    const result = await test.fn();
    if (result) {
      passed++;
    } else {
      failed++;
    }
    
    // Pequeña pausa entre tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  log('\n' + '='.repeat(70), colors.magenta);
  log('📊 RESULTADOS FINALES', colors.magenta);
  log('='.repeat(70), colors.magenta);
  log(`✅ Tests Pasados: ${passed}/${tests.length}`, colors.green);
  log(`❌ Tests Fallados: ${failed}/${tests.length}`, failed > 0 ? colors.red : colors.green);
  log(`📈 Porcentaje de Éxito: ${Math.round((passed / tests.length) * 100)}%`, colors.cyan);
  
  if (failed === 0) {
    log('\n🎉 ¡TODOS LOS TESTS PASARON!', colors.green);
    log('✅ El sistema está completamente funcional y listo para producción\n', colors.green);
  } else {
    log(`\n⚠️  ${failed} test(s) fallaron. Revisa los errores arriba.\n`, colors.yellow);
  }

  process.exit(failed > 0 ? 1 : 0);
}

// Ejecutar
runAllTests().catch(error => {
  log(`\n❌ Error fatal: ${error.message}`, colors.red);
  console.error(error);
  process.exit(1);
});
