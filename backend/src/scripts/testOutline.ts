import { buildPrompt } from '../prompts/promptTemplates';

const mockDocs = [{
  text: `La Ley 40/2015, de 1 de octubre, de Régimen Jurídico del Sector Público regula:
  
  - El funcionamiento electrónico del sector público
  - Las normas de funcionamiento
  - Los órganos de las Administraciones Públicas
  
  Artículo 1. Objeto: Esta Ley regula y desarrolla...`,
  payload: {
    bloque: "1",
    tema: "3",
    documento: "Ley 40/2015",
    filename: "test.txt"
  }
}];

const testMessage = "Dame un esquema de la Ley 40/2015";

const { prompt, type } = buildPrompt(testMessage, mockDocs);

console.log('TIPO DETECTADO:', type);
console.log('\n========== PROMPT GENERADO ==========\n');
console.log(prompt);
console.log('\n====================================\n');

// Verificaciones
console.log('✓ Contiene "SOLO TEXTO":', prompt.includes('SOLO TEXTO'));
console.log('✓ Contiene "PROHIBIDO":', prompt.includes('PROHIBIDO'));
console.log('✓ Contiene ejemplo de formato:', prompt.includes('I. TÍTULO'));
