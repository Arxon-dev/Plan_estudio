import React, { useState, useMemo, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Input } from '../ui/input';
import {
    Loader2,
    CheckSquare,
    Square,
    Search,
    ChevronDown,
    ChevronRight,
    FilterX
} from 'lucide-react';
import type { AvailableBlock, DocumentSelection } from '../../hooks/useDocumentSelection';

interface DocumentSelectorProps {
    availableDocs: AvailableBlock[];
    selectedDocs: DocumentSelection[];
    onToggle: (bloque: string, tema: string) => void;
    onSelectAll: () => void;
    onClear: () => void;
    isLoading: boolean;
}

export const DocumentSelector: React.FC<DocumentSelectorProps> = ({
    availableDocs,
    selectedDocs,
    onToggle,
    onSelectAll,
    onClear,
    isLoading
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedBlocks, setExpandedBlocks] = useState<Set<string>>(new Set());

    // Filtrar documentos basado en búsqueda
    const filteredDocs = useMemo(() => {
        if (!searchTerm.trim()) return availableDocs;

        const term = searchTerm.toLowerCase();
        return availableDocs.map(block => ({
            ...block,
            temas: block.temas.filter(t =>
                t.title.toLowerCase().includes(term) ||
                block.bloque.toLowerCase().includes(term)
            )
        })).filter(block => block.temas.length > 0);
    }, [availableDocs, searchTerm]);

    // Expandir bloques automáticamente al buscar
    useEffect(() => {
        if (searchTerm.trim()) {
            const allBlockIds = new Set(filteredDocs.map(b => b.bloque));
            setExpandedBlocks(allBlockIds);
        }
    }, [searchTerm, filteredDocs]);

    // Inicializar con el primer bloque expandido si no hay búsqueda
    useEffect(() => {
        if (!searchTerm.trim() && availableDocs.length > 0 && expandedBlocks.size === 0) {
            setExpandedBlocks(new Set([availableDocs[0].bloque]));
        }
    }, [availableDocs]);

    const toggleBlock = (bloque: string) => {
        const newExpanded = new Set(expandedBlocks);
        if (newExpanded.has(bloque)) {
            newExpanded.delete(bloque);
        } else {
            newExpanded.add(bloque);
        }
        setExpandedBlocks(newExpanded);
    };

    const isSelected = (bloque: string, tema: string) => {
        return selectedDocs.some(d => d.bloque === bloque && d.tema === tema);
    };

    const getBlockSelectionCount = (bloque: string) => {
        return selectedDocs.filter(d => d.bloque === bloque).length;
    };

    const handleSelectBlock = (e: React.MouseEvent, block: AvailableBlock) => {
        e.stopPropagation();
        const blockDocs = block.temas;
        const allSelected = blockDocs.every(t => isSelected(block.bloque, t.id));

        blockDocs.forEach(t => {
            const currentlySelected = isSelected(block.bloque, t.id);
            if (allSelected) {
                // Deseleccionar si todos están seleccionados
                if (currentlySelected) onToggle(block.bloque, t.id);
            } else {
                // Seleccionar los que falten
                if (!currentlySelected) onToggle(block.bloque, t.id);
            }
        });
    };

    if (isLoading) {
        return <div className="flex justify-center items-center h-full p-4"><Loader2 className="animate-spin text-primary" /></div>;
    }

    return (
        <div className="flex flex-col h-full bg-background border-l shadow-xl w-full max-w-md">
            {/* Sticky Header */}
            <div className="p-4 border-b bg-card z-10 space-y-3 shadow-sm">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-lg">Temario</h3>
                    <Badge variant={selectedDocs.length > 0 ? "default" : "secondary"} className="transition-all">
                        {selectedDocs.length} seleccionados
                    </Badge>
                </div>

                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar temas..."
                        value={searchTerm}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                        className="pl-8"
                    />
                    {searchTerm && (
                        <button
                            onClick={() => setSearchTerm('')}
                            className="absolute right-2 top-2.5 text-muted-foreground hover:text-foreground"
                        >
                            <FilterX className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <div className="flex gap-2 pt-1">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onSelectAll}
                        className="flex-1 text-xs h-8"
                        disabled={filteredDocs.length === 0}
                    >
                        <CheckSquare className="w-3 h-3 mr-2" /> Seleccionar Todo
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClear}
                        className="flex-1 text-xs h-8"
                        disabled={selectedDocs.length === 0}
                    >
                        <Square className="w-3 h-3 mr-2" /> Limpiar
                    </Button>
                </div>
            </div>

            {/* Scrollable Content */}
            <ScrollArea className="flex-1 bg-gray-50/50">
                {filteredDocs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 text-muted-foreground space-y-2">
                        <Search className="w-8 h-8 opacity-20" />
                        <p className="text-sm">No se encontraron temas</p>
                    </div>
                ) : (
                    <div className="p-2 space-y-2">
                        {filteredDocs.map((block) => {
                            const isExpanded = expandedBlocks.has(block.bloque);
                            const selectionCount = getBlockSelectionCount(block.bloque);
                            const totalCount = block.temas.length;
                            const isFullySelected = selectionCount === totalCount && totalCount > 0;

                            return (
                                <div key={block.bloque} className="bg-card rounded-lg border shadow-sm overflow-hidden transition-all duration-200">
                                    {/* Accordion Header */}
                                    <div
                                        className={`
                                            flex items-center justify-between p-3 cursor-pointer hover:bg-accent/50 transition-colors
                                            ${isExpanded ? 'bg-accent/30' : ''}
                                        `}
                                        onClick={() => toggleBlock(block.bloque)}
                                    >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            {isExpanded ? <ChevronDown className="w-4 h-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 shrink-0 text-muted-foreground" />}
                                            <span className="font-medium text-sm truncate" title={block.bloque}>{block.bloque}</span>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-xs text-muted-foreground font-mono">
                                                {selectionCount}/{totalCount}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-6 w-6 hover:bg-primary/10 ${isFullySelected ? 'text-primary' : 'text-muted-foreground'}`}
                                                onClick={(e) => handleSelectBlock(e, block)}
                                                title={isFullySelected ? "Deseleccionar bloque" : "Seleccionar bloque"}
                                            >
                                                <CheckSquare className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Accordion Content */}
                                    {isExpanded && (
                                        <div className="border-t bg-white">
                                            {block.temas.map((tema) => {
                                                const checked = isSelected(block.bloque, tema.id);
                                                return (
                                                    <div
                                                        key={`${block.bloque}-${tema.id}`}
                                                        className={`
                                                            flex items-start space-x-3 p-3 hover:bg-gray-50 transition-colors border-b last:border-0
                                                            ${checked ? 'bg-primary/5' : ''}
                                                        `}
                                                        onClick={() => onToggle(block.bloque, tema.id)}
                                                    >
                                                        <Checkbox
                                                            id={`${block.bloque}-${tema.id}`}
                                                            checked={checked}
                                                            onCheckedChange={() => onToggle(block.bloque, tema.id)}
                                                            className="mt-0.5"
                                                        />
                                                        <div className="grid gap-1.5 leading-none cursor-pointer w-full">
                                                            <label
                                                                htmlFor={`${block.bloque}-${tema.id}`}
                                                                className={`text-sm font-medium leading-none cursor-pointer ${checked ? 'text-primary' : 'text-foreground'}`}
                                                            >
                                                                {tema.title}
                                                            </label>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </ScrollArea>
        </div>
    );
};
