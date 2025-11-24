
import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
const TEST_USER = {
    firstName: 'Test',
    lastName: 'Baremo',
    email: `test_baremo_${Date.now()}@example.com`,
    password: 'password123',
    confirmPassword: 'password123'
};

async function verifyBaremoApi() {
    try {
        console.log('🚀 Starting Baremo API Verification...');

        // 1. Register
        console.log('1️⃣  Registering test user...');
        try {
            await axios.post(`${BASE_URL}/auth/register`, TEST_USER);
            console.log('   ✅ User registered');
        } catch (error: any) {
            console.error('   ❌ Registration failed:',
                error.response?.status,
                error.response?.statusText,
                JSON.stringify(error.response?.data) || error.message
            );
            return;
        }

        // 2. Login
        console.log('2️⃣  Logging in...');
        let token = '';
        try {
            const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
                email: TEST_USER.email,
                password: TEST_USER.password
            });
            token = loginRes.data.token;
            console.log('   ✅ Login successful, token received');
        } catch (error: any) {
            console.error('   ❌ Login failed:',
                error.response?.status,
                error.response?.statusText,
                JSON.stringify(error.response?.data) || error.message
            );
            return;
        }

        const headers = { Authorization: `Bearer ${token}` };

        // 3. Get Baremo (Initial)
        console.log('3️⃣  Fetching initial Baremo...');
        try {
            const getRes = await axios.get(`${BASE_URL}/baremo`, { headers });
            console.log('   ✅ Get Baremo successful');
            // console.log('   Data:', JSON.stringify(getRes.data, null, 2));
        } catch (error: any) {
            console.error('   ❌ Get Baremo failed:',
                error.response?.status,
                error.response?.statusText,
                JSON.stringify(error.response?.data) || error.message
            );
        }

        // 4. Update Baremo
        console.log('4️⃣  Updating Baremo...');
        const baremoData = {
            ejercito: 'TIERRA',
            empleo: 'SOLDADO',
            especialidadFundamental: 'Infantería Ligera',
            fechaIngreso: '2020-01-01',
            notaMediaInformes: 8.5,
            idiomas: [
                { idioma: 'INGLES', nivel: 'SLP_2222' }
            ]
        };

        try {
            const updateRes = await axios.put(`${BASE_URL}/baremo`, baremoData, { headers });
            console.log('   ✅ Update Baremo successful');
            // console.log('   Data:', JSON.stringify(updateRes.data, null, 2));
        } catch (error: any) {
            console.error('   ❌ Update Baremo failed:',
                error.response?.status,
                error.response?.statusText,
                JSON.stringify(error.response?.data) || error.message
            );
        }

        // 5. Verify Persistence
        console.log('5️⃣  Verifying persistence...');
        try {
            const verifyRes = await axios.get(`${BASE_URL}/baremo`, { headers });
            const data = verifyRes.data; // Fixed: Access data directly
            if (data.ejercito === 'TIERRA' && data.notaMediaInformes === 8.5) {
                console.log('   ✅ Data persisted correctly');
            } else {
                console.error('   ❌ Data mismatch:', data);
            }
        } catch (error: any) {
            console.error('   ❌ Verify persistence failed:',
                error.response?.status,
                error.response?.statusText,
                JSON.stringify(error.response?.data) || error.message
            );
        }

        // 6. Check Ranking
        console.log('6️⃣  Checking Ranking...');
        try {
            const rankingRes = await axios.get(`${BASE_URL}/ranking`, { headers });
            const ranking = rankingRes.data; // Fixed: Access data directly (it's an array)
            const userInRanking = ranking.find((u: any) => u.name.includes('Test B.'));

            if (userInRanking) {
                console.log('   ✅ User found in ranking');
                console.log(`   Position: ${userInRanking.position}, Points: ${userInRanking.puntosTotal}`);
            } else {
                console.warn('   ⚠️ User not found in ranking (might be due to caching or low score)');
                // console.log('   Ranking:', ranking.slice(0, 5));
            }
        } catch (error: any) {
            console.error('   ❌ Get Ranking failed:',
                error.response?.status,
                error.response?.statusText,
                JSON.stringify(error.response?.data) || error.message
            );
        }

        console.log('🏁 Verification Complete');

    } catch (error: any) {
        console.error('❌ Unexpected error:', error.message);
    }
}

verifyBaremoApi();
