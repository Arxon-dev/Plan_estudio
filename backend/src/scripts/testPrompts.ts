import { buildPrompt, detectRequestType } from '../prompts/promptTemplates';

const testMessages = [
    "Dame un resumen del tema 3",
    "Crea un esquema del bloque 1",
    "Genera flashcards de la ley 40/2015",
    "Compara el tema 2 y el tema 4",
    "Hazme un diagrama de la estructura orgánica",
    "¿Qué dice la constitución sobre defensa?"
];

const mockDocs = [
    {
        payload: {
            text: "Contenido del documento de prueba...",
            bloque: "1",
            tema: "3",
            documento: "Ley 40/2015"
        }
    }
];

console.log("=== TEST DE DETECCIÓN DE TIPOS ===\n");

testMessages.forEach(msg => {
    const type = detectRequestType(msg);
    console.log(`Mensaje: "${msg}"`);
    console.log(`Tipo detectado: ${type}\n`);
});

console.log("\n=== TEST DE GENERACIÓN DE PROMPT (ESQUEMA) ===\n");

const { prompt, type } = buildPrompt(testMessages[1], mockDocs);
console.log("Tipo:", type);
console.log("\nPrompt generado:");
console.log(prompt);
