const { spawn } = require('child_process');

console.log('📺 Monitor de logs del servidor backend');
console.log('=====================================');
console.log('Este script mostrará los logs en tiempo real mientras se crea el plan.');
console.log('Los mensajes importantes a buscar son:');
console.log('  - ✅ Plan viable / ❌ Plan no viable');
console.log('  - 🔄 Distribución de tareas');
console.log('  - 📅 Procesando semana X con Y sesiones');
console.log('  - ❌ Errores de generación');
console.log('  - 📅 Primera/última sesión');
console.log('');

// Función para obtener logs del servidor
function monitorLogs() {
  console.log('🔍 Monitoreando logs del servidor...');
  
  // Intentar leer el log del proceso actual
  const tail = spawn('tail', ['-f', 'server.log'], { cwd: __dirname });
  
  tail.stdout.on('data', (data) => {
    console.log('📄 LOG:', data.toString());
  });
  
  tail.stderr.on('data', (data) => {
    console.log('⚠️ ERROR:', data.toString());
  });
  
  tail.on('close', (code) => {
    console.log(`📴 Monitor cerrado con código ${code}`);
  });
  
  // También monitorear la consola actual
  console.log('💡 Los logs también aparecerán en la consola donde ejecutaste "npm run dev"');
  console.log('💡 Mientras tanto, ejecuta el script test-session-creation.js con tu token');
}

// Ejecutar monitor
monitorLogs();

// Mantener el script activo
process.on('SIGINT', () => {
  console.log('\n🛑 Monitor detenido por el usuario');
  process.exit(0);
});