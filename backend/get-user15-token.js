const { User } = require('./dist/models/index');
const jwt = require('jsonwebtoken');

async function getRealToken() {
  try {
    // Buscar el usuario con ID 15
    const user = await User.findByPk(15);
    
    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('Usuario encontrado:', user.email);
    
    // Generar token con el JWT_SECRET del archivo .env
    const JWT_SECRET = process.env.JWT_SECRET || 'tu_secreto_jwt_super_seguro_2024';
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        role: user.role 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    console.log('Token JWT válido:');
    console.log(token);
    
    // Guardar en archivo para usar en otros scripts
    require('fs').writeFileSync('user15-token.txt', token);
    console.log('Token guardado en user15-token.txt');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

getRealToken();