import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Download, FileJson } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SummaryButtonProps {
    onGenerate: (format: 'pdf' | 'markdown') => void;
    disabled?: boolean;
}

export const SummaryButton: React.FC<SummaryButtonProps> = ({ onGenerate, disabled }) => {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={disabled} className="h-8">
                    <FileText className="h-4 w-4 mr-2" />
                    Resumen
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onGenerate('pdf')}>
                    <Download className="h-4 w-4 mr-2" />
                    Descargar PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onGenerate('markdown')}>
                    <FileJson className="h-4 w-4 mr-2" />
                    Ver Markdown
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
