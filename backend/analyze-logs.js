// Script para analizar logs del servidor y encontrar errores en creación de sesiones
const fs = require('fs');
const path = require('path');

console.log('🔍 Analizador de logs - Búsqueda de errores en creación de sesiones');
console.log('=====================================================================');

// Funciones de búsqueda de patrones
function findErrorsInLogs(logContent) {
  const errors = [];
  const lines = logContent.split('\n');
  
  lines.forEach((line, index) => {
    // Buscar errores específicos
    if (line.includes('❌') || line.includes('Error') || line.includes('error')) {
      errors.push({
        line: index + 1,
        content: line.trim(),
        type: 'ERROR'
      });
    }
    
    // Buscar advertencias
    if (line.includes('⚠️') || line.includes('Warning') || line.includes('warning')) {
      errors.push({
        line: index + 1,
        content: line.trim(),
        type: 'WARNING'
      });
    }
    
    // Buscar mensajes de generación
    if (line.includes('Generación') || line.includes('generación') || line.includes('generate')) {
      errors.push({
        line: index + 1,
        content: line.trim(),
        type: 'GENERATION'
      });
    }
    
    // Buscar problemas con sesiones
    if (line.includes('sesiones') || line.includes('sessions') || line.includes('StudyPlanService')) {
      errors.push({
        line: index + 1,
        content: line.trim(),
        type: 'SESSION'
      });
    }
    
    // Buscar problemas con horarios
    if (line.includes('horas') || line.includes('horario') || line.includes('weekly')) {
      errors.push({
        line: index + 1,
        content: line.trim(),
        type: 'SCHEDULE'
      });
    }
  });
  
  return errors;
}

// Función para analizar logs recientes
function analyzeRecentLogs() {
  const logFiles = [
    'server.log',
    'app.log',
    'error.log',
    'debug.log'
  ];
  
  console.log('📂 Buscando archivos de log...');
  
  logFiles.forEach(logFile => {
    const logPath = path.join(__dirname, logFile);
    
    if (fs.existsSync(logPath)) {
      console.log(`\n📄 Analizando: ${logFile}`);
      
      try {
        const content = fs.readFileSync(logPath, 'utf8');
        const errors = findErrorsInLogs(content);
        
        if (errors.length > 0) {
          console.log(`   Encontrados ${errors.length} mensajes relevantes:`);
          
          // Agrupar por tipo
          const grouped = {};
          errors.forEach(error => {
            if (!grouped[error.type]) grouped[error.type] = [];
            grouped[error.type].push(error);
          });
          
          Object.entries(grouped).forEach(([type, items]) => {
            console.log(`   \n   ${type}: ${items.length} mensajes`);
            items.slice(0, 5).forEach(item => {
              console.log(`      Línea ${item.line}: ${item.content}`);
            });
            if (items.length > 5) {
              console.log(`      ... y ${items.length - 5} más`);
            }
          });
        } else {
          console.log('   ✅ No se encontraron errores relevantes');
        }
      } catch (error) {
        console.log(`   ❌ Error al leer archivo: ${error.message}`);
      }
    } else {
      console.log(`   ⚠️ Archivo no encontrado: ${logFile}`);
    }
  });
}

// Función para crear un log de prueba si no existe
function createTestLog() {
  const testLogPath = path.join(__dirname, 'server.log');
  
  if (!fs.existsSync(testLogPath)) {
    console.log('📄 Creando log de prueba...');
    
    const testLogContent = `2025-01-18 10:00:00 [INFO] Servidor iniciado en puerto 3000
2025-01-18 10:01:00 [INFO] Conexión a base de datos establecida
2025-01-18 10:02:00 [INFO] Usuario 15 intentando crear plan
2025-01-18 10:02:01 [INFO] ✅ Plan viable: 12h/semana, 5 temas, 294 días disponibles
2025-01-18 10:02:02 [INFO] 🔄 Iniciando generación con ROTACIÓN DE TEMAS
2025-01-18 10:02:03 [INFO] 📊 DISTRIBUCIÓN DE TAREAS: study=5, review=20, test=15
2025-01-18 10:02:04 [INFO] 📅 Procesando semana 1 con 40 sesiones
2025-01-18 10:02:05 [ERROR] ❌ Error al crear sesión: Horas insuficientes en el día
2025-01-18 10:02:06 [WARNING] ⚠️ Buffer de 30 días activo - sesiones terminan el 22/09/2026
2025-01-18 10:02:07 [INFO] 📅 Primera sesión: 2025-01-02 - STUDY
2025-01-18 10:02:08 [INFO] 📅 Última sesión: 2025-09-22 - REVIEW
2025-01-18 10:02:09 [ERROR] ❌ Generación fallida: No se pudieron crear todas las sesiones
`;
    
    fs.writeFileSync(testLogPath, testLogContent);
    console.log('✅ Log de prueba creado');
  }
}

// Ejecutar análisis
console.log('');
createTestLog();
analyzeRecentLogs();

console.log('\n💡 Consejos para encontrar más información:');
console.log('   1. Ejecuta el servidor con: npm run dev');
console.log('   2. Intenta crear un plan desde el frontend');
console.log('   3. Observa la consola donde corre el servidor');
console.log('   4. Busca mensajes como:');
console.log('      - ✅ Plan viable / ❌ Plan no viable');
console.log('      - 🔄 Distribución de tareas');
console.log('      - 📅 Procesando semana X con Y sesiones');
console.log('      - ❌ Error al crear sesión');
console.log('      - 📅 Primera/última sesión');