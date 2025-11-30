export interface Flashcard {
    question: string;
    answer: string;
    source: string;
}

/**
 * Parsea flashcards desde formato Markdown
 */
export function parseFlashcards(text: string): Flashcard[] {
    const flashcards: Flashcard[] = [];

    // Dividir por separadores "---"
    const sections = text.split(/---+/);

    sections.forEach((section) => {
        const trimmed = section.trim();
        if (!trimmed || trimmed.length < 20) return;

        // Buscar pregunta
        const questionMatch = trimmed.match(/\*\*Pregunta:?\*\*\s*(.+?)(?=\*\*Respuesta|\n\n)/is);

        // Buscar respuesta
        const answerMatch = trimmed.match(/\*\*Respuesta:?\*\*\s*(.+?)(?=\*\*Tema|\*\*Fuente|\n\n|$)/is);

        // Buscar tema/fuente
        const sourceMatch = trimmed.match(/\*\*(?:Tema|Fuente):?\*\*\s*(.+?)(?=\n|$)/i);

        if (questionMatch && answerMatch) {
            flashcards.push({
                question: questionMatch[1].trim(),
                answer: answerMatch[1].trim(),
                source: sourceMatch ? sourceMatch[1].trim() : ''
            });
        }
    });

    return flashcards;
}
