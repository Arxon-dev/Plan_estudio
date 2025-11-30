import React from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UsageIndicator } from './UsageIndicator';
import { LimitReachedModal } from './LimitReachedModal';
import { SourcesPanel } from './SourcesPanel';
import { UpgradeBanner } from './UpgradeBanner';
import { ChatToolbar } from './ChatToolbar';
import { SummaryButton } from './ActionButtons/SummaryButton';
import { DiagramButton } from './ActionButtons/DiagramButton';
import { CompareButton } from './ActionButtons/CompareButton';
import { FlashcardsButton } from './ActionButtons/FlashcardsButton';
import { MnemonicButton } from './ActionButtons/MnemonicButton';
import { DocumentSelector } from './DocumentSelector';
import { useDocumentSelection } from '../../hooks/useDocumentSelection';
import { FileText, X } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const ChatInterface: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const {
        messages,
        isLoading,
        usage,
        limitReached,
        sendMessage,
        simplifiedMode,
        setSimplifiedMode,
        generateSummary,
        generateDiagram,
        compareLaws,
        generateFlashcards,
        generateMnemonic
    } = useChat();

    const [showSources, setShowSources] = React.useState(false);
    const [activeSources, setActiveSources] = React.useState<any[]>([]);
    const [showDocSelector, setShowDocSelector] = React.useState(false);
    const [isLimitModalOpen, setIsLimitModalOpen] = React.useState(false);

    React.useEffect(() => {
        if (limitReached) {
            setIsLimitModalOpen(true);
        }
    }, [limitReached]);

    const {
        availableDocs,
        selectedDocs,
        toggleSelection,
        selectAll,
        clearSelection,
        isLoadingDocs
    } = useDocumentSelection();

    const handleShowSources = (sources: any[]) => {
        setActiveSources(sources);
        setShowSources(true);
        setShowDocSelector(false); // Cerrar selector si se abren fuentes
    };

    const toggleDocSelector = () => {
        setShowDocSelector(!showDocSelector);
        if (!showDocSelector) setShowSources(false);
    };

    const getLastUserMessage = () => {
        return [...messages].reverse().find(m => m.role === 'user')?.content || "";
    };

    const getEffectiveTopic = (defaultTopic: string) => {
        // 1. Prioridad: Selección explícita de documentos
        if (selectedDocs.length > 0) {
            // Intentar obtener el título legible del primer tema seleccionado
            // (Tomamos el primero como referencia principal si hay varios)
            const firstDoc = selectedDocs[0];
            const block = availableDocs.find(b => b.bloque === firstDoc.bloque);
            const theme = block?.temas.find(t => t.id === firstDoc.tema);

            if (theme) return theme.title;
            return `Tema ${firstDoc.tema}`;
        }

        // 2. Prioridad: Último mensaje del usuario
        return getLastUserMessage() || defaultTopic;
    };

    const handleSendMessage = (content: string) => {
        // Convertir selección al formato esperado por el backend
        const context = selectedDocs.length > 0 ? selectedDocs : undefined;
        sendMessage(content, context);
    };

    return (
        <div className="flex flex-col h-full bg-background text-foreground relative">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
                <div>
                    <h2 className="text-lg font-semibold">Asistente IA</h2>
                    <p className="text-sm text-muted-foreground">Pregunta sobre el temario</p>
                </div>
                <div className="flex items-center gap-2">
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleDocSelector}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-200
                                        font-medium text-sm shadow-sm border
                                        ${showDocSelector
                                            ? 'bg-primary text-primary-foreground border-primary'
                                            : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                        }
                                        ${selectedDocs.length > 0 ? 'ring-2 ring-primary/20 border-primary/50' : ''}
                                    `}
                                    aria-label="Seleccionar Temario"
                                >
                                    <FileText className={`w-4 h-4 ${showDocSelector ? 'text-primary-foreground' : 'text-gray-500'}`} />
                                    <span>
                                        {selectedDocs.length > 0
                                            ? `Temario (${selectedDocs.length})`
                                            : "Seleccionar Temario"
                                        }
                                    </span>
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Gestionar selección de documentos</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                    {usage && <UsageIndicator usage={usage} />}
                    {
                        onClose && (
                            <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        )
                    }
                </div >
            </div >

            {/* Banner para usuarios gratis */}
            {
                usage?.plan_type === 'free' && !limitReached && (
                    <UpgradeBanner />
                )
            }

            {/* Toolbar */}
            <ChatToolbar mode={simplifiedMode} onModeChange={setSimplifiedMode}>
                <SummaryButton
                    onGenerate={(format) => {
                        const topic = getEffectiveTopic("Constitución Española");
                        const context = selectedDocs.length > 0 ? selectedDocs : undefined;
                        generateSummary(topic, format, context);
                    }}
                    disabled={isLoading || limitReached}
                />
                <DiagramButton
                    onGenerate={(type) => {
                        const query = getEffectiveTopic("Estructura del Ministerio de Defensa");
                        generateDiagram(query, type);
                    }}
                    disabled={isLoading || limitReached}
                />
                <CompareButton
                    onCompare={(aspect) => {
                        const currentTopic = getEffectiveTopic("Tema actual");
                        compareLaws([currentTopic, "Normativa relacionada"], aspect);
                    }}
                    disabled={isLoading || limitReached}
                />
                <FlashcardsButton
                    onGenerate={(difficulty) => {
                        const topic = getEffectiveTopic("Conceptos clave");
                        generateFlashcards(topic, 5, difficulty);
                    }}
                    disabled={isLoading || limitReached}
                />
                <MnemonicButton
                    onGenerate={(type) => {
                        const content = getEffectiveTopic("Lista de conceptos");
                        generateMnemonic(content, type);
                    }}
                    disabled={isLoading}
                />
            </ChatToolbar>

            {/* Area principal */}
            <div className="flex-1 overflow-hidden flex relative">
                <div className="flex-1 flex flex-col min-w-0">
                    <MessageList
                        messages={messages}
                        isLoading={isLoading}
                        onShowSources={handleShowSources}
                    />
                    <div className="p-4 border-t">
                        <MessageInput
                            onSend={handleSendMessage}
                            disabled={limitReached || isLoading}
                            placeholder={limitReached ? "Límite alcanzado" : "Escribe tu pregunta..."}
                        />
                    </div>
                </div>

                {/* Panel lateral de fuentes (Desktop) */}
                {showSources && (
                    <div className="w-80 border-l bg-card hidden md:block">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-medium">Fuentes</h3>
                            <button onClick={() => setShowSources(false)}><X className="w-4 h-4" /></button>
                        </div>
                        <SourcesPanel sources={activeSources} />
                    </div>
                )}

                {/* Panel lateral de selección de documentos */}
                {showDocSelector && (
                    <div className="w-80 border-l bg-card hidden md:block absolute right-0 top-0 bottom-0 z-10 shadow-lg">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-medium">Contexto</h3>
                            <button onClick={() => setShowDocSelector(false)}><X className="w-4 h-4" /></button>
                        </div>
                        <DocumentSelector
                            availableDocs={availableDocs}
                            selectedDocs={selectedDocs}
                            onToggle={toggleSelection}
                            onSelectAll={selectAll}
                            onClear={clearSelection}
                            isLoading={isLoadingDocs}
                        />
                    </div>
                )}
            </div>

            {/* Modal de límite */}
            <LimitReachedModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                usage={usage}
            />
        </div >
    );
};
