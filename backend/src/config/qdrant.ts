import { QdrantClient } from '@qdrant/js-client-rest';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

const QDRANT_HOST = process.env.QDRANT_HOST || 'localhost';
const QDRANT_PORT = Number(process.env.QDRANT_PORT) || 6333;
const QDRANT_API_KEY = process.env.QDRANT_API_KEY;

console.log(`🔌 Conectando a Qdrant en ${QDRANT_HOST}:${QDRANT_PORT}`);

// Debug: Verificar resolución DNS
dns.lookup(QDRANT_HOST, (err, address, family) => {
    if (err) {
        console.error(`❌ Error resolviendo DNS para ${QDRANT_HOST}:`, err);
    } else {
        console.log(`🔍 Resolución DNS para ${QDRANT_HOST}: ${address} (Familia: IPv${family})`);
    }
});

export const qdrantClient = new QdrantClient({
    host: QDRANT_HOST,
    port: QDRANT_PORT,
    apiKey: QDRANT_API_KEY,
    https: QDRANT_PORT === 443,
});

export const COLLECTION_NAME = 'documentos_defensa';

// Función para verificar conexión
export const checkQdrantConnection = async (): Promise<boolean> => {
    try {
        const result = await qdrantClient.getCollections();
        console.log('✅ Conexión a Qdrant exitosa. Colecciones:', result.collections.map(c => c.name));
        return true;
    } catch (error) {
        console.error('❌ Error conectando a Qdrant:', error);
        return false;
    }
};
