interface DetectedContext {
    bloque?: string;
    tema?: string;
    explicit?: boolean; // True si el usuario lo pidió explícitamente
    listing?: boolean; // True si el usuario pide listar todos los temas
}

export class IntentDetector {
    // Detectar referencias a Bloques y Temas
    // Ejemplos: "resumen del tema 3", "bloque 1", "tema 5 del bloque 2"
    static detectContext(text: string): DetectedContext | null {
        const normalized = text.toLowerCase();
        const context: DetectedContext = {};
        let found = false;

        // 1. Detectar Intención de Listado
        // Patrones: "cuales son los temas", "lista de temas", "que temas hay", "temario completo"
        const listingRegex = /(cuales son|lista de|que temas|temario|todos los temas|listado)/i;
        if (listingRegex.test(normalized) && (normalized.includes('tema') || normalized.includes('dispones') || normalized.includes('hay'))) {
            context.listing = true;
            found = true;
        }

        // 2. Detectar Bloque
        // Patrones: "bloque 1", "bloque I", "b1"
        const bloqueMatch = normalized.match(/bloque\s*(\d+|[ivx]+)|b(\d+)/i);
        if (bloqueMatch) {
            const num = bloqueMatch[1] || bloqueMatch[2];
            // Normalizar a formato de carpeta: "B" + número
            // Si ya viene como "B1" (por ejemplo si el usuario dice "B1"), el regex captura el número.
            // Si dice "bloque 1", captura "1".
            // En ambos casos queremos "B1".
            context.bloque = `B${num}`;
            found = true;
        }

        // 3. Detectar Tema
        // Patrones: "tema 3", "tema III", "t3"
        const temaMatch = normalized.match(/tema\s*(\d+|[ivx]+)|t(\d+)/i);
        if (temaMatch) {
            const num = temaMatch[1] || temaMatch[2];
            // Normalizar a formato de carpeta: "Tema_" + número
            context.tema = `Tema_${num}`;
            found = true;
        }

        if (found) {
            context.explicit = true; // Inferido del texto
            return context;
        }

        return null;
    }

    // Construir filtro de Qdrant basado en selección manual o detección
    static buildQdrantFilter(selection: { bloque?: string, tema?: string }[]): any {
        if (!selection || selection.length === 0) {
            return {}; // Sin filtro
        }

        // Si hay múltiples selecciones, usamos SHOULD (OR)
        // Cada selección es un MUST (AND) de bloque y tema
        const conditions = selection.map(sel => {
            const must: any[] = [];

            if (sel.bloque) {
                // El bloque ya debería venir normalizado como "B1", "B2", etc.
                // Pero por seguridad, si viene solo número, lo ajustamos (aunque detectContext ya lo hace)
                let val = sel.bloque;
                if (/^\d+$/.test(val)) val = `B${val}`;

                must.push({ key: "bloque", match: { value: val } });
            }

            if (sel.tema) {
                // El tema ya debería venir normalizado como "Tema_1", etc.
                // Pero por seguridad...
                let val = sel.tema;
                if (/^\d+$/.test(val)) val = `Tema_${val}`;

                must.push({ key: "tema", match: { value: val } });
            }

            return { must };
        });

        if (conditions.length === 1) {
            return conditions[0];
        }

        return {
            should: conditions
        };
    }
}
