export interface OutlineNode {
    id: string;
    title: string;
    level: number;
    children: OutlineNode[];
}

/**
 * Parsea esquemas jerárquicos desde texto
 * Detecta niveles: I. II. III. (romano) → A. B. C. → 1. 2. 3. → a. b. c.
 */
export function parseOutline(text: string): OutlineNode {
    const lines = text.split('\n').filter(line => line.trim());
    const tree: OutlineNode = { id: 'root', title: 'Root', children: [], level: 0 };
    const stack: OutlineNode[] = [tree];

    lines.forEach(line => {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('**Fuente')) return;

        // Detectar nivel y contenido
        const level = detectLevel(line);
        const content = extractContent(trimmed);

        if (!content) return;

        const node: OutlineNode = {
            id: Math.random().toString(36).substr(2, 9),
            title: content,
            level: level,
            children: []
        };

        // Encontrar el padre correcto según nivel
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
            stack.pop();
        }

        const parent = stack[stack.length - 1];
        if (parent) {
            parent.children.push(node);
            stack.push(node);
        }
    });

    return tree.children.length > 0 ? tree.children[0] : tree;
}

function detectLevel(line: string): number {
    // Contar espacios de indentación
    const indent = line.search(/\S/);

    // Detectar por marcadores
    if (/^[IVX]+\./.test(line.trim())) return 1; // I. II. III.
    if (/^[A-Z]\./.test(line.trim())) return 2;  // A. B. C.
    if (/^\d+\./.test(line.trim())) return 3;     // 1. 2. 3.
    if (/^[a-z]\./.test(line.trim())) return 4;   // a. b. c.

    // Por indentación como fallback
    return Math.floor(indent / 3) + 1;
}

function extractContent(line: string): string {
    // Remover marcadores y limpiar
    return line
        .replace(/^[IVX]+\.\s*/i, '')
        .replace(/^[A-Z]\.\s*/, '')
        .replace(/^\d+\.\s*/, '')
        .replace(/^[a-z]\.\s*/, '')
        .replace(/^\*\*/g, '')
        .replace(/\*\*$/g, '')
        .trim();
}
