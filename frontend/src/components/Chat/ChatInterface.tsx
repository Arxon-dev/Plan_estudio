import React, { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { UsageIndicator } from './UsageIndicator';
import { LimitReachedModal } from './LimitReachedModal';
import { SourcesPanel } from './SourcesPanel';
import { UpgradeBanner } from './UpgradeBanner';
import { Card } from '../ui/card'; // Asumiendo que existe o usaré div
import { Button } from '../ui/button'; // Asumiendo que existe o usaré button
import { X } from 'lucide-react';

export const ChatInterface: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
    const { messages, isLoading, usage, limitReached, sendMessage, refreshUsage } = useChat();
    const [showSources, setShowSources] = React.useState(false);
    const [activeSources, setActiveSources] = React.useState<any[]>([]);

    const handleShowSources = (sources: any[]) => {
        setActiveSources(sources);
        setShowSources(true);
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
                    {usage && <UsageIndicator usage={usage} />}
                    {onClose && (
                        <button onClick={onClose} className="p-2 hover:bg-accent rounded-full">
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Banner para usuarios gratis */}
            {usage?.plan_type === 'free' && !limitReached && (
                <UpgradeBanner />
            )}

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
                            onSend={sendMessage}
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
            </div>

            {/* Modal de límite */}
            <LimitReachedModal
                isOpen={limitReached}
                onClose={() => { }} // No se puede cerrar si es bloqueo total, o sí?
                usage={usage}
            />
        </div>
    );
};
