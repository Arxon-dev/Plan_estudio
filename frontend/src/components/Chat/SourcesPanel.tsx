import React from 'react';


interface SourcesPanelProps {
    sources: Array<{
        documento: string;
        texto: string;
        score: number;
    }>;
}

export const SourcesPanel: React.FC<SourcesPanelProps> = ({ sources }) => {
    return (
        <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {sources.map((source, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-muted/30 text-sm">
                        <div className="font-medium text-primary mb-1 flex justify-between">
                            <span>{source.documento}</span>
                            <span className="text-xs text-muted-foreground">{(source.score * 100).toFixed(0)}% rel.</span>
                        </div>
                        <p className="text-muted-foreground text-xs leading-relaxed">
                            "{source.texto}"
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};
