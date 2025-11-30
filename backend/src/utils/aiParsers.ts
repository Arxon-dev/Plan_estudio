/**
 * Extrae un objeto JSON válido de una respuesta de texto que puede contener bloques de código markdown.
 * @param text Texto que contiene el JSON
 * @returns String JSON limpio
 */
export function extractJSON(text: string): string {
    try {
        // Intentar encontrar bloque de código JSON
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            return jsonMatch[1];
        }

        // Intentar encontrar bloque de código sin especificar lenguaje
        const codeMatch = text.match(/```\n([\s\S]*?)\n```/);
        if (codeMatch) {
            return codeMatch[1];
        }

        // Si no hay bloques, asumir que es el texto completo o buscar llaves
        const firstBrace = text.indexOf('{');
        const lastBrace = text.lastIndexOf('}');

        if (firstBrace !== -1 && lastBrace !== -1) {
            return text.substring(firstBrace, lastBrace + 1);
        }

        return text;
    } catch (e) {
        console.error('Error extrayendo JSON:', e);
        return text;
    }
}

/**
 * Extrae código Mermaid de una respuesta de texto.
 * @param text Texto que contiene el código Mermaid
 * @returns String con el código Mermaid limpio
 */
export function extractMermaidCode(text: string): string {
    try {
        // Intentar encontrar bloque de código mermaid
        const mermaidMatch = text.match(/```mermaid\n([\s\S]*?)\n```/);
        if (mermaidMatch) {
            return mermaidMatch[1];
        }

        // Si no hay bloques específicos, buscar patrones comunes de mermaid
        if (text.includes('graph ') || text.includes('flowchart ') || text.includes('mindmap')) {
            // Limpiar posibles bloques de código genéricos
            return text.replace(/```/g, '').trim();
        }

        return text;
    } catch (e) {
        console.error('Error extrayendo Mermaid:', e);
        return text;
    }
}
