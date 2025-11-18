require('dotenv').config({ path: '.env.local' });
const jwt = require('jsonwebtoken');

// Generar un token JWT válido para el usuario 15
const payload = { 
  id: 15, 
  email: 'carlos.perez.milla@gmail.com',
  iat: Math.floor(Date.now() / 1000)
};

const token = jwt.sign(
  payload,
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);

console.log('🔑 Token JWT generado:', token);
console.log('✅ Token válido por 7 días');
console.log('📋 Payload:', JSON.stringify(payload, null, 2));