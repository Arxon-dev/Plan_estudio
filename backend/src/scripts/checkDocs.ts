import { getAvailableDocuments } from '../services/chatService';
import * as fs from 'fs';
import * as path from 'path';

async function checkDocs() {
    console.log('--- Comprobando getAvailableDocuments ---');
    const docs = await getAvailableDocuments();
    console.log(JSON.stringify(docs, null, 2));
    
    console.log('\n--- Explorando sistema de archivos ---');
    const DOCS_DIR = path.join(__dirname, '../../Doc/TEMARIO TXT');
    
    if (fs.existsSync(DOCS_DIR)) {
        const bloques = fs.readdirSync(DOCS_DIR);
        for (const bloque of bloques) {
            const bloquePath = path.join(DOCS_DIR, bloque);
            if (fs.statSync(bloquePath).isDirectory()) {
                console.log(`\nBloque: ${bloque}`);
                const temas = fs.readdirSync(bloquePath);
                for (const tema of temas) {
                    const temaPath = path.join(bloquePath, tema);
                    if (fs.statSync(temaPath).isDirectory() && tema.startsWith('Tema')) {
                        console.log(`  Carpeta: ${tema}`);
                        const archivos = fs.readdirSync(temaPath);
                        for (const archivo of archivos) {
                            console.log(`    - Archivo: ${archivo}`);
                        }
                    }
                }
            }
        }
    } else {
        console.log('Directorio de documentos no encontrado:', DOCS_DIR);
    }
}

checkDocs();