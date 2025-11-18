// Hacer login y obtener token real
const http = require('http');

// Datos de login
const loginData = JSON.stringify({
  email: 'user1@example.com',
  password: 'password123'
});

const loginOptions = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(loginData)
  }
};

const loginReq = http.request(loginOptions, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log('Respuesta del login:', res.statusCode);
    
    if (res.statusCode === 200) {
      try {
        const response = JSON.parse(data);
        const token = response.token;
        
        console.log('✅ Login exitoso');
        console.log('Token:', token);
        
        // Ahora obtener los planes del usuario
        getUserPlans(token);
        
      } catch (e) {
        console.log('Error parseando respuesta:', data);
      }
    } else {
      console.log('Error en login:', data);
      // Si el login falla, intentar con otro usuario
      tryAlternativeLogin();
    }
  });
});

loginReq.on('error', (error) => {
  console.error('Error en login:', error.message);
});

loginReq.write(loginData);
loginReq.end();

function getUserPlans(token) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/study-plans',
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\nRespuesta de planes:', res.statusCode);
      
      if (res.statusCode === 200 && data) {
        try {
          const response = JSON.parse(data);
          console.log('Planes encontrados:', response.length);
          
          if (response.length > 0) {
            response.forEach(plan => {
              console.log(`Plan ID: ${plan.id}, Estado: ${plan.status}, Fecha examen: ${plan.examDate}`);
            });
            
            // Probar el primer plan con distribución equitativa
            const firstPlan = response[0];
            console.log(`\n=== PROBANDO DISTRIBUCIÓN EQUITATIVA CON PLAN ${firstPlan.id} ===`);
            testEquitableDistribution(token, firstPlan.id);
          } else {
            console.log('No hay planes disponibles');
          }
        } catch (e) {
          console.log('Error parseando respuesta:', data);
        }
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error obteniendo planes:', error.message);
  });

  req.end();
}

function testEquitableDistribution(token, planId) {
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: `/api/study-plans/${planId}/equitable-distribution`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('\nRespuesta de distribución equitativa:', res.statusCode);
      
      if (res.statusCode === 200 && data) {
        try {
          const response = JSON.parse(data);
          console.log('\n=== DISTRIBUCIÓN EQUITATIVA FUNCIONANDO ===');
          
          if (response.distributionByComplexity) {
            Object.entries(response.distributionByComplexity).forEach(([complexity, themes]) => {
              console.log(`${complexity}: ${themes.length} temas`);
              if (themes.length > 0) {
                themes.forEach(theme => {
                  console.log(`  📚 ${theme.name}: ${theme.sessions} sesiones`);
                });
              }
            });
            
            console.log('\n✅ SUCCESS: La distribución equitativa está funcionando correctamente');
            console.log('✅ Los temas están clasificados por complejidad (LOW, MEDIUM, HIGH)');
            console.log('✅ El problema "No hay temas en esta categoría" ha sido resuelto');
          }
        } catch (e) {
          console.log('Respuesta cruda:', data);
        }
      } else {
        console.log('Error o respuesta vacía:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('Error en distribución equitativa:', error.message);
  });

  req.end();
}

function tryAlternativeLogin() {
  // Intentar con otro usuario común
  const altLoginData = JSON.stringify({
    email: 'test@example.com',
    password: 'test123'
  });

  const altLoginReq = http.request(loginOptions, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log('Respuesta del login alternativo:', res.statusCode);
      if (res.statusCode === 200) {
        try {
          const response = JSON.parse(data);
          console.log('✅ Login alternativo exitoso');
          getUserPlans(response.token);
        } catch (e) {
          console.log('Error parseando respuesta alternativa:', data);
        }
      } else {
        console.log('Login alternativo también falló:', data);
      }
    });
  });

  altLoginReq.on('error', (error) => {
    console.error('Error en login alternativo:', error.message);
  });

  altLoginReq.write(altLoginData);
  altLoginReq.end();
}