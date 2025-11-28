import React from 'react';
// import { cn } from '../../lib/utils'; // Asumiendo utils de shadcn o crearé uno simple
import { BookOpen, Copy, Check } from 'lucide-react';

// Mock de cn si no existe
// export function cn(...inputs: ClassValue[]) {
//   return twMerge(clsx(inputs))
// }

export const MessageBubble: React.FC<{ message: any, onShowSources: (s: any[]) => void }> = ({ message, onShowSources }) => {
    const isUser = message.role === 'user';
    const [copied, setCopied] = React.useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[85%] rounded-lg p-4 ${isUser
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted/50 border rounded-tl-none'
                    }`}
            >
                <div className="prose dark:prose-invert text-sm">
                    {/* Si tuviera react-markdown: <ReactMarkdown>{message.content}</ReactMarkdown> */}
                    <p className="whitespace-pre-wrap">{message.content}</p>
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
