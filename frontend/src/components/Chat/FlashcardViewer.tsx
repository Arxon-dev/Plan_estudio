import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCw } from 'lucide-react';

interface Flashcard {
    question: string;
    answer: string;
    source: string;
}

interface FlashcardViewerProps {
    flashcards: Flashcard[];
}

export const FlashcardViewer: React.FC<FlashcardViewerProps> = ({ flashcards }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    if (!flashcards || flashcards.length === 0) {
        return (
            <div className="text-center text-muted-foreground p-4">
                No se encontraron flashcards válidas
            </div>
        );
    }

    const currentCard = flashcards[currentIndex];

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 150);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 150);
    };

    const handleFlip = () => {
        setIsFlipped(!isFlipped);
    };

    // DEBUGGING
    console.log('[FlashcardViewer] Estado actual:', {
        currentIndex,
        isFlipped,
        currentQuestion: currentCard.question,
        currentAnswer: currentCard.answer
    });

    return (
        <div className="w-full space-y-4">
            {/* Contador */}
            <div className="text-center text-sm font-medium text-muted-foreground">
                Flashcard {currentIndex + 1} de {flashcards.length}
            </div>

            {/* Tarjeta */}
            <div
                className="relative h-72 cursor-pointer"
                onClick={handleFlip}
                style={{ perspective: '1000px' }}
            >
                <div
                    className="relative w-full h-full transition-transform duration-600"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                        transition: 'transform 0.6s'
                    }}
                >
                    {/* FRENTE - Pregunta (visible cuando isFlipped = false) */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 rounded-xl shadow-lg border-2 border-blue-200 dark:border-blue-800"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(0deg)'
                        }}
                    >
                        <div className="text-xs font-bold text-blue-600 dark:text-blue-400 mb-4 uppercase tracking-wide">
                            Pregunta
                        </div>
                        <p className="text-center text-lg font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                            {currentCard.question}
                        </p>
                        <div className="absolute bottom-6 flex items-center gap-2 text-xs text-muted-foreground">
                            <RotateCw className="w-4 h-4" />
                            <span>Click para ver respuesta</span>
                        </div>
                    </div>

                    {/* REVERSO - Respuesta (visible cuando isFlipped = true) */}
                    <div
                        className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 rounded-xl shadow-lg border-2 border-green-200 dark:border-green-800"
                        style={{
                            backfaceVisibility: 'hidden',
                            WebkitBackfaceVisibility: 'hidden',
                            transform: 'rotateY(180deg)'
                        }}
                    >
                        <div className="text-xs font-bold text-green-600 dark:text-green-400 mb-4 uppercase tracking-wide">
                            Respuesta
                        </div>
                        <p className="text-center text-base text-gray-900 dark:text-gray-100 leading-relaxed">
                            {currentCard.answer}
                        </p>
                        {currentCard.source && (
                            <div className="absolute bottom-6 text-xs text-muted-foreground">
                                📚 {currentCard.source}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controles */}
            <div className="flex items-center justify-center gap-4">
                <button
                    className="p-2 border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        handlePrev();
                    }}
                    disabled={flashcards.length <= 1}
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleFlip();
                    }}
                >
                    <RotateCw className="w-4 h-4" />
                    {isFlipped ? 'Ver pregunta' : 'Ver respuesta'}
                </button>

                <button
                    className="p-2 border rounded-md hover:bg-accent transition-colors disabled:opacity-50"
                    onClick={(e) => {
                        e.stopPropagation();
                        handleNext();
                    }}
                    disabled={flashcards.length <= 1}
                >
                    <ChevronRight className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};
