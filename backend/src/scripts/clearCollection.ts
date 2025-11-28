import { qdrantClient, COLLECTION_NAME } from '../config/qdrant';

const clear = async () => {
    try {
        console.log(`🗑️ Eliminando colección ${COLLECTION_NAME}...`);
        await qdrantClient.deleteCollection(COLLECTION_NAME);
        console.log(`✅ Colección ${COLLECTION_NAME} eliminada exitosamente.`);
    } catch (e) {
        console.error('❌ Error eliminando colección (puede que no exista):', e);
    }
};

clear();
