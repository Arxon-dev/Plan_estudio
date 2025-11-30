import React from 'react';
import { Button } from '@/components/ui/button';
import { Layers } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuLabel,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';

interface FlashcardsButtonProps {
    onGenerate: (difficulty: 'easy' | 'medium' | 'hard') => void;
    disabled?: boolean;
}

export const FlashcardsButton: React.FC<FlashcardsButtonProps> = ({ onGenerate, disabled }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={disabled} title="Generar Flashcards">
                    <Layers className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Dificultad</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onGenerate('easy')}>
                    Fácil (Conceptos)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('medium')}>
                    Media (Aplicación)
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('hard')}>
                    Difícil (Análisis)
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
