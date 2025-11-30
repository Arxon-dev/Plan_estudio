import React from 'react';
import { Button } from '@/components/ui/button';
import { Scale } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface CompareButtonProps {
    onCompare: (aspect: string) => void;
    disabled?: boolean;
}

export const CompareButton: React.FC<CompareButtonProps> = ({ onCompare, disabled }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" disabled={disabled} title="Comparar Leyes">
                    <Scale className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onCompare("Diferencias clave")}>
                    Diferencias clave
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCompare("Plazos y fechas")}>
                    Plazos y fechas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCompare("Competencias")}>
                    Competencias
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onCompare("Sanciones")}>
                    Sanciones
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
