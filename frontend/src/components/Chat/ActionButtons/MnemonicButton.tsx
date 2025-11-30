import React from 'react';
import { Button } from '@/components/ui/button';
import { Lightbulb } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MnemonicButtonProps {
    onGenerate: (type: 'acronym' | 'story' | 'rhyme' | 'method-of-loci') => void;
    disabled?: boolean;
}

export const MnemonicButton: React.FC<MnemonicButtonProps> = ({ onGenerate, disabled }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={disabled} title="Generar Mnemotecnia">
                    <Lightbulb className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onGenerate('acronym')}>
                    Acrónimo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('story')}>
                    Historia
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('rhyme')}>
                    Rima
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('method-of-loci')}>
                    Método de Loci
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
