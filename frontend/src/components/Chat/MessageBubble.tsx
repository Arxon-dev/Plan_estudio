import React from 'react';
import { BookOpen, Copy, Check, FileText, List, CreditCard, GitCompare, Network } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { DiagramViewer } from './DiagramViewer';
import { FlashcardViewer } from './FlashcardViewer';
import { OutlineTreeView } from './OutlineTreeView';
import { FlowDiagramView } from './FlowDiagramView';
import { parseFlashcards } from '../../utils/flashcardParser';
import { parseOutline } from '../../utils/outlineParser';
import { parseDiagram } from '../../utils/diagramParser';
import { ReactFlowProvider } from 'reactflow';

const typeIcons: Record<string, React.ReactNode> = {
    summary: <FileText className="w-4 h-4" />,
    outline: <List className="w-4 h-4" />,
    flashcards: <CreditCard className="w-4 h-4" />,
    comparison: <GitCompare className="w-4 h-4" />,
    diagram: <Network className="w-4 h-4" />,
    general: null
};

const typeLabels: Record<string, string> = {
    summary: 'Resumen',
    outline: 'Esquema',
    flashcards: 'Flashcards',
    comparison: 'Comparación',
    diagram: 'Diagrama',
    general: ''
};

export const MessageBubble: React.FC<{ message: any, onShowSources: (s: any[]) => void }> = ({ message, onShowSources }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // RENDERIZADO ESPECIAL PARA FLASHCARDS
    if (!isUser && message.type === 'flashcards') {
        const flashcards = parseFlashcards(message.content);
        console.log('[MessageBubble] Flashcards parseadas:', flashcards.length);

        return (
            <div className="flex justify-start mb-6">
                <div className="bg-background rounded-xl p-6 max-w-[85%] w-full border shadow-sm">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b text-primary">
                        <CreditCard className="w-5 h-5" />
                        <span className="font-semibold text-sm">Flashcards de estudio</span>
                    </div>

                    {/* Visor */}
                    <FlashcardViewer flashcards={flashcards} />

                    {/* Fuentes */}
                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                            <p className="font-semibold mb-2">📚 Documentos consultados:</p>
                            <ul className="space-y-1">
                                {message.sources.map((source: any, idx: number) => (
                                    <li key={idx}>
                                        • {source.documento}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RENDERIZADO ESPECIAL PARA ESQUEMAS
    if (!isUser && message.type === 'outline') {
        const outlineTree = parseOutline(message.content);

        return (
            <div className="flex justify-start mb-6">
                <div className="bg-background rounded-xl p-6 max-w-[90%] w-full border shadow-sm">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b text-primary">
                        <List className="w-5 h-5" />
                        <span className="font-semibold text-sm">Esquema Visual</span>
                    </div>

                    {/* Vista de árbol */}
                    <OutlineTreeView outline={outlineTree} />

                    {/* Fuentes */}
                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                            <p className="font-semibold mb-2">📚 Documentos consultados:</p>
                            <ul className="space-y-1">
                                {message.sources.map((source: any, idx: number) => (
                                    <li key={idx}>
                                        • {source.documento}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // RENDERIZADO ESPECIAL PARA DIAGRAMAS
    if (!isUser && message.type === 'diagram') {
        const diagramData = parseDiagram(message.content);

        return (
            <div className="flex justify-start mb-6">
                <div className="bg-background rounded-xl p-6 w-full border shadow-sm">
                    {/* Badge */}
                    <div className="flex items-center gap-2 mb-4 pb-3 border-b text-primary">
                        <Network className="w-5 h-5" />
                        <span className="font-semibold text-sm">Diagrama de Flujo</span>
                    </div>

                    {/* Diagrama interactivo */}
                    {/* Diagrama interactivo */}
                    <ReactFlowProvider>
                        <FlowDiagramView diagram={diagramData} />
                    </ReactFlowProvider>

                    {/* Fuentes */}
                    {message.sources && message.sources.length > 0 && (
                        <div className="mt-6 pt-4 border-t text-xs text-muted-foreground">
                            <p className="font-semibold mb-2">📚 Documentos consultados:</p>
                            <ul className="space-y-1">
                                {message.sources.map((source: any, idx: number) => (
                                    <li key={idx}>
                                        • {source.documento}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    const renderContent = () => {
        // Detectar Diagrama Mermaid
        const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/;
        if (mermaidRegex.test(message.content)) {
            const match = message.content.match(mermaidRegex);
            const parts = message.content.split(mermaidRegex);
            return (
                <>
                    <ReactMarkdown>{parts[0]}</ReactMarkdown>
                    <DiagramViewer code={match![1]} />
                    {parts[2] && <ReactMarkdown>{parts[2]}</ReactMarkdown>}
                </>
            );
        }

        return <ReactMarkdown>{message.content}</ReactMarkdown>;
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-lg p-4 ${isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-muted/50 border rounded-tl-none'
                    }`}
            >
                {/* Badge de tipo */}
                {!isUser && message.type && typeLabels[message.type] && (
                    <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground font-medium uppercase tracking-wider">
                        {typeIcons[message.type]}
                        <span>{typeLabels[message.type]}</span>
                    </div>
                )}

                <div className={`prose prose-sm max-w-none break-words ${isUser ? 'text-white prose-invert' : 'dark:prose-invert'}`}>
                    {renderContent()}
                </div>

                {!isUser && (
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50">
                        {message.sources && message.sources.length > 0 && (
                            <button
                                onClick={() => onShowSources(message.sources)}
                                className="text-xs flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <BookOpen className="w-3 h-3" />
                                {message.sources.length} Fuentes
                            </button>
                        )}
                        <div className="flex-1" />
                        <button
                            onClick={handleCopy}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
