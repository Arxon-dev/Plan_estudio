const axios = require('axios');

async function testLogin() {
    try {
        console.log('🔐 Probando login con test2@example.com...\n');

        const response = await axios.post('http://localhost:3000/api/auth/login', {
            email: 'test2@example.com',
            password: '..001122..'
        });

        console.log('✅ Login exitoso!\n');
        console.log('📦 Datos del usuario devueltos:');
        console.log(JSON.stringify(response.data.user, null, 2));

        console.log('\n🔍 Verificando campos premium:');
        console.log(`  isPremium: ${response.data.user.isPremium ? '✅ true' : '❌ false o undefined'}`);
        console.log(`  stripeCustomerId: ${response.data.user.stripeCustomerId || '❌ undefined'}`);
        console.log(`  subscriptionStatus: ${response.data.user.subscriptionStatus || '❌ undefined'}`);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
    }
}

testLogin();
