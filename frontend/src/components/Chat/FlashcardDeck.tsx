import React, { useState } from 'react';
import ReactCardFlip from 'react-card-flip';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Flashcard {
    id: string;
    front: string;
    back: string;
    topic: string;
}

interface FlashcardDeckProps {
    flashcards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ flashcards }) => {
    if (!flashcards || flashcards.length === 0) {
        return <div className="p-4 text-center text-muted-foreground">No hay tarjetas disponibles.</div>;
    }
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    const handleNext = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % flashcards.length);
        }, 300);
    };

    const handlePrev = () => {
        setIsFlipped(false);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
        }, 300);
    };

    const currentCard = flashcards[currentIndex];

    return (
        <div className="my-4 flex flex-col items-center">
            <div className="w-full max-w-md h-64 perspective-1000">
                <ReactCardFlip isFlipped={isFlipped} flipDirection="horizontal">
                    {/* Front */}
                    <div
                        className="w-full h-64 bg-card border-2 border-primary/20 rounded-xl p-6 flex flex-col justify-between cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
                        onClick={() => setIsFlipped(true)}
                    >
                        <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {currentCard.topic}
                        </div>
                        <div className="text-xl font-medium text-center">
                            {currentCard.front}
                        </div>
                        <div className="text-center text-sm text-muted-foreground">
                            Toca para ver respuesta
                        </div>
                    </div>

                    {/* Back */}
                    <div
                        className="w-full h-64 bg-primary text-primary-foreground rounded-xl p-6 flex flex-col justify-between cursor-pointer shadow-lg"
                        onClick={() => setIsFlipped(false)}
                    >
                        <div className="text-xs opacity-70 uppercase tracking-wider font-semibold">
                            Respuesta
                        </div>
                        <div className="text-lg text-center">
                            {currentCard.back}
                        </div>
                        <div className="text-center text-sm opacity-70">
                            Toca para volver
                        </div>
                    </div>
                </ReactCardFlip>
            </div>

            <div className="flex items-center gap-4 mt-4">
                <Button variant="outline" size="icon" onClick={handlePrev}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">
                    {currentIndex + 1} / {flashcards.length}
                </span>
                <Button variant="outline" size="icon" onClick={handleNext}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
