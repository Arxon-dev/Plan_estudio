import { generateEmbedding, chatModel } from '../config/gemini';
import { qdrantClient, COLLECTION_NAME } from '../config/qdrant';
import { incrementUsage } from './usageService';

interface ChatResponse {
    response: string;
    sources: Array<{
        documento: string;
        texto: string;
        score: number;
    }>;
}

export const processChat = async (userId: number, message: string): Promise<ChatResponse> => {
    try {
        // 1. Generar embedding de la pregunta
        const embedding = await generateEmbedding(message);

        // 2. Buscar en Qdrant
        let searchResult: any[] = [];
        try {
            searchResult = await qdrantClient.search(COLLECTION_NAME, {
                vector: embedding,
                limit: 5,
                with_payload: true,
            });
        } catch (error) {
            console.error('❌ Error buscando en Qdrant:', error);
            // Si falla Qdrant, podemos decidir si fallar o intentar responder sin contexto (pero el requerimiento es estricto)
            throw new Error('El servicio de búsqueda de documentos no está disponible en este momento.');
        }

        // 3. Construir contexto
        const context = searchResult
            .map((item: any) => `Documento: ${item.payload.documento}\nContenido: ${item.payload.text}`)
            .join('\n\n');

        // 4. Construir prompt
        const prompt = `
Eres un asistente especializado en normativa militar española y de defensa.
Responde ÚNICAMENTE basándote en los documentos proporcionados a continuación.
Si la información no está en los documentos, indica claramente que no tienes esa información en tu base de conocimiento.

Contexto de documentos relevantes:
${context}

Pregunta del usuario:
${message}

Instrucciones:
- Sé preciso y cita el documento cuando sea relevante.
- Si no encuentras la respuesta en el contexto, dilo claramente.
- Usa lenguaje profesional pero accesible para estudiantes.
- Formatea la respuesta en Markdown.
`;

        // 5. Consultar a Gemini
        const result = await chatModel.generateContent(prompt);
        const response = result.response.text();

        // 6. Registrar uso (solo si fue exitoso)
        await incrementUsage(userId);

        // 7. Formatear fuentes
        const sources = searchResult.map((item: any) => ({
            documento: item.payload.documento,
            texto: (item.payload?.text || '').substring(0, 150) + '...', // Preview del texto
            score: item.score,
        }));

        return {
            response,
            sources,
        };

    } catch (error) {
        console.error('Error en processChat:', error);
        throw error;
    }
};
