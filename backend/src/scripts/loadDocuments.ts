import fs from 'fs';
import path from 'path';
import { qdrantClient, COLLECTION_NAME } from '../config/qdrant';
import { generateEmbedding } from '../config/gemini';
import { v4 as uuidv4 } from 'uuid';

const DOCS_DIR = path.join(__dirname, '../../Doc/TEMARIO TXT');

interface DocumentChunk {
    id: string;
    text: string;
    metadata: {
        filename: string;
        documento: string;
        bloque: string;
        tema: string;
    };
}

// Función para parsear el nombre del archivo y extraer metadata
// Intenta extraer de la ruta (B1/Tema_1) o del nombre del archivo
const parseMetadata = (filePath: string) => {
    const filename = path.basename(filePath);
    const dir = path.dirname(filePath);
    const dirs = dir.split(path.sep);

    // Intentar deducir Bloque y Tema de las carpetas padres
    // Estructura esperada: .../B1/Tema_1/archivo.txt
    let bloque = dirs.find(d => d.match(/^B\d+$/) || d.startsWith('Bloque')) || 'Desconocido';
    let tema = dirs.find(d => d.startsWith('Tema')) || 'Desconocido';

    // Si no se encuentra en directorios, intentar del nombre del archivo (legacy)
    if (bloque === 'Desconocido' || tema === 'Desconocido') {
        const parts = filename.replace('.txt', '').split('_');
        if (bloque === 'Desconocido') bloque = parts.find(p => p.startsWith('Bloque')) || 'Desconocido';
        if (tema === 'Desconocido') tema = parts.find(p => p.startsWith('Tema')) || 'Desconocido';
    }

    // Limpiar nombre del documento
    let documento = filename.replace('.txt', '');
    // Si el nombre empieza por "Tema X. ", quitarlo para dejar solo el título
    documento = documento.replace(/^Tema\s*\d+[\.\-]\s*/i, '');

    return { bloque, tema, documento };
};

const splitText = (text: string, chunkSize: number = 1000): string[] => {
    const chunks: string[] = [];
    let currentChunk = '';

    const paragraphs = text.split('\n');

    for (const paragraph of paragraphs) {
        if ((currentChunk + paragraph).length > chunkSize) {
            chunks.push(currentChunk);
            currentChunk = paragraph;
        } else {
            currentChunk += '\n' + paragraph;
        }
    }
    if (currentChunk) chunks.push(currentChunk);

    return chunks;
};

const loadDocuments = async () => {
    try {
        console.log('🚀 Iniciando carga de documentos...');

        // 1. Recrear colección para asegurar limpieza
        try {
            console.log(`🗑️ Eliminando colección ${COLLECTION_NAME} existente...`);
            await qdrantClient.deleteCollection(COLLECTION_NAME);
        } catch (e) {
            console.log(`ℹ️ La colección ${COLLECTION_NAME} no existía.`);
        }

        console.log(`✨ Creando nueva colección ${COLLECTION_NAME}...`);
        await qdrantClient.createCollection(COLLECTION_NAME, {
            vectors: {
                size: 768, // Tamaño para text-embedding-004
                distance: 'Cosine',
            },
        });

        // 2. Leer archivos (recursivo)
        if (!fs.existsSync(DOCS_DIR)) {
            console.error(`❌ Directorio de documentos no encontrado: ${DOCS_DIR}`);
            return;
        }

        const getAllFiles = (dirPath: string, arrayOfFiles: string[] = []) => {
            const files = fs.readdirSync(dirPath);
            files.forEach((file) => {
                if (fs.statSync(path.join(dirPath, file)).isDirectory()) {
                    arrayOfFiles = getAllFiles(path.join(dirPath, file), arrayOfFiles);
                } else {
                    if (file.endsWith('.txt')) {
                        arrayOfFiles.push(path.join(dirPath, file));
                    }
                }
            });
            return arrayOfFiles;
        };

        const files = getAllFiles(DOCS_DIR);
        console.log(`📄 Encontrados ${files.length} documentos.`);

        for (const filePath of files) {
            const file = path.basename(filePath);
            console.log(`Processing ${file}...`);
            const content = fs.readFileSync(filePath, 'utf-8');
            const metadata = parseMetadata(filePath);
            const chunks = splitText(content);

            console.log(`  - Dividido en ${chunks.length} fragmentos.`);

            const points = [];

            for (const chunk of chunks) {
                // Generar embedding (con retries simples)
                let embedding;
                try {
                    embedding = await generateEmbedding(chunk);
                } catch (err) {
                    console.error(`  ❌ Error generando embedding para chunk de ${file}, saltando...`);
                    continue;
                }

                points.push({
                    id: uuidv4(),
                    vector: embedding,
                    payload: {
                        text: chunk,
                        filename: file,
                        ...metadata
                    }
                });
            }

            // Subir a Qdrant en lotes
            if (points.length > 0) {
                await qdrantClient.upsert(COLLECTION_NAME, {
                    points: points,
                });
                console.log(`  ✅ Subidos ${points.length} puntos a Qdrant.`);
            }
        }

        console.log('🎉 Carga de documentos completada!');

    } catch (error) {
        console.error('❌ Error fatal en carga de documentos:', error);
    }
};

loadDocuments();
