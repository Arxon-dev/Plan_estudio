import { GoogleGenerativeAI } from '@google/generative-ai';
import { qdrantClient, COLLECTION_NAME } from '../config/qdrant';
import { getChatModel, generateEmbedding } from '../config/gemini';
import { extractJSON, extractMermaidCode } from '../utils/aiParsers';
import { createSummaryPDF } from '../utils/pdfGenerator';
import { buildPrompt, RequestType } from '../prompts/promptTemplates';
import { IntentDetector } from './intentDetector';

interface ChatResponse {
    response: string;
    sources: Array<{
        documento: string;
        texto: string;
        score: number;
    }>;
    type?: string;
}

// --- Helper: Buscar contexto ---
async function getContext(query: string, limit: number = 5, filter?: any): Promise<string> {
    const embedding = await generateEmbedding(query);
    try {
        const searchParams: any = {
            vector: embedding,
            limit: limit,
            with_payload: true,
        };

        if (filter && (filter.must || filter.should)) {
            searchParams.filter = filter;
        }

        const searchResult = await qdrantClient.search(COLLECTION_NAME, searchParams);

        return searchResult
            .map((item: any) => `Documento: ${item.payload.documento} (Bloque ${item.payload.bloque}, Tema ${item.payload.tema})\nContenido: ${item.payload.text}`)
            .join('\n\n');
    } catch (error) {
        console.error('❌ Error buscando en Qdrant:', error);
        return '';
    }
}

function sanitizeOutlineResponse(response: string, type: string): string {
    if (type !== 'outline') {
        return response;
    }

    // Eliminar bloques de código que puedan contener diagramas
    let cleaned = response.replace(/```[\s\S]*?```/g, '');

    // Eliminar tags HTML/SVG
    cleaned = cleaned.replace(/<[^>]*>/g, '');

    // Eliminar sintaxis de Mermaid
    if (cleaned.includes('graph') || cleaned.includes('flowchart')) {
        console.warn('[SANITIZE] Detectado intento de diagrama Mermaid, limpiando...');
        cleaned = cleaned.split('\n')
            .filter(line => !line.includes('-->') && !line.includes('graph'))
            .join('\n');
    }

    return cleaned;
}

// --- Obtener Documentos Disponibles ---
export async function getAvailableDocuments(): Promise<{ bloque: string; temas: { id: string; title: string; isPart?: boolean; parentId?: string }[] }[]> {
    try {
        const points = await qdrantClient.scroll(COLLECTION_NAME, {
            limit: 10000,
            with_payload: true,
        });

        // Map<Bloque, Map<TemaID, Set<DocumentoTitulo>>>
        const blocksMap = new Map<string, Map<string, Set<string>>>();

        for (const point of points.points) {
            const p = point.payload;
            if (p && p.bloque && p.tema) {
                const bloque = String(p.bloque);
                const tema = String(p.tema);
                // Usamos el documento como título si existe, si no el tema
                // Limpiamos extensión .txt si existe
                let documento = p.documento ? String(p.documento) : tema;
                documento = documento.replace(/\.txt$/i, '');

                if (!blocksMap.has(bloque)) {
                    blocksMap.set(bloque, new Map());
                }

                if (!blocksMap.get(bloque)!.has(tema)) {
                    blocksMap.get(bloque)!.set(tema, new Set());
                }
                
                blocksMap.get(bloque)!.get(tema)!.add(documento);
            }
        }

        const result: { bloque: string; temas: { id: string; title: string; isPart?: boolean; parentId?: string }[] }[] = [];

        const sortedBlocks = Array.from(blocksMap.keys()).sort();

        for (const bloque of sortedBlocks) {
            const temasMap = blocksMap.get(bloque)!;
            const temas: { id: string; title: string; isPart?: boolean; parentId?: string }[] = [];

            for (const [id, titlesSet] of temasMap.entries()) {
                const titles = Array.from(titlesSet).sort();
                
                // Si hay más de un título (partes) o el título indica explícitamente que es una parte
                if (titles.length > 1 || titles.some(t => t.toLowerCase().includes('parte'))) {
                    // Agregamos cada parte como un "tema" individual en la lista
                    titles.forEach((title, index) => {
                        // Intentar extraer "Parte X" para el ID único
                        const partMatch = title.match(/Parte\s+(\d+)/i);
                        const partNum = partMatch ? partMatch[1] : (index + 1).toString();
                        
                        temas.push({
                            id: `${id}_part_${partNum}`, // ID único compuesto: Tema_6_part_1
                            title: title,
                            isPart: true,
                            parentId: id // Referencia al tema padre (Tema_6) por si se necesita agrupar
                        });
                    });
                } else {
                    // Caso normal: un solo documento/tema
                    temas.push({ 
                        id, 
                        title: titles[0] 
                    });
                }
            }

            // Ordenar temas alfanuméricamente, manejando las partes correctamente
            temas.sort((a, b) => {
                // Extraer número de tema base (ej: "Tema_6" -> 6)
                const getNum = (str: string) => {
                    const match = str.match(/Tema_(\d+)/);
                    return match ? parseInt(match[1]) : 0;
                };
                
                const numA = getNum(a.parentId || a.id);
                const numB = getNum(b.parentId || b.id);

                if (numA !== numB) return numA - numB;

                // Si son del mismo tema, ordenar por ID (que incluye la parte)
                return a.id.localeCompare(b.id, undefined, { numeric: true });
            });

            result.push({ bloque, temas });
        }

        console.log(`[getAvailableDocuments] Found ${result.length} blocks`);
        return result;

    } catch (error) {
        console.error('Error fetching documents from Qdrant:', error);
        return [];
    }
}

// --- Helper: Reparar tablas Markdown ---
function repairMarkdownTables(text: string): string {
    if (!text) return text;

    // Estrategia agresiva para separar filas pegadas
    // Reemplaza "| |" o "||" por "|\n|"
    // Esto asume que los espacios entre pipes son separadores de fila cuando faltan los saltos de línea
    let processed = text.replace(/\|\s*\|/g, (match) => {
        // Si es una línea de separación (ej: |---|), no la tocamos aquí si está aislada, 
        // pero si está pegada a algo, el regex capturará los pipes de unión.
        return '|\n|';
    });

    // Asegurar que la línea de separación de encabezados tenga saltos de línea
    // Busca patrones como: |\n|---|---|...|\n|
    // A veces el reemplazo anterior deja cosas como: ...Header|\n|---|...
    // Queremos asegurar que |---| tenga \n antes y después.
    // Buscamos el patrón de guiones
    processed = processed.replace(/([^\n])(\|\s*:?-{3,}:?.*\|)([^\n])/g, '$1\n$2\n$3');

    return processed;
}

// --- Chat Principal ---
export const processChat = async (
    userId: number,
    message: string,
    simplifiedMode: boolean = false,
    explicitContext?: { bloque?: string, tema?: string }[]
): Promise<ChatResponse> => {
    try {
        // 1. Determinar filtro de contexto
        let filter: any = null;
        let isListingRequest = false;

        // A. Contexto explícito (seleccionado en UI)
        if (explicitContext && explicitContext.length > 0) {
            filter = IntentDetector.buildQdrantFilter(explicitContext);
        }
        // B. Contexto implícito (detectado en mensaje)
        else {
            const detected = IntentDetector.detectContext(message);
            if (detected) {
                if (detected.explicit) {
                    filter = IntentDetector.buildQdrantFilter([{ bloque: detected.bloque, tema: detected.tema }]);
                }
                if (detected.listing) {
                    isListingRequest = true;
                }
            }
        }

        // 2. Generar embedding y buscar en Qdrant con filtro
        const embedding = await generateEmbedding(message);
        let searchResult: any[] = [];
        let context = '';

        if (isListingRequest) {
            // Si pide listar temas, inyectamos la estructura completa
            const allDocs = await getAvailableDocuments();
            const structure = allDocs.map(b => `Bloque ${b.bloque}:\n${b.temas.map(t => `  - ${t.title}`).join('\n')}`).join('\n\n');
            context = `El usuario quiere saber qué temas están disponibles. Aquí tienes la lista COMPLETA de documentos indexados en el sistema:\n\n${structure}\n\nUsa esta lista para responder qué temas hay disponibles. Muestra el nombre completo de cada tema.`;

            // Hacemos una búsqueda mínima para no romper el flujo, pero el contexto principal es la lista
            try {
                const searchParams: any = {
                    vector: embedding,
                    limit: 3, // Limitamos búsqueda vectorial si es listado
                    with_payload: true,
                };
                searchResult = await qdrantClient.search(COLLECTION_NAME, searchParams);
            } catch (e) {
                console.warn('Error en búsqueda auxiliar para listado (ignorable):', e);
            }

        } else {
            // Búsqueda normal con límite aumentado
            try {
                const searchParams: any = {
                    vector: embedding,
                    limit: 10, // AUMENTADO DE 5 A 10
                    with_payload: true,
                };

                if (filter) {
                    searchParams.filter = filter;
                }

                searchResult = await qdrantClient.search(COLLECTION_NAME, searchParams);

                // Construir contexto normal
                context = searchResult
                    .map((item: any) => `Documento: ${item.payload.documento}\nContenido: ${item.payload.text}`)
                    .join('\n\n');

            } catch (error) {
                console.error('❌ Error buscando en Qdrant:', error);
                throw new Error('El servicio de búsqueda de documentos no está disponible en este momento.');
            }
        }

        // 3. Construir prompt especializado
        const { prompt, type } = buildPrompt(message, searchResult, context);

        console.log('=== DEBUG CHAT SERVICE ===');
        console.log('Tipo detectado:', type);
        console.log('Primeras 500 chars del prompt:');
        console.log(prompt.substring(0, 500));
        console.log('========================');

        // 4. Consultar a Gemini
        const tokenLimits: Record<string, number> = {
            summary: 8192,
            outline: 4096,
            flashcards: 4096,
            comparison: 4096,
            diagram: 4096,
            general: 1024
        };

        const maxTokens = tokenLimits[type] || 2048;
        console.log(`[ChatService] Usando ${maxTokens} tokens para tipo: ${type}`);

        const dynamicModel = getChatModel({ maxOutputTokens: maxTokens });
        const result = await dynamicModel.generateContent(prompt);
        const response = result.response;
        const geminiResponse = response.text();

        console.log('=== RESPUESTA DE GEMINI ===');
        console.log('Longitud:', geminiResponse.length);
        console.log('Finish reason:', response.candidates?.[0]?.finishReason);
        if (response.candidates?.[0]?.finishReason === 'MAX_TOKENS') {
            console.warn('⚠️ RESPUESTA TRUNCADA - Aumentar maxOutputTokens');
        }

        let sanitizedResponse = sanitizeOutlineResponse(geminiResponse, type);
        
        // Reparar tablas si el modelo las devolvió compactadas (sin saltos de línea)
        if (type === 'summary' || type === 'comparison' || type === 'general') {
            sanitizedResponse = repairMarkdownTables(sanitizedResponse);
        }

        // 5. Registrar uso (asumiendo que existe la función incrementUsage, si no, comentar)
        // await incrementUsage(userId); 
        
        // 6. Formatear fuentes
        const sources = searchResult.map((item: any) => ({
            documento: item.payload.documento,
            texto: (item.payload?.text || '').substring(0, 150) + '...',
            score: item.score,
        }));

        return { response: sanitizedResponse, sources, type };

    } catch (error) {
        console.error('Error en processChat:', error);
        throw error;
    }
};

// --- Generar Resumen ---
export async function generateSummary(
    tema: string,
    format: 'pdf' | 'markdown',
    explicitContext?: { bloque?: string, tema?: string }[]
): Promise<{ content: string | Uint8Array; filename: string }> {

    let context = '';

    // Si hay contexto explícito (seleccionado por el usuario), intentamos recuperar TODO el documento
    if (explicitContext && explicitContext.length > 0) {
        console.log('[generateSummary] Usando contexto explícito para resumen completo:', explicitContext);
        const filter = IntentDetector.buildQdrantFilter(explicitContext);
        // AUMENTADO: De 100 a 200 chunks para cubrir temas extensos (Leyes largas)
        context = await getContext(tema, 200, filter);
    } else {
        // Fallback a búsqueda semántica estándar (Aumentado de 10 a 30 para mejor contexto implícito)
        context = await getContext(tema, 30);
    }

    const summaryPrompt = `
Eres un preparador experto de oposiciones militares de alto nivel. Tu objetivo es generar una FICHA DE ESTUDIO TÉCNICA para un examen tipo test sobre el tema: "${tema}".

INSTRUCCIONES DE FORMATO ESTRICTAS:
1. NO incluyas saludos, introducciones, ni texto conversacional (tipo "Claro, aquí tienes...").
2. Empieza DIRECTAMENTE con el título "# Ficha de Estudio Técnica".
3. Asegúrate de que las tablas Markdown tengan un salto de línea después de cada fila.

Estructura obligatoria del resumen (usa Markdown):

# Ficha de Estudio Técnica

## 1. Marco Normativo y Objeto
*   **Norma principal**: (Ley/RD exacto y fecha).
*   **Objeto**: ¿Qué regula exactamente?
*   **Ámbito de aplicación**: ¿A quién aplica y a quién NO (exclusiones)?

## 2. Conceptos Clave y Definiciones (Literalidad)
*   Define conceptos técnicos.
*   **ATENCIÓN A LOS VERBOS**: Diferencia claramente entre obligaciones ("Deberá") y potestades ("Podrá").
*   Si hay listas cerradas (ej: "Son causas de exclusión..."), indícalas.

## 3. Datos Numéricos y Plazos (Vital para el Test)
*Genera una tabla con todos los plazos, mayorías, edades o cantidades mencionadas.*
*IMPORTANTE: Usa el siguiente formato de tabla EXACTO, con saltos de línea:*

| Concepto | Dato/Plazo | Referencia |
|---|---|---|
| Ej: Plazo de recurso | 1 mes | Art. X |
| Ej: Mayoría | 2/3 | Art. Y |

## 4. Órganos y Competencias
*   ¿Quién resuelve? ¿Quién propone? ¿Quién nombra?
*   Estructura jerárquica clara.

## 5. "Trampas" Frecuentes de Examen
*   Identifica excepciones a la norma general.
*   Señala confusiones típicas (ej: Silencio administrativo positivo vs negativo).
*   Datos que parecen lógicos pero no lo son.

## 6. Mnemotecnia Express
*   1 o 2 trucos para recordar lo más difícil de este tema.

Contexto de los documentos oficiales:
${context}

INSTRUCCIONES FINALES:
*   Prioriza la precisión sobre la elegancia.
*   Si el tema es muy extenso, prioriza la estructura y los datos puros sobre las explicaciones largas.
*   Usa negritas para los términos clave.
*   NO escribas nada antes del título "# Ficha de Estudio Técnica".
`;

    console.log(`[ChatService] Context length: ${context.length}`);

    try {
        console.log('[ChatService] Generating summary content...');
        const chatModel = getChatModel({ maxOutputTokens: 8192 });
        const result = await chatModel.generateContent(summaryPrompt);
        const response = await result.response;
        console.log('[ChatService] Full Response Object:', JSON.stringify(response, null, 2));

        let content = response.text();
        console.log(`[ChatService] Generated summary length: ${content.length}`);

        // Limpiar texto conversacional (todo lo que haya antes del primer #)
        const firstHeaderIndex = content.indexOf('#');
        if (firstHeaderIndex !== -1) {
            content = content.substring(firstHeaderIndex);
        }

        // Reparar tablas (para ambos formatos: PDF y Markdown)
        content = repairMarkdownTables(content);

        if (format === 'pdf') {
            console.log('[ChatService] Generating PDF...');
            try {
                const pdfBuffer = await createSummaryPDF(`Resumen: ${tema}`, content);
                console.log('[ChatService] PDF generated successfully');
                return { content: pdfBuffer, filename: `resumen_${tema.replace(/\s+/g, '_')}.pdf` };
            } catch (pdfError) {
                console.error('[ChatService] Error generating PDF:', pdfError);
                throw pdfError;
            }
        } else {
            return { content, filename: `resumen_${tema.replace(/\s+/g, '_')}.md` };
        }
    } catch (error: any) {
        console.error('[ChatService] Error generating content:', error);

        // Manejar error de cuota excedida (429)
        if (error.status === 429 || (error.message && error.message.includes('429'))) {
            const retryAfter = error.errorDetails?.find((d: any) => d.retryDelay)?.retryDelay || 'un momento';
            throw {
                status: 429,
                message: `Has excedido el límite de uso de la IA. Por favor, intenta de nuevo en ${retryAfter}.`
            };
        }

        throw error;
    }
}

// --- Generar Diagrama ---
export async function generateDiagram(
    query: string,
    type: 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy'
): Promise<string> {
    const context = await getContext(query, 5);

    const diagramPrompt = `
Genera un diagrama Mermaid tipo "${type}" para: "${query}"

REGLAS CRÍTICAS PARA MERMAID:
1. **SINTAXIS**: Usa sintaxis válida de Mermaid ${type}.
2. **ETIQUETAS**:
   - Si una etiqueta contiene espacios o caracteres especiales (., (), [], {}, "", ''), **DEBE** ir entre comillas dobles.
   - Ejemplo: id["Texto con (paréntesis) y 'comillas'"]
   - NO uses paréntesis () dentro de los nodos si no son parte de la sintaxis de forma.
3. **NODOS**:
   - Usa IDs simples y alfanuméricos (ej: A, B, Node1).
   - Máximo 15-20 nodos para legibilidad.
4. **JERARQUÍA**: Estructura lógica y clara.

${type === 'mindmap' ? 'Ejemplo mindmap:\nmindmap\n  root((Tema Central))\n    Subtema_1["Subtema 1"]\n      Detalle_A["Detalle A (Info)"]\n      Detalle_B["Detalle B"]' : ''}
${type === 'flowchart' ? 'Ejemplo flowchart:\nflowchart TD\n    A[Inicio] --> B{Decisión}\n    B -->|Sí| C["Acción 1 (Rápida)"]\n    B -->|No| D["Acción 2"]' : ''}

Contexto de documentos:
${context}

Devuelve ÚNICAMENTE el código Mermaid, sin explicaciones adicionales.
`;

    const chatModel = getChatModel({ maxOutputTokens: 4096 });
    const result = await chatModel.generateContent(diagramPrompt);
    return extractMermaidCode(result.response.text());
}

// --- Comparador de Leyes ---
export async function compareLaws(
    documents: string[],
    aspect: string
): Promise<{ comparison: string; documents: string[]; aspect: string }> {
    const context = await getContext(`${aspect} en ${documents.join(' y ')}`, 10);

    const comparisonPrompt = `
Eres un experto en legislación militar. Compara los siguientes documentos respecto a "${aspect}":

Documentos solicitados: ${documents.join(', ')}

Genera una tabla comparativa en formato Markdown con:
1. Columna por cada documento (o grupo si son muchos)
2. Filas con aspectos comparables
3. Destacar diferencias y similitudes
4. Sección final: "Conclusiones y relaciones"

Contexto de documentos:
${context}

Formato: Markdown con tabla (| Header 1 | Header 2 |)
`;

    const chatModel = getChatModel({ maxOutputTokens: 4096 });
    const result = await chatModel.generateContent(comparisonPrompt);
    return {
        comparison: result.response.text(),
        documents,
        aspect
    };
}

// --- Generador de Flashcards ---
interface Flashcard {
    id: string;
    front: string;
    back: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
}

export async function generateFlashcards(
    tema: string,
    quantity: number = 10,
    difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): Promise<Flashcard[]> {
    const context = await getContext(tema, 10);

    const flashcardsPrompt = `
Genera ${quantity} flashcards (tarjetas de estudio) sobre "${tema}".

Dificultad: ${difficulty}

FORMATO REQUERIDO (JSON):
[
  {
    "front": "Pregunta clara y concisa",
    "back": "Respuesta precisa con contexto mínimo",
    "topic": "Subtema específico"
  }
]

REGLAS:
1. Preguntas tipo "¿Qué es...?", "¿Cuándo...?", "¿Quién...?"
2. Respuestas de 1-3 frases máximo
3. Cubrir diferentes aspectos del tema
4. Evitar ambigüedad
5. Incluir números de artículos cuando sea relevante

${difficulty === 'easy' ? 'Dificultad FÁCIL: Conceptos básicos y definiciones' : ''}
${difficulty === 'medium' ? 'Dificultad MEDIA: Aplicación de conceptos y comparaciones' : ''}
${difficulty === 'hard' ? 'Dificultad DIFÍCIL: Casos complejos y análisis profundo' : ''}

Contexto de documentos:
${context}

Devuelve ÚNICAMENTE el JSON, sin texto adicional.
`;

    const chatModel = getChatModel({ maxOutputTokens: 4096 });
    const result = await chatModel.generateContent(flashcardsPrompt);
    const jsonStr = extractJSON(result.response.text());

    try {
        const flashcards = JSON.parse(jsonStr);
        return flashcards.map((card: any, index: number) => ({
            id: `${tema.substring(0, 10).replace(/\s/g, '')}_${Date.now()}_${index}`,
            ...card,
            difficulty
        }));
    } catch (e) {
        console.error('Error parsing flashcards JSON:', e);
        throw new Error('Error al generar flashcards. Inténtalo de nuevo.');
    }
}

// --- Generador de Mnemotecnias ---
interface MnemonicResult {
    mnemonic: string;
    explanation: string;
    usage_tip: string;
}

export async function generateMnemonic(
    content: string,
    type: 'acronym' | 'story' | 'rhyme' | 'method-of-loci'
): Promise<MnemonicResult> {
    const mnemonicPrompt = `
Crea una mnemotecnia tipo "${type}" para recordar: "${content}"

${type === 'acronym' ? `
ACRÓNIMO: Crea una palabra o frase memorable usando las primeras letras.
Ejemplo: "Ejército, Armada, Aire" → "EAA: España Asegura Armamento"
` : ''}

${type === 'story' ? `
HISTORIA: Crea una historia corta y memorable que conecte los conceptos.
Debe ser visual, emotiva o absurda para facilitar el recuerdo.
` : ''}

${type === 'rhyme' ? `
RIMA: Crea una rima corta y pegadiza.
Ejemplo: "Ocho consultas gratis al mes, para más necesitas ser premium pues"
` : ''}

${type === 'method-of-loci' ? `
MÉTODO DE LOCI: Asocia cada concepto con un lugar en un recorrido familiar.
Ejemplo: "Imagina que entras a tu casa..."
` : ''}

REGLAS:
1. Creativo pero memorable
2. Relacionado con el contenido original
3. Fácil de recordar
4. Explicar por qué funciona

Formato de respuesta (JSON):
{
  "mnemonic": "La mnemotecnia creada",
  "explanation": "Por qué ayuda a recordar",
  "usage_tip": "Cómo usarla al estudiar"
}

Devuelve ÚNICAMENTE el JSON, sin texto adicional.
`;

    const chatModel = getChatModel({ maxOutputTokens: 2048 });
    const result = await chatModel.generateContent(mnemonicPrompt);
    const jsonStr = extractJSON(result.response.text());

    try {
        return JSON.parse(jsonStr);
    } catch (e) {
        console.error('Error parsing mnemonic JSON:', e);
        throw new Error('Error al generar mnemotecnia.');
    }
}
