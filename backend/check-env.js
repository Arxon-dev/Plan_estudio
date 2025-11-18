require('dotenv').config({ path: '.env.local' });

console.log('🔍 Verificando variables de entorno:');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? '✅ Configurado' : '❌ No encontrado');
console.log('PORT:', process.env.PORT);
console.log('DB_HOST:', process.env.DB_HOST);

// Verificar que el JWT_SECRET coincida con el usado para generar el token
const jwt = require('jsonwebtoken');
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLnBlcmV6Lm1pbGxhQGdtYWlsLmNvbSIsImlhdCI6MTc2MzQ3OTc5OCwiZXhwIjoxNzY0MDg0NTk4fQ.YCseWWOR-lQU3YEi2w54LiaOx9Bu0if6PoYhChtH5OU';

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET || '');
  console.log('✅ Token válido con este JWT_SECRET');
  console.log('📋 Decoded:', decoded);
} catch (error) {
  console.log('❌ Token inválido con este JWT_SECRET');
  console.log('Error:', error.message);
}