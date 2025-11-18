const axios = require('axios');

// Probar sin autenticación primero
console.log('🧪 Probando conexión sin autenticación...');

axios.get('http://localhost:3001/api/themes')
.then(response => {
  console.log('✅ Conexión exitosa sin auth!');
  console.log(`📚 Encontrados ${response.data.themes.length} temas`);
})
.catch(error => {
  console.log('❌ Error sin auth:', error.response?.status, error.response?.data?.error);
  
  // Ahora probar con un endpoint que no requiera auth
  console.log('\n🧪 Probando endpoint de health check...');
  return axios.get('http://localhost:3001/api/health');
})
.then(response => {
  console.log('✅ Health check exitoso!');
})
.catch(error => {
  console.log('❌ Health check falló:', error.message);
});