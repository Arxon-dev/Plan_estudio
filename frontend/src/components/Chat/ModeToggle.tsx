import React from 'react';
import { Button } from '@/components/ui/button';
import { GraduationCap, Baby } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ModeToggleProps {
    mode: 'normal' | 'simplified';
    onChange: (mode: 'normal' | 'simplified') => void;
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange }) => {
    return (
        <div className="flex items-center space-x-2 bg-secondary/50 p-1 rounded-lg">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={mode === 'normal' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onChange('normal')}
                            className="h-8 px-2"
                        >
                            <GraduationCap className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Normal</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Lenguaje técnico y preciso</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant={mode === 'simplified' ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => onChange('simplified')}
                            className="h-8 px-2"
                        >
                            <Baby className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Simplificado</span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Explicaciones sencillas y ejemplos</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>
    );
};
