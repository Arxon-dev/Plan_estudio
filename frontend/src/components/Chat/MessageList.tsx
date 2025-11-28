import React, { useEffect, useRef } from 'react';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
    messages: any[];
    isLoading: boolean;
    onShowSources: (sources: any[]) => void;
}

export const MessageList: React.FC<MessageListProps> = ({ messages, isLoading, onShowSources }) => {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    return (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <span className="text-2xl">👋</span>
                    </div>
                    <h3 className="text-lg font-medium mb-2">¡Hola! Soy tu asistente de estudio</h3>
                    <p className="max-w-sm">
                        Pregúntame cualquier duda sobre el temario. Mis respuestas se basan únicamente en los documentos oficiales.
                    </p>
                </div>
            )}

            {messages.map((msg) => (
                <MessageBubble
                    key={msg.id}
                    message={msg}
                    onShowSources={onShowSources}
                />
            ))}

            {isLoading && (
                <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-4 rounded-tl-none">
                        <div className="flex space-x-2">
                            <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-75" />
                            <div className="w-2 h-2 bg-foreground/30 rounded-full animate-bounce delay-150" />
                        </div>
                    </div>
                </div>
            )}

            <div ref={bottomRef} />
        </div>
    );
};
