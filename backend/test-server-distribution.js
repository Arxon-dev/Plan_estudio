// Script para probar la distribución equitativa usando el servidor backend
const { spawn } = require('child_process');
const http = require('http');

let serverProcess;

function startServer() {
  return new Promise((resolve, reject) => {
    console.log('Iniciando servidor backend...');
    
    // Iniciar el servidor backend
    serverProcess = spawn('npm', ['run', 'dev'], { 
      cwd: __dirname,
      stdio: 'pipe'
    });

    let serverStarted = false;

    serverProcess.stdout.on('data', (data) => {
      const output = data.toString();
      console.log('Servidor:', output.trim());
      
      // Verificar si el servidor está listo
      if (output.includes('Servidor corriendo') || output.includes('Server running')) {
        if (!serverStarted) {
          serverStarted = true;
          console.log('✅ Servidor iniciado correctamente');
          resolve();
        }
      }
    });

    serverProcess.stderr.on('data', (data) => {
      console.error('Error servidor:', data.toString().trim());
    });

    serverProcess.on('error', (error) => {
      console.error('Error iniciando servidor:', error);
      reject(error);
    });

    // Esperar 5 segundos máximo para que el servidor inicie
    setTimeout(() => {
      if (!serverStarted) {
        console.log('⏰ Timeout esperando servidor, continuando...');
        resolve();
      }
    }, 5000);
  });
}

function makeRequest() {
  return new Promise((resolve, reject) => {
    console.log('Realizando petición de prueba...');
    
    // Hacer una petición simple al endpoint de distribución equitativa
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/study-plans/94/equitable-distribution',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('Respuesta del servidor:', res.statusCode);
        if (data) {
          try {
            const response = JSON.parse(data);
            console.log('Datos recibidos:', JSON.stringify(response, null, 2));
            
            if (response.distributionByComplexity) {
              console.log('\n=== DISTRIBUCIÓN POR COMPLEJIDAD ===');
              Object.entries(response.distributionByComplexity).forEach(([complexity, themes]) => {
                console.log(\`\\n\${complexity} (\${themes.length} temas):\`);
                themes.forEach((theme: any) => {
                  console.log(\`  📚 \${theme.name}: \${theme.sessions} sesiones\`);
                });
              });
            }
            
          } catch (e) {
            console.log('Respuesta cruda:', data);
          }
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('Error en la petición:', error.message);
      resolve(); // No rechazar para continuar con el proceso
    });

    req.end();
  });
}

async function testEquitableDistribution() {
  try {
    await startServer();
    
    // Esperar un poco más para asegurar que el servidor esté listo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    await makeRequest();
    
  } catch (error) {
    console.error('Error en el test:', error);
  } finally {
    // Detener el servidor
    if (serverProcess) {
      console.log('Deteniendo servidor...');
      serverProcess.kill();
    }
    
    console.log('\n=== TEST COMPLETADO ===');
    console.log('Si el servidor respondió con datos de distribución, la funcionalidad está funcionando.');
    console.log('Si hubo error de autenticación, es normal - el endpoint necesita token JWT.');
  }
}

testEquitableDistribution();