const { User } = require('./dist/models');
const jwt = require('jsonwebtoken');

async function generateTestToken() {
  try {
    // Buscar un usuario existente
    const user = await User.findOne({ where: { email: 'carlos.perez.milla@gmail.com' } });
    
    if (!user) {
      console.log('❌ Usuario no encontrado');
      return;
    }
    
    console.log('✅ Usuario encontrado:', user.email);
    console.log('🆔 User ID:', user.id);
    
    // Generar un token JWT válido
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email 
      },
      process.env.JWT_SECRET || 'tu_secreto_jwt_aqui',
      { expiresIn: '7d' }
    );
    
    console.log('🔑 Token generado:', token);
    console.log('✅ Token válido por 7 días');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

generateTestToken();