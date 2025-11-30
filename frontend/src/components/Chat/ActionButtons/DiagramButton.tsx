import React from 'react';
import { Button } from '@/components/ui/button';
import { Network, GitGraph, GitCommit, ListTree } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface DiagramButtonProps {
    onGenerate: (type: 'mindmap' | 'flowchart' | 'timeline' | 'hierarchy') => void;
    disabled?: boolean;
}

export const DiagramButton: React.FC<DiagramButtonProps> = ({ onGenerate, disabled }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled} className="h-8">
                    <Network className="h-4 w-4 mr-2" />
                    Diagrama
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onGenerate('mindmap')}>
                    <Network className="h-4 w-4 mr-2" />
                    Mapa Mental
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('flowchart')}>
                    <GitGraph className="h-4 w-4 mr-2" />
                    Diagrama de Flujo
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('timeline')}>
                    <GitCommit className="h-4 w-4 mr-2" />
                    Línea Temporal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('hierarchy')}>
                    <ListTree className="h-4 w-4 mr-2" />
                    Jerarquía
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
