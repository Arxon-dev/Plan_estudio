import React from 'react';
import { Lightbulb, BookOpen } from 'lucide-react';

interface MnemonicCardProps {
    mnemonic: string;
    explanation: string;
    usage_tip: string;
}

export const MnemonicCard: React.FC<MnemonicCardProps> = ({ mnemonic, explanation, usage_tip }) => {
    return (
        <div className="my-4 border border-yellow-500/50 bg-yellow-500/10 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3 text-yellow-600 dark:text-yellow-400 font-semibold">
                <Lightbulb className="h-5 w-5" />
                Mnemotecnia
            </div>

            <div className="text-xl font-bold text-center py-4 border-b border-yellow-500/20">
                {mnemonic}
            </div>

            <div className="mt-4 space-y-3 text-sm">
                <div>
                    <span className="font-semibold block mb-1">Explicación:</span>
                    <p className="text-muted-foreground">{explanation}</p>
                </div>

                <div className="bg-background/50 p-3 rounded text-xs flex gap-2">
                    <BookOpen className="h-4 w-4 shrink-0 mt-0.5" />
                    <p>{usage_tip}</p>
                </div>
            </div>
        </div>
    );
};
