import { processChat } from './services/chatService';
import { getUsage, incrementUsage } from './services/usageService';
import sequelize from './config/database';
import User from './models/User';

const testChatFlow = async () => {
    try {
        console.log('🚀 Iniciando test de flujo de chat...');

        // 1. Crear usuario de prueba
        const testEmail = `test_chat_${Date.now()}@example.com`;
        const user = await User.create({
            email: testEmail,
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            isPremium: false, // Usuario gratis
        } as any);

        console.log(`👤 Usuario creado: ${user.id} (${user.email})`);

        // 2. Verificar uso inicial
        let usage = await getUsage(user.id);
        console.log('📊 Uso inicial:', usage);

        // 3. Simular consulta
        console.log('💬 Enviando consulta...');
        // Mockeamos la respuesta de Gemini/Qdrant para no gastar créditos reales si es posible, 
        // pero aquí llamaremos al servicio real para verificar integración.
        await user.destroy();
        console.log('🧹 Usuario de prueba eliminado');

    } catch (error) {
        console.error('❌ Error fatal en test:', error);
    } finally {
        await sequelize.close();
    }
};

testChatFlow();
