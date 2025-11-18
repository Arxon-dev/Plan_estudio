const axios = require('axios');

async function checkExistingThemes() {
  try {
    console.log('📚 Verificando temas existentes...');
    
    // Obtener todos los temas
    const response = await axios.get('http://localhost:3000/api/themes', {
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTYsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsImlhdCI6MTc2MzM5ODE4MiwiZXhwIjoxNzY0MDAyOTgyfQ.7oTazOWeJdXUZeJm6mbwkk1U9nFrKCfcm546UVQXq2s'
      }
    });
    
    console.log(`📊 Total de temas en BD: ${response.data.themes.length}`);
    
    console.log('\n📋 Temas disponibles:');
    response.data.themes.forEach(theme => {
      console.log(`ID: ${theme.id} | ${theme.block}-${theme.themeNumber} | ${theme.complexity} | ${theme.title.substring(0, 50)}...`);
    });
    
    // Verificar qué themeIds de las sesiones existen en la BD
    const sessionThemeIds = [1, 2, 3, 4, 5, 6]; // De las sesiones
    const existingThemeIds = response.data.themes.map(t => t.id);
    
    console.log('\n🎯 Verificación de themeIds:');
    sessionThemeIds.forEach(id => {
      const exists = existingThemeIds.includes(id);
      console.log(`Tema ID ${id}: ${exists ? '✅ Existe' : '❌ No existe'}`);
    });
    
    // Mostrar qué themeIds sí existen
    console.log('\n📋 ThemeIds existentes en BD:', existingThemeIds.join(', '));
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

checkExistingThemes();