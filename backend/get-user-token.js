const { User } = require('./dist/models/User');
const jwt = require('jsonwebtoken');

async function getUserToken() {
  try {
    // Buscar el primer usuario
    const user = await User.findOne();
    
    if (!user) {
      console.log('❌ No hay usuarios en la base de datos');
      return;
    }
    
    console.log('✅ Usuario encontrado:', {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    });
    
    // Generar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      'tu_clave_secreta_super_segura_para_el_desarrollo_de_la_aplicacion',
      { expiresIn: '7d' }
    );
    
    console.log('\n🔑 Token JWT generado:');
    console.log(token);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

getUserToken();