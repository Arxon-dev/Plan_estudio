const fetch = require('node-fetch'); // Or native fetch if Node 18+

const BASE_URL = 'http://localhost:3000/api';

async function runTest() {
    try {
        console.log('🚀 Iniciando prueba de Custom Blocks...');

        // 1. Registrar usuario
        const email = `test_${Date.now()}@example.com`;
        const password = 'password123';
        console.log(`👤 Registrando usuario: ${email}`);

        const registerRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, firstName: 'Test', lastName: 'User' })
        });

        if (!registerRes.ok) {
            const err = await registerRes.text();
            // Si ya existe, intentamos login
            if (registerRes.status !== 409) {
                throw new Error(`Error registro: ${err}`);
            }
            console.log('Usuario ya existe, procediendo a login...');
        }

        // 2. Login
        console.log('🔑 Iniciando sesión...');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!loginRes.ok) throw new Error(`Error login: ${await loginRes.text()}`);
        const { token } = await loginRes.json();
        console.log('✅ Login exitoso');

        // 3. Crear Plan Custom Blocks (Válido)
        console.log('📅 Creando plan Custom Blocks válido...');
        const validPayload = {
            startDate: '2025-01-01',
            examDate: '2025-06-01',
            totalHours: 28, // 4h/day * 7
            blocksConfig: [
                {
                    blockNumber: 1,
                    startDate: '2025-01-01',
                    endDate: '2025-01-30',
                    weeklyPattern: {
                        monday: { totalMinutes: 240, activities: [{ themeId: 1, type: 'study', duration: 120 }, { themeId: 2, type: 'review', duration: 120 }] },
                        tuesday: { totalMinutes: 240, activities: [] },
                        wednesday: { totalMinutes: 240, activities: [] },
                        thursday: { totalMinutes: 240, activities: [] },
                        friday: { totalMinutes: 240, activities: [] },
                        saturday: { totalMinutes: 240, activities: [] },
                        sunday: { totalMinutes: 0, activities: [] }
                    }
                }
            ]
        };

        const createRes = await fetch(`${BASE_URL}/study-plans/custom-blocks/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validPayload)
        });

        if (!createRes.ok) {
            throw new Error(`Error creando plan: ${await createRes.text()}`);
        }

        const planData = await createRes.json();
        console.log('✅ Plan creado exitosamente:', planData.message);
        console.log(`   ID del Plan: ${planData.plan.id}`);
        console.log(`   Sesiones generadas: ${planData.sessionsCount}`);

        // 4. Probar Validación (Inválido - Exceso de horas)
        console.log('🧪 Probando validación (Exceso de horas)...');
        const invalidPayload = {
            ...validPayload,
            blocksConfig: [
                {
                    ...validPayload.blocksConfig[0],
                    weeklyPattern: {
                        ...validPayload.blocksConfig[0].weeklyPattern,
                        monday: {
                            totalMinutes: 300, // > 240 (4h)
                            activities: [{ themeId: 1, type: 'study', duration: 300 }]
                        }
                    }
                }
            ]
        };

        const invalidRes = await fetch(`${BASE_URL}/study-plans/custom-blocks/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(invalidPayload)
        });

        if (invalidRes.status === 400) {
            const errorData = await invalidRes.json();
            console.log('✅ Validación correcta. Error recibido:', errorData.error);
        } else {
            console.error('❌ Falló la validación. Status:', invalidRes.status);
        }

    } catch (error) {
        console.error('❌ Error en el test:', error.message);
    }
}

runTest();
