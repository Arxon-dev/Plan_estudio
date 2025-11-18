const axios = require('axios');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: '.env.local' });

const API_URL = 'http://localhost:3001/api';

// Token JWT generado (usar el token real generado)
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLnBlcmV6Lm1pbGxhQGdtYWlsLmNvbSIsImlhdCI6MTc2MzQ3OTkzMiwiZXhwIjoxNzY0MDg0NzMyfQ.bWq2sXYNtV2cyXY3tZvJOLfXRfBwjkpGXpUULT96ntA';

console.log('🧪 Probando conexión con el backend...');

// Prueba simple de conexión
axios.get(`${API_URL}/themes`, {
  headers: { Authorization: `Bearer ${token}` }
})
.then(response => {
  console.log('✅ Conexión exitosa!');
  console.log(`📚 Encontrados ${response.data.themes.length} temas`);
  
  const themesWithParts = response.data.themes.filter(theme => theme.parts > 1);
  console.log(`📖 Temas con partes: ${themesWithParts.length}`);
  
  themesWithParts.forEach(theme => {
    console.log(`   - ${theme.title} (${theme.parts} partes)`);
  });
})
.catch(error => {
  console.error('❌ Error de conexión:', error.response?.data || error.message);
  if (error.response?.status === 401) {
    console.log('🔑 El token puede estar expirado o ser inválido');
  }
});